# App **Administration**

Documentation pour l’équipe en charge du module **administration** (scolarité, établissement, annonces, bibliothèque, forum, emplois du temps).

---

## Rôle du module

L’app **administration** gère tout ce qui relève de la **structure de l’école** et des **données partagées** :

- **Établissement** : années académiques, niveaux, filières, classes, matières, affectations enseignants
- **Administration École** : comptes (matricule, poste, droits CRUD), liaison avec `auth_user` pour la connexion
- **Annonces** : création, publication, lectures, destinataires
- **Emplois du temps** et **événements**
- **Bibliothèque** (côté données) : catégories, tags, ressources, exemplaires, emprunts, réservations, consultations
- **Forum** : forums, sujets, réponses, réactions
- **Messages**

Les APIs sont exposées sous **`/api/administration/`** (viewset Administration) et **`/api/etablissement/`** (endpoints détaillés : annees, niveaux, filières, classes, matières, administrationecoles, annonces, etc.).

---

## Règle importante

> **Ne pas modifier les autres apps.**  
> Travailler **uniquement** dans `app/administration/`. Ne pas toucher à `app.authentification`, `app.admin`, `app.core`, `app.espace_library`, `app.espace_prof`, `app.espace_student`, ni aux URLs principales dans `esi_online/urls.py` (sauf si une évolution convenue avec le responsable projet).

---

## Structure du module

```
app/administration/
├── README.md                 ← ce fichier
├── __init__.py
├── admin.py                  ← enregistrement des modèles dans l’admin Django (optionnel)
├── apps.py
├── models.py                 ← tous les modèles (AnneeAcademique, Niveau, Filiere, Classe, Matiere, …)
├── serializers.py
├── urls.py                   ← route vers AdministrationViewSet → /api/administration/
├── api/
│   ├── urls.py               ← routes détaillées → /api/etablissement/ (anneeacademiques/, filieres/, …)
│   ├── views.py              ← vues list/detail pour chaque ressource
│   └── serializers.py
├── interfaces/
│   └── administration_repository_interface.py
├── permissions/
│   └── administration_permissions.py
├── repositories/             ← un repository par entité (accès BDD)
│   ├── anneeacademique_repository.py
│   ├── classe_repository.py
│   ├── administrationecole_repository.py
│   └── … (annonce, emprunt, forum, etc.)
├── services/                 ← logique métier (un service par entité)
│   ├── anneeacademique_service.py
│   ├── administrationecole_service.py
│   └── …
├── views/
│   └── administration_viewset.py
└── migrations/
```

---

## Modèles principaux (résumé)

| Modèle | Rôle |
|--------|------|
| `Administration` | Entité générique (nom, description). |
| `AnneeAcademique` | Année scolaire (libelle, date_debut, date_fin, is_active). |
| `Niveau` | Niveau d’études (code, libelle, ordre). |
| `Filiere` | Filière (code, libelle, description). |
| `Classe` | Classe (code, libelle, niveau, filiere, annee_academique, effectif_max). |
| `Matiere` | Matière (code, libelle, coefficient, credit, niveau, filiere, semestre). |
| `DroitAdministration` | Droits CRUD pour l’administration école (code, libelle, domaine, action). |
| `AdministrationEcole` | Compte admin école (user, auth_user, matricule, poste, droits M2M). |
| `Annonce`, `LectureAnnonce` | Annonces et suivi des lectures. |
| `EmploiDuTemps`, `Evenement` | EDT et événements. |
| `Categorie`, `Tag`, `Ressource`, `Exemplaire`, `Emprunt`, `Reservation`, `ConsultationRessource` | Bibliothèque. |
| `Message`, `Forum`, `Sujet`, `Reponse`, `ReactionReponse` | Forum et messages. |
| `AffectationEnseignant` | Lien enseignant – matière / classe. |

Les **clés étrangères** pointent vers `app_admin.User`, `administration.*`, ou `espace_prof.Enseignant` (pour EmploiDuTemps). Ne pas casser ces références.

---

## API exposées

- **`/api/administration/`** : ViewSet REST (list, retrieve, create, update, destroy) selon configuration du routeur.
- **`/api/etablissement/`** : endpoints détaillés (liste + détail par ressource), ex. :
  - `anneeacademiques/`, `niveaus/`, `filieres/`, `classes/`, `matieres/`
  - `administrationecoles/`, `droitadministrations/`
  - `annonces/`, `lectureannonces/`, `emploidutempss/`, `evenements/`
  - `categories/`, `tags/`, `ressources/`, `exemplaires/`, `emprunts/`, `reservations/`
  - `messages/`, `forums/`, `sujets/`, `reponses/`, `reactionreponses/`
  - `affectationenseignants/`, `consultationressources/`

Respecter les **méthodes HTTP** et les **codes de réponse** habituels (200, 201, 400, 404).

---

## Roadmap — Ce que l’équipe doit faire (par sprint)

Référence : **ROADMAP CHRONOLOGIQUE - ESI-Online MVP**. Travailler **uniquement** dans `app/administration/`, en respectant **couleurs et typo** du projet et **sans toucher aux autres apps**.

### Sprint 2 — Espace Administration (Partie 1)

- **Modèles** : s’assurer que Année académique, Niveau, Filière, Classe, Matière sont complets et cohérents (déjà présents).
- **API CRUD** : finaliser/compléter les API de gestion académique (`/api/etablissement/` : anneeacademiques, niveaus, filieres, classes, matieres).
- **API gestion des utilisateurs** : exposer ou compléter les endpoints de création, modification, suppression des utilisateurs (coordination avec authentification pour la création de comptes).
- **API import massif (CSV)** : permettre l’import en masse (ex. étudiants par classe) ; validation, gestion des erreurs, rapport d’import.
- **Permissions admin** : renforcer les permissions (superuser, admin_ecole) sur toutes les vues ; tests de droits.
- **Tests** : tests unitaires et d’intégration pour les services et vues CRUD académiques.

### Sprint 3 — Bibliothèque académique (données)

- **Modèles** : s’assurer que Ressource, Catégorie, Tag (et métadonnées si prévues) sont complets (déjà présents).
- **API classification** : endpoints pour associer les ressources par niveau, année, matière (liens avec les modèles existants).
- **Système de tags et métadonnées** : logique dans les services (ajout/suppression de tags, filtres par métadonnées).
- **Statistiques de consultation** : enregistrement des consultations (ConsultationRessource) et API d’agrégation (documents populaires, stats par catégorie).
- **Permissions** : définir qui peut créer/modifier les ressources (admin pour MVP) ; appliquer dans les vues.
- **Tests** : tests sur la classification, les tags, les stats de consultation.

*(L’upload de fichiers, validation formats/taille, compression et moteur de recherche peuvent être dans **espace_library** ou exposés ici selon choix d’architecture ; ne pas dupliquer.)*

### Sprint 4 — Espace étudiant (données côté admin)

- **Modèle Emploi du temps** : déjà présent (EmploiDuTemps, Evenement) ; s’assurer que les champs sont complets.
- **API emploi du temps** : exposée sous `/api/etablissement/` (emploidutempss) — par classe, par enseignant si besoin.
- **API agenda académique** : événements (evenements/) avec filtres par classe, année, date.
- **API notifications** : si les modèles de notifications sont dans cette app ou dans admin, exposer les endpoints nécessaires pour l’espace étudiant.
- **API messagerie interne basique** : modèles Message déjà présents ; exposer les endpoints (liste, envoi, lecture) en respectant les permissions.
- **Tests** : tests sur EDT, agenda, messagerie.

### Sprint 5 — Espace Administration Partie 2 (Communication)

- **Modèle Annonce** : déjà présent ; compléter les champs si besoin (pièces jointes, catégorisation).
- **API création d’annonces** : CRUD complet avec éditeur de contenu côté front (backend : champs texte, fichier_joint, catégorie).
- **API ciblage** : logique de ciblage (tous, par rôle, par niveau, par classe, individuel) — utiliser destinataires_tous, destinataires_roles et éventuellement une table de ciblage fine.
- **Programmation de publication** : champs date_publication, date_expiration ; API pour lister brouillons / publiées / programmées / archivées.
- **API statistiques de lecture** : LectureAnnonce ; endpoints d’agrégation (nombre de lectures par annonce, par destinataire).
- **Système de notifications** : coordination avec le module notifications (email + in-app) ; ne pas casser les modèles existants.
- **Tests** : tests sur annonces, ciblage, programmation, stats de lecture.

### Phase 3 (optionnel) — Fonctionnalités avancées

- **Forums** : modèles Forum, Sujet, Reponse, ReactionReponse déjà présents ; compléter les API (création sujets, réponses, modération, réactions/votes).
- **Tableau d’affichage institutionnel** : API pour affichage public des annonces (archivage, catégorisation).

### Règles transverses

- **Logique métier** dans les **services** ; vues légères.
- **Migrations** : après toute modification de `models.py`, exécuter `makemigrations` et `migrate` depuis la racine du projet.
- **Conventions** : PascalCase modèles, snake_case champs ; pas de CSS/JS dans cette app.

---

## Conventions à respecter

- **Couleurs / typo** : pas de changement de thème ou de styles en dehors de ce module ; côté backend, rester sur du code Python/Django standard (pas de fichiers CSS/JS dans cette app).
- **Nommage** :  
  - Modèles en **PascalCase**, champs en **snake_case**.  
  - Repositories : `*_repository.py` ; services : `*_service.py`.  
  - Noms d’URL en **minuscules**, pluriel si liste (ex. `anneeacademiques/`).
- **Architecture** :  
  - Les **vues** appellent les **services** ; les services s’appuient sur les **repositories** et éventuellement `app.core.exceptions` (NotFoundError, ValidationError).  
  - Ne pas mettre de logique métier lourde dans les vues ou les serializers.
- **Imports** : utiliser les modèles via `administration.*` ou les apps autorisées (voir section suivante).

---

## Dépendances autorisées

- **`app.core`** : autorisé (exceptions, base repository si besoin).
- **`app.admin`** (ou `app_admin` selon configuration) : autorisé pour les références **User** (ForeignKey, OneToOne).
- **`app.authentification`** : en lecture / référence uniquement si nécessaire (ex. rôle utilisateur) ; ne pas modifier l’app authentification.
- **`app.espace_prof`** : autorisé pour les références **Enseignant** (ex. EmploiDuTemps.enseignant).
- **`app.espace_library`** / **`app.espace_student`** : ne pas importer depuis administration dans ces apps ; si une donnée doit être partagée, passer par l’API ou des modèles déjà liés.

---

## Résumé

| Élément | Règle |
|--------|--------|
| **Périmètre** | Uniquement `app/administration/`. |
| **Autres apps** | Ne pas les modifier. |
| **Logique métier** | Dans les **services** ; vues légères. |
| **Accès données** | Via **repositories** et modèles. |
| **API** | `/api/administration/` et `/api/etablissement/`. |
| **Migrations** | Toujours après changement de modèles. |
