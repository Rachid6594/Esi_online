# Generated migration for UserClasse (affectation auth.User -> Classe)

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("administration", "0001_initial"),
        ("auth", "0001_initial"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("authentification", "0001_create_admin_user"),
    ]

    operations = [
        migrations.CreateModel(
            name="UserClasse",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("user", models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name="classe_affectation", to=settings.AUTH_USER_MODEL)),
                ("classe", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="auth_users", to="administration.classe")),
            ],
            options={
                "db_table": "auth_user_classe",
                "verbose_name": "Affectation utilisateur – classe",
                "verbose_name_plural": "Affectations utilisateur – classe",
            },
        ),
    ]
