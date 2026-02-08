# Migration: domaine + action CRUD sur DroitAdministration, 4 sous-droits par rôle

from django.db import migrations, models
from django.db.models import Q


def migrate_droits_to_crud(apps, schema_editor):
    """Pour chaque droit existant (sans action), créer les 4 sous-droits CRUD, migrer les M2M, puis supprimer l'ancien."""
    DroitAdministration = apps.get_model("administration", "DroitAdministration")
    AdministrationEcole = apps.get_model("administration", "AdministrationEcole")
    actions = [
        ("create", " (C)"),
        ("read", " (R)"),
        ("update", " (U)"),
        ("delete", " (D)"),
    ]
    # Droits sans action = anciens (avant CRUD)
    old = list(DroitAdministration.objects.filter(action__isnull=True))
    for d in old:
        base_code = d.code
        base_libelle = d.libelle or d.code
        ordre = d.ordre
        new_ids = []
        for i, (action_key, suffix) in enumerate(actions):
            new_code = f"{base_code}_{action_key}"
            if DroitAdministration.objects.filter(code=new_code).exists():
                existing = DroitAdministration.objects.get(code=new_code)
                new_ids.append(existing.id)
                continue
            new_d = DroitAdministration.objects.create(
                code=new_code,
                libelle=f"{base_libelle}{suffix}",
                ordre=ordre * 10 + i,
                domaine=base_code,
                action=action_key,
            )
            new_ids.append(new_d.id)
        # Comptes admin qui avaient ce droit : leur donner les 4 nouveaux
        admins_with_this = AdministrationEcole.objects.filter(droits=d)
        for admin in admins_with_this:
            for new_id in new_ids:
                admin.droits.add(new_id)
            admin.droits.remove(d)
        d.delete()


class Migration(migrations.Migration):

    dependencies = [
        ("administration", "0003_droits_administration_ecole"),
    ]

    operations = [
        migrations.AddField(
            model_name="droitadministration",
            name="domaine",
            field=models.CharField(
                blank=True,
                help_text="Ex. peut_gerer_prof pour regrouper les 4 actions CRUD",
                max_length=80,
                null=True,
                verbose_name="Domaine (rôle parent)",
            ),
        ),
        migrations.AddField(
            model_name="droitadministration",
            name="action",
            field=models.CharField(
                blank=True,
                choices=[
                    ("create", "Créer (C)"),
                    ("read", "Lire (R)"),
                    ("update", "Modifier (U)"),
                    ("delete", "Supprimer (D)"),
                ],
                max_length=10,
                null=True,
                verbose_name="Action CRUD",
            ),
        ),
        migrations.AddConstraint(
            model_name="droitadministration",
            constraint=models.UniqueConstraint(
                condition=Q(domaine__isnull=False),
                fields=("domaine", "action"),
                name="droits_admin_domaine_action_unique",
            ),
        ),
        migrations.RunPython(migrate_droits_to_crud, migrations.RunPython.noop),
    ]
