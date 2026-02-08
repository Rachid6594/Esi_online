# App **Core**

Documentation pour l’équipe en charge des **briques partagées** du backend (exceptions, repository de base). Cette app ne contient **pas** de modèles métier ni d’API exposée ; elle est utilisée par les autres apps.

---

## Rôle du module

L’app **core** fournit :

- **Exceptions métier** : `AppError`, `NotFoundError`, `ValidationError` à utiliser dans les **services** et **repositories** de toutes les apps pour une gestion d’erreurs cohérente.
- **Repository de base** : `BaseRepository` (CRUD générique sur un modèle Django) pour factoriser l’accès aux données et respecter le pattern Repository.

Aucune route HTTP n’est définie dans **core** ; les URLs du projet n’incluent pas `app.core`.

---

## Règle importante

> **Ne pas modifier les autres apps.**  
> Travailler **uniquement** dans `app/core/`. Les autres apps **importent** depuis core ; il faut éviter de **casser les signatures** (ex. ajouter des paramètres obligatoires à `BaseRepository` ou changer le nom des exceptions) sans coordination avec toutes les équipes.

---

## Structure du module

```
app/core/
├── README.md                 ← ce fichier
├── __init__.py
├── apps.py
├── exceptions.py             ← AppError, NotFoundError, ValidationError
└── repositories/
    ├── __init__.py
    └── base.py               ← BaseRepository (get_queryset, get_by_id, create, update, delete, filter)
```

---

## Exceptions (`exceptions.py`)

| Classe | Usage |
|--------|--------|
| **AppError** | Erreur métier générique (message, code optionnel). |
| **NotFoundError** | Ressource introuvable (ex. `get_or_raise` dans un repository). Code `not_found`. |
| **ValidationError** | Erreur de validation métier (données invalides). Code `validation_error`. |

Les **vues** (DRF) doivent attraper ces exceptions et renvoyer des réponses HTTP adaptées (404 pour NotFoundError, 400 pour ValidationError).

---

## BaseRepository (`repositories/base.py`)

- **get_queryset()** : retourne le queryset de base (souvent `Model.objects.all()`).
- **get_by_id(pk)** : retourne l’instance ou `None`.
- **get_or_raise(pk)** : retourne l’instance ou lève une exception du modèle (DoesNotExist) ou `NotFoundError` selon l’implémentation.
- **filter(\*\*kwargs)** : filtre le queryset.
- **create(\*\*kwargs)** : création d’une instance.
- **update(pk, \*\*kwargs)** : mise à jour partielle ; retourne l’instance ou `None`.
- **delete(pk)** : suppression ; retourne un booléen.

Les repositories **métier** (dans administration, authentification, espace_prof, etc.) héritent ou s’inspirent de ce base pour garder un comportement cohérent.

---

## Roadmap — Ce que l’équipe doit faire

Référence : **ROADMAP CHRONOLOGIQUE - ESI-Online MVP**. L’app **core** n’a pas de tâches spécifiques par sprint ; elle **soutient toutes les phases** (MVP et Version 2). Les autres apps utilisent `app.core.exceptions` et éventuellement `BaseRepository`.

- **Ne pas supprimer** `AppError`, `NotFoundError`, `ValidationError` ; au besoin **ajouter** de nouvelles classes d’exception (ex. `ForbiddenError`) en restant cohérent avec le reste du projet.
- **Étendre** `BaseRepository` si besoin (méthodes génériques réutilisables) sans casser les signatures existantes utilisées par les autres apps.
- **Documentation** : garder les docstrings à jour pour que les autres équipes sachent comment utiliser core.
- **Pas de logique métier** dans core : pas de modèles, pas de vues, pas d’URLs.

---

## Conventions à respecter

- **Typo / style** : code Python standard ; pas de dépendances à des libs métier (uniquement Django si nécessaire pour `BaseRepository`).
- **Imports** : les autres apps font `from app.core.exceptions import ValidationError` ou `from app.core.repositories.base import BaseRepository`. Ne pas inverser les dépendances : **core ne doit pas importer** depuis les autres apps.

---

## Dépendances

- **core** n’a **aucune dépendance** vers les autres apps du projet (administration, authentification, admin, espace_*). Elle peut dépendre de **Django** (models, conf) pour le repository de base.

---

## Résumé

| Élément | Règle |
|--------|--------|
| **Périmètre** | Uniquement `app/core/`. |
| **Contenu** | Exceptions + BaseRepository ; pas d’API. |
| **Changements** | Ne pas casser les signatures utilisées ailleurs. |
| **Dépendances** | Aucune vers les autres apps. |
