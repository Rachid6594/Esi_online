"""
Générateur de code ESI-Online avec architecture Repository.
Génère / fusionne : models, repositories, services, api (serializers, views, urls).
"""
import os
import re
import shutil
import subprocess
import sys
from datetime import datetime
from pathlib import Path
from typing import Any

try:
    from jinja2 import Environment, FileSystemLoader
except ModuleNotFoundError:
    Environment = None
    FileSystemLoader = None

from codegen.schema_validator import ModelDefinition, SchemaValidator


def _get_base_dir() -> Path:
    """Racine du projet Django (où est manage.py)."""
    return Path(__file__).resolve().parent.parent


class ImprovedCodeGenerator:
    """Générateur de code pour l'architecture Repository (app/)."""

    def __init__(self, template_dir: str | None = None, base_dir: str | Path | None = None):
        if template_dir is None:
            template_dir = os.path.join(os.path.dirname(__file__), "templates")
        if Environment is None or FileSystemLoader is None:
            raise RuntimeError(
                "Jinja2 est requis. Exécutez: pip install jinja2"
            )
        def py_string(s: str) -> str:
            """Retourne une chaîne Python sûre (guillemets/apostrophes échappés)."""
            if s is None:
                return "''"
            return repr(str(s))

        self.env = Environment(
            loader=FileSystemLoader(template_dir),
            trim_blocks=True,
            lstrip_blocks=True,
        )
        self.env.filters["py_string"] = py_string
        self.backup_dir = os.path.join(os.path.dirname(__file__), "backups")
        os.makedirs(self.backup_dir, exist_ok=True)
        self.base_dir = Path(base_dir) if base_dir else _get_base_dir()

    def create_backup(self, file_path: str) -> str | None:
        """Crée une sauvegarde avant modification."""
        if os.path.exists(file_path):
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_name = f"{os.path.basename(file_path)}.{timestamp}.backup"
            backup_path = os.path.join(self.backup_dir, backup_name)
            shutil.copy2(file_path, backup_path)
            return backup_path
        return None

    def validate_python_syntax(self, file_path: str) -> bool:
        """Valide la syntaxe Python d'un fichier."""
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                compile(f.read(), file_path, "exec")
            return True
        except SyntaxError as e:
            print(f"[ERREUR] Erreur de syntaxe dans {file_path}: {e}")
            return False
        except Exception as e:
            print(f"[ERREUR] Erreur validation {file_path}: {e}")
            return False

    def _app_dir(self, app_name: str) -> str:
        return os.path.join(self.base_dir, "app", app_name)

    def merge_models_file(self, model_def: ModelDefinition, app_dir: str) -> bool:
        """Fusionne un nouveau modèle dans app/<app>/models.py."""
        models_file = os.path.join(app_dir, "models.py")
        backup_path = self.create_backup(models_file)
        if backup_path:
            print(f"Backup: {backup_path}")

        try:
            new_class = self._generate_model_class(model_def)
            if os.path.exists(models_file):
                with open(models_file, "r", encoding="utf-8") as f:
                    content = f.read()
                pattern = rf"class {model_def.model_name}\(.*?\n(?=class |\Z)"
                if re.search(pattern, content, re.DOTALL):
                    content = re.sub(pattern, new_class + "\n\n", content, count=1, flags=re.DOTALL)
                else:
                    content = content.rstrip() + "\n\n\n" + new_class + "\n"
                content = self._update_imports_models(content, model_def)
            else:
                content = "from django.db import models\n\n\n" + new_class + "\n"
            with open(models_file, "w", encoding="utf-8") as f:
                f.write(content)
            if not self.validate_python_syntax(models_file):
                if backup_path:
                    shutil.copy2(backup_path, models_file)
                return False
            print(f"[OK] Modele {model_def.model_name} dans models.py")
            return True
        except Exception as e:
            print(f"[ERREUR] Merge models: {e}")
            if backup_path and os.path.exists(backup_path):
                shutil.copy2(backup_path, models_file)
            return False

    def _generate_model_class(self, model_def: ModelDefinition) -> str:
        """Génère le code de la classe du modèle."""
        lines = [
            f"class {model_def.model_name}(models.Model):",
            f'    """{model_def.model_name}."""',
            "",
        ]
        for field_name, field in model_def.fields.items():
            if field_name == "id":
                continue
            ft = model_def.get_django_field_type(field_name)
            params = model_def.get_field_params(field_name)
            parts = []
            for k, v in params.items():
                if k == "on_delete" and isinstance(v, str) and v.startswith("models."):
                    parts.append(f"{k}={v}")
                else:
                    parts.append(f"{k}={repr(v)}")
            lines.append(f"    {field_name} = models.{ft}({', '.join(parts)})")
        lines.append("")
        lines.append("    created_at = models.DateTimeField(auto_now_add=True)")
        lines.append("    updated_at = models.DateTimeField(auto_now=True)")
        db_table = model_def.meta.get("db_table") or f"{model_def.app_name}_{model_def.model_name.lower()}s"
        verbose = model_def.meta.get("verbose_name") or model_def.model_name
        verbose_plural = model_def.meta.get("verbose_name_plural") or f"{model_def.model_name}s"
        lines.extend([
            "",
            "    class Meta:",
            f"        db_table = {repr(db_table)}",
            f"        verbose_name = {repr(verbose)}",
            f"        verbose_name_plural = {repr(verbose_plural)}",
            "        ordering = ['-created_at']",
            "",
            "    def __str__(self):",
            "        return str(self.title if hasattr(self, 'title') else self.id)",
        ])
        return "\n".join(lines)

    def _update_imports_models(self, content: str, model_def: ModelDefinition) -> str:
        """Assure from django.db import models."""
        if "from django.db import models" not in content:
            content = "from django.db import models\n\n" + content
        return content

    def merge_serializers_file(self, model_def: ModelDefinition, app_dir: str) -> bool:
        """Fusionne un serializer dans app/<app>/api/serializers.py."""
        api_dir = os.path.join(app_dir, "api")
        os.makedirs(api_dir, exist_ok=True)
        init_api = os.path.join(api_dir, "__init__.py")
        if not os.path.exists(init_api):
            with open(init_api, "w", encoding="utf-8") as f:
                f.write("")
        serializers_file = os.path.join(api_dir, "serializers.py")
        backup_path = self.create_backup(serializers_file)
        if backup_path:
            print(f"Backup: {backup_path}")

        try:
            template = self.env.get_template("serializer_class.py.j2")
            new_class = template.render(model=model_def)
            if os.path.exists(serializers_file):
                with open(serializers_file, "r", encoding="utf-8") as f:
                    content = f.read()
                pattern = rf"class {model_def.model_name}Serializer\(.*?\n(?=class |\Z)"
                if re.search(pattern, content, re.DOTALL):
                    content = re.sub(pattern, new_class + "\n\n", content, count=1, flags=re.DOTALL)
                else:
                    content = content.rstrip() + "\n\n\n" + new_class + "\n"
            else:
                content = (
                    "from rest_framework import serializers\n"
                    f"from app.{model_def.app_name}.models import {model_def.model_name}\n\n\n"
                    + new_class + "\n"
                )
            import_match = re.search(rf"from app\.{model_def.app_name}\.models import ([^\n]+)", content)
            if import_match:
                imports = [x.strip() for x in import_match.group(1).split(",")]
                if model_def.model_name not in imports:
                    imports.append(model_def.model_name)
                    new_import = f"from app.{model_def.app_name}.models import {', '.join(sorted(imports))}"
                    content = re.sub(rf"from app\.{model_def.app_name}\.models import [^\n]+", new_import, content, count=1)
            os.makedirs(os.path.dirname(serializers_file), exist_ok=True)
            with open(serializers_file, "w", encoding="utf-8") as f:
                f.write(content)
            if not self.validate_python_syntax(serializers_file):
                if backup_path:
                    shutil.copy2(backup_path, serializers_file)
                return False
            print(f"[OK] Serializer {model_def.model_name}Serializer dans api/serializers.py")
            return True
        except Exception as e:
            print(f"[ERREUR] Merge serializers: {e}")
            if backup_path and os.path.exists(backup_path):
                shutil.copy2(backup_path, serializers_file)
            return False

    def merge_permissions_file(self, model_def: ModelDefinition, app_dir: str) -> bool:
        """Crée ou fusionne les permissions (CanView, CanCreate, CanUpdate, CanDelete) pour le modèle."""
        permissions_dir = os.path.join(app_dir, "permissions")
        os.makedirs(permissions_dir, exist_ok=True)
        init_file = os.path.join(permissions_dir, "__init__.py")
        if not os.path.exists(init_file):
            with open(init_file, "w", encoding="utf-8") as f:
                f.write("")
        perm_file = os.path.join(permissions_dir, f"{model_def.app_name}_permissions.py")
        backup_path = self.create_backup(perm_file)
        if backup_path:
            print(f"Backup: {backup_path}")
        try:
            template = self.env.get_template("permission_classes.py.j2")
            snippet = template.render(model=model_def)
            if os.path.exists(perm_file):
                with open(perm_file, "r", encoding="utf-8") as f:
                    content = f.read()
                block_pattern = (
                    rf"# --- {re.escape(model_def.model_name)} ---\n"
                    rf".*?"
                    rf"(?=\n# --- |\Z)"
                )
                if re.search(block_pattern, content, re.DOTALL):
                    content = re.sub(block_pattern, snippet.rstrip() + "\n\n", content, count=1, flags=re.DOTALL)
                else:
                    content = content.rstrip() + "\n\n\n" + snippet + "\n"
                if "from rest_framework import permissions" not in content:
                    content = "from rest_framework import permissions\n\n\n" + content.lstrip()
            else:
                content = "from rest_framework import permissions\n\n\n" + snippet + "\n"
            with open(perm_file, "w", encoding="utf-8") as f:
                f.write(content)
            if not self.validate_python_syntax(perm_file):
                if backup_path and os.path.exists(backup_path):
                    shutil.copy2(backup_path, perm_file)
                return False
            print(f"[OK] Permissions {model_def.model_name} (CanView, CanCreate, CanUpdate, CanDelete)")
            return True
        except Exception as e:
            print(f"[ERREUR] Merge permissions: {e}")
            if backup_path and os.path.exists(backup_path):
                shutil.copy2(backup_path, perm_file)
            return False

    def generate_repository(self, model_def: ModelDefinition, app_dir: str) -> bool:
        """Génère app/<app>/repositories/<model>_repository.py et met à jour __init__."""
        repo_file = os.path.join(app_dir, "repositories", f"{model_def.model_name.lower()}_repository.py")
        backup_path = self.create_backup(repo_file)
        try:
            template = self.env.get_template("repository.py.j2")
            content = template.render(model=model_def)
            with open(repo_file, "w", encoding="utf-8") as f:
                f.write(content)
            if not self.validate_python_syntax(repo_file):
                if backup_path:
                    shutil.copy2(backup_path, repo_file)
                return False
            init_file = os.path.join(app_dir, "repositories", "__init__.py")
            with open(init_file, "r", encoding="utf-8") as f:
                init_content = f.read()
            repo_class = f"{model_def.model_name}Repository"
            import_line = f"from app.{model_def.app_name}.repositories.{model_def.model_name.lower()}_repository import {repo_class}"
            if import_line not in init_content:
                init_content = init_content.rstrip() + "\n" + import_line + "\n"
                if "__all__" in init_content:
                    all_match = re.search(r"__all__\s*=\s*\[(.*?)\]", init_content, re.DOTALL)
                    if all_match and repo_class not in all_match.group(1):
                        old_all = all_match.group(0)
                        new_all = old_all.rstrip("]") + f', "{repo_class}"]'
                        init_content = init_content.replace(old_all, new_all, 1)
                else:
                    init_content = init_content.rstrip() + f'\n__all__ = ["{repo_class}"]\n'
                with open(init_file, "w", encoding="utf-8") as f:
                    f.write(init_content)
            print(f"[OK] Repository {repo_class}")
            return True
        except Exception as e:
            print(f"[ERREUR] Repository: {e}")
            if backup_path and os.path.exists(backup_path):
                shutil.copy2(backup_path, repo_file)
            return False

    def generate_service(self, model_def: ModelDefinition, app_dir: str) -> bool:
        """Génère app/<app>/services/<model>_service.py et met à jour __init__."""
        service_file = os.path.join(app_dir, "services", f"{model_def.model_name.lower()}_service.py")
        backup_path = self.create_backup(service_file)
        try:
            template = self.env.get_template("service.py.j2")
            content = template.render(model=model_def)
            with open(service_file, "w", encoding="utf-8") as f:
                f.write(content)
            if not self.validate_python_syntax(service_file):
                if backup_path:
                    shutil.copy2(backup_path, service_file)
                return False
            init_file = os.path.join(app_dir, "services", "__init__.py")
            with open(init_file, "r", encoding="utf-8") as f:
                init_content = f.read()
            svc_class = f"{model_def.model_name}Service"
            import_line = f"from app.{model_def.app_name}.services.{model_def.model_name.lower()}_service import {svc_class}"
            if import_line not in init_content:
                init_content = init_content.rstrip() + "\n" + import_line + "\n"
                if "__all__" not in init_content:
                    init_content += f'__all__ = ["{svc_class}"]\n'
                with open(init_file, "w", encoding="utf-8") as f:
                    f.write(init_content)
            print(f"[OK] Service {svc_class}")
            return True
        except Exception as e:
            print(f"[ERREUR] Service: {e}")
            if backup_path and os.path.exists(backup_path):
                shutil.copy2(backup_path, service_file)
            return False

    def update_api_views_and_urls(self, model_def: ModelDefinition, app_dir: str) -> bool:
        """Ajoute les vues list/detail et les routes dans api/views.py et api/urls.py."""
        api_dir = os.path.join(app_dir, "api")
        os.makedirs(api_dir, exist_ok=True)
        views_file = os.path.join(api_dir, "views.py")
        urls_file = os.path.join(api_dir, "urls.py")
        default_views = (
            "from rest_framework.decorators import api_view\n"
            "from rest_framework.response import Response\n\n\n"
        )
        default_urls = (
            "from django.urls import path\n"
            "from . import views\n\n\n"
            "urlpatterns = [\n]\n"
        )
        if not os.path.exists(views_file):
            with open(views_file, "w", encoding="utf-8") as f:
                f.write(default_views)
        if not os.path.exists(urls_file):
            with open(urls_file, "w", encoding="utf-8") as f:
                f.write(default_urls)
        backup_views = self.create_backup(views_file)
        backup_urls = self.create_backup(urls_file)
        try:
            template = self.env.get_template("view_snippet.py.j2")
            view_snippet = template.render(model=model_def)
            with open(views_file, "r", encoding="utf-8") as f:
                views_content = f.read()
            perm_import = (
                f"from app.{model_def.app_name}.permissions.{model_def.app_name}_permissions import (\n"
                f"    CanView{model_def.model_name}, CanCreate{model_def.model_name},\n"
                f"    CanUpdate{model_def.model_name}, CanDelete{model_def.model_name},\n"
                f")"
            )
            imports_needed = [
                "from rest_framework import status",
                f"from app.{model_def.app_name}.services import {model_def.model_name}Service",
                f"from app.{model_def.app_name}.api.serializers import {model_def.model_name}Serializer",
                "from app.core.exceptions import NotFoundError",
                perm_import,
            ]
            missing = []
            for imp in imports_needed:
                if "CanView" in imp and "permissions" in imp:
                    if f"CanView{model_def.model_name}" not in views_content:
                        missing.append(imp)
                elif imp not in views_content:
                    missing.append(imp)
            if missing:
                first_import_end = views_content.find("\n\n")
                if first_import_end == -1:
                    first_import_end = len(views_content)
                views_content = views_content[:first_import_end] + "\n" + "\n".join(missing) + views_content[first_import_end:]
            if "permission_classes" not in views_content:
                views_content = views_content.replace(
                    "from rest_framework.decorators import api_view",
                    "from rest_framework.decorators import api_view, permission_classes",
                    1,
                )
            if f"def {model_def.model_name.lower()}_list" not in views_content:
                views_content = views_content.rstrip() + "\n\n" + view_snippet + "\n"
            with open(views_file, "w", encoding="utf-8") as f:
                f.write(views_content)

            with open(urls_file, "r", encoding="utf-8") as f:
                urls_content = f.read()
            route_name = f"{model_def.model_name.lower()}s"
            path_list = f'path("", views.{model_def.model_name.lower()}_list),'
            path_detail = f'path("<int:pk>/", views.{model_def.model_name.lower()}_detail),'
            if path_list not in urls_content and path_detail not in urls_content:
                idx = urls_content.rfind("]")
                if idx != -1:
                    insert = f'\n    path("{route_name}/", views.{model_def.model_name.lower()}_list),\n    path("{route_name}/<int:pk>/", views.{model_def.model_name.lower()}_detail),'
                    urls_content = urls_content[:idx] + insert + "\n" + urls_content[idx:]
                with open(urls_file, "w", encoding="utf-8") as f:
                    f.write(urls_content)
            print("[OK] Vues et URLs api mises a jour")
            return True
        except Exception as e:
            print(f"[ERREUR] Vues/URLs: {e}")
            if backup_views and os.path.exists(backup_views):
                shutil.copy2(backup_views, views_file)
            if backup_urls and os.path.exists(backup_urls):
                shutil.copy2(backup_urls, urls_file)
            return False

    def run_management_command(self, args: list[str]) -> bool:
        """Exécute python manage.py <args>."""
        try:
            result = subprocess.run(
                [sys.executable, str(self.base_dir / "manage.py")] + args,
                cwd=str(self.base_dir),
                capture_output=True,
                text=True,
            )
            if result.returncode != 0:
                print(f"[ERREUR] {' '.join(args)}: {result.stderr.strip()}")
                return False
            if result.stdout.strip():
                print(result.stdout.strip())
            return True
        except Exception as e:
            print(f"[ERREUR] Commande {' '.join(args)}: {e}")
            return False

    def create_and_apply_migrations(self, app_name: str) -> bool:
        """Crée et applique les migrations."""
        print("🧱 makemigrations...")
        if not self.run_management_command(["makemigrations", app_name]):
            return False
        print("🚚 migrate...")
        return self.run_management_command(["migrate"])

    def generate_api(self, model_data: dict[str, Any]) -> bool:
        """
        Point d'entrée : génère modèle, repository, service, serializers, vues, URLs,
        puis propose les migrations.
        model_data: { model_name, app_name, fields: { name: { type, max_length?, null?, blank? } }, meta?: {} }
        """
        try:
            model_def = SchemaValidator.validate_model(model_data)
            app_dir = self._app_dir(model_def.app_name)
            if not os.path.isdir(app_dir):
                print(f"[ERREUR] Dossier app/{model_def.app_name}/ introuvable. Creez l'app avec create_app.py d'abord.")
                return False

            print(f"Generation pour {model_def.model_name} (app.{model_def.app_name})")

            if not self.merge_models_file(model_def, app_dir):
                return False
            if not self.merge_serializers_file(model_def, app_dir):
                return False
            if not self.merge_permissions_file(model_def, app_dir):
                return False
            if not self.generate_repository(model_def, app_dir):
                return False
            if not self.generate_service(model_def, app_dir):
                return False
            if not self.update_api_views_and_urls(model_def, app_dir):
                return False

            print()
            print("Etapes suivantes (optionnel):")
            print(f"  python manage.py makemigrations {model_def.app_name}")
            print("  python manage.py migrate")
            print(f"[OK] Generation terminee pour {model_def.model_name}")
            return True
        except ValueError as e:
            print(f"[ERREUR] Validation: {e}")
            return False
        except Exception as e:
            print(f"[ERREUR] Generation: {e}")
            return False
