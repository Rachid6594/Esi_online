"""
Tests de l'API etudiant : portee des donnees et protection de la notation.

Ces endpoints sont montes sous /api/eleve/ et portent sur des objets qui
appartiennent a un etudiant precis. Deux defauts ont ete corriges ici :

- les serializers etaient en "fields = '__all__'", donc un POST pouvait
  ecrire la note, le statut et le retour de correction. Un etudiant pouvait
  s attribuer 20/20 sans que personne ne l'ait corrige ;
- les listes renvoyaient list_all(), donc tous les rendus et toutes les
  tentatives de l'ecole a quiconque avait la permission de lire.

Les deux sont verifies ici, avec le double cas etudiant / staff.
"""
from datetime import date, timedelta
from decimal import Decimal
import shutil
import tempfile
from pathlib import Path

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Permission
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from app.administration.models import (
    AnneeAcademique,
    Classe,
    Filiere,
    Niveau,
    Matiere,
    Ressource,
)
from app.admin.models import User as AppAdminUser
from app.espace_prof.models import Chapitre, Cours, Enseignant, TP
from app.espace_student.models import (
    Etudiant,
    PermissionUploadEtudiant,
    RenduTP,
    TentativeQCM,
)
from app.espace_student.utils import (
    ensure_etudiant_for_auth_user,
    get_auth_user_for_etudiant,
    get_etudiant_for_auth_user,
)

User = get_user_model()

API = "/api/eleve"
PDF = b"%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n"


class BasePorteeEtudiant(APITestCase):
    """Deux etudiants distincts, un staff, et la chaine TP jusqu a la classe."""

    PERMS_ETUDIANT = [
        "view_rendutp",
        "add_rendutp",
        "change_rendutp",
        "delete_rendutp",
        "view_tentativeqcm",
        "add_tentativeqcm",
        "view_reponseetudiantqcm",
        "add_reponseetudiantqcm",
    ]

    def setUp(self):
        self.annee = AnneeAcademique.objects.create(
            libelle="2025-2026",
            date_debut=date(2025, 9, 1),
            date_fin=date(2026, 6, 30),
            is_active=True,
        )
        self.niveau = Niveau.objects.create(
            code="L1", libelle="Licence 1", ordre=1
        )
        self.filiere = Filiere.objects.create(
            code="INF", libelle="Informatique"
        )
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
        self.enseignant = Enseignant.objects.create(
            user=self._creer_app_admin(),
            matricule="ENS001",
        )
        self.cours = Cours.objects.create(
            titre="Algorithmique 1",
            matiere=self.matiere,
            classe=self.classe,
            enseignant=self.enseignant,
            annee_academique=self.annee,
            is_published=True,
        )
        self.chapitre = Chapitre.objects.create(cours=self.cours, titre="Chapitre 1")
        self.tp = TP.objects.create(
            chapitre=self.chapitre,
            titre="TP 1",
            enonce="Enonce du TP",
            date_limite=timezone.now() + timedelta(days=7),
        )

        self.etudiant_a = self._creer_etudiant("alice")
        self.etudiant_b = self._creer_etudiant("bob")
        self.staff = User.objects.create_user(
            username="prof", email="prof@esi.dz", password="pass-test-123", is_staff=True
        )

    def _creer_app_admin(self):
        app_admin_user = AppAdminUser.objects.create()
        return app_admin_user

    def _auth(self, etudiant):
        """User d'authentification du profil Etudiant.

        Le profil pointe sur app_admin.User, pas sur le User de django.contrib
        : ce sont deux tables differentes, liant par identifiant.
        """
        return get_auth_user_for_etudiant(etudiant)

    def _creer_etudiant(self, nom):
        auth_user = User.objects.create_user(
            username=nom,
            email=f"{nom}@esi.dz",
            password="pass-test-123",
        )
        # ensure_etudiant_for_auth_user aligne les identifiants des deux tables
        from app.espace_student.utils import ensure_etudiant_for_auth_user

        etudiant = ensure_etudiant_for_auth_user(auth_user)
        etudiant.matricule = f"ETU-{nom.upper()}"
        etudiant.classe = self.classe
        etudiant.save()
        # La permission est accordee a l'utilisateur auth : c'est lui que les
        # classes de permission interrogent via has_perm.
        for codename in self.PERMS_ETUDIANT:
            auth_user.user_permissions.add(Permission.objects.get(codename=codename))
        return etudiant

    def _rendu(self, etudiant):
        return RenduTP.objects.create(
            tp=self.tp, etudiant=etudiant, fichier=f"rendu_{etudiant.matricule}.pdf"
        )


class RenduTPNotationTests(BasePorteeEtudiant):
    """Un etudiant ne doit pas pouvoir ecrire sa propre note."""

    def test_etudiant_ne_peut_pas_envoyer_une_note(self):
        self.client.force_authenticate(user=self._auth(self.etudiant_a))
        response = self.client.post(
            f"{API}/rendutps/",
            {
                "tp": self.tp.pk,
                "fichier": "mon_rendu.pdf",
                "note": "20",
                "statut": "CORRIGE",
                "commentaire_enseignant": "Excellent travail",
            },
            format="json",
        )
        self.assertEqual(status.HTTP_400_BAD_REQUEST, response.status_code)
        for champ in ("note", "statut", "commentaire_enseignant"):
            self.assertIn(champ, response.data, f"{champ} aurait du etre refuse")
        self.assertFalse(RenduTP.objects.exists(), "aucun rendu ne doit etre cree")

    def test_etudiant_peut_deposer_son_rendu(self):
        self.client.force_authenticate(user=self._auth(self.etudiant_a))
        response = self.client.post(
            f"{API}/rendutps/",
            {"tp": self.tp.pk, "fichier": "mon_rendu.pdf", "commentaire_etudiant": "a rendre"},
            format="json",
        )
        self.assertEqual(status.HTTP_201_CREATED, response.status_code)
        rendu = RenduTP.objects.get()
        self.assertEqual(self.etudiant_a, rendu.etudiant)
        self.assertIsNone(rendu.note)
        self.assertEqual("RENDU", rendu.statut)

    def test_etudiant_ne_peut_pas_deposer_pour_autrui(self):
        self.client.force_authenticate(user=self._auth(self.etudiant_a))
        response = self.client.post(
            f"{API}/rendutps/",
            {"tp": self.tp.pk, "fichier": "mon_rendu.pdf", "etudiant": self.etudiant_b.pk},
            format="json",
        )
        self.assertEqual(status.HTTP_201_CREATED, response.status_code)
        # le champ "etudiant" envoye par le client est ecrase
        self.assertEqual(self.etudiant_a, RenduTP.objects.get().etudiant)

    def test_staff_peut_corriger(self):
        self.client.force_authenticate(user=self.staff)
        response = self.client.post(
            f"{API}/rendutps/",
            {
                "tp": self.tp.pk,
                "etudiant": self.etudiant_a.pk,
                "fichier": "rendu.pdf",
                "note": "17.50",
                "commentaire_enseignant": "Bon travail",
            },
            format="json",
        )
        self.assertEqual(status.HTTP_201_CREATED, response.status_code)
        self.assertEqual(Decimal("17.50"), RenduTP.objects.get().note)


class RenduTPPorteeTests(BasePorteeEtudiant):
    """Un etudiant ne voit que ses propres rendus."""

    def setUp(self):
        super().setUp()
        self.rendu_a = self._rendu(self.etudiant_a)
        self.rendu_b = self._rendu(self.etudiant_b)

    def test_liste_ne_contient_que_ses_rendus(self):
        self.client.force_authenticate(user=self._auth(self.etudiant_a))
        response = self.client.get(f"{API}/rendutps/")
        self.assertEqual(status.HTTP_200_OK, response.status_code)
        ids = [r["id"] for r in response.data]
        self.assertIn(self.rendu_a.pk, ids)
        self.assertNotIn(self.rendu_b.pk, ids, "un rendu d un autre etudiant a fuité")

    def test_detail_d_un_autre_rendu_renvoie_404(self):
        self.client.force_authenticate(user=self._auth(self.etudiant_a))
        response = self.client.get(f"{API}/rendutps/{self.rendu_b.pk}/")
        self.assertEqual(status.HTTP_404_NOT_FOUND, response.status_code)

    def test_etudiant_ne_peut_pas_modifier_un_autre_rendu(self):
        self.client.force_authenticate(user=self._auth(self.etudiant_a))
        response = self.client.patch(
            f"{API}/rendutps/{self.rendu_b.pk}/", {"fichier": "ecrase.pdf"}, format="json"
        )
        self.assertEqual(status.HTTP_404_NOT_FOUND, response.status_code)
        self.rendu_b.refresh_from_db()
        self.assertEqual("rendu_ETU-BOB.pdf", self.rendu_b.fichier)

    def test_etudiant_ne_peut_pas_supprimer_un_autre_rendu(self):
        self.client.force_authenticate(user=self._auth(self.etudiant_a))
        response = self.client.delete(f"{API}/rendutps/{self.rendu_b.pk}/")
        self.assertEqual(status.HTTP_404_NOT_FOUND, response.status_code)
        self.assertTrue(RenduTP.objects.filter(pk=self.rendu_b.pk).exists())

    def test_staff_voit_tous_les_rendus(self):
        self.client.force_authenticate(user=self.staff)
        response = self.client.get(f"{API}/rendutps/")
        ids = [r["id"] for r in response.data]
        self.assertIn(self.rendu_a.pk, ids)
        self.assertIn(self.rendu_b.pk, ids)


class TentativeQCMPorteeTests(BasePorteeEtudiant):
    """Meme regle sur les tentatives, plus le verrouillage des champs calcules."""

    def setUp(self):
        super().setUp()
        from app.espace_prof.models import QCM

        self.qcm = QCM.objects.create(
            chapitre=self.chapitre,
            titre="QCM 1",
            date_ouverture=timezone.now() - timedelta(days=1),
            date_fermeture=timezone.now() + timedelta(days=7),
        )
        self.tentative_a = TentativeQCM.objects.create(qcm=self.qcm, etudiant=self.etudiant_a)
        self.tentative_b = TentativeQCM.objects.create(qcm=self.qcm, etudiant=self.etudiant_b)

    def test_etudiant_ne_peut_pas_envoyer_sa_note(self):
        self.client.force_authenticate(user=self._auth(self.etudiant_a))
        response = self.client.post(
            f"{API}/tentativeqcms/",
            {"qcm": self.qcm.pk, "note_obtenue": "20", "pourcentage": "100"},
            format="json",
        )
        self.assertEqual(status.HTTP_400_BAD_REQUEST, response.status_code)
        for champ in ("note_obtenue", "pourcentage"):
            self.assertIn(champ, response.data)
        self.assertEqual(2, TentativeQCM.objects.count())

    def test_ouverture_de_tentative_etouit_le_proprietaire(self):
        from app.espace_prof.models import QuestionQCM

        question = QuestionQCM.objects.create(qcm=self.qcm, enonce="1 + 1 ?", points=1)
        self.client.force_authenticate(user=self._auth(self.etudiant_a))
        # le client ne peut pas choisir son etudiant
        response = self.client.post(
            f"{API}/reponseetudiantqcms/",
            {"tentative": self.tentative_b.pk, "question": question.pk},
            format="json",
        )
        self.assertEqual(status.HTTP_400_BAD_REQUEST, response.status_code)
        self.assertIn("tentative", response.data)

    def test_liste_des_reponses_est_limitee_a_ses_tentatives(self):
        from app.espace_prof.models import QuestionQCM, ReponseQCM
        from app.espace_student.models import ReponseEtudiantQCM

        question = QuestionQCM.objects.create(qcm=self.qcm, enonce="1 + 1 ?", points=1)
        reponse = ReponseQCM.objects.create(question=question, texte="2", is_correcte=True)
        for tentative in (self.tentative_a, self.tentative_b):
            ReponseEtudiantQCM.objects.create(tentative=tentative, question=question)

        self.client.force_authenticate(user=self._auth(self.etudiant_a))
        response = self.client.get(f"{API}/reponseetudiantqcms/")
        self.assertEqual(status.HTTP_200_OK, response.status_code)
        ids = [r["id"] for r in response.data]
        self.assertEqual(1, len(ids), "une seule reponse, celle de la tentative A")
        attendu = ReponseEtudiantQCM.objects.get(tentative=self.tentative_a)
        self.assertEqual([attendu.pk], ids)
        self.assertTrue(reponse.pk)  # la reponse correcte existe bien


class UploadEtudiantNonRegression(APITestCase):
    """
    Non-regression sur l'upload etudiant.

    L'ecriture du fichier a ete deplacee vers app/core/documents.py pour etre
    partagee avec l'espace admin. Ce test existe pour prouver que le chemin
    etudiant n'a pas change au passage : meme extension acceptee, meme nom uuid,
    et surtout le fichier toujours ecrit sous uploads/etudiants/<id>/.
    """

    API_UPLOAD = "/api/eleve/me/upload/"

    def setUp(self):
        auth_user = User.objects.create_user(
            username="etudiant_upload",
            email="upload@esi.dz",
            password="pass-test-123",
        )
        self.etudiant = ensure_etudiant_for_auth_user(auth_user)
        self.user = get_auth_user_for_etudiant(self.etudiant)
        PermissionUploadEtudiant.objects.create(
            etudiant=self.etudiant,
            types_autorises=["Cours", "Rapport"],
            is_active=True,
        )
        self.media_tmp = tempfile.mkdtemp(prefix="esi-upload-etudiant-")

    def tearDown(self):
        shutil.rmtree(self.media_tmp, ignore_errors=True)

    def _deposer(self, nom="cours.pdf", contenu=PDF, **champs):
        donnees = {
            "titre": "Chapitre 1",
            "type_ressource": "Cours",
            **champs,
        }
        with override_settings(MEDIA_ROOT=self.media_tmp):
            reponse = self.client.post(
                self.API_UPLOAD,
                {**donnees, "fichier": SimpleUploadedFile(nom, contenu)},
            )
        return reponse

    def test_upload_etudiant_ecrit_le_fichier_sous_son_dossier(self):
        self.client.force_authenticate(user=self.user)

        reponse = self._deposer()

        self.assertEqual(status.HTTP_201_CREATED, reponse.status_code)
        ressource = Ressource.objects.get()
        # Le dossier porte l'id du User d'authentification, pas celui du profil
        # Etudiant : ce sont deux tables liees par identifiant.
        self.assertTrue(
            ressource.fichier.startswith(f"uploads/etudiants/{self.user.id}/"),
            f"chemin inattendu : {ressource.fichier}",
        )
        contenu = Path(self.media_tmp) / ressource.fichier
        self.assertTrue(contenu.is_file(), "le fichier doit etre sur le disque")

    def test_upload_etudiant_refuse_un_type_hors_permission(self):
        self.client.force_authenticate(user=self.user)

        reponse = self._deposer(type_ressource="Examen")

        self.assertEqual(status.HTTP_400_BAD_REQUEST, reponse.status_code)
        self.assertFalse(Ressource.objects.exists())

    def test_upload_etudiant_accepte_un_type_ajoute_a_la_liste_partagee(self):
        """« Rapport » n'existait pas dans l'ancienne liste de l'espace etudiant."""
        self.client.force_authenticate(user=self.user)

        reponse = self._deposer(type_ressource="Rapport")

        self.assertEqual(status.HTTP_201_CREATED, reponse.status_code)

    def test_upload_etudiant_refuse_sans_permission(self):
        self.client.force_authenticate(user=self.user)
        PermissionUploadEtudiant.objects.update(is_active=False)

        reponse = self._deposer()

        self.assertEqual(status.HTTP_400_BAD_REQUEST, reponse.status_code)
        self.assertFalse(Ressource.objects.exists())


class UploadEtudiantMatiereControlee(UploadEtudiantNonRegression):
    """
    L'etudiant ne peut pas inscrire son fichier dans une matiere etrangere.

    /api/eleve/me/upload/ resolvait matiere_id par un .first() sans rien
    verifier. N'importe quel etudiant authentifie pouvait donc deposer un
    document dans la matiere d'une autre filiere, en devinant un id : la
    matiere est une cle etrangere partagee, pas une etiquette libre. Le
    service refuse maintenant la matiere hors programme, avec un 400.
    """

    def setUp(self):
        super().setUp()
        self.annee = AnneeAcademique.objects.create(
            libelle="2025-2026",
            date_debut=date(2025, 9, 1),
            date_fin=date(2026, 6, 30),
            is_active=True,
        )
        self.niveau = Niveau.objects.create(code="L1", libelle="Licence 1", ordre=1)
        self.filiere_inf = Filiere.objects.create(code="INF", libelle="Informatique")
        self.filiere_math = Filiere.objects.create(code="MATH", libelle="Mathematique")
        self.classe = Classe.objects.create(
            code="L1-A", libelle="L1 groupe A", niveau=self.niveau,
            filiere=self.filiere_inf, annee_academique=self.annee,
        )
        self.etudiant.classe = self.classe
        self.etudiant.save()
        self.matiere_ok = Matiere.objects.create(
            code="INF01", libelle="Algorithmique", niveau=self.niveau,
            filiere=self.filiere_inf, semestre=1,
        )
        self.matiere_etrangere = Matiere.objects.create(
            code="MATH01", libelle="Analyse", niveau=self.niveau,
            filiere=self.filiere_math, semestre=1,
        )

    def test_upload_accepte_la_matiere_de_son_programme(self):
        self.client.force_authenticate(user=self.user)

        reponse = self._deposer(matiere_id=self.matiere_ok.pk)

        self.assertEqual(status.HTTP_201_CREATED, reponse.status_code)
        self.assertEqual(self.matiere_ok.pk, Ressource.objects.get().matiere_id)

    def test_upload_refuse_la_matiere_d_une_autre_filiere(self):
        self.client.force_authenticate(user=self.user)

        reponse = self._deposer(matiere_id=self.matiere_etrangere.pk)

        self.assertEqual(status.HTTP_400_BAD_REQUEST, reponse.status_code)
        self.assertFalse(Ressource.objects.exists())

    def test_upload_refuse_une_matiere_inexistante(self):
        """Un id devine qui n'existe pas doit repondre 404, pas 500."""
        self.client.force_authenticate(user=self.user)

        reponse = self._deposer(matiere_id=999999)

        self.assertEqual(status.HTTP_404_NOT_FOUND, reponse.status_code)
        self.assertFalse(Ressource.objects.exists())

    def test_upload_refuse_un_matiere_id_non_numerique(self):
        """matiere_id='abc' faisait lever une ValueError non captalee : 500."""
        self.client.force_authenticate(user=self.user)

        reponse = self._deposer(matiere_id="abc")

        self.assertEqual(status.HTTP_400_BAD_REQUEST, reponse.status_code)
        self.assertFalse(Ressource.objects.exists())


class UploadEtudiantFichierOrphelin(APITestCase):
    """
    Un depot refuse ne doit pas laisser de fichier sur le disque.

    L'ecriture sur le disque precedait la creation de la ligne. Si celle-ci
    echouait, la transaction annulait la ligne mais pas l'octet ecrit : le
    fichier restait la, sans ligne qui le reference et sans moyen de le
    retrouver. Le service le supprime maintenant.
    """

    API_UPLOAD = "/api/eleve/me/upload/"

    def setUp(self):
        auth_user = User.objects.create_user(
            username="etudiant_orphelin",
            email="orphelin@esi.dz",
            password="pass-test-123",
        )
        etudiant = ensure_etudiant_for_auth_user(auth_user)
        self.user = get_auth_user_for_etudiant(etudiant)
        PermissionUploadEtudiant.objects.create(
            etudiant=etudiant, types_autorises=["Cours"], is_active=True,
        )
        self.media_tmp = tempfile.mkdtemp(prefix="esi-upload-orphelin-")

    def tearDown(self):
        shutil.rmtree(self.media_tmp, ignore_errors=True)

    def test_un_depot_refuse_ne_laisse_aucun_fichier(self):
        self.client.force_authenticate(user=self.user)

        with override_settings(MEDIA_ROOT=self.media_tmp):
            # Type hors permission : refuse avant toute ecriture.
            self.client.post(
                self.API_UPLOAD,
                {
                    "titre": "Chapitre 1",
                    "type_ressource": "Examen",
                    "fichier": SimpleUploadedFile("cours.pdf", PDF),
                },
            )
            # Titre vide : refuse lui aussi avant l'ecriture.
            self.client.post(
                self.API_UPLOAD,
                {
                    "titre": "   ",
                    "type_ressource": "Cours",
                    "fichier": SimpleUploadedFile("cours.pdf", PDF),
                },
            )
            deposes = list(Path(self.media_tmp).rglob("*"))

        self.assertEqual([], [p for p in deposes if p.is_file()])
        self.assertFalse(Ressource.objects.exists())


class UploadPermissionsAdminErreurs(APITestCase):
    """
    Les endpoints de permissions d'upload ne doivent pas repondre 500.

    is_superuser est le seul acces (IsSuperAdmin). Un user_id non numerique
    faisait lever une ValueError par l'ORM, et le front recevait une page de
    trace au lieu du message d'erreur.
    """

    API = "/api/eleve/upload-permissions/"

    def setUp(self):
        self.admin = User.objects.create_superuser(
            username="admin_upload", email="admin@esi.dz", password="pass-test-123",
        )

    def test_user_id_non_numerique_repond_400(self):
        self.client.force_authenticate(user=self.admin)

        reponse = self.client.post(self.API, {"user_id": "abc", "types_autorises": ["Cours"]})

        self.assertEqual(status.HTTP_400_BAD_REQUEST, reponse.status_code)
        self.assertIn("detail", reponse.data)

    def test_user_id_absent_repond_400(self):
        self.client.force_authenticate(user=self.admin)

        reponse = self.client.post(self.API, {"types_autorises": ["Cours"]})

        self.assertEqual(status.HTTP_400_BAD_REQUEST, reponse.status_code)
        self.assertIn("detail", reponse.data)

    def test_user_id_inconnu_repond_404(self):
        self.client.force_authenticate(user=self.admin)

        reponse = self.client.post(self.API, {"user_id": 999999, "types_autorises": ["Cours"]})

        self.assertEqual(status.HTTP_404_NOT_FOUND, reponse.status_code)

    def test_un_etudiant_ne_lit_pas_les_permissions(self):
        etudiant = User.objects.create_user(
            username="etudiant_lecture", email="lecture@esi.dz", password="pass-test-123",
        )
        self.client.force_authenticate(user=etudiant)

        reponse = self.client.get(self.API)

        self.assertEqual(status.HTTP_403_FORBIDDEN, reponse.status_code)


# Dossier de media du groupe de tests : l'override doit couvrir la lecture
# du fichier par la vue, pas seulement l'ecriture.
MEDIA_DOCS = tempfile.mkdtemp(prefix="esi-docs-etudiant-")


@override_settings(MEDIA_ROOT=MEDIA_DOCS)
class DocumentsEtudiantTests(APITestCase):
    """
    Portee, filtres et telechargement des documents vus par un etudiant.

    L'espace etudiant lisait /api/etablissement/ressources/, l'endpoint d'admin :
    la liste ne portait aucun tri de visibilite, et le front construisait ses
    filtres sur des ids affiches en « Matiere N°5 ». Le bouton de
    telechargement, lui, ne telechargeait rien : il generait un .txt de recu.
    """

    API = "/api/eleve/documents/"

    def setUp(self):
        self.annee = AnneeAcademique.objects.create(
            libelle="2025-2026",
            date_debut=date(2025, 9, 1),
            date_fin=date(2026, 6, 30),
            is_active=True,
        )
        self.niveau = Niveau.objects.create(code="L1", libelle="Licence 1", ordre=1)
        self.filiere = Filiere.objects.create(code="INF", libelle="Informatique")
        self.classe_a = Classe.objects.create(
            code="L1-A", libelle="L1 groupe A", niveau=self.niveau,
            filiere=self.filiere, annee_academique=self.annee,
        )
        self.classe_b = Classe.objects.create(
            code="L1-B", libelle="L1 groupe B", niveau=self.niveau,
            filiere=self.filiere, annee_academique=self.annee,
        )
        self.matiere = Matiere.objects.create(
            code="ALGO", libelle="Algorithmique", niveau=self.niveau,
            filiere=self.filiere, semestre=1,
        )
        self.etudiant, self.user = self._creer_etudiant_rattache(self.classe_a)
        self.client.force_authenticate(user=self.user)
        Path(MEDIA_DOCS).mkdir(parents=True, exist_ok=True)

    def tearDown(self):
        shutil.rmtree(MEDIA_DOCS, ignore_errors=True)

    def _creer_etudiant_rattache(self, classe):
        auth_user = User.objects.create_user(
            username=f"et_{classe.code}", email=f"{classe.code}@esi.dz",
            password="pass-test-123",
        )
        etudiant = ensure_etudiant_for_auth_user(auth_user)
        etudiant.matricule = f"M{classe.code}"
        etudiant.classe = classe
        etudiant.save()
        return etudiant, get_auth_user_for_etudiant(etudiant)

    def _fichier(self, nom="cours.pdf", contenu=PDF):
        """Pose un faux fichier joint sous MEDIA_ROOT et renvoie son chemin."""
        path = Path(MEDIA_DOCS) / "docs"
        path.mkdir(parents=True, exist_ok=True)
        (path / nom).write_bytes(contenu)
        return f"docs/{nom}"

    def _doc(self, titre, **champs):
        defauts = {
            "titre": titre,
            "type_ressource": "Cours",
            "fichier": self._fichier(),
            "taille_fichier": len(PDF),
            "format_fichier": "pdf",
            "is_public": True,
        }
        return Ressource.objects.create(**{**defauts, **champs})

    # --- portee ---------------------------------------------------------

    def test_liste_ne_expose_pas_les_documents_d_une_autre_classe(self):
        prive = self._doc("Corrige B", is_public=False, classe=self.classe_b)
        self._doc("Cours public")

        reponse = self.client.get(self.API)

        self.assertEqual(status.HTTP_200_OK, reponse.status_code)
        ids = [d["id"] for d in reponse.json()]
        self.assertNotIn(prive.id, ids, "un document prive d'une autre classe est expose")
        self.assertEqual(1, len(ids))

    def test_document_public_sans_classe_visible(self):
        general = self._doc("Guide du campus")

        reponse = self.client.get(self.API)

        self.assertIn(general.id, [d["id"] for d in reponse.json()])

    def test_document_prive_de_sa_classe_visible(self):
        prive = self._doc("Programme de la classe", is_public=False, classe=self.classe_a)

        reponse = self.client.get(self.API)

        self.assertIn(prive.id, [d["id"] for d in reponse.json()])

    def test_etudiant_revoit_son_propre_depot_meme_non_public(self):
        """Un devoir rendu par l'etudiant ne doit pas disparaitre de son espace."""
        etudiant_b, user_b = self._creer_etudiant_rattache(self.classe_b)
        rendu = self._doc("Mon devoir", is_public=False, classe=self.classe_b)
        Ressource.objects.filter(pk=rendu.pk).update(uploaded_by=etudiant_b.user)
        self.client.force_authenticate(user=user_b)

        reponse = self.client.get(self.API)

        self.assertIn(rendu.id, [d["id"] for d in reponse.json()])

    # --- libelles et telechargement --------------------------------------

    def test_liste_renvoie_des_libelles_et_non_des_ids(self):
        self._doc("Devoir algo", type_ressource="Devoir", matiere=self.matiere,
                  classe=self.classe_a, annee_academique=self.annee)

        document = self.client.get(self.API).json()[0]

        self.assertEqual("Algorithmique", document["matiere_libelle"])
        self.assertEqual("L1 groupe A", document["classe_libelle"])
        self.assertEqual("2025-2026", document["annee_libelle"])
        self.assertTrue(document["url_telechargement"].endswith("/telecharger/"))

    def test_telechargement_envoie_les_octets_du_fichier(self):
        document = self._doc("Devoir algo")

        reponse = self.client.get(f"{self.API}{document.pk}/telecharger/")

        self.assertEqual(status.HTTP_200_OK, reponse.status_code)
        self.assertEqual(b"".join(reponse.streaming_content), PDF)
        self.assertIn("attachment", reponse["Content-Disposition"])

    def test_compteur_de_telechargements_incremente(self):
        document = self._doc("Devoir algo")

        self.client.get(f"{self.API}{document.pk}/telecharger/")

        document.refresh_from_db()
        self.assertEqual(1, document.nombre_telechargements)

    def test_document_d_une_autre_classe_non_telechargeable(self):
        prive = self._doc("Corrige B", is_public=False, classe=self.classe_b)

        reponse = self.client.get(f"{self.API}{prive.pk}/telecharger/")

        self.assertEqual(status.HTTP_404_NOT_FOUND, reponse.status_code)

    def test_document_sans_fichier_ne_propose_pas_de_telechargement(self):
        document = self._doc("Lien externe", fichier=None, lien="https://esi.dz")

        payload = self.client.get(self.API).json()[0]

        self.assertFalse(payload["telechargeable"])
        self.assertIsNone(payload["url_telechargement"])

    # --- filtres --------------------------------------------------------

    def test_filtre_par_type(self):
        self._doc("Un cours", type_ressource="Cours")
        attendu = self._doc("Un rapport", type_ressource="Rapport")

        reponse = self.client.get(self.API, {"type_ressource": "Rapport"})

        self.assertEqual([attendu.pk], [d["id"] for d in reponse.json()])

    def test_filtre_par_classe(self):
        a = self._doc("Cours A", classe=self.classe_a)
        self._doc("Cours B", classe=self.classe_b)

        reponse = self.client.get(self.API, {"classe_id": self.classe_a.id})

        self.assertEqual([a.pk], [d["id"] for d in reponse.json()])

    def test_filtre_par_matiere_et_annee(self):
        autre = Matiere.objects.create(
            code="BDD", libelle="Bases de donnees", niveau=self.niveau,
            filiere=self.filiere, semestre=2,
        )
        algo = self._doc("Algo", matiere=self.matiere, annee_academique=self.annee)
        self._doc("BDD", matiere=autre, annee_academique=self.annee)

        par_matiere = self.client.get(self.API, {"matiere_id": self.matiere.id})
        par_annee = self.client.get(self.API, {"annee_academique_id": self.annee.id})

        self.assertEqual([algo.pk], [d["id"] for d in par_matiere.json()])
        self.assertEqual(2, len(par_annee.json()))

    def test_recherche_sur_titre_et_matiere(self):
        autre = Matiere.objects.create(
            code="BDD", libelle="Bases de donnees", niveau=self.niveau,
            filiere=self.filiere, semestre=2,
        )
        algo = self._doc("Rappels d'algo", matiere=self.matiere)
        self._doc("Modele relationnel", matiere=autre)

        par_titre = self.client.get(self.API, {"search": "rappels"})
        par_matiere = self.client.get(self.API, {"search": "Algorithmique"})

        self.assertEqual([algo.pk], [d["id"] for d in par_titre.json()])
        self.assertEqual([algo.pk], [d["id"] for d in par_matiere.json()])

    def test_filtre_ignore_les_valeurs_absentes(self):
        """Un Select sans choix envoie 0 : il ne doit pas tout effacer."""
        self._doc("Un cours")

        reponse = self.client.get(self.API, {"classe_id": "0", "type_ressource": ""})

        self.assertEqual(status.HTTP_200_OK, reponse.status_code)
        self.assertEqual(1, len(reponse.json()))

    def test_staff_ne_passe_pas_par_cet_endpoint(self):
        staff = User.objects.create_user(username="prof_docs", password="x")
        staff.is_staff = True
        staff.save()
        self.client.force_authenticate(user=staff)

        reponse = self.client.get(self.API)

        self.assertEqual(status.HTTP_403_FORBIDDEN, reponse.status_code)
