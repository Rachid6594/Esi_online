# Guide de prise en main — Backend ESI-Online
> Destiné aux développeurs backend **juniors et intermédiaires**  
> Objectif : être opérationnel en **une journée**

---

## Table des matières

1. [Vue d'ensemble de l'architecture](#1-vue-densemble-de-larchitecture)
2. [Organisation du dossier Backend](#2-organisation-du-dossier-backend)
3. [Description détaillée de chaque module](#3-description-détaillée-de-chaque-module)
4. [Flux de données global](#4-flux-de-données-global)
5. [Comment ajouter une nouvelle app, un modèle, une API](#5-comment-ajouter)
6. [Scripts Python disponibles](#6-scripts-python-disponibles)
7. [Bonnes pratiques](#7-bonnes-pratiques)
8. [Erreurs courantes à éviter](#8-erreurs-courantes-à-éviter)

---

## 1. Vue d'ensemble de l'architecture

### Stack technique

| Composant | Technologie | Version |
|---|---|---|
| Framework web | Django | >=5.0, <6.0 |
| API REST | Django REST Framework (DRF) | >=3.14, <4.0 |
| Authentification | Simple JWT | >=5.3, <6.0 |
| CORS | django-cors-headers | >=4.3, <5.0 |
| Variables d'env | django-environ | >=0.11, <1.0 |
| Base de données | PostgreSQL (psycopg2-binary) | >=2.9, <3.0 |
| Génération de code | Jinja2 | >=3.1, <4.0 |

### Pattern architectural : Repository

Le projet suit un pattern en **4 couches** strictement séparées, appliqué de manière uniforme dans toutes les apps :

```
┌─────────────────────────────────────────────────────┐
│  CLIENT (Frontend / Postman)                        │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP Request
┌──────────────────────▼──────────────────────────────┐
│  VIEWS / VIEWSETS (DRF)                             │
│  → Reçoit la requête, vérifie les permissions,      │
│    appelle le service, sérialise la réponse         │
└──────────────────────┬──────────────────────────────┘
                       │ appel méthode
┌──────────────────────▼──────────────────────────────┐
│  SERVICES (Logique métier)                          │
│  → Règles métier, validations complexes,            │
│    orchestration entre repositories                 │
└──────────────────────┬──────────────────────────────┘
                       │ appel méthode
┌──────────────────────▼──────────────────────────────┐
│  REPOSITORIES (Accès aux données)                   │
│  → Requêtes Django ORM, filtrages, agrégations      │
│    Implémentent une interface (contrat)             │
└──────────────────────┬──────────────────────────────┘
                       │ QuerySet
┌──────────────────────▼──────────────────────────────┐
│  MODÈLES DJANGO (Base de données PostgreSQL)        │
└─────────────────────────────────────────────────────┘
```

**Principe fondamental** : chaque couche ne parle qu'à sa voisine directe. Une vue n'accède **jamais** directement à un modèle. Un repository ne contient **aucune** logique métier.

### Règle de cloisonnement inter-apps

Chaque développeur travaille **uniquement dans son app**. Les dépendances entre apps se font toujours via **import en lecture** des modèles ou des services de l'app source. **Jamais de modification d'une app tierce.**

```
admin          ←  toutes les apps l'utilisent (User)
    │
administration ←  espace_prof, espace_student, espace_library l'utilisent
    │
authentification ← espace_prof, espace_student l'utilisent (rôles)
    │
espace_prof    ←  espace_student l'utilise (TP, QCM)
    │
espace_student │
espace_library │  (travaillent sur les données administration + admin)
core           ←  toutes les apps l'utilisent (exceptions, BaseRepository)
```

---

## 2. Organisation du dossier Backend

```
backend/
├── requirements.txt              ← Dépendances Python
├── GUIDE_PRISE_EN_MAIN.md        ← Ce fichier
│
├── codegen/                      ← Générateur de code (outil interne)
│   ├── README.md
│   ├── improved_code_generator.py
│   ├── schema_validator.py
│   ├── templates/                ← Templates Jinja2 pour la génération
│   └── backups/                  ← Sauvegardes auto avant modification
│
└── esi_online/                   ← Projet Django principal
    ├── manage.py                 ← Point d'entrée Django
    ├── README_APPS.md            ← Index de toutes les apps
    │
    ├── run_menu.py               ← Menu interactif (génération, création d'apps)
    ├── run_generate.py           ← Générateur en ligne de commande
    ├── run_all_models.py         ← Génération en lot de tous les modèles
    ├── create_app.py             ← Création d'app simple
    ├── create_app_full.py        ← Création d'app complète avec structure
    │
    ├── esi_online/               ← Configuration Django
    │   ├── settings.py
    │   ├── urls.py               ← Routeur principal
    │   ├── wsgi.py
    │   └── asgi.py
    │
    ├── models_zones/             ← Définitions JSON des modèles (source de vérité)
    │   ├── README.md
    │   ├── GUIDE_MODULES.md
    │   └── <zone>/               ← Un dossier par app (ex. admin/, administration/)
    │       └── <modele>.json     ← Un JSON par modèle
    │
    └── app/                      ← Code Django des applications
        ├── admin/                ← User, SuperAdmin, Notification, AuditLog
        ├── administration/       ← Structure scolaire, bibliothèque (données), forum, EDT
        ├── authentification/     ← Login JWT, rôles, création de comptes
        ├── core/                 ← Exceptions partagées + BaseRepository
        ├── espace_library/       ← Espace bibliothécaire (API)
        ├── espace_prof/          ← Espace enseignant (cours, TP, QCM)
        └── espace_student/       ← Espace étudiant (profil, rendus, QCM)
```

### Structure interne d'une app (patron uniforme)

Chaque app sous `app/` suit **exactement la même structure** :

```
app/<nom_app>/
├── __init__.py
├── apps.py                       ← Config Django de l'app
├── admin.py                      ← Enregistrement dans l'admin Django (optionnel)
├── models.py                     ← Modèles Django
├── serializers.py                ← Serializers DRF
├── urls.py                       ← Routeur principal de l'app
├── tests.py
│
├── api/                          ← (présent dans certaines apps) endpoints détaillés
│   ├── urls.py
│   ├── views.py
│   └── serializers.py
│
├── interfaces/                   ← Contrats (interfaces) des repositories
│   └── <modele>_repository_interface.py
│
├── permissions/                  ← Classes de permission DRF custom
│   └── <modele>_permissions.py
│
├── repositories/                 ← Implémentations d'accès aux données
│   └── <modele>_repository.py
│
├── services/                     ← Logique métier
│   └── <modele>_service.py
│
├── views/                        ← ViewSets DRF
│   └── <modele>_viewset.py
│
└── migrations/                   ← Migrations Django (générées automatiquement)
```

---

## 3. Description détaillée de chaque module

### 3.1 `app/core` — Briques partagées

**Rôle** : fournit les outils transversaux utilisés par toutes les autres apps. Pas de modèle, pas d'API, pas d'URL.

**Contenu clé** :

| Fichier | Contenu | Usage |
|---|---|---|
| `exceptions.py` | `AppError`, `NotFoundError`, `ValidationError` | À lever dans services et repositories |
| `repositories/base.py` | `BaseRepository` | Classe de base pour tous les repositories |

**Utilisation dans votre app** :
```python
# Dans un service
from app.core.exceptions import NotFoundError, ValidationError

# Dans un repository
from app.core.repositories.base import BaseRepository

class MonRepository(BaseRepository):
    ...
```

> ⚠️ **core ne doit jamais importer depuis les autres apps.** La dépendance est à sens unique.

---

### 3.2 `app/admin` — Utilisateurs & technique

**Rôle** : gestion technique de la plateforme. Contient le modèle `User` (AUTH_USER_MODEL), les logs et les notifications. **Ne pas modifier sans autorisation.**

**Modèles** :

| Modèle | Description clé |
|---|---|
| `User` | Base de tous les comptes. Champ `role` (max 15 chars) et `is_active`. C'est le `AUTH_USER_MODEL`. |
| `SuperAdmin` | FK OneToOne → User. Niveau d'accès, dernier accès. |
| `Notification` | FK → User. Titre, message, type, lu/non lu, lien. |
| `PreferenceNotification` | FK → User. Préférences d'envoi (app, email). |
| `AuditLog` | FK → User. Traçabilité des actions (action, model, object_id). |

**Référencer `User` dans vos modèles** :
```python
# Toujours utiliser la chaîne 'app_admin.User', jamais d'import direct
user = models.ForeignKey('app_admin.User', on_delete=models.CASCADE)
# Ou via AUTH_USER_MODEL (recommandé pour OneToOne avec le User Django)
from django.conf import settings
auth_user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
```

---

### 3.3 `app/administration` — Structure scolaire (données partagées)

**Rôle** : référentiel central de l'école. Contient toutes les entités de structure (années, classes, filières…) et les données partagées (bibliothèque, forum, EDT). **C'est la source de données pour la plupart des autres apps.**

**URL exposées** : `/api/administration/` et `/api/etablissement/`

**Modèles organisés par domaine** :

| Domaine | Modèles |
|---|---|
| **Structure scolaire** | `AnneeAcademique`, `Niveau`, `Filiere`, `Classe`, `Matiere`, `AffectationEnseignant` |
| **Administration école** | `AdministrationEcole`, `DroitAdministration` |
| **Annonces** | `Annonce`, `LectureAnnonce` |
| **Emploi du temps** | `EmploiDuTemps`, `Evenement` |
| **Bibliothèque (données)** | `Categorie`, `Tag`, `Ressource`, `Exemplaire`, `Emprunt`, `Reservation`, `ConsultationRessource` |
| **Forum & messagerie** | `Forum`, `Sujet`, `Reponse`, `ReactionReponse`, `Message` |

**Dépendances** : importe `app_admin.User` et `espace_prof.Enseignant` (pour EmploiDuTemps).

> ℹ️ **Point d'ambiguïté résolu** : les modèles de bibliothèque (Ressource, Categorie, Emprunt…) vivent dans **administration**. L'app **espace_library** fournit uniquement l'API et la logique métier en lisant ces modèles via import. Ne pas dupliquer.

---

### 3.4 `app/authentification` — Login & gestion des comptes

**Rôle** : tout ce qui concerne l'identité : connexion JWT, calcul du rôle, création de comptes (étudiant, bibliothécaire, professeur), invitations, import CSV.

**URL exposées** : `/api/auth/`

**Endpoints principaux** :

| Méthode | Endpoint | Description |
|---|---|---|
| POST | `login/` | Retourne `{ user, access, refresh }` |
| POST | `token/refresh/` | Rafraîchissement JWT |
| GET | `me/` | Profil utilisateur connecté (avec `role`) |
| POST | `students/create/` | Création d'un étudiant (admin) |
| POST | `students/import-csv/` | Import CSV d'étudiants |
| GET | `students/export/` | Export CSV |
| POST | `bibliothecaires/create/` | Création bibliothécaire |
| POST | `professeurs/create/` | Création professeur |
| POST | `invitation/validate/` | Validation token invitation |
| POST | `invitation/set-password/` | Définition du mot de passe |

**Modèles propres** :

| Modèle | Description |
|---|---|
| `UserClasse` | Lien OneToOne entre `AUTH_USER_MODEL` et `Classe`. |
| `ProfesseurMatiere` | Lien M2M logique entre `User` et `Matiere`. |

**Calcul du rôle** : dans `UserSerializer.get_user_role()`, le rôle est déduit de `is_superuser`, `is_staff`, des groupes Django et du profil `AdministrationEcole`. Valeurs possibles : `admin`, `admin_ecole`, `professeur`, `bibliothecaire`, `user`.

---

### 3.5 `app/espace_prof` — Espace enseignant

**Rôle** : tout ce que gère un professeur — son profil, ses cours, ses TP et QCM.

**URL exposées** : `/api/prof/`

**Modèles** :

| Modèle | Dépend de | Description |
|---|---|---|
| `Enseignant` | `app_admin.User` | Profil enseignant (matricule, grade, spécialité) |
| `Cours` | `Matiere`, `Classe`, `Enseignant`, `AnneeAcademique` | Cours publié ou brouillon |
| `Chapitre` | `Cours` | Ordre, dates de disponibilité, visibilité |
| `RessourceCours` | `Chapitre` | Fichier ou lien pédagogique |
| `Exercice` | `Chapitre` | Énoncé + corrigé (avec date de publication) |
| `TP` | `Chapitre` | Travail pratique, date limite, formats acceptés |
| `FichierSupportTP` | `TP` | Fichier support attaché à un TP |
| `QCM` | `Chapitre` | Quiz avec questions et réponses |
| `QuestionQCM` | `QCM` | Question individuelle |
| `ReponseQCM` | `QuestionQCM` | Réponse possible (avec `is_correcte`) |

> Les tentatives et réponses des étudiants (`TentativeQCM`, `ReponseEtudiantQCM`) sont dans **espace_student**, pas ici.

---

### 3.6 `app/espace_student` — Espace étudiant

**Rôle** : profil étudiant et interactions avec les cours (rendus TP, tentatives QCM). Lit les données de `espace_prof` et `administration` sans les modifier.

**URL exposées** : `/api/eleve/`

**Modèles** :

| Modèle | Dépend de | Description |
|---|---|---|
| `Etudiant` | `app_admin.User`, `Classe` | Profil complet de l'étudiant (matricule, contact urgence…) |
| `RenduTP` | `espace_prof.TP`, `Etudiant`, `Enseignant` | Rendu d'un TP (fichier, statut, note, commentaires) |
| `TentativeQCM` | `espace_prof.QCM`, `Etudiant` | Tentative de QCM (score, statut, date) |
| `ReponseEtudiantQCM` | `TentativeQCM`, `QuestionQCM` | Réponse d'un étudiant à une question |

**Accès à la classe d'un étudiant** :
```python
# Depuis la requête (utilisateur connecté)
etudiant = request.user.etudiant_profile      # OneToOne via 'etudiant_profile'
classe = etudiant.classe                       # → administration.Classe
filiere = classe.filiere                       # → administration.Filiere
niveau = classe.niveau                         # → administration.Niveau
```

---

### 3.7 `app/espace_library` — Espace bibliothécaire

**Rôle** : API et logique métier de l'espace bibliothèque. Les données (Ressource, Exemplaire, Emprunt…) viennent d'**administration**. Cette app les consomme via import.

**URL exposées** : `/api/bibliotheque/`

**État actuel** : app en cours de développement. Contient un modèle stub `EspaceBibliotheque` et les couches ViewSet/Service/Repository génériques associées. Les vrais modèles métier (Livre, RapportSoutenance, DocumentDevoir, Signalement…) sont à créer.

**Principe** :
```python
# espace_library peut importer depuis administration
from app.administration.models import Ressource, Categorie, Emprunt

# espace_library NE DOIT PAS modifier ces modèles
# ni créer des doublons
```

---

## 4. Flux de données global

### 4.1 Flux d'authentification

```
POST /api/auth/login/
    │
    ▼
LoginView (authentification/api/views.py)
    │ appelle
    ▼
AuthService.login_with_email(email, password)
    │ appelle
    ▼
UserRepository.get_by_email(email)  +  check_password()
    │ retourne User
    ▼
Simple JWT génère access + refresh tokens
    │
    ▼
UserSerializer(user) → { id, email, role, poste, ... }
    │
    ▼
Response { user, access, refresh }  → Frontend stocke tokens
```

### 4.2 Flux d'une requête API protégée (exemple : créer un cours)

```
POST /api/prof/cours/
Headers: Authorization: Bearer <access_token>
    │
    ▼
DRF Authentication (Simple JWT)  → identifie request.user
    │
    ▼
CoursViewSet.get_permissions()   → CanCreateCours()
    │ échec → 403 | succès →
    ▼
CoursViewSet.create(request)
    │ valide via
    ▼
CoursSerializer.is_valid()       → 400 si invalide
    │ appelle
    ▼
CoursService.create(validated_data)
    │ logique métier (règles, validations)
    ▼
CoursRepository.create(data)     → Cours.objects.create(**data)
    │
    ▼
Response 201 + CoursSerializer(obj).data
```

### 4.3 Flux de rendu d'un TP

```
Étudiant → POST /api/eleve/rendus/
    │ crée RenduTP (espace_student)
    │ pointe vers TP (espace_prof)
    ▼
RenduTPService.create_rendu(tp_id, etudiant, fichier)
    │ vérifie date limite, formats autorisés (règles du TP)
    ▼
RenduTPRepository.create(...)
    ▼
Professeur → GET /api/prof/tps/{id}/rendus/
    │ lit RenduTP (espace_student) depuis espace_prof
    ▼
RenduTPRepository.get_by_tp(tp_id)
    ▼
Professeur → PATCH /api/prof/rendus/{id}/noter/
    │ met à jour note, commentaire_enseignant (dans espace_student)
```

### 4.4 Cartographie des dépendances entre apps

```
                  ┌────────┐
                  │  core  │ ← utilisé par tout le monde
                  └───┬────┘
                      │
              ┌───────▼───────┐
              │   app_admin   │ (User, Notification, AuditLog)
              └───────┬───────┘
                      │
         ┌────────────▼────────────┐
         │     administration      │ (Classe, Filiere, Ressource...)
         └──┬──────────┬───────────┘
            │          │
    ┌───────▼──┐   ┌───▼──────────┐
    │espace_   │   │ authentifi-  │
    │ prof     │   │ cation       │
    └───┬──────┘   └──────────────┘
        │
    ┌───▼──────────┐   ┌──────────────────┐
    │espace_student│   │ espace_library   │
    └──────────────┘   └──────────────────┘
```

---

## 5. Comment ajouter

### 5.1 Une nouvelle app

> **Règle absolue** : ne jamais créer une app manuellement. Utiliser exclusivement le script `run_menu.py` pour garantir une structure cohérente avec le reste du projet.

```bash
# Depuis backend/esi_online/
python run_menu.py --create-app-full <nom_app>
```

Cela génère automatiquement toute la structure de l'app :
- Dossiers : `api/`, `interfaces/`, `repositories/`, `services/`, `permissions/`, `views/`, `migrations/`
- Fichiers de base : `__init__.py`, `apps.py`, `admin.py`, `models.py`, `serializers.py`, `urls.py`, `tests.py`

Après la génération, deux étapes manuelles restent nécessaires :

**1. Déclarer l'app dans `settings.py`** (à faire avec l'accord du responsable projet) :
```python
INSTALLED_APPS = [
    ...
    'app.<nom_app>.apps.<NomApp>Config',  # Vérifier le nom exact dans apps.py
]
```

**2. Ajouter le préfixe URL dans `esi_online/urls.py`** (idem) :
```python
path('api/<prefixe>/', include('app.<nom_app>.urls')),
```

---

### 5.2 Un nouveau modèle

> **Règle absolue** : ne jamais écrire un modèle à la main. Décrire le modèle dans un fichier JSON, puis laisser le générateur produire tout le code.

**Étape 1 — Créer le fichier JSON** dans `models_zones/<nom_zone>/<nom_modele>.json` :

```json
{
  "model_name": "MonModele",
  "app_name": "mon_app",
  "fields": {
    "titre": { "type": "char", "max_length": 200 },
    "description": { "type": "text", "null": true, "blank": true },
    "date_debut": { "type": "date" },
    "is_active": { "type": "bool", "default": true }
  },
  "meta": {
    "db_table": "mes_modeles",
    "verbose_name": "Mon modèle",
    "verbose_name_plural": "Mes modèles"
  }
}
```

**Étape 2 — Lancer la génération** :

```bash
# Depuis backend/esi_online/
python run_menu.py --generate-from-zone <nom_zone> <nom_modele>
```

Le script génère automatiquement : le modèle Django, l'interface repository, le repository, le service, le serializer, les vues et les URLs.

**Étape 3 — Appliquer la migration** :

```bash
python manage.py makemigrations <nom_app>
python manage.py migrate
```

**Types de champs disponibles dans le JSON** :

| Type JSON | Champ Django généré |
|---|---|
| `char` | `CharField(max_length=...)` |
| `text` | `TextField()` |
| `int` | `IntegerField()` |
| `float` | `FloatField()` |
| `decimal` | `DecimalField(max_digits=10, decimal_places=2)` |
| `bool` | `BooleanField()` |
| `date` | `DateField()` |
| `datetime` | `DateTimeField()` |
| `email` | `EmailField()` |
| `url` | `URLField()` |
| `fk` | `ForeignKey(to=..., on_delete=...)` |
| `one2one` | `OneToOneField(...)` |
| `m2m` | `ManyToManyField(...)` |

---

### 5.3 Une nouvelle API

> **Règle absolue** : l'intégralité du squelette API (interface repository, repository, service, serializer, viewset, URLs) est générée automatiquement par le script à partir du JSON défini à l'étape 5.2. Ne pas écrire ces fichiers manuellement.

**Le script `run_menu.py --generate-from-zone` génère automatiquement ces fichiers** :

| Fichier généré | Rôle |
|---|---|
| `interfaces/<modele>_repository_interface.py` | Contrat abstrait (méthodes get_all, get_by_id, create, update, delete) |
| `repositories/<modele>_repository.py` | Implémentation ORM (requêtes Django) |
| `services/<modele>_service.py` | Logique métier (orchestration du repository) |
| `serializers.py` | Serializer DRF avec `read_only_fields` sur id, created_at, updated_at |
| `permissions/<modele>_permissions.py` | Classes CanView, CanCreate, CanUpdate, CanDelete |
| `views/<modele>_viewset.py` | ViewSet CRUD complet avec injection du service |
| `urls.py` | Enregistrement du ViewSet dans le routeur DRF |

**Après génération, les seules adaptations manuelles autorisées sont** :

1. **Service** — ajouter la logique métier spécifique au projet (règles de validation, calculs, vérifications) dans les méthodes `create()` et `update()` du service généré.
2. **Permissions** — adapter les conditions de rôle dans chaque classe `CanXxx` selon les droits réels définis pour votre app.
3. **Serializer** — affiner la liste des `fields` exposés ou ajouter des champs calculés (`SerializerMethodField`) si nécessaire.
4. **Repository** — ajouter des méthodes de filtrage métier (ex. `get_by_filiere()`, `get_actifs_only()`) en complément des méthodes CRUD de base.

**Routes générées automatiquement** par le routeur DRF :

| Méthode | URL | Action ViewSet |
|---|---|---|
| GET | `/api/<prefixe>/<modeles>` | `list` |
| POST | `/api/<prefixe>/<modeles>` | `create` |
| GET | `/api/<prefixe>/<modeles>/{id}` | `retrieve` |
| PUT | `/api/<prefixe>/<modeles>/{id}` | `update` |
| PATCH | `/api/<prefixe>/<modeles>/{id}` | `partial_update` |
| DELETE | `/api/<prefixe>/<modeles>/{id}` | `destroy` |

---

## 6. Scripts Python disponibles

Tous les scripts sont à exécuter depuis `backend/esi_online/` (là où se trouve `manage.py`).

### 6.1 `run_menu.py` — Menu interactif principal

Le point d'entrée le plus commun. Lance un menu interactif, ou peut être utilisé en CLI directement :

```bash
# Menu interactif
python run_menu.py

# Créer une app avec toute sa structure
python run_menu.py --create-app-full <nom_app>

# Générer le code d'un modèle à partir d'un JSON
python run_menu.py --generate-from-zone <zone> <nom_modele_sans_json>
# Exemple :
python run_menu.py --generate-from-zone administration annee_academique

# Lister les zones disponibles
python run_menu.py --list-zones
```

### 6.2 `run_generate.py` — Générateur en ligne de commande

Alternative directe au menu, utile pour les scripts ou la CI :

```bash
# Syntaxe courte (champs inline)
python run_generate.py <app_name> <ModelName> [champ:type:max_length] ...
# Exemple :
python run_generate.py administration AnneeAcademique libelle:char:50 date_debut:date is_active:bool

# Syntaxe complète (JSON)
python run_generate.py --json '{ "model_name": "...", "app_name": "...", "fields": {...}, "meta": {...} }'
```

**Ce qui est généré** : modèle Django, repository, service, serializer, vues (list + detail), URLs.

### 6.3 `run_all_models.py` — Génération en lot

Génère tous les modèles d'une zone en une fois :
```bash
python run_all_models.py <nom_zone>
```

### 6.4 `create_app.py` / `create_app_full.py` — Création d'app

```bash
# App simple (structure minimale)
python create_app.py <nom_app>

# App complète (toute la structure avec dossiers et fichiers de base)
python create_app_full.py <nom_app>
```

### 6.5 `manage.py` — Commandes Django standard

```bash
# Générer les migrations après modification des modèles
python manage.py makemigrations <app_name>

# Appliquer les migrations
python manage.py migrate

# Créer un super-utilisateur
python manage.py createsuperuser

# Lancer le serveur de développement
python manage.py runserver

# Shell Django interactif (utile pour tester)
python manage.py shell

# Envoyer un email de test (commande custom dans authentification)
python manage.py send_test_email
```

### 6.6 `codegen/improved_code_generator.py` — API Python du générateur

Pour utilisation programmatique (scripts d'automatisation) :
```python
from codegen.improved_code_generator import ImprovedCodeGenerator

gen = ImprovedCodeGenerator()
gen.generate_api({
    "model_name": "MonModele",
    "app_name": "mon_app",
    "fields": {
        "titre": {"type": "char", "max_length": 200},
        "est_actif": {"type": "bool", "default": True},
    },
    "meta": {"db_table": "mes_modeles"},
})
```

> **Sauvegardes automatiques** : avant toute modification d'un fichier existant, le générateur crée une sauvegarde dans `codegen/backups/` avec un timestamp. En cas de problème, les fichiers originaux y sont disponibles.

---

## 7. Bonnes pratiques

### Architecture et code

- **Logique métier exclusivement dans les services.** Les vues ne font que router et sérialiser. Les repositories ne font qu'accéder à la base de données.
- **Utiliser les exceptions de `app.core`** (`NotFoundError`, `ValidationError`) dans les services et les repositories. Les vues les catchent et retournent les codes HTTP appropriés (404, 400).
- **Un serializer par contexte** si nécessaire : utiliser un `ListSerializer` léger pour les listes et un `DetailSerializer` complet pour le retrieve, plutôt qu'un seul serializer avec des champs conditionnels.
- **`read_only_fields`** : toujours marquer `id`, `created_at`, `updated_at` en lecture seule dans les serializers.

### Modèles

- **Nommage** : modèles en `PascalCase`, champs et méthodes en `snake_case`.
- **Toujours définir `class Meta`** avec au minimum `db_table`, `verbose_name`, `verbose_name_plural` et `ordering`.
- **Référencer les modèles d'autres apps par chaîne** (`'app_admin.User'`, `'administration.Classe'`) pour éviter les imports circulaires.
- **Clés étrangères vers `User`** : utiliser `settings.AUTH_USER_MODEL` pour les `OneToOneField` et `'app_admin.User'` pour les `ForeignKey`.
- **Stockage de fichiers** : utiliser `CharField(max_length=500)` pour stocker le chemin ou l'URL du fichier (cohérent avec le reste du projet). Pas de `FileField`.

### Migrations

- **Toujours faire `makemigrations` après toute modification des modèles**, même mineure.
- **Ne jamais modifier une migration déjà appliquée en production.** Créer une nouvelle migration.
- **Vérifier les dépendances** entre migrations lorsqu'un modèle d'une app référence un modèle d'une autre app.

### Permissions

- **Une classe de permission par action** (CanView, CanCreate, CanUpdate, CanDelete). Ce pattern est déjà en place dans tout le projet.
- **Ne jamais mettre `AllowAny` sur les endpoints de modification** (create, update, delete).
- **`AllowAny`** uniquement pour les endpoints d'authentification (login, register, validate-invitation).

### Isolation inter-apps

- **Ne modifier que les fichiers de votre app.** Si vous avez besoin d'une donnée d'une autre app, importez le modèle ou le service en lecture.
- **Ne jamais modifier `esi_online/urls.py`** ou `settings.py` sans accord explicite du responsable projet.
- Si une fonctionnalité nécessite des données de deux apps, la **logique de jonction** se fait dans le service de l'app demandeuse.

### Git & collaboration

- Travailler sur une **branche feature** par app ou par fonctionnalité.
- **Ne pas committer les fichiers `codegen/backups/`** (ils sont volumineux et transitoires).
- Committer les migrations avec le code correspondant dans le même commit.

---

## 8. Erreurs courantes à éviter

### ❌ Mettre la logique métier dans les vues

```python
# MAUVAIS
class CoursViewSet(viewsets.ModelViewSet):
    def create(self, request):
        if Cours.objects.filter(matiere=data['matiere'], classe=data['classe']).exists():
            return Response({'error': '...'}, status=400)
        cours = Cours.objects.create(**data)  # Accès direct au modèle
        ...

# CORRECT
class CoursViewSet(viewsets.ModelViewSet):
    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        obj = self.service.create(serializer.validated_data)  # Déléguer au service
        ...
```

### ❌ Accéder à un modèle d'une autre app directement depuis une vue

```python
# MAUVAIS — La vue accède directement au modèle d'une autre app
from app.administration.models import Classe

class EtudiantViewSet(viewsets.ModelViewSet):
    def list(self, request):
        classes = Classe.objects.all()  # Logique qui devrait être dans un service

# CORRECT — Passer par le service de l'app propriétaire ou importer le modèle pour un queryset simple
```

### ❌ Oublier de migrer après ajout d'un champ

```python
# Vous ajoutez un champ dans models.py...
description = models.TextField(null=True, blank=True)

# ...et lancez directement le serveur → ProgrammingError: column does not exist

# TOUJOURS faire :
# python manage.py makemigrations <app_name>
# python manage.py migrate
```

### ❌ Références circulaires entre apps via import direct

```python
# MAUVAIS — import direct peut créer des circularités
from app.administration.models import Classe  # Peut poser problème à l'initialisation

# CORRECT — utiliser la référence par chaîne dans les ForeignKey des modèles
classe = models.ForeignKey('administration.Classe', on_delete=models.SET_NULL, null=True)
```

### ❌ Dupliquer des modèles entre apps

```python
# MAUVAIS — recréer Ressource dans espace_library
# app/espace_library/models.py
class Ressource(models.Model):  # Déjà dans administration !
    titre = models.CharField(...)

# CORRECT — importer depuis l'app propriétaire
from app.administration.models import Ressource
```

### ❌ Modifier les fichiers d'une autre app

```python
# MAUVAIS — modifier app/administration/models.py depuis l'équipe espace_library
# Cela casse le travail de l'autre équipe et les migrations sont imprévisibles.

# CORRECT — si un champ manque dans un modèle d'une autre app,
# en discuter avec l'équipe responsable et laisser CETTE équipe faire la modification.
```

### ❌ Ne pas utiliser `trailing_slash=False` dans le routeur

```python
# Le projet utilise partout :
router = DefaultRouter(trailing_slash=False)
# → /api/cours  (sans slash final)

# Ne pas créer :
router = DefaultRouter()
# → /api/cours/  (avec slash final) — incohérent avec le reste du projet
```

### ❌ Exposer des données sensibles dans les serializers

```python
# MAUVAIS
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'  # Expose le mot de passe hashé, les tokens, etc.

# CORRECT
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'role', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']
```

### ❌ Appeler `makemigrations` sans préciser l'app

```bash
# RISQUÉ — détecte les changements dans TOUTES les apps
python manage.py makemigrations

# CORRECT — cible uniquement votre app
python manage.py makemigrations <nom_app>
```

---

*Guide rédigé le 03/03/2026 — À mettre à jour au fur et à mesure des évolutions du projet.*
