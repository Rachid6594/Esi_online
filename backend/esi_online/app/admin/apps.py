"""
Configuration de l'application admin.
"""
from django.apps import AppConfig


class AdminConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "app.admin"
    label = "app_admin"  # évite conflit avec django.contrib.admin
    verbose_name = "Admin"

    def ready(self):
        pass
