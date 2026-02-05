#!/usr/bin/env python3
"""
Menu interactif pour ESI-Online : créer des apps, générer des APIs, models_zones.
Usage: python run_menu.py
       python run_menu.py --create-app <nom>
       python run_menu.py --create-app-full <nom>
       python run_menu.py --generate <app_name> <model_name> [champ:type:max_length]...
       python run_menu.py --generate-from-zone <zone> <model>   # ex: espace_admin annee_academique
"""
import argparse
import json
import sys
from pathlib import Path

_here = Path(__file__).resolve().parent
_backend = _here.parent
sys.path.insert(0, str(_here))
sys.path.insert(0, str(_backend))

BASE_DIR = _here
MODELS_ZONES_DIR = BASE_DIR / "models_zones"


def create_app_simple(app_name: str) -> bool:
    """Crée une app avec create_app.py (structure repositories/services/api)."""
    from create_app import create_app, validate_app_name
    try:
        validate_app_name(app_name)
        create_app(app_name, Path(__file__).resolve().parent)
        return True
    except Exception as e:
        print(f"[ERREUR] {e}")
        return False


def create_app_full_cli(app_name: str, verbose_name: str | None = None) -> bool:
    """Crée une app avec structure complète (interfaces, ViewSet, permissions, router)."""
    from create_app_full import create_app_full, validate_app_name
    try:
        validate_app_name(app_name)
        create_app_full(app_name, verbose_name)
        return True
    except Exception as e:
        print(f"[ERREUR] {e}")
        return False


def generate_api_cli(app_name: str, model_name: str, fields_args: list[str]) -> bool:
    """Génère l'API pour un modèle (repository, service, serializers, vues, urls)."""
    from run_generate import parse_fields_from_args
    from codegen.improved_code_generator import ImprovedCodeGenerator
    fields = parse_fields_from_args(fields_args) if fields_args else {"title": {"type": "char", "max_length": 200}}
    if not model_name[0].isupper():
        model_name = model_name[0].upper() + model_name[1:]
    model_data = {
        "model_name": model_name,
        "app_name": app_name,
        "fields": fields,
        "meta": {"db_table": f"{app_name}_{model_name.lower()}s"},
    }
    gen = ImprovedCodeGenerator(base_dir=BASE_DIR)
    return gen.generate_api(model_data)


def _stem_to_class_name(stem: str) -> str:
    """Convertit un stem snake_case en nom de classe PascalCase (ex. annee_academique → AnneeAcademique)."""
    return "".join(part.capitalize() for part in stem.split("_"))


def model_exists_in_app(zone: str, model_name: str, json_stem: str | None = None) -> bool:
    """
    Indique si le modèle est déjà défini dans app/<zone>/models.py.
    model_name: nom lu du JSON (ex. AnneeAcademique ou annee_academique).
    json_stem: stem du fichier JSON (ex. annee_academique) pour tenter PascalCase si besoin.
    """
    models_file = BASE_DIR / "app" / zone / "models.py"
    if not models_file.exists():
        return False
    try:
        content = models_file.read_text(encoding="utf-8")
        if f"class {model_name}(" in content:
            return True
        if json_stem and model_name == json_stem:
            class_name = _stem_to_class_name(json_stem)
            return f"class {class_name}(" in content
        return False
    except Exception:
        return False


def scan_models_zones():
    """
    Scanne models_zones/ et retourne la liste des modèles disponibles.
    Returns: list of (zone_name, json_stem, json_path, model_name_from_file)
    """
    if not MODELS_ZONES_DIR.exists():
        return []
    result = []
    for zone_dir in sorted(MODELS_ZONES_DIR.iterdir()):
        if not zone_dir.is_dir() or zone_dir.name.startswith("."):
            continue
        zone_name = zone_dir.name
        for json_path in sorted(zone_dir.glob("*.json")):
            stem = json_path.stem
            try:
                data = json.loads(json_path.read_text(encoding="utf-8"))
                model_name = data.get("model_name") or data.get("model") or stem
            except Exception:
                model_name = stem
            result.append((zone_name, stem, json_path, model_name))
    return result


def generate_from_zone(zone: str, model_stem: str) -> bool:
    """Génère l'API à partir d'un JSON dans models_zones/<zone>/<model_stem>.json."""
    json_path = MODELS_ZONES_DIR / zone / f"{model_stem}.json"
    if not json_path.exists():
        print(f"[ERREUR] Fichier introuvable: {json_path}")
        return False
    try:
        model_data = json.loads(json_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        print(f"[ERREUR] JSON invalide dans {json_path}: {e}")
        return False
    model_data.setdefault("app_name", zone)
    if "model_name" not in model_data:
        model_data["model_name"] = model_stem.replace("_", " ").title().replace(" ", "")
    from codegen.improved_code_generator import ImprovedCodeGenerator
    from codegen.schema_validator import SchemaValidator
    try:
        SchemaValidator.validate_model(model_data)
    except ValueError as e:
        print(f"[ERREUR] Schéma invalide: {e}")
        return False
    gen = ImprovedCodeGenerator(base_dir=BASE_DIR)
    return gen.generate_api(model_data)


def list_apps() -> None:
    """Liste les applications dans app/."""
    base = BASE_DIR / "app"
    if not base.exists():
        print("Aucune app dans app/.")
        return
    dirs = [d.name for d in base.iterdir() if d.is_dir() and not d.name.startswith("_")]
    if not dirs:
        print("Aucune app dans app/.")
        return
    print("Applications (app/):")
    for name in sorted(dirs):
        if name == "core":
            print(f"  - {name} (partagé)")
        else:
            print(f"  - {name}")


def interactive_menu() -> None:
    """Menu interactif principal."""
    while True:
        print("\n" + "=" * 60)
        print("🎯 MENU ESI-ONLINE")
        print("=" * 60)
        print("1. Créer une app (structure simple: repositories, services, api)")
        print("2. Créer une app complète (interfaces, ViewSet, permissions, router)")
        print("3. Générer l'API pour un modèle (saisie manuelle)")
        print("4. Générer l'API à partir d'un modèle (models_zones)")
        print("5. Lister les applications")
        print("6. Lister les modèles dans models_zones")
        print("7. Quitter")
        choice = input("\nChoix (1-7): ").strip()

        if choice == "1":
            app_name = input("Nom de l'app (ex: library): ").strip().lower()
            if app_name:
                create_app_simple(app_name)
            else:
                print("Nom requis.")

        elif choice == "2":
            app_name = input("Nom de l'app (ex: products): ").strip().lower()
            if app_name:
                verbose = input("Nom d'affichage (optionnel): ").strip() or None
                create_app_full_cli(app_name, verbose)
            else:
                print("Nom requis.")

        elif choice == "3":
            app_name = input("Nom de l'app existante (ex: espace_admin): ").strip().lower()
            model_name = input("Nom du modèle (ex: AnneeAcademique): ").strip()
            if not app_name or not model_name:
                print("App et modèle requis.")
                continue
            fields_str = input("Champs (optionnel, ex: libelle:char:50 date_debut:date) [title:char:200]: ").strip()
            fields_args = fields_str.split() if fields_str else ["title:char:200"]
            generate_api_cli(app_name, model_name, fields_args)

        elif choice == "4":
            models_list = scan_models_zones()
            if not models_list:
                print("Aucun modèle dans models_zones/. Déposez des JSON (ex: models_zones/espace_admin/annee_academique.json).")
                continue
            print("\nModèles disponibles (models_zones):")
            for i, (zone, stem, path, model_name) in enumerate(models_list, 1):
                exists = "[OK] deja genere" if model_exists_in_app(zone, model_name, stem) else "[--] pas encore"
                print(f"  {i}. [{zone}] {model_name} ({stem}.json) — {exists}")
            try:
                idx = int(input(f"\nChoisir (1-{len(models_list)}): ").strip()) - 1
                if 0 <= idx < len(models_list):
                    zone, stem, path, _ = models_list[idx]
                    print(f"\nGeneration depuis {zone}/{stem}.json...")
                    generate_from_zone(zone, stem)
                else:
                    print("Choix invalide.")
            except ValueError:
                print("Entrez un numéro valide.")

        elif choice == "5":
            list_apps()

        elif choice == "6":
            models_list = scan_models_zones()
            if not models_list:
                print("Aucun modèle dans models_zones/.")
            else:
                print("\nModèles (models_zones):")
                for zone, stem, path, model_name in models_list:
                    exists = "[OK] deja genere" if model_exists_in_app(zone, model_name, stem) else "[--] pas encore"
                    print(f"  {zone}/{stem}.json → {model_name} — {exists}")

        elif choice == "7":
            print("👋 Au revoir.")
            break

        else:
            print("Option invalide.")


def main():
    parser = argparse.ArgumentParser(description="Menu ESI-Online")
    parser.add_argument("--create-app", metavar="NAME", help="Créer une app simple (repositories, services, api)")
    parser.add_argument("--create-app-full", metavar="NAME", help="Créer une app complète (interfaces, ViewSet, permissions)")
    parser.add_argument("--verbose-name", help="Nom d'affichage (avec --create-app-full)")
    parser.add_argument("--generate", nargs="+", metavar="ARG",
                        help="Générer API: --generate espace_admin AnneeAcademique libelle:char:50 date_debut:date")
    parser.add_argument("--list", action="store_true", help="Lister les applications")
    parser.add_argument("--list-zones", action="store_true", help="Lister les modèles dans models_zones")
    parser.add_argument("--generate-from-zone", nargs=2, metavar=("ZONE", "MODEL"),
                        help="Générer API depuis models_zones: --generate-from-zone espace_admin annee_academique")
    args = parser.parse_args()

    if args.create_app:
        ok = create_app_simple(args.create_app)
        sys.exit(0 if ok else 1)

    if args.create_app_full:
        ok = create_app_full_cli(args.create_app_full, args.verbose_name)
        sys.exit(0 if ok else 1)

    if args.generate:
        if len(args.generate) < 2:
            print("Usage: --generate <app_name> <model_name> [field:type:max_length]...")
            sys.exit(2)
        app_name, model_name = args.generate[0], args.generate[1]
        fields_args = args.generate[2:] if len(args.generate) > 2 else []
        ok = generate_api_cli(app_name, model_name, fields_args)
        sys.exit(0 if ok else 1)

    if args.list:
        list_apps()
        sys.exit(0)

    if args.list_zones:
        models_list = scan_models_zones()
        if not models_list:
            print("Aucun modèle dans models_zones/.")
        else:
            for zone, stem, path, model_name in models_list:
                exists = "[OK] deja genere" if model_exists_in_app(zone, model_name, stem) else "[--] pas encore"
                print(f"  {zone}/{stem}.json → {model_name} — {exists}")
        sys.exit(0)

    if args.generate_from_zone:
        zone, model_stem = args.generate_from_zone[0], args.generate_from_zone[1]
        ok = generate_from_zone(zone, model_stem)
        sys.exit(0 if ok else 1)

    interactive_menu()


if __name__ == "__main__":
    main()
