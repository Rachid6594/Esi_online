"""
Configuration de l'application administration.
"""
from django.apps import AppConfig


class AdministrationConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "app.administration"
    verbose_name = "Administration"

    def ready(self):
        pass
