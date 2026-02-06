# Migration pour créer un superutilisateur admin (tous les droits).
# Mot de passe : variable d'environnement ADMIN_INITIAL_PASSWORD, sinon "AdminESI2025!"
import os

from django.db import migrations
from django.contrib.auth.hashers import make_password


def create_admin_user(apps, schema_editor):
    User = apps.get_model("auth", "User")
    if User.objects.filter(username="admin").exists():
        return
    password = os.environ.get("ADMIN_INITIAL_PASSWORD", "AdminESI2025!")
    User.objects.create(
        username="admin",
        email="admin@esi.bf",
        password=make_password(password),
        is_staff=True,
        is_superuser=True,
        is_active=True,
    )


def noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("auth", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(create_admin_user, noop),
    ]
