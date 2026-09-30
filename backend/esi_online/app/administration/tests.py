"""
Tests du depot de documents par l'administration.

Avant, la creation d'une ressource passait par /ressources/ en JSON. Comme
Ressource.fichier est un CharField, un admin ne pouvait pas deposer un fichier :
il pouvait saisir un chemin, et rien ne verifiait qu'un fichier existe derriere.
Le formulaire d'admin n'avait donc rien a appeler.

Ces tests couvrent l'endpoint multipart : ecriture reelle sur disque, nom de
fichier non reutilise, extension et taille controlees, rattachement a la
classe, et refus quand une cle etrangere demandee n'existe pas.
"""
import shutil
import tempfile
from datetime import date
from pathlib import Path
from unittest.mock import patch

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from rest_framework import status
from rest_framework.test import APITestCase

from app.administration.models import (
    AnneeAcademique,
    Classe,
    Filiere,
    Matiere,
    Niveau,
    Ressource,
)
from app.administration.services.document_service import DocumentService
from app.core.exceptions import ValidationError

User = get_user_model()

API = "/api/etablissement/documents/depot/"
API_TYPES = "/api/etablissement/documents/types/"

PDF = b"%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n"

# Un dossier par session de tests, retire a la fin de chaque test.
MEDIA_TMP = tempfile.mkdtemp(prefix="esi-medias-test-")


@override_settings(MEDIA_ROOT=MEDIA_TMP)
class DepotDocumentAdminTests(APITestCase):
    """L'admin depose un document, et le fichier atterrit reellement sur disque."""

    def tearDown(self):
        shutil.rmtree(MEDIA_TMP, ignore_errors=True)

    def setUp(self):
        self.annee = AnneeAcademique.objects.create(
            libelle="2025-2026",
            date_debut=date(2025, 9, 1),
            date_fin=date(2026, 6, 30),
            is_active=True,
        )
        self.niveau = Niveau.objects.create(code="L1", libelle="Licence 1", ordre=1)
        self.filiere = Filiere.objects.create(code="INF", libelle="Informatique")
        self.classe = Classe.objects.create(
            code="L1-A",
            libelle="L1 groupe A",
            niveau=self.niveau,
            filiere=self.filiere,
            annee_academique=self.annee,
        )
        self.matiere = Matiere.objects.create(
            code="ALGO",
            libelle="Algorithmique",
            niveau=self.niveau,
            filiere=self.filiere,
            semestre=1,
        )
        self.user = User.objects.create_user(username="admin_doc", password="x")
        self.user.is_staff = True
        self.user.save()
        self.client.force_authenticate(self.user)

    def _post(self, **champs):
        defauts = {
            "titre": "Devoir 1",
            "type_ressource": "Devoir",
            "classe_id": self.classe.id,
            "matiere_id": self.matiere.id,
            "fichier": SimpleUploadedFile(
                "devoir.pdf", PDF, content_type="application/pdf"
            ),
        }
        # Un override a None retire le champ du POST : c'est ainsi qu'on
        # simule "l'admin n'a pas coche de fichier".
        donnees = {k: v for k, v in {**defauts, **champs}.items() if v is not None}
        return self.client.post(API, donnees)

    def _chemin(self, ressource):
        return Path(settings.MEDIA_ROOT) / ressource.fichier

    # --- le cas nominal -------------------------------------------------

    def test_depot_cree_la_ressource_et_ecrit_le_fichier(self):
        reponse = self._post()

        self.assertEqual(reponse.status_code, status.HTTP_201_CREATED)
        ressource = Ressource.objects.get()
        self.assertEqual(ressource.titre, "Devoir 1")
        self.assertEqual(ressource.type_ressource, "Devoir")
        self.assertEqual(ressource.format_fichier, "pdf")
        self.assertEqual(ressource.taille_fichier, len(PDF))

        contenu = self._chemin(ressource)
        self.assertTrue(contenu.is_file(), "le fichier doit exister sur le disque")
        self.assertEqual(contenu.read_bytes(), PDF)

    def test_depot_rattache_la_classe_et_la_matiere(self):
        self._post()
        ressource = Ressource.objects.get()

        self.assertEqual(ressource.classe, self.classe)
        self.assertEqual(ressource.matiere, self.matiere)

    def test_depot_ne_reutilise_pas_le_nom_dorigine(self):
        """Le nom envoye par l'admin ne doit pas influencer le chemin stocke."""
        self._post(fichier=SimpleUploadedFile("../../../../etc/passwd.pdf", PDF))
        ressource = Ressource.objects.get()

        self.assertNotIn("..", ressource.fichier)
        self.assertNotIn("passwd", ressource.fichier)
        self.assertTrue(ressource.fichier.startswith("uploads/admin/"))
        self.assertTrue(self._chemin(ressource).is_file())

    def test_depot_sans_classe_reste_possible(self):
        """Un document general n'est pas oblige d'etre rattache a une classe."""
        reponse = self._post(classe_id="", matiere_id="")

        self.assertEqual(reponse.status_code, status.HTTP_201_CREATED)
        ressource = Ressource.objects.get()
        self.assertIsNone(ressource.classe)
        self.assertIsNone(ressource.matiere)

    def test_liste_des_types_est_lue_par_le_formulaire(self):
        reponse = self.client.get(API_TYPES)

        self.assertEqual(reponse.status_code, status.HTTP_200_OK)
        valeurs = {t["valeur"] for t in reponse.json()}
        self.assertTrue(
            {"Devoir", "TD", "TP", "Rapport", "Exercice"} <= valeurs,
            f"types manquants, recu : {valeurs}",
        )

    # --- les refus ------------------------------------------------------

    def test_extension_non_autorisee_refusee(self):
        reponse = self._post(
            fichier=SimpleUploadedFile(
                "script.exe", b"MZ", content_type="application/octet-stream"
            )
        )

        self.assertEqual(reponse.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(Ressource.objects.exists())
        self.assertIn("Extension", reponse.json()["detail"])

    def test_type_inconnu_refuse(self):
        reponse = self._post(type_ressource="Dossier secret")

        self.assertEqual(reponse.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Type de document inconnu", reponse.json()["detail"])
        self.assertFalse(Ressource.objects.exists())

    def test_sans_fichier_ni_lien_refuse(self):
        reponse = self._post(fichier=None)

        self.assertEqual(reponse.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(Ressource.objects.exists())

    def test_titre_vide_refuse(self):
        reponse = self._post(titre="   ")

        self.assertEqual(reponse.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(Ressource.objects.exists())

    def test_fichier_trop_volumineux_refuse(self):
        """
        Un octet de plus que le plafond doit faire echouer le depot.

        Le plafond est abaisse plutot que d'envoyer 100 Mo : la regle testee
        est la comparaison, pas le nombre.
        """
        with patch(
            "app.administration.services.document_service.TAILLE_MAX_DOCUMENT", 10
        ):
            with self.assertRaises(ValidationError) as contexte:
                DocumentService().deposer_document(
                    auth_user=self.user,
                    titre="Cours du soir",
                    type_ressource="Cours",
                    uploaded_file=SimpleUploadedFile("cours.pdf", PDF),
                )

        self.assertIn("volumineux", str(contexte.exception))
        self.assertFalse(Ressource.objects.exists())

    def test_matiere_inexistante_renvoie_404_sans_ecrire_de_fichier(self):
        reponse = self._post(matiere_id=999999)

        self.assertEqual(reponse.status_code, status.HTTP_404_NOT_FOUND)
        self.assertFalse(Ressource.objects.exists())
        # Aucun octet ne doit rester sur le disque quand une cle etrangere est
        # fausse : les cles sont resolues avant l'ecriture.
        depot = Path(settings.MEDIA_ROOT) / "uploads" / "admin"
        self.assertFalse(
            depot.is_dir() and any(depot.iterdir()),
            "un fichier a ete ecrit alors que la matiere n'existe pas",
        )

    def test_etudiant_refuse_le_depot(self):
        """Le depot est reserve au staff, pas a quiconque a la permission."""
        etudiant = User.objects.create_user(username="etudiant_doc", password="x")
        self.client.force_authenticate(etudiant)

        reponse = self._post()

        self.assertEqual(reponse.status_code, status.HTTP_403_FORBIDDEN)
        self.assertFalse(Ressource.objects.exists())