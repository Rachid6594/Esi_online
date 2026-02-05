#!/usr/bin/env python3
"""
Lance le générateur de code pour un modèle.
Usage:
  python run_generate.py <app_name> <model_name> [field1:type] [field2:type] ...
  python run_generate.py --json '{"model_name":"AnneeAcademique","app_name":"academic","fields":{"libelle":{"type":"char","max_length":50},"date_debut":{"type":"date"},"date_fin":{"type":"date"}}}'

Exemple simple:
  python run_generate.py espace_admin AnneeAcademique libelle:char:50 date_debut:date date_fin:date
"""
import json
import sys
from pathlib import Path

# S'assurer que le projet est sur le path (esi_online + backend pour codegen)
_here = Path(__file__).resolve().parent
_backend = _here.parent
sys.path.insert(0, str(_here))
sys.path.insert(0, str(_backend))

from codegen.improved_code_generator import ImprovedCodeGenerator
from codegen.schema_validator import SchemaValidator


def parse_fields_from_args(args: list[str]) -> dict:
    """Parse field1:type:max_length ou field:type."""
    fields = {}
    for a in args:
        parts = a.split(":")
        if len(parts) < 2:
            continue
        name = parts[0].strip()
        ftype = parts[1].strip().lower()
        field_def = {"type": ftype, "blank": True, "null": True}
        if len(parts) > 2 and parts[2].strip().isdigit():
            field_def["max_length"] = int(parts[2].strip())
        fields[name] = field_def
    return fields


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    if sys.argv[1] == "--json":
        if len(sys.argv) < 3:
            print("Usage: python run_generate.py --json '<json>'")
            sys.exit(1)
        try:
            model_data = json.loads(sys.argv[2])
        except json.JSONDecodeError as e:
            print(f"[ERREUR] JSON invalide: {e}")
            sys.exit(1)
    else:
        if len(sys.argv) < 4:
            print("Usage: python run_generate.py <app_name> <model_name> [field:type] ...")
            sys.exit(1)
        app_name = sys.argv[1].strip().lower()
        model_name = sys.argv[2].strip()
        if not model_name[0].isupper():
            model_name = model_name[0].upper() + model_name[1:]
        fields = parse_fields_from_args(sys.argv[3:])
        if not fields:
            fields = {"title": {"type": "char", "max_length": 200}}
        model_data = {
            "model_name": model_name,
            "app_name": app_name,
            "fields": fields,
            "meta": {"db_table": f"{app_name}_{model_name.lower()}s"},
        }

    gen = ImprovedCodeGenerator(base_dir=_here)
    ok = gen.generate_api(model_data)
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
