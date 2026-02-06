from django.conf import settings
from django.db import models


class UserClasse(models.Model):
    """
    Affectation d'un utilisateur (auth.User) à une classe.
    Utilisé pour les étudiants créés depuis l'admin (formulaire ou CSV).
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="classe_affectation",
    )
    classe = models.ForeignKey(
        "administration.Classe",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="auth_users",
    )

    class Meta:
        db_table = "auth_user_classe"
        verbose_name = "Affectation utilisateur – classe"
        verbose_name_plural = "Affectations utilisateur – classe"
