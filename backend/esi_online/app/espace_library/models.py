"""
Modèles pour l'application espace_library.
"""
from django.db import models
from django.utils import timezone


class EspaceBibliotheque(models.Model):
    """Modèle espace_bibliotheque."""
    name = models.CharField(max_length=255, verbose_name="Nom")
    description = models.TextField(blank=True, null=True, verbose_name="Description")
    created_at = models.DateTimeField(default=timezone.now, verbose_name="Date de création")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Date de modification")

    class Meta:
        verbose_name = "espace_bibliotheque"
        verbose_name_plural = "espace_bibliotheque"
        ordering = ["-created_at"]

    def __str__(self):
        return self.name
