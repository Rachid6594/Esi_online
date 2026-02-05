# Générateur de code ESI-Online (Repository pattern)

Génère modèle, repository, service, serializers, vues et URLs pour une app existante dans `app/`.

## Prérequis

- L'app doit déjà exister (créée avec `python create_app.py <nom_app>`).
- `pip install jinja2` (ou `requirements.txt`).

## Usage

Depuis la racine du projet (où se trouve `manage.py`) :

### 1. Ligne de commande simple

```bash
python run_generate.py <app_name> <model_name> [champ:type:max_length] ...
```

Exemple :

```bash
python run_generate.py espace_admin AnneeAcademique libelle:char:50 date_debut:date date_fin:date is_active:bool
```

Types courants : `char`, `text`, `int`, `date`, `datetime`, `bool`, `email`, `url`.

### 2. JSON complet

```bash
python run_generate.py --json '{"model_name":"AnneeAcademique","app_name":"espace_admin","fields":{"libelle":{"type":"char","max_length":50},"date_debut":{"type":"date"},"date_fin":{"type":"date"},"is_active":{"type":"bool","default":false}},"meta":{"db_table":"annees_academiques","verbose_name":"Année académique"}}'
```

## Ce qui est généré

- **models.py** : classe du modèle (fusionnée si le fichier existe).
- **api/serializers.py** : `XxxSerializer` (fusionné).
- **repositories/xxx_repository.py** : repository héritant de `BaseRepository`.
- **services/xxx_service.py** : service avec get_by_id, list_all, create, update, delete.
- **api/views.py** : vues `xxx_list` et `xxx_detail` (ajoutées).
- **api/urls.py** : routes `xxxs/` et `xxxs/<int:pk>/` (ajoutées).

Des sauvegardes sont créées dans `codegen/backups/` avant modification.

## Depuis Python

```python
from codegen.improved_code_generator import ImprovedCodeGenerator

gen = ImprovedCodeGenerator()
gen.generate_api({
    "model_name": "AnneeAcademique",
    "app_name": "espace_admin",
    "fields": {
        "libelle": {"type": "char", "max_length": 50},
        "date_debut": {"type": "date"},
        "date_fin": {"type": "date"},
    },
    "meta": {"db_table": "annees_academiques"},
})
```

Puis : `python manage.py makemigrations espace_admin` et `python manage.py migrate`.
