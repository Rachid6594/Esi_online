# App **Espace étudiant**

Documentation pour l’équipe en charge du module **espace étudiant** : profil étudiant, rendus TP, tentatives QCM et réponses aux QCM. Les **données** de structure (Classe, etc.) sont dans **administration** ; les **cours, TP, QCM** sont dans **espace_prof**.

---

## Rôle du module

L’app **espace_student** gère :

- **Profil étudiant** : modèle **Etudiant** (lié à User), matricule, date/lieu de naissance, adresse, classe, année d’entrée, contact d’urgence.
- **RenduTP** : rendu d’un TP par un étudiant (fichier, commentaire, statut, note, commentaire enseignant, correction).
- **TentativeQCM** : une tentative d’un étudiant sur un QCM (numéro de tentative, score, date).
- **ReponseEtudiantQCM** : réponse d’un étudiant à une question de QCM (lien vers la question et la réponse choisie).

L’API est exposée sous **`/api/eleve/`** (ViewSet ou endpoints détaillés selon la configuration).

---

## Règle importante

> **Ne pas modifier les autres apps.**  
> Travailler **uniquement** dans `app/espace_student/`. Ne pas toucher à `app.admin`, `app.administration`, `app.authentification`, `app.core`, `app.espace_library`, `app.espace_prof`, ni aux URLs principales (sauf évolution convenue).

---

## Structure du module

```
app/espace_student/
├── README.md                 ← ce fichier
├── __init__.py
├── admin.py
├── apps.py
├── models.py                 ← Etudiant, RenduTP, TentativeQCM, ReponseEtudiantQCM
├── serializers.py
├── urls.py                   ← routes sous /api/eleve/
├── api/                      ← si présent
├── interfaces/
│   └── eleve_repository_interface.py
├── permissions/
│   ├── eleve_permissions.py
│   └── espace_student_permissions.py
├── repositories/             ← etudiant, rendutp, tentativeqcm, reponseetudiantqcm
├── services/
├── views/
│   └── eleve_viewset.py
└── migrations/
```

---

## Modèles principaux (résumé)

| Modèle | Rôle |
|--------|------|
| **Etudiant** | Profil étudiant (user, matricule, classe, date_naissance, adresse, contact_urgence, …). |
| **RenduTP** | Rendu d’un TP par un étudiant ; FK vers **espace_prof.TP** et **Etudiant** ; statut, note, commentaire enseignant, fichier correction. |
| **TentativeQCM** | Tentative d’un QCM par un étudiant ; FK vers **espace_prof.QCM** et **Etudiant** ; numero_tentative, score, date. |
| **ReponseEtudiantQCM** | Réponse à une question ; FK vers question (espace_prof), réponse choisie, tentative. |

Les **clés étrangères** vers `administration.Classe`, `espace_prof.TP`, `espace_prof.QCM`, `espace_prof.QuestionQCM`, `espace_prof.ReponseQCM` et `app_admin.User` ne doivent pas être cassées.

---

## API exposée (`/api/eleve/`)

- ViewSet REST (list, retrieve, create, update, destroy) selon le routeur.
- L’équipe peut **ajouter** des actions (ex. déposer un rendu TP, soumettre une tentative QCM, consulter mes notes) **sans modifier** les autres apps.

Respecter les **permissions** : accès réservé aux **étudiants** (utilisateur avec profil Etudiant ou rôle `user`) ; un étudiant ne doit accéder qu’à **ses propres** données (rendus, tentatives) sauf si le métier exige autrement.

---

## Roadmap — Ce que l’équipe doit faire (par sprint)

Référence : **ROADMAP CHRONOLOGIQUE - ESI-Online MVP**. Travailler **uniquement** dans `app/espace_student/`, en respectant **couleurs et typo** du projet et **sans toucher aux autres apps**. Les **cours, TP, QCM** sont dans **espace_prof** ; les lire pour afficher les sujets et enregistrer les rendus/tentatives ici.

### Sprint 4 — Espace étudiant

- **Modèle Etudiant** : s’assurer qu’il est complet (user, matricule, classe, date_naissance, adresse, contact_urgence, etc.) et lié à AUTH_USER_MODEL et administration.Classe.
- **API emploi du temps** : les données EDT sont dans **administration** ; exposer ici un endpoint agrégé « mon emploi du temps » (par classe de l’étudiant) ou déléguer au frontend (appel à administration). Ne pas dupliquer les modèles.
- **API agenda académique** : événements (administration.Evenement) — exposer les événements pour la classe de l’étudiant connecté.
- **API notifications** : exposer les notifications pour l’utilisateur connecté (si le modèle est dans admin/administration, fournir un endpoint « mes notifications » sans modifier ces apps).
- **API messagerie interne basique** : liste des messages reçus/envoyés par l’étudiant ; envoi de message (utilisation des modèles administration.Message si applicable).
- **Profil étudiant** : API lecture/mise à jour du profil (Etudiant) pour l’étudiant connecté ; accès aux ressources de sa classe (lecture des ressources selon classe/niveau — données dans administration).
- **Tests** : tests sur profil, EDT, agenda, notifications, messagerie.

### Sprint 9 — TP et rendus (côté étudiant)

- **Modèle RenduTP** : déjà présent ; champs fichier, commentaire_etudiant, statut, note, commentaire_enseignant, fichier_correction, date_correction, corrige_par.
- **API de soumission (côté étudiant)** : endpoint pour déposer un rendu (upload fichier, commentaire) ; validation format et taille max (cohérent avec la config TP dans espace_prof). Création d’un RenduTP lié au TP et à l’Etudiant connecté.
- **API de récupération des rendus** : liste « mes rendus » avec statut, note, feedback ; détail par rendu.
- **Historique des rendus** : filtres par TP, par matière, par statut.
- **Visualisation des notes et feedbacks** : exposition des champs note, commentaire_enseignant, fichier_correction dans les serializers ; permissions (étudiant = uniquement ses rendus).
- **Gestion des retards** : indiquer si le rendu est en retard (date de dépôt > date limite du TP) ; champ dérivé ou règle dans le service.
- **Tests** : tests soumission, validation taille/format, lecture des feedbacks, permissions.

### Sprint 10 — Exercices, QCM & communication (côté étudiant)

- **Modèles TentativeQCM, ReponseEtudiantQCM** : déjà présents ; s’assurer que les liens vers espace_prof.QCM, QuestionQCM, ReponseQCM sont cohérents.
- **Accès aux exercices** : exposer la liste des exercices disponibles pour l’étudiant (lecture des exercices espace_prof selon ses cours/classe) ; pas de modification des modèles espace_prof.
- **API QCM (côté étudiant)** : récupération des QCM disponibles ; création d’une **TentativeQCM** au démarrage ; enregistrement des **ReponseEtudiantQCM** (question + réponse choisie) à la soumission.
- **Auto-correction** : calcul du score de la tentative (comparaison ReponseEtudiantQCM avec les bonnes réponses dans ReponseQCM) ; mise à jour du score sur TentativeQCM ; exposition du résultat (score, détail bon/mauvais) après soumission.
- **Visualisation des corrigés** : lorsque la date de publication du corrigé est dépassée, exposer le corrigé (données en lecture depuis espace_prof) ; sinon renvoyer « pas encore disponible ».
- **Messagerie avec enseignants** : mêmes principes que Sprint 4 ; liste des échanges, envoi de message (modèles administration si applicable).
- **Tests** : tests tentative QCM, enregistrement réponses, calcul score, corrigés, messagerie.

### Règles transverses

- **Permissions** : un étudiant n’accède qu’à **ses propres** données (rendus, tentatives, profil) ; professeurs/admin peuvent accéder aux rendus pour correction via leurs endpoints (espace_prof ou API dédiée).
- **Cohérence avec espace_prof** : lire TP, QCM, QuestionQCM, ReponseQCM pour afficher les sujets ; ne pas modifier l’app espace_prof.
- **Logique métier** dans les **services** (calcul score QCM, règles tentative max, dates) ; vues légères.
- **Migrations** : après toute modification de `models.py`, exécuter `makemigrations` et `migrate` depuis la racine du projet.

---

## Conventions à respecter

- **Typo / style** : code Python/Django standard.
- **Nommage** : modèles en **PascalCase**, champs en **snake_case** ; repositories et services avec suffixe cohérent.
- **Architecture** : **vues** → **services** → **repositories** ; utiliser `app.core.exceptions` pour les erreurs métier.

---

## Dépendances autorisées

- **`app.core`** : autorisé.
- **`app.administration`** : **lecture** pour Classe (profil étudiant) ; **ne pas modifier** l’app administration.
- **`app.admin`** (User) : lecture pour l’utilisateur connecté et lien Etudiant.
- **`app.espace_prof`** : **lecture** pour TP, QCM, QuestionQCM, ReponseQCM (pour afficher les sujets et enregistrer les rendus/tentatives) ; **ne pas modifier** l’app espace_prof.

---

## Résumé

| Élément | Règle |
|--------|--------|
| **Périmètre** | Uniquement `app/espace_student/`. |
| **Modèles** | Etudiant, RenduTP, TentativeQCM, ReponseEtudiantQCM. |
| **API** | `/api/eleve/` ; réservée au rôle étudiant (et correction prof/admin si prévu). |
| **Autres apps** | Ne pas les modifier. |
