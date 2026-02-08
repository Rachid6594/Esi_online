# App **Espace bibliothèque**

Documentation pour l’équipe en charge du module **espace bibliothèque** : API et logique métier côté « bibliothèque » (ressources, emprunts, réservations, etc.). Les **données** de catalogue (Ressource, Exemplaire, Emprunt, Reservation, Categorie, Tag) sont définies dans l’app **administration** ; cette app expose l’**espace** et les **usages** pour le rôle bibliothécaire.

---

## Rôle du module

L’app **espace_library** fournit :

- L’**API** et les **vues** pour l’espace bibliothèque (dashboard bibliothécaire côté frontend).
- Le **ViewSet** et les **services/repositories** dédiés à la logique « bibliothèque » (consultation des ressources, gestion des emprunts/réservations côté interface).

Les **modèles** métier (Ressource, Exemplaire, Emprunt, Reservation, Categorie, Tag, ConsultationRessource) sont dans **administration** ; cette app peut les **utiliser** via import depuis `app.administration.models` ou via des **services administration** si besoin. Ne pas **dupliquer** ces modèles dans espace_library.

---

## Règle importante

> **Ne pas modifier les autres apps.**  
> Travailler **uniquement** dans `app/espace_library/`. Ne pas toucher à `app.admin`, `app.administration`, `app.authentification`, `app.core`, `app.espace_prof`, `app.espace_student`, ni aux URLs principales dans `esi_online/urls.py` (sauf évolution convenue).

---

## Structure du module

```
app/espace_library/
├── README.md                 ← ce fichier
├── __init__.py
├── admin.py
├── apps.py
├── models.py                 ← modèle(s) spécifiques espace (ex. EspaceBibliotheque) si besoin
├── serializers.py
├── urls.py                   ← routes sous /api/bibliotheque/
├── interfaces/
│   └── espace_bibliotheque_repository_interface.py (si présent)
├── permissions/
│   └── espace_bibliotheque_permissions.py
├── repositories/
│   └── espace_bibliotheque_repository.py
├── services/
│   └── espace_bibliotheque_service.py
├── views/
│   └── espace_bibliotheque_viewset.py
└── migrations/
```

---

## Modèles

- **EspaceBibliotheque** (modèle local) : entité générique pour l’espace (nom, description) si utilisée par le ViewSet.
- Les **ressources, exemplaires, emprunts, réservations, catégories, tags** sont dans **administration** ; les lire ou les manipuler via **services/repositories** en important depuis `app.administration` (sans modifier les modèles administration).

---

## API exposée (`/api/bibliotheque/`)

- ViewSet REST (list, retrieve, create, update, destroy) selon la configuration du routeur dans `urls.py`.
- L’équipe peut **étendre** les actions (ex. liste des emprunts en cours, réservations) en ajoutant des **actions** ou des **endpoints** dans cette app, en s’appuyant sur les modèles **administration** en lecture/écriture via des services dédiés.

Respecter les **permissions** (bibliothécaire = `is_staff` ou groupe dédié) définies dans `permissions/`.

---

## Roadmap — Ce que l’équipe doit faire (par sprint)

Référence : **ROADMAP CHRONOLOGIQUE - ESI-Online MVP**. Travailler **uniquement** dans `app/espace_library/`, en respectant **couleurs et typo** du projet et **sans toucher aux autres apps**. Les **modèles** Ressource, Catégorie, Tag, Exemplaire, Emprunt, Reservation, ConsultationRessource sont dans **administration** ; les utiliser sans les dupliquer.

### Sprint 3 — Bibliothèque académique (API et logique)

- **API upload de fichiers** : exposer un ou des endpoints d’upload (création/mise à jour de Ressource avec fichier). **Validation des formats** (PDF, vidéos, documents autorisés) et **taille max** ; renvoyer des erreurs 400 en cas de refus.
- **API de recherche et filtrage** : endpoints pour rechercher les ressources (par titre, auteur, catégorie, tag, niveau, année, matière). Filtres combinables ; pagination.
- **Système de tags et métadonnées** : utilisation des modèles administration (Tag, métadonnées sur Ressource) ; logique dans les services pour associer/dissocier des tags, filtrer par métadonnées.
- **Compression / optimisation des fichiers** : si prévu dans le périmètre, traiter les fichiers uploadés (compression images, normalisation PDF) dans les services ; ne pas modifier les modèles dans administration.
- **Statistiques de consultation** : exploiter ConsultationRessource (administration) ; exposer des endpoints d’agrégation (documents populaires, stats par période, par catégorie) pour le tableau de bord bibliothèque.
- **Permissions** : restreindre l’upload et la gestion au rôle **admin** (MVP) ou **bibliothécaire** ; lecture selon politique (étudiants, profs). Utiliser `espace_bibliotheque_permissions.py`.
- **Tests** : tests sur upload (formats refusés, taille max), recherche/filtrage, stats, permissions.

### Règles transverses

- **Logique métier** dans les **services** (règles d’emprunt, délais, réservations si gérés ici) ; vues légères.
- **Ne pas dupliquer** les modèles Ressource, Exemplaire, Emprunt, etc. ; les utiliser depuis **administration**.
- **Migrations** : uniquement si vous ajoutez ou modifiez des modèles **dans** `espace_library/models.py`.

---

## Conventions à respecter

- **Typo / style** : code Python/Django standard ; pas de changement de thème ou de styles globaux.
- **Nommage** : repositories et services en **snake_case** avec suffixe cohérent ; ViewSet en **PascalCase**.
- **Architecture** : **vues** → **services** → **repositories** ; utiliser `app.core.exceptions` (NotFoundError, ValidationError) pour les erreurs métier.

---

## Dépendances autorisées

- **`app.core`** : autorisé (exceptions, base repository).
- **`app.administration`** : **lecture et écriture** des modèles nécessaires (Ressource, Exemplaire, Emprunt, Reservation, etc.) via imports ; **ne pas modifier** les fichiers dans `app/administration/`.
- **`app.admin`** (User) : lecture pour l’utilisateur connecté.
- **`app.authentification`** : ne pas modifier ; utilisation du rôle/utilisateur déjà fourni par le JWT.

---

## Résumé

| Élément | Règle |
|--------|--------|
| **Périmètre** | Uniquement `app/espace_library/`. |
| **Données catalogue** | Dans **administration** ; les utiliser, ne pas les dupliquer. |
| **API** | `/api/bibliotheque/` ; réservée au rôle bibliothécaire. |
| **Autres apps** | Ne pas les modifier. |
