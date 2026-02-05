#!/usr/bin/env python3
"""
Script de création d'une application Django avec architecture Repository.
Usage: python create_app.py <nom_app>
Exemple: python create_app.py library

  - Crée l'app dans app/<nom_app>/ (models, admin, apps, tests, migrations,
    repositories/, services/, api/)
  - Ajoute "app.<nom_app>" dans esi_online/settings.py (INSTALLED_APPS)
  - Ajoute path("api/<nom_app>/", include(...)) dans esi_online/urls.py
"""
import re
import sys
from pathlib import Path


def validate_app_name(name: str) -> str:
    """Nom en minuscules, alphanumeriques + underscores."""
    if not name or not re.match(r"^[a-z][a-z0-9_]*$", name):
        raise ValueError(
            f"Nom invalide: '{name}'. Utilisez uniquement minuscules, chiffres et _ (ex: library, academic)."
        )
    return name


def get_templates(app_name: str) -> dict[str, str]:
    """Contenu des fichiers à générer."""
    class_name = "".join(w.capitalize() for w in app_name.split("_"))
    repo_class = f"{class_name}Repository"
    service_class = f"{class_name}Service"
    app_module = f"app.{app_name}"

    return {
        "app/__init__.py": "",
        "apps.py": f'''from django.apps import AppConfig


class {class_name}Config(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "{app_module}"
    verbose_name = "{class_name}"
''',
        "models.py": '''from django.db import models


# Définir vos modèles ici.
# Exemple:
# class MonModele(models.Model):
#     titre = models.CharField(max_length=200)
#     created_at = models.DateTimeField(auto_now_add=True)
''',
        "admin.py": '''from django.contrib import admin

# from app.{app_name}.models import MonModele
# admin.site.register(MonModele)
''',
        "tests.py": '''from django.test import TestCase

# from app.{app_name}.services import {service_class}
# from app.{app_name}.repositories import {repo_class}
''',
        "views.py": "# Vues Django classiques (optionnel). L'API REST est dans api/.",
        "migrations/__init__.py": "",
        "repositories/__init__.py": f'''from app.{app_name}.repositories.{app_name}_repository import {repo_class}

__all__ = ["{repo_class}"]
''',
        "repositories/repo_file": f'''"""
Repository {app_name} : accès aux données (pattern Repository).
Hérite de BaseRepository ; assigner le modèle dans model = ...
"""
from app.core.repositories.base import BaseRepository


class {repo_class}(BaseRepository):
    # Remplacer par votre modèle : from app.{app_name}.models import MonModele
    # model = MonModele
    model = None  # À définir après création du modèle

    def get_queryset(self):
        return super().get_queryset()
        # Exemple de filtre par défaut :
        # return super().get_queryset().filter(is_active=True)
'''.replace("repo_file", f"{app_name}_repository.py"),
        "services/__init__.py": f'''from app.{app_name}.services.{app_name}_service import {service_class}

__all__ = ["{service_class}"]
''',
        "services/service_file": f'''"""
Service {app_name} : logique métier.
Utilise les repositories ; les vues API appellent les services.
"""
from app.{app_name}.repositories import {repo_class}


class {service_class}:
    def __init__(self):
        self.repository = {repo_class}()

    def get_by_id(self, pk: int):
        return self.repository.get_by_id(pk)

    def list_all(self):
        return self.repository.get_queryset()

    # Ajouter les méthodes métier (create, update, validate, etc.)
'''.replace("service_file", f"{app_name}_service.py"),
        "api/__init__.py": "# API REST : serializers, views, urls (appellent les services)",
        "api/serializers.py": f'''"""
Serializers pour l'API {app_name}.
"""
from rest_framework import serializers

# from app.{app_name}.models import MonModele
# class MonModeleSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = MonModele
#         fields = "__all__"
''',
        "api/views.py": f'''"""
Vues API {app_name} : appellent les services (pas les repositories directement).
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

# from app.{app_name}.services import {service_class}


@api_view(["GET"])
def list_view(request):
    """Exemple : liste des éléments."""
    # service = {service_class}()
    # items = service.list_all()
    # serializer = MonModeleSerializer(items, many=True)
    return Response({{"detail": "À implémenter"}}, status=status.HTTP_200_OK)


@api_view(["GET"])
def detail_view(request, pk: int):
    """Exemple : détail d'un élément."""
    # service = {service_class}()
    # item = service.get_by_id(pk)
    # if not item:
    #     return Response({{"detail": "Non trouvé"}}, status=status.HTTP_404_NOT_FOUND)
    # serializer = MonModeleSerializer(item)
    return Response({{"detail": "À implémenter"}}, status=status.HTTP_200_OK)
''',
        "api/urls.py": f'''from django.urls import path

from app.{app_name}.api import views

app_name = "{app_name}"

urlpatterns = [
    path("", views.list_view),
    path("<int:pk>/", views.detail_view),
]
''',
    }


def create_app(app_name: str, base_dir: Path) -> None:
    """Crée l'arborescence et tous les fichiers."""
    app_name = validate_app_name(app_name)
    app_dir = base_dir / "app" / app_name

    if app_dir.exists():
        print(f"Erreur: le dossier app/{app_name}/ existe déjà.")
        sys.exit(1)

    templates = get_templates(app_name)

    # Dossiers
    dirs_to_create = [
        app_dir,
        app_dir / "migrations",
        app_dir / "repositories",
        app_dir / "services",
        app_dir / "api",
    ]
    for d in dirs_to_create:
        d.mkdir(parents=True, exist_ok=True)

    # Fichiers plats dans app/<name>/
    flat_files = {
        "apps.py": templates["apps.py"],
        "models.py": templates["models.py"],
        "admin.py": templates["admin.py"],
        "tests.py": templates["tests.py"],
        "views.py": templates["views.py"],
        "__init__.py": "",
    }
    for filename, content in flat_files.items():
        (app_dir / filename).write_text(content, encoding="utf-8")

    # migrations/__init__.py
    (app_dir / "migrations" / "__init__.py").write_text("", encoding="utf-8")

    # repositories/
    (app_dir / "repositories" / "__init__.py").write_text(
        templates["repositories/__init__.py"], encoding="utf-8"
    )
    (app_dir / "repositories" / f"{app_name}_repository.py").write_text(
        templates["repositories/repo_file"], encoding="utf-8"
    )

    # services/
    (app_dir / "services" / "__init__.py").write_text(
        templates["services/__init__.py"], encoding="utf-8"
    )
    (app_dir / "services" / f"{app_name}_service.py").write_text(
        templates["services/service_file"], encoding="utf-8"
    )

    # api/
    (app_dir / "api" / "__init__.py").write_text(
        templates["api/__init__.py"], encoding="utf-8"
    )
    (app_dir / "api" / "serializers.py").write_text(
        templates["api/serializers.py"], encoding="utf-8"
    )
    (app_dir / "api" / "views.py").write_text(
        templates["api/views.py"], encoding="utf-8"
    )
    (app_dir / "api" / "urls.py").write_text(
        templates["api/urls.py"], encoding="utf-8"
    )

    # Mise à jour automatique de settings.py et urls.py
    config_dir = base_dir / "esi_online"
    settings_path = config_dir / "settings.py"
    urls_path = config_dir / "urls.py"

    if settings_path.exists():
        add_app_to_settings(settings_path, app_name)
        print(f"[OK] App ajoutée dans esi_online/settings.py (INSTALLED_APPS)")
    else:
        print(f"[!] Fichier settings non trouvé : {settings_path}")

    if urls_path.exists():
        add_app_to_urls(urls_path, app_name)
        print(f"[OK] URL ajoutée dans esi_online/urls.py (api/{app_name}/)")
    else:
        print(f"[!] Fichier urls non trouvé : {urls_path}")

    print()
    print("Prochaines étapes:")
    print(f"  1. Définir les modèles dans app/{app_name}/models.py")
    print(f"  2. Dans app/{app_name}/repositories/{app_name}_repository.py : assigner model = VotreModele")
    print(f"  3. python manage.py makemigrations {app_name}")
    print(f"  4. python manage.py migrate")


def add_app_to_settings(settings_path: Path, app_name: str) -> None:
    """Ajoute 'app.<app_name>' dans INSTALLED_APPS (après la dernière app.xxx)."""
    text = settings_path.read_text(encoding="utf-8")
    app_entry = f'"app.{app_name}"'
    if app_entry in text:
        return
    # Trouver la dernière ligne "app.xxx", (sans # devant) et ajouter après
    match = list(re.finditer(r'^\s+"(app\.\w+)",\s*$', text, re.MULTILINE))
    if not match:
        return
    last = match[-1]
    insert_pos = last.end()
    # Insérer après le \n qui suit cette ligne
    new_text = text[:insert_pos] + f"\n    {app_entry}," + text[insert_pos:]
    settings_path.write_text(new_text, encoding="utf-8")


def add_app_to_urls(urls_path: Path, app_name: str) -> None:
    """Ajoute path('api/<app_name>/', include(...)) dans urlpatterns."""
    text = urls_path.read_text(encoding="utf-8")
    include_str = f'include("app.{app_name}.api.urls")'
    if include_str in text:
        return
    new_line = f'    path("api/{app_name}/", include("app.{app_name}.api.urls")),\n'
    idx = text.rfind("\n]")
    if idx != -1:
        new_text = text[: idx + 1] + new_line + text[idx + 1 :]
        urls_path.write_text(new_text, encoding="utf-8")


def main():
    if len(sys.argv) != 2:
        print("Usage: python create_app.py <nom_app>")
        print("Exemple: python create_app.py library")
        sys.exit(1)

    app_name = sys.argv[1].strip().lower()
    # Répertoire racine du projet Django (où se trouve manage.py)
    base_dir = Path(__file__).resolve().parent

    try:
        create_app(app_name, base_dir)
    except ValueError as e:
        print(f"Erreur: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
