#!/usr/bin/env python3
"""
Crée une application Django avec structure complète (template style):
interfaces, repositories, services, permissions, views (ViewSet), serializers, urls (DefaultRouter).
Enregistre l'app dans settings et les URLs dans esi_online/urls.py.
Usage: python create_app_full.py <app_name> [verbose_name]
"""
import re
import sys
from pathlib import Path


def validate_app_name(name: str) -> str:
    if not name or not re.match(r"^[a-z][a-z0-9_]*$", name):
        raise ValueError(
            f"Nom invalide: '{name}'. Utilisez minuscules, chiffres et _ (ex: products)."
        )
    return name


def create_app_full(app_name: str, verbose_name: str | None = None) -> None:
    if verbose_name is None:
        verbose_name = "".join(w.capitalize() for w in app_name.replace("_", " ").split())
    class_name = "".join(w.capitalize() for w in app_name.split("_"))
    app_module = f"app.{app_name}"
    base_dir = Path(__file__).resolve().parent
    app_dir = base_dir / "app" / app_name

    if app_dir.exists():
        print(f"[ERREUR] Le dossier app/{app_name}/ existe déjà.")
        sys.exit(1)

    # Structure complète
    files = {
        "__init__.py": f'"""Application {app_name} - {verbose_name}."""',
        "apps.py": f'''"""
Configuration de l'application {app_name}.
"""
from django.apps import AppConfig


class {class_name}Config(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "{app_module}"
    verbose_name = "{verbose_name}"

    def ready(self):
        pass
''',
        "models.py": f'''"""
Modèles pour l'application {app_name}.
"""
from django.db import models
from django.utils import timezone


class {class_name}(models.Model):
    """Modèle {verbose_name}."""
    name = models.CharField(max_length=255, verbose_name="Nom")
    description = models.TextField(blank=True, null=True, verbose_name="Description")
    created_at = models.DateTimeField(default=timezone.now, verbose_name="Date de création")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Date de modification")

    class Meta:
        verbose_name = "{verbose_name}"
        verbose_name_plural = "{verbose_name}"
        ordering = ["-created_at"]

    def __str__(self):
        return self.name
''',
        "serializers.py": f'''"""
Sérialiseurs pour l'application {app_name}.
"""
from rest_framework import serializers
from app.{app_name}.models import {class_name}


class {class_name}Serializer(serializers.ModelSerializer):
    class Meta:
        model = {class_name}
        fields = "__all__"
        read_only_fields = ["created_at", "updated_at"]
''',
        "urls.py": f'''"""
URLs pour l'application {app_name}.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from app.{app_name}.views.{app_name}_viewset import {class_name}ViewSet

router = DefaultRouter(trailing_slash=False)
router.register(r"", {class_name}ViewSet, basename="{app_name}")

urlpatterns = [
    path("", include(router.urls)),
]
app_name = "{app_name}"
''',
        "admin.py": f'''from django.contrib import admin
from app.{app_name}.models import {class_name}

admin.site.register({class_name})
''',
        "tests.py": f'''"""Tests pour l'application {app_name}."""
from django.test import TestCase
from app.{app_name}.models import {class_name}
''',
        "migrations/__init__.py": "",
        "interfaces/__init__.py": "",
        f"interfaces/{app_name}_repository_interface.py": f'''"""
Interface du repository {app_name}.
"""
from abc import ABC, abstractmethod


class {class_name}RepositoryInterface(ABC):
    @abstractmethod
    def get_all(self):
        pass

    @abstractmethod
    def get_by_id(self, pk):
        pass

    @abstractmethod
    def create(self, data):
        pass

    @abstractmethod
    def update(self, pk, data, partial=False):
        pass

    @abstractmethod
    def delete(self, pk):
        pass
''',
        "repositories/__init__.py": f'''from app.{app_name}.repositories.{app_name}_repository import {class_name}Repository

__all__ = ["{class_name}Repository"]
''',
        f"repositories/{app_name}_repository.py": f'''"""
Repository pour l'accès aux données {app_name}.
"""
from app.{app_name}.models import {class_name}
from app.{app_name}.interfaces.{app_name}_repository_interface import {class_name}RepositoryInterface


class {class_name}Repository({class_name}RepositoryInterface):
    def get_all(self):
        return {class_name}.objects.all()

    def get_by_id(self, pk):
        return {class_name}.objects.get(id=pk)

    def create(self, data):
        return {class_name}.objects.create(**data)

    def update(self, pk, data, partial=False):
        obj = self.get_by_id(pk)
        for field, value in data.items():
            if hasattr(obj, field):
                setattr(obj, field, value)
        obj.save()
        return obj

    def delete(self, pk):
        obj = self.get_by_id(pk)
        obj.delete()
        return True
''',
        "services/__init__.py": f'''from app.{app_name}.services.{app_name}_service import {class_name}Service

__all__ = ["{class_name}Service"]
''',
        f"services/{app_name}_service.py": f'''"""
Service métier pour {app_name}.
"""
from app.{app_name}.models import {class_name}
from app.{app_name}.repositories.{app_name}_repository import {class_name}Repository


class {class_name}Service:
    def __init__(self):
        self.repository = {class_name}Repository()

    def get_all(self):
        return self.repository.get_all()

    def get_by_id(self, pk):
        return self.repository.get_by_id(pk)

    def create(self, data):
        return self.repository.create(data)

    def update(self, pk, data, partial=False):
        return self.repository.update(pk, data, partial)

    def delete(self, pk):
        return self.repository.delete(pk)
''',
        "permissions/__init__.py": "",
        f"permissions/{app_name}_permissions.py": f'''"""
Permissions pour l'application {app_name}.
"""
from rest_framework import permissions


class CanView{class_name}(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_staff or request.user.has_perm("{app_name}.view_{class_name.lower()}")
        )


class CanCreate{class_name}(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_staff or request.user.has_perm("{app_name}.add_{class_name.lower()}")
        )


class CanUpdate{class_name}(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_staff or request.user.has_perm("{app_name}.change_{class_name.lower()}")
        )


class CanDelete{class_name}(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_staff or request.user.has_perm("{app_name}.delete_{class_name.lower()}")
        )
''',
        "views/__init__.py": "",
        f"views/{app_name}_viewset.py": f'''"""
ViewSet CRUD pour {app_name}.
"""
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from app.{app_name}.models import {class_name}
from app.{app_name}.serializers import {class_name}Serializer
from app.{app_name}.services.{app_name}_service import {class_name}Service
from app.{app_name}.permissions.{app_name}_permissions import (
    CanView{class_name},
    CanCreate{class_name},
    CanUpdate{class_name},
    CanDelete{class_name},
)


class {class_name}ViewSet(viewsets.ModelViewSet):
    queryset = {class_name}.objects.all()
    serializer_class = {class_name}Serializer

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.service = {class_name}Service()

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [CanView{class_name}()]
        if self.action == "create":
            return [CanCreate{class_name}()]
        if self.action in ("update", "partial_update"):
            return [CanUpdate{class_name}()]
        if self.action == "destroy":
            return [CanDelete{class_name}()]
        return [IsAuthenticated()]

    def list(self, request, *args, **kwargs):
        items = self.service.get_all()
        serializer = self.get_serializer(items, many=True)
        return Response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        try:
            obj = self.service.get_by_id(kwargs["pk"])
        except {class_name}.DoesNotExist:
            return Response({{"detail": "Non trouvé."}}, status=status.HTTP_404_NOT_FOUND)
        serializer = self.get_serializer(obj)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        obj = self.service.create(serializer.validated_data)
        serializer = self.get_serializer(obj)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        try:
            obj = self.service.get_by_id(kwargs["pk"])
        except {class_name}.DoesNotExist:
            return Response({{"detail": "Non trouvé."}}, status=status.HTTP_404_NOT_FOUND)
        serializer = self.get_serializer(obj, data=request.data, partial=kwargs.get("partial", False))
        serializer.is_valid(raise_exception=True)
        obj = self.service.update(kwargs["pk"], serializer.validated_data, partial=kwargs.get("partial", False))
        return Response(self.get_serializer(obj).data)

    def destroy(self, request, *args, **kwargs):
        try:
            self.service.delete(kwargs["pk"])
        except {class_name}.DoesNotExist:
            return Response({{"detail": "Non trouvé."}}, status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)
''',
    }

    for file_path, content in files.items():
        full_path = app_dir / file_path
        full_path.parent.mkdir(parents=True, exist_ok=True)
        full_path.write_text(content, encoding="utf-8")

    # Enregistrer dans settings.py
    config_dir = base_dir / "esi_online"
    settings_path = config_dir / "settings.py"
    if settings_path.exists():
        text = settings_path.read_text(encoding="utf-8")
        entry = f'"app.{app_name}"'
        if entry not in text:
            match = list(re.finditer(r'^\s+"(app\.\w+)",\s*$', text, re.MULTILINE))
            if match:
                last = match[-1]
                insert_pos = last.end()
                text = text[:insert_pos] + f"\n    {entry}," + text[insert_pos:]
                settings_path.write_text(text, encoding="utf-8")
                print(f"[OK] App ajoutée dans esi_online/settings.py")
    else:
        print(f"[!] settings.py non trouvé: {settings_path}")

    # Enregistrer dans urls.py
    urls_path = config_dir / "urls.py"
    if urls_path.exists():
        text = urls_path.read_text(encoding="utf-8")
        include_str = f'include("app.{app_name}.urls")'
        if include_str not in text:
            idx = text.rfind("\n]")
            if idx != -1:
                line = f'    path("api/{app_name}/", include("app.{app_name}.urls")),\n'
                text = text[: idx + 1] + line + text[idx + 1 :]
                urls_path.write_text(text, encoding="utf-8")
                print(f"[OK] URL ajoutée dans esi_online/urls.py -> api/{app_name}/")
    else:
        print(f"[!] urls.py non trouvé: {urls_path}")

    print(f"\n[OK] Application '{app_module}' créée avec succès.")
    print(f"Dossier: {app_dir}")
    print("\nProchaines étapes:")
    print(f"  1. python manage.py makemigrations {app_name}")
    print(f"  2. python manage.py migrate")
    print(f"  3. Tester: GET/POST api/{app_name}/ , GET/PUT/DELETE api/{app_name}/<id>/")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python create_app_full.py <app_name> [verbose_name]")
        sys.exit(1)
    app_name = sys.argv[1].strip().lower()
    verbose_name = sys.argv[2].strip() if len(sys.argv) > 2 else None
    try:
        create_app_full(app_name, verbose_name)
    except ValueError as e:
        print(f"[ERREUR] {e}")
        sys.exit(1)
