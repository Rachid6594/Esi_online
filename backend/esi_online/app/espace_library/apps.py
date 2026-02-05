"""
Configuration de l'application espace_library.
"""
from django.apps import AppConfig


class EspaceLibraryConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "app.espace_library"
    verbose_name = "Espace bibliothèque"

    def ready(self):
        pass
