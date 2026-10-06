"""
Modèles pour l'application espace_library.
"""
from django.conf import settings
from django.db import models
from django.utils import timezone

from app.core.documents import TYPES_DOCUMENT


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


class LibraryDocument(models.Model):
    TYPE_CHOICES = TYPES_DOCUMENT
    titre = models.CharField(max_length=255)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    fichier = models.CharField(max_length=500, blank=True, default="")
    description = models.TextField(blank=True, default="")
    matiere = models.ForeignKey(
        "administration.Matiere",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="library_documents",
    )
    filiere = models.ForeignKey(
        "administration.Filiere",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="library_documents",
    )
    auteur = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="library_documents",
    )
    annee = models.CharField(max_length=9, blank=True, default="")
    nb_telechargements = models.PositiveIntegerField(default=0)
    date_ajout = models.DateTimeField(auto_now_add=True)
    est_approuve = models.BooleanField(default=True)

    class Meta:
        db_table = "library_documents"
        ordering = ["-date_ajout"]


class DownloadHistory(models.Model):
    document = models.ForeignKey(
        LibraryDocument,
        on_delete=models.CASCADE,
        related_name="downloads",
    )
    utilisateur = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="download_history",
    )
    date = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "library_download_history"
        ordering = ["-date"]
