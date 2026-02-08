# Migration: compte de connexion (email + mot de passe) pour AdministrationEcole

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("administration", "0004_droitadministration_crud"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name="administrationecole",
            name="auth_user",
            field=models.OneToOneField(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="administration_ecole_auth_profile",
                to=settings.AUTH_USER_MODEL,
                verbose_name="Compte de connexion (email + mot de passe)",
            ),
        ),
    ]
