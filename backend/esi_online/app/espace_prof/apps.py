"""
Configuration de l'application espace_prof.
"""
from django.apps import AppConfig


class EspaceProfConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "app.espace_prof"
    verbose_name = "Espace professeur"

    def ready(self):
        pass
