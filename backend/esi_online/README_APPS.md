# Documentation des apps — ESI Online Backend

Ce document est l’**index** de la documentation par app. Chaque équipe travaille sur **une app** et doit suivre le **README détaillé** de cette app ainsi que les **règles communes** ci-dessous.

La **ROADMAP CHRONOLOGIQUE - ESI-Online MVP** (Phases 0 à 3, Sprints 1 à 12+) est déclinée **par app** dans chaque README : section **« Roadmap — Ce que l’équipe doit faire (par sprint) »**. Consulter le README de son app pour la liste détaillée des tâches à réaliser, dans l’ordre des sprints, tout en respectant **couleurs, typo** et **sans toucher aux autres parties** du projet.

---

## Règles communes à toutes les équipes

1. **Ne pas toucher aux autres parties du projet**  
   Chaque équipe modifie **uniquement** les fichiers de son app (dossier `app/<nom_app>/`). Ne pas modifier les autres apps, ni `esi_online/urls.py`, `esi_online/settings.py`, sauf accord explicite avec le responsable projet.

2. **Respect des couleurs et de la typographie**  
   - Côté **backend** : rester sur du code Python/Django standard (pas de fichiers CSS/JS dans les apps backend).  
   - **Nommage** : modèles en **PascalCase**, champs et fonctions en **snake_case** ; noms d’URL en minuscules.  
   - Conserver le **style** et les **conventions** déjà en place dans le fichier où vous intervenez.

3. **Architecture**  
   - **Vues** (API) → **Services** (logique métier) → **Repositories** (accès données).  
   - Utiliser les **exceptions** de `app.core` (NotFoundError, ValidationError) pour une gestion d’erreurs cohérente.

4. **Migrations**  
   Après toute modification des modèles, exécuter depuis la racine du projet :
   ```bash
   python manage.py makemigrations <app_name>
   python manage.py migrate
   ```

---

## Liste des apps et documentation

| App | Rôle | README |
|-----|------|--------|
| **administration** | Scolarité, établissement, annonces, bibliothèque (données), forum, EDT, Administration École | [app/administration/README.md](app/administration/README.md) |
| **authentification** | Connexion, rôles, création de comptes (étudiants, bibliothécaires, professeurs), invitations | [app/authentification/README.md](app/authentification/README.md) |
| **core** | Exceptions et repository de base (partagé) | [app/core/README.md](app/core/README.md) |
| **espace_library** | Espace bibliothèque (API et logique côté bibliothécaire) | [app/espace_library/README.md](app/espace_library/README.md) |
| **espace_prof** | Espace professeur (cours, chapitres, TP, QCM) | [app/espace_prof/README.md](app/espace_prof/README.md) |
| **espace_student** | Espace étudiant (profil, rendus TP, tentatives QCM) | [app/espace_student/README.md](app/espace_student/README.md) |

L’app **admin** (administration technique du site, User, logs, notifications) n’est **pas** documentée ici ; ne pas la modifier sans accord.

Dans chaque README ci-dessus, la section **« Roadmap — Ce que l’équipe doit faire »** détaille, **sprint par sprint**, les tâches à réaliser (modèles, API, permissions, tests, etc.) conformément à la roadmap MVP et Version 2.

---

## URLs API (rappel)

| Préfixe | App |
|--------|-----|
| `/api/auth/` | authentification |
| `/api/admin/` | admin (ne pas modifier sans accord) |
| `/api/administration/` | administration (viewset) |
| `/api/etablissement/` | administration (endpoints détaillés) |
| `/api/eleve/` | espace_student |
| `/api/prof/` | espace_prof |
| `/api/bibliotheque/` | espace_library |

---

Pour le détail des **tâches**, **structure**, **conventions** et **dépendances** de chaque app, ouvrir le **README** correspondant dans le tableau ci-dessus.
