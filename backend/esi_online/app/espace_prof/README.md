# App **Espace professeur**

Documentation pour l’équipe en charge du module **espace professeur** : cours, chapitres, ressources, exercices, TP, QCM et réponses. Les **données** de structure (Matiere, Classe, AnneeAcademique) sont dans l’app **administration** ; les **données** liées aux étudiants (RenduTP, TentativeQCM, ReponseEtudiantQCM) sont dans **espace_student**.

---

## Rôle du module

L’app **espace_prof** gère :

- **Profil enseignant** : modèle **Enseignant** (lié à User), matricule, grade, spécialité, bureau, bio.
- **Cours** : liés à une matière, une classe, un enseignant, une année académique ; chapitres, visibilité, dates.
- **Chapitres** : ordre, dates de disponibilité/expiration, visibilité.
- **Ressources de cours** : fichiers ou liens associés aux chapitres.
- **Exercices** et **TP** (travaux pratiques) : énoncés, fichiers supports, dates.
- **QCM** : questions, réponses possibles (ReponseQCM), correction ; les **tentatives** et **réponses étudiants** sont dans **espace_student**.

L’API est exposée sous **`/api/prof/`** (ViewSet ou endpoints détaillés selon la configuration).

---

## Règle importante

> **Ne pas modifier les autres apps.**  
> Travailler **uniquement** dans `app/espace_prof/`. Ne pas toucher à `app.admin`, `app.administration`, `app.authentification`, `app.core`, `app.espace_library`, `app.espace_student`, ni aux URLs principales (sauf évolution convenue).

---

## Structure du module

```
app/espace_prof/
├── README.md                 ← ce fichier
├── __init__.py
├── admin.py
├── apps.py
├── models.py                 ← Enseignant, Cours, Chapitre, RessourceCours, Exercice, TP, FichierSupportTP, QCM, QuestionQCM, ReponseQCM
├── serializers.py
├── urls.py                   ← routes sous /api/prof/
├── api/                      ← si présent (urls, views, serializers détaillés)
├── interfaces/
│   └── prof_repository_interface.py
├── permissions/
│   ├── espace_prof_permissions.py
│   └── prof_permissions.py
├── repositories/             ← un repository par entité (cours, chapitre, qcm, …)
├── services/                 ← logique métier (cours, chapitre, qcm, tp, …)
├── views/
│   └── prof_viewset.py
└── migrations/
```

---

## Modèles principaux (résumé)

| Modèle | Rôle |
|--------|------|
| **Enseignant** | Profil prof (user, matricule, grade, specialite, bureau, bio). |
| **Cours** | Cours (titre, matiere, classe, enseignant, annee_academique, is_published, dates). |
| **Chapitre** | Chapitre d’un cours (ordre, titre, dates, is_visible). |
| **RessourceCours** | Ressource attachée à un chapitre. |
| **Exercice** | Exercice (lié à un chapitre/cours). |
| **TP** | Travail pratique ; les **rendus** sont dans espace_student (RenduTP). |
| **FichierSupportTP** | Fichier support d’un TP. |
| **QCM** | QCM (lié à un cours/chapitre) ; **QuestionQCM**, **ReponseQCM** (réponses possibles). |
| **TentativeQCM** et **ReponseEtudiantQCM** | Dans **espace_student**. |

Les **clés étrangères** vers `administration.Matiere`, `administration.Classe`, `administration.AnneeAcademique` et vers `app_admin.User` ne doivent pas être cassées.

---

## API exposée (`/api/prof/`)

- ViewSet REST (list, retrieve, create, update, destroy) selon le routeur.
- L’équipe peut **ajouter** des actions (ex. publier un cours, lister les QCM d’un chapitre, statistiques) dans les vues ou en sous-routes, **sans modifier** les autres apps.

Respecter les **permissions** : accès réservé aux utilisateurs ayant le rôle **professeur** (groupe ou lien Enseignant).

---

## Roadmap — Ce que l’équipe doit faire (par sprint)

Référence : **ROADMAP CHRONOLOGIQUE - ESI-Online MVP**. Travailler **uniquement** dans `app/espace_prof/`, en respectant **couleurs et typo** du projet et **sans toucher aux autres apps**. Les rendus étudiants (RenduTP, TentativeQCM, ReponseEtudiantQCM) sont dans **espace_student** ; ne pas les déplacer.

### Sprint 7 — Fondations espace enseignant

- **Modèle Enseignant** : s’assurer qu’il est complet (user, matricule, grade, specialite, bureau, bio) et lié à AUTH_USER_MODEL.
- **Extension du modèle User** : lien OneToOne User ↔ Enseignant ; affectation enseignants aux matières (via **administration.AffectationEnseignant** ou **authentification.ProfesseurMatiere** — ne pas modifier ces apps).
- **API de gestion du profil enseignant** : CRUD ou mise à jour du profil (matricule, grade, bureau, bio) ; réservé au professeur connecté ou à l’admin.
- **Permissions enseignant** : restreindre l’accès à l’API aux utilisateurs ayant le rôle **professeur** (groupe ou profil Enseignant) ; utiliser `espace_prof_permissions.py` / `prof_permissions.py`.
- **Tests** : tests sur création/mise à jour profil, permissions.

### Sprint 8 — Gestion de cours (interface unifiée)

- **Modèles** : Cours, Chapitre/Section, RessourceCours — déjà présents ; compléter les champs si besoin (ordre, dates, visibilité).
- **Hiérarchie** : Cours → Chapitres → Ressources ; contraintes et cohérence dans les services.
- **API CRUD complète** : création, modification, suppression de cours, chapitres, ressources de cours ; validation des FK (matiere, classe, enseignant, annee_academique).
- **Publication programmée** : champs date_debut, date_fin sur Cours/Chapitre ; logique de visibilité (is_published, is_visible) selon les dates.
- **Gestion de la disponibilité** : dates début/fin par chapitre ou ressource ; API pour récupérer le planning de disponibilité.
- **Système de visibilité** : publié / brouillon (is_published) ; filtres côté API.
- **API de réorganisation** : endpoints pour modifier l’ordre des chapitres ou des ressources (drag & drop côté front — backend : mise à jour du champ ordre).
- **Tests** : tests CRUD cours, chapitres, ressources ; publication, ordre.

### Sprint 9 — TP et système de rendus

- **Modèles** : TP, Exercice, FichierSupportTP — déjà présents. Les **rendus** (RenduTP) sont dans **espace_student** ; ne pas les déplacer.
- **API création de TP** : énoncé, consignes, fichiers support ; liaison au cours/chapitre.
- **API de configuration TP** : dates (ouverture/fermeture), formats de fichier acceptés, taille max des rendus.
- **API de récupération des rendus** : lire les RenduTP (espace_student) pour les TP de l’enseignant ; filtres par TP, par étudiant, par statut.
- **Système de notation** : API pour mettre à jour note et commentaire_enseignant sur RenduTP (écriture dans espace_student via API ou service autorisé).
- **API feedback / commentaires** : enregistrement du commentaire enseignant et éventuellement fichier_correction, date_correction, corrige_par.
- **Gestion des retards** : règle métier (rendu après date limite) ; indiquer en lecture seule ou champ dérivé.
- **Téléchargement groupé (ZIP)** : endpoint pour télécharger tous les rendus d’un TP en ZIP (coordination avec espace_student pour les fichiers).
- **Tests** : tests création TP, récupération rendus, notation, export ZIP.

### Sprint 10 — Exercices, QCM & communication

- **Modèle Exercice** (manuel) : déjà présent ; compléter si besoin (énoncé, corrigé, date publication corrigé).
- **Modèles QCM** : QCM, QuestionQCM, ReponseQCM — déjà présents ; s’assurer que les champs (bonne réponse, ordre) sont cohérents.
- **API de création d’exercices** : CRUD exercices liés à un chapitre/cours.
- **API de création de QCM** : CRUD QCM, questions, réponses possibles ; marquer la bonne réponse pour l’auto-correction.
- **Système d’auto-correction pour QCM** : logique de calcul du score (côté espace_student ou ici en lecture des ReponseEtudiantQCM) ; exposer le score et le détail par tentative.
- **API des corrigés** : disponibilité différée (date de publication du corrigé) ; endpoint pour récupérer le corrigé si date dépassée.
- **Extension messagerie** : si la messagerie enseignant–étudiant passe par les modèles Message (administration), exposer les endpoints nécessaires pour l’enseignant (liste des messages où il est concerné, envoi).
- **Système de notifications enseignant** : coordination avec le module notifications ; ne pas modifier les autres apps.
- **Tests** : tests création exercices, QCM, auto-correction, corrigés, messagerie.

### Sprint 11 — Finalisation espace enseignant

- **Emploi du temps enseignant** : exposer les créneaux EDT où l’enseignant est affecté (données dans administration.EmploiDuTemps ; filtrage par enseignant).
- **Statistiques et analytics** : endpoints pour engagement des étudiants, taux de rendu des TP, statistiques par matière (agrégation à partir des données espace_student et des cours).
- **Templates de cours réutilisables** : duplication d’un cours (structure chapitres/ressources) ; API de copie.
- **Duplication de cours (année à année)** : cloner un cours vers une nouvelle année académique ; duplication des chapitres et ressources (références, pas les fichiers si stockés par ID).
- **Tests** : tests d’intégration, E2E parcours enseignant ; tests de charge (uploads simultanés) si pertinent.

### Règles transverses

- **Logique métier** dans les **services** ; vues légères.
- **Cohérence avec espace_student** : lire RenduTP, TentativeQCM, ReponseEtudiantQCM pour correction/stats ; ne pas modifier l’app espace_student.
- **Migrations** : après toute modification de `models.py`, exécuter `makemigrations` et `migrate` depuis la racine du projet.

---

## Conventions à respecter

- **Typo / style** : code Python/Django standard.
- **Nommage** : modèles en **PascalCase**, champs en **snake_case** ; repositories `*_repository.py`, services `*_service.py`.
- **Architecture** : **vues** → **services** → **repositories** ; utiliser `app.core.exceptions` pour les erreurs métier.

---

## Dépendances autorisées

- **`app.core`** : autorisé.
- **`app.administration`** : **lecture** (et écriture si besoin) pour Matiere, Classe, AnneeAcademique ; **ne pas modifier** les fichiers dans `app/administration/`.
- **`app.admin`** (User) : lecture pour l’utilisateur connecté et lien Enseignant.
- **`app.espace_student`** : **lecture** possible pour RenduTP, TentativeQCM, ReponseEtudiantQCM (correction, stats) ; **ne pas modifier** l’app espace_student.

---

## Résumé

| Élément | Règle |
|--------|--------|
| **Périmètre** | Uniquement `app/espace_prof/`. |
| **Modèles** | Enseignant, Cours, Chapitre, RessourceCours, Exercice, TP, QCM, QuestionQCM, ReponseQCM. |
| **API** | `/api/prof/` ; réservée au rôle professeur. |
| **Autres apps** | Ne pas les modifier. |
