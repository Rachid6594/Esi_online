"""
Configuration de l'application espace_student.
"""
from django.apps import AppConfig


class EspaceStudentConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "app.espace_student"
    verbose_name = "Espace étudiant"

    def ready(self):
        pass
