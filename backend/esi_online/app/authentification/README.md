# App **Authentification**

Documentation pour l’équipe en charge du module **authentification** : connexion unique, rôles, création de comptes (étudiants, bibliothécaires, professeurs), invitations et changement de mot de passe.

---

## Rôle du module

L’app **authentification** assure :

- **Connexion unique** : login par email + mot de passe ; retour de l’utilisateur (avec **rôle**) et des **tokens JWT** pour que le frontend redirige selon le rôle (admin → `/admin`, admin_ecole → `/administration`, bibliothecaire, professeur, étudiant → `/home`, etc.).
- **Utilisateur courant** : endpoint `me/` pour récupérer le profil (id, email, role, poste si admin_ecole).
- **Création de comptes** (côté admin) : étudiants (formulaire ou import CSV), bibliothécaires, professeurs ; envoi des identifiants par email et lien pour définir le mot de passe.
- **Invitation** : validation de token d’invitation et définition du mot de passe.
- **Liste / export** des étudiants (filtres, tri, export CSV).

Les modèles **UserClasse** et **ProfesseurMatiere** lient les utilisateurs Django aux **classes** (administration) et **matières** (administration) ; ils restent dans cette app pour éviter des dépendances circulaires.

---

## Règle importante

> **Ne pas modifier les autres apps.**  
> Travailler **uniquement** dans `app/authentification/`. Ne pas toucher à `app.admin`, `app.administration`, `app.core`, `app.espace_library`, `app.espace_prof`, `app.espace_student`, ni aux URLs principales dans `esi_online/urls.py` (sauf évolution convenue avec le responsable projet).

---

## Structure du module

```
app/authentification/
├── README.md                 ← ce fichier
├── __init__.py
├── admin.py
├── apps.py
├── models.py                 ← UserClasse, ProfesseurMatiere (pas le User Django, il est dans AUTH_USER_MODEL)
├── views.py
├── api/
│   ├── urls.py               ← routes sous /api/auth/
│   ├── views.py              ← login_view, current_user, register, create_student, …
│   └── serializers.py        ← UserSerializer (role, poste), LoginSerializer, CreateStudentSerializer, …
├── repositories/
│   └── user_repository.py
├── services/
│   ├── auth_service.py       ← login_with_email, create_user, …
│   └── student_email_service.py  ← envoi email identifiants / lien changer MDP
├── management/commands/
│   └── send_test_email.py
└── migrations/
```

---

## Modèles

| Modèle | Rôle |
|--------|------|
| **UserClasse** | Lien OneToOne entre `AUTH_USER_MODEL` et `administration.Classe` (étudiant → classe). |
| **ProfesseurMatiere** | Lien Many-to-Many logique (User ↔ Matiere) : un professeur peut avoir plusieurs matières. |

Le **User** Django est défini par `AUTH_USER_MODEL` (souvent `app_admin.User`). Le **rôle** (admin, admin_ecole, professeur, bibliothecaire, user) est calculé dans les serializers (`get_user_role`) à partir des groupes, `is_staff`, `is_superuser`, et du profil `AdministrationEcole` (administration).

---

## API exposées (`/api/auth/`)

| Méthode | Endpoint | Rôle |
|--------|----------|------|
| POST | `login/` | Connexion ; retourne `{ user, access, refresh }`. |
| POST | `token/refresh/` | Rafraîchissement du token (Simple JWT). |
| GET | `me/` | Utilisateur connecté (JWT requis). |
| POST | `register/` | Inscription (selon politique). |
| GET | `students/` | Liste des étudiants (admin). |
| GET | `students/export/` | Export CSV des étudiants. |
| POST | `students/create/` | Création d’un étudiant (admin). |
| POST | `students/import-csv/` | Import CSV d’étudiants. |
| GET | `bibliothecaires/` | Liste des bibliothécaires. |
| POST | `bibliothecaires/create/` | Création d’un bibliothécaire. |
| GET | `professeurs/` | Liste des professeurs. |
| POST | `professeurs/create/` | Création d’un professeur. |
| POST | `invitation/validate/` | Validation d’un token d’invitation. |
| POST | `invitation/set-password/` | Définition du mot de passe depuis une invitation. |

Respecter les **codes HTTP** (200, 201, 400, 401, 403) et ne pas exposer de données sensibles dans les réponses.

---

## Roadmap — Ce que l’équipe doit faire (par sprint)

Référence : **ROADMAP CHRONOLOGIQUE - ESI-Online MVP**. Travailler **uniquement** dans `app/authentification/`, en respectant **couleurs et typo** du projet et **sans toucher aux autres apps**.

### Sprint 1 — Authentification & base de données

- **Modèles utilisateurs** : le User Django (AUTH_USER_MODEL) est dans `app.admin` ; dans cette app, maintenir **UserClasse** et **ProfesseurMatiere** pour lier utilisateurs aux classes et matières. S’assurer que les champs et contraintes sont cohérents.
- **Système de rôles et permissions (RBAC)** : maintenir/enrichir la logique de rôle dans `get_user_role` (admin, admin_ecole, professeur, bibliothecaire, user) et l’exposer dans **UserSerializer** (champ `role`, `poste` si admin_ecole) pour que le frontend redirige correctement.
- **API d’inscription** : endpoint `register/` (POST) avec validation (email, mot de passe) ; utiliser AuthService.
- **API de connexion (JWT)** : endpoint `login/` (POST) — email + mot de passe ; retourner `{ user, access, refresh }` (Simple JWT). Gestion des erreurs (identifiants invalides).
- **API de déconnexion** : côté frontend (invalidation du token) ; côté backend, documenter ou exposer un endpoint de révocation si prévu.
- **API de récupération de mot de passe** : implémenter ou compléter le flux (demande par email, lien avec token, endpoint pour réinitialiser le mot de passe).
- **Gestion des sessions et tokens** : utiliser Simple JWT (access + refresh) ; durée de vie, blacklist si besoin.
- **Middleware d’authentification** : s’assurer que les vues protégées utilisent les permissions DRF (IsAuthenticated, IsAdminUser) et que le JWT est validé.
- **Tests unitaires auth** : tests pour login, register, récupération MDP, création de comptes (étudiant, bibliothécaire, professeur), validation invitation.

### Sprint 2 — Soutien à l’espace administration

- **API de gestion des utilisateurs** : compléter les endpoints `students/`, `students/create/`, `students/import-csv/`, `bibliothecaires/create/`, `professeurs/create/` (création User + lien Classe via UserClasse, envoi email identifiants, import CSV avec rapport d’erreurs).
- **API import massif (CSV)** : endpoint `students/import-csv/` — parsing CSV, validation, création des comptes, envoi des emails d’invitation ou identifiants.
- **Export CSV** : endpoint `students/export/` — filtres, tri, pagination ; format CSV cohérent avec l’import.

### Règles transverses

- **Sécuriser** : pas de log de mots de passe ; AllowAny uniquement pour login/register/invitation ; IsAdminUser pour création de comptes et listes.
- **Emails** : faire évoluer `student_email_service` (templates, contenu) dans cette app uniquement.
- **Rôle** : ne pas renommer ou supprimer le champ `role` (ni `poste`) sans coordination avec le frontend.
- **Migrations** : après toute modification de `models.py`, exécuter `makemigrations` et `migrate` depuis la racine du projet.

---

## Conventions à respecter

- **Typo / style** : code Python/Django standard ; pas de changement de thème ou de styles globaux.
- **Nommage** : vues en **snake_case** ; serializers en **PascalCase** avec suffixe `Serializer`.
- **Architecture** : les **vues** appellent les **services** (AuthService, student_email_service) ; les services peuvent utiliser le **user_repository** et `app.core.exceptions` (ValidationError).
- **Rôle** : toujours exposé via **UserSerializer** pour que le frontend redirige correctement ; ne pas renommer ou supprimer le champ `role` sans coordination avec le frontend.

---

## Dépendances autorisées

- **`app.core`** : autorisé (exceptions).
- **`app.admin`** (ou `app_admin` selon settings) : lecture du **User** et des groupes ; pas de modification de l’app admin.
- **`app.administration`** : lecture uniquement pour **Classe**, **Matiere**, **AdministrationEcole** (détection du rôle admin_ecole et poste). Ne pas modifier les modèles administration depuis cette app.

---

## Résumé

| Élément | Règle |
|--------|--------|
| **Périmètre** | Uniquement `app/authentification/`. |
| **Autres apps** | Ne pas les modifier. |
| **Login** | Retourner **user** (avec role, poste) + **access** + **refresh**. |
| **Création comptes** | Via services + email (identifiants / lien MDP). |
| **Migrations** | Après toute modification de `models.py`. |
