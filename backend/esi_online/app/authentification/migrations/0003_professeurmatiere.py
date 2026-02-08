# Migration ProfesseurMatiere (lien professeur auth.User <-> matière)

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("administration", "0001_initial"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("authentification", "0002_userclasse"),
    ]

    operations = [
        migrations.CreateModel(
            name="ProfesseurMatiere",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="professeur_matieres", to=settings.AUTH_USER_MODEL)),
                ("matiere", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="professeurs_lies", to="administration.matiere")),
            ],
            options={
                "db_table": "auth_professeur_matiere",
                "verbose_name": "Professeur – matière",
                "verbose_name_plural": "Professeur – matières",
            },
        ),
        migrations.AddConstraint(
            model_name="professeurmatiere",
            constraint=models.UniqueConstraint(fields=("user", "matiere"), name="auth_professeur_matiere_unique"),
        ),
    ]
