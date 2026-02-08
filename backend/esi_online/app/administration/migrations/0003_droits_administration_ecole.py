# Generated manually for droits administration

from django.db import migrations, models


def create_initial_droits(apps, schema_editor):
    DroitAdministration = apps.get_model("administration", "DroitAdministration")
    initial = [
        ("peut_gerer_etudiants", "Gérer les étudiants", 10),
        ("peut_gerer_enseignants", "Gérer les enseignants", 20),
        ("peut_gerer_structure_academique", "Gérer la structure académique", 30),
        ("peut_envoyer_annonces", "Envoyer des annonces", 40),
        ("peut_gerer_bibliotheque", "Gérer la bibliothèque", 50),
        ("peut_voir_statistiques", "Voir les statistiques", 60),
        ("peut_gerer_emplois_du_temps", "Gérer les emplois du temps", 70),
    ]
    for code, libelle, ordre in initial:
        DroitAdministration.objects.get_or_create(
            code=code,
            defaults={"libelle": libelle, "ordre": ordre},
        )


class Migration(migrations.Migration):

    dependencies = [
        ("administration", "0002_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="DroitAdministration",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("code", models.CharField(max_length=80, unique=True, verbose_name="Code")),
                ("libelle", models.CharField(max_length=200, verbose_name="Libellé")),
                ("ordre", models.IntegerField(default=0, verbose_name="Ordre d'affichage")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "verbose_name": "Droit d'administration",
                "verbose_name_plural": "Droits d'administration",
                "db_table": "droits_administration",
                "ordering": ["ordre", "libelle"],
            },
        ),
        migrations.AddField(
            model_name="administrationecole",
            name="droits",
            field=models.ManyToManyField(
                blank=True,
                related_name="admins_ecole",
                to="administration.droitadministration",
                verbose_name="Droits",
            ),
        ),
        migrations.RemoveField(model_name="administrationecole", name="peut_gerer_etudiants"),
        migrations.RemoveField(model_name="administrationecole", name="peut_gerer_enseignants"),
        migrations.RemoveField(model_name="administrationecole", name="peut_gerer_structure_academique"),
        migrations.RemoveField(model_name="administrationecole", name="peut_envoyer_annonces"),
        migrations.RemoveField(model_name="administrationecole", name="peut_gerer_bibliotheque"),
        migrations.RemoveField(model_name="administrationecole", name="peut_voir_statistiques"),
        migrations.RunPython(create_initial_droits, migrations.RunPython.noop),
    ]
