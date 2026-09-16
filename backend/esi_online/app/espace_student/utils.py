"""
Helpers pour lier le User Django auth à Etudiant (via app_admin.User au même id).
"""
from django.contrib.auth import get_user_model

from app.admin.models import User as AdminUser
from app.espace_student.models import Etudiant

AuthUser = get_user_model()


def ensure_etudiant_for_auth_user(auth_user) -> Etudiant:
    """
    Garantit un profil Etudiant pour un User auth (non staff).
    Crée AdminUser + Etudiant si besoin (id aligné).
    """
    admin_user, _ = AdminUser.objects.get_or_create(
        id=auth_user.id,
        defaults={"role": "user", "is_active": True},
    )
    etudiant, created = Etudiant.objects.get_or_create(
        user=admin_user,
        defaults={
            "matricule": f"ETU{auth_user.id:05d}",
        },
    )
    if created:
        # Lier la classe si UserClasse existe
        try:
            from app.authentification.models import UserClasse
            uc = UserClasse.objects.filter(user=auth_user).select_related("classe").first()
            if uc and uc.classe_id:
                etudiant.classe_id = uc.classe_id
                etudiant.save(update_fields=["classe_id", "updated_at"])
        except Exception:
            pass
    return etudiant


def get_etudiant_for_auth_user(auth_user) -> Etudiant | None:
    if not auth_user or not auth_user.is_authenticated:
        return None
    try:
        admin_user = AdminUser.objects.get(pk=auth_user.id)
    except AdminUser.DoesNotExist:
        return None
    return Etudiant.objects.filter(user=admin_user).first()


def get_auth_user_for_etudiant(etudiant) -> AuthUser | None:
    if not etudiant or not etudiant.user_id:
        return None
    return AuthUser.objects.filter(pk=etudiant.user_id).first()
