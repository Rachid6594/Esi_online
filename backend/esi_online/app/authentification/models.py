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


class ProfesseurMatiere(models.Model):
    """
    Lien entre un compte professeur (auth.User du groupe professeurs) et une matière.
    Un professeur peut être lié à une ou plusieurs matières.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="professeur_matieres",
    )
    matiere = models.ForeignKey(
        "administration.Matiere",
        on_delete=models.CASCADE,
        related_name="professeurs_lies",
    )

    class Meta:
        db_table = "auth_professeur_matiere"
        verbose_name = "Professeur – matière"
        verbose_name_plural = "Professeur – matières"
        constraints = [
            models.UniqueConstraint(fields=["user", "matiere"], name="auth_professeur_matiere_unique"),
        ]
