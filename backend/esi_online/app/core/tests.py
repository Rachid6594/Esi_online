"""
Tests transverses du socle.

Le controle des permissions repose sur des chaines ecrites a la main, du type
"espace_student.view_eleve". Ces chaines ne sont verifiees par personne : une
faute de frappe ne leve aucune erreur, la permission n est jamais accordee, et
la classe de permission laisse passer silencieusement en mode is_staff only.

Le test ci-dessous verifie que chaque chaine utilisee correspond bien a une
permission reelle de la base. Il a deja attrape trois prefixes de label
inexistants ("eleve.", "admin.", "prof.") qui rendaient les permissions
correspondantes impossibles a accorder.
"""

import re
from pathlib import Path

from django.apps import apps
from django.contrib.auth.models import Permission
from django.test import TestCase

# has_perm("label_app.codename")
HAS_PERM_RE = re.compile(r'has_perm\(\s*["\'](?P<label>[a-z_]+)\.(?P<codename>[a-z_]+)["\']\s*\)')


def collect_permission_codenames():
    """Relit les fichiers permissions/ de chaque app et extrait les (label, codename)."""
    found = []
    for config in apps.get_app_configs():
        permissions_dir = Path(config.path) / "permissions"
        if not permissions_dir.is_dir():
            continue
        for path in sorted(permissions_dir.glob("*.py")):
            source = path.read_text(encoding="utf-8")
            for match in HAS_PERM_RE.finditer(source):
                found.append(
                    (
                        match.group("label"),
                        match.group("codename"),
                        f"{config.label}/{path.name}",
                    )
                )
    return found


class PermissionCodenameTests(TestCase):
    """Chaque chaine has_perm() doit designer une permission reelle."""

    def test_les_fichiers_permissions_existent(self):
        # Garde-fou : si le motif de recherche ne trouve plus rien, le test
        # suivant passerait a vide et ne protegerait plus rien.
        self.assertTrue(
            collect_permission_codenames(),
            "Aucune permission trouvee : le motif de recherche est probablement casse.",
        )

    def test_chaque_codename_correspond_a_une_permission_reelle(self):
        inconnues = []
        for label, codename, origine in collect_permission_codenames():
            existe = Permission.objects.filter(
                content_type__app_label=label,
                codename=codename,
            ).exists()
            if not existe:
                inconnues.append(f"{origine} -> {label}.{codename}")

        self.assertEqual(
            [],
            inconnues,
            "Permissions referencees mais inexistantes en base :\n  "
            + "\n  ".join(inconnues),
        )
