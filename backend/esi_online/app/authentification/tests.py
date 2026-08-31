"""Tests pour la gestion globale des utilisateurs (admin) de l'application authentification."""
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from rest_framework import status
from rest_framework.test import APITestCase

from app.administration.models import AdministrationEcole

User = get_user_model()

API_PREFIX = "/api/auth/users"


class UserManagementBaseTestCase(APITestCase):
    """Base : un admin (staff, non superuser) authentifié et quelques comptes."""

    def setUp(self):
        self.admin = User.objects.create_user(
            username="admin_test",
            email="admin_test@esi.dz",
            password="pass-test-123",
            is_staff=True,
        )
        self.superuser = User.objects.create_superuser(
            username="super_test",
            email="super_test@esi.dz",
            password="pass-test-123",
        )
        self.student = User.objects.create_user(
            username="student_test",
            email="student_test@esi.dz",
            password="pass-test-123",
            first_name="Alice",
            last_name="Durand",
        )
        self.bibliothecaire = User.objects.create_user(
            username="biblio_test",
            email="biblio_test@esi.dz",
            password="pass-test-123",
            is_staff=True,
        )
        prof_group = Group.objects.get_or_create(name="professeurs")[0]
        self.professeur = User.objects.create_user(
            username="prof_test",
            email="prof_test@esi.dz",
            password="pass-test-123",
            first_name="Bob",
            last_name="Martin",
        )
        self.professeur.groups.add(prof_group)

        self.client.force_authenticate(user=self.admin)

    def _create_admin_ecole(self, user):
        from app.admin.models import User as AppAdminUser
        app_admin_user = AppAdminUser.objects.create()
        AdministrationEcole.objects.create(
            user=app_admin_user,
            auth_user=user,
            matricule="M001",
            poste="Secrétaire",
        )


class UsersListTests(UserManagementBaseTestCase):
    def test_list_returns_all_users(self):
        resp = self.client.get(f"{API_PREFIX}/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        emails = {u["email"] for u in resp.data}
        # Tous nos comptes de test doivent être présents (un superuser admin@esi.bf
        # est créé par une migration de données).
        self.assertSetEqual(
            {
                "admin_test@esi.dz",      # admin via is_staff -> role "bibliothecaire"
                "super_test@esi.dz",      # superuser -> role "admin"
                "student_test@esi.dz",    # -> role "user"
                "biblio_test@esi.dz",     # staff -> role "bibliothecaire"
                "prof_test@esi.dz",       # groupe professeurs -> role "professeur"
            },
            emails.intersection({
                "admin_test@esi.dz",
                "super_test@esi.dz",
                "student_test@esi.dz",
                "biblio_test@esi.dz",
                "prof_test@esi.dz",
            }),
        )

    def test_role_field_computed(self):
        resp = self.client.get(f"{API_PREFIX}/")
        roles = {u["email"]: u["role"] for u in resp.data}
        self.assertEqual(roles["super_test@esi.dz"], "admin")
        self.assertEqual(roles["student_test@esi.dz"], "user")
        self.assertEqual(roles["prof_test@esi.dz"], "professeur")
        self.assertEqual(roles["biblio_test@esi.dz"], "bibliothecaire")

    def test_admin_ecole_role(self):
        self._create_admin_ecole(self.admin)
        resp = self.client.get(f"{API_PREFIX}/")
        roles = {u["email"]: u["role"] for u in resp.data}
        self.assertEqual(roles["admin_test@esi.dz"], "admin_ecole")

    def test_filter_by_role(self):
        self._create_admin_ecole(self.admin)
        resp = self.client.get(f"{API_PREFIX}/", {"role": "professeur"})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        emails = {u["email"] for u in resp.data}
        self.assertEqual(emails, {"prof_test@esi.dz"})

        resp = self.client.get(f"{API_PREFIX}/", {"role": "admin_ecole"})
        emails = {u["email"] for u in resp.data}
        self.assertEqual(emails, {"admin_test@esi.dz"})

    def test_filter_by_search(self):
        resp = self.client.get(f"{API_PREFIX}/", {"search": "Alice"})
        emails = {u["email"] for u in resp.data}
        self.assertEqual(emails, {"student_test@esi.dz"})

        resp = self.client.get(f"{API_PREFIX}/", {"search": "prof_test"})
        emails = {u["email"] for u in resp.data}
        self.assertEqual(emails, {"prof_test@esi.dz"})

    def test_filter_by_is_active(self):
        self.student.is_active = False
        self.student.save()
        resp = self.client.get(f"{API_PREFIX}/", {"is_active": "false"})
        emails = {u["email"] for u in resp.data}
        self.assertEqual(emails, {"student_test@esi.dz"})


class UsersPermissionTests(UserManagementBaseTestCase):
    def test_requires_staff(self):
        self.client.force_authenticate(user=self.student)
        resp = self.client.get(f"{API_PREFIX}/")
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_requires_authentication(self):
        self.client.force_authenticate(user=None)
        resp = self.client.get(f"{API_PREFIX}/")
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)


class UserToggleActiveTests(UserManagementBaseTestCase):
    def test_deactivate_student(self):
        resp = self.client.post(f"{API_PREFIX}/{self.student.id}/toggle-active/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.student.refresh_from_db()
        self.assertFalse(self.student.is_active)

    def test_reactivate_student(self):
        self.student.is_active = False
        self.student.save()
        resp = self.client.post(f"{API_PREFIX}/{self.student.id}/toggle-active/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.student.refresh_from_db()
        self.assertTrue(self.student.is_active)

    def test_cannot_deactivate_superuser(self):
        resp = self.client.post(f"{API_PREFIX}/{self.superuser.id}/toggle-active/")
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.superuser.refresh_from_db()
        self.assertTrue(self.superuser.is_active)

    def test_unknown_user_returns_404(self):
        resp = self.client.post(f"{API_PREFIX}/99999/toggle-active/")
        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)


class UserDeleteTests(UserManagementBaseTestCase):
    def test_delete_student(self):
        resp = self.client.delete(f"{API_PREFIX}/{self.student.id}/")
        self.assertEqual(resp.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(User.objects.filter(pk=self.student.id).exists())

    def test_cannot_delete_superuser(self):
        resp = self.client.delete(f"{API_PREFIX}/{self.superuser.id}/")
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertTrue(User.objects.filter(pk=self.superuser.id).exists())

    def test_unknown_user_returns_404(self):
        resp = self.client.delete(f"{API_PREFIX}/99999/")
        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)
