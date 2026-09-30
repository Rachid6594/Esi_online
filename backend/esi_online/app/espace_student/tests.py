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

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Permission
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from app.administration.models import (
    AnneeAcademique,
    Classe,
    Filiere,
    Niveau,
    Matiere,
)
from app.admin.models import User as AppAdminUser
from app.espace_prof.models import Chapitre, Cours, Enseignant, TP
from app.espace_student.models import Etudiant, RenduTP, TentativeQCM
from app.espace_student.utils import get_auth_user_for_etudiant

User = get_user_model()

API = "/api/eleve"


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
