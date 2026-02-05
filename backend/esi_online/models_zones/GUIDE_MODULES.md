# Comment les modules sont créés (explication simple)

## Deux choses différentes

1. **Les fiches (JSON)** = des fichiers dans `models_zones/`  
   Ce sont juste des **descriptions** de ce que tu veux comme modèle en base de données.  
   Par exemple : `models_zones/eleve/etudiant.json` dit : "je veux un modèle Etudiant avec matricule, date_naissance, classe, etc."

2. **Les vrais modules Django** = le code dans `app/`  
   C’est le code Python réel : `app/eleve/models.py`, `app/eleve/api/views.py`, etc.  
   Ce code est **généré automatiquement** à partir des fiches JSON.

Donc : **tu n’écris pas les modules à la main**. Tu décris dans un JSON, puis un script lit ce JSON et crée tout le code (modèle, API, permissions, etc.).

---

## Comment ça se passe en pratique

### Étape 1 : Créer l’app (une fois par app)

Une "app" = un dossier dans `app/` (ex. `app/admin/`, `app/eleve/`).  
Au début ce dossier n’existe pas. Tu le crées avec une commande :

```bash
python run_menu.py --create-app-full admin
python run_menu.py --create-app-full administration
python run_menu.py --create-app-full eleve
python run_menu.py --create-app-full prof
```

Ça crée la **structure vide** : dossiers `api/`, `repositories/`, `services/`, `permissions/`, etc., avec des fichiers de base (souvent vides ou avec des exemples).

### Étape 2 : Générer chaque modèle à partir du JSON

Ensuite, pour **chaque** fiche JSON, tu lances une commande.  
Le script lit le JSON et **ajoute** dans l’app le modèle + l’API (repository, service, serializers, vues, permissions).

Exemple pour l’étudiant :

```bash
python run_menu.py --generate-from-zone eleve etudiant
```

- Il lit `models_zones/eleve/etudiant.json`
- Il écrit dans `app/eleve/models.py` la classe `Etudiant`
- Il crée `app/eleve/repositories/etudiant_repository.py`
- Il crée `app/eleve/services/etudiant_service.py`
- Il ajoute dans `app/eleve/api/serializers.py` le `EtudiantSerializer`
- Il ajoute dans `app/eleve/api/views.py` les vues list/create/detail/update/delete
- Il ajoute dans `app/eleve/permissions/` les permissions (CanView, CanCreate, etc.)

Donc **un JSON = une commande = un modèle complet (modèle + API + permissions)**.

### Résumé du flux

```
models_zones/eleve/etudiant.json   →   [run_menu.py --generate-from-zone eleve etudiant]   →   app/eleve/ (modèle + API + perms)
models_zones/prof/cours.json       →   [run_menu.py --generate-from-zone prof cours]      →   app/prof/ (idem)
...
```

- **Les "modules"** = les dossiers `app/admin/`, `app/administration/`, `app/eleve/`, `app/prof/`.
- **Comment ils sont créés** : d’abord `--create-app-full <nom>`, puis pour chaque modèle `--generate-from-zone <zone> <nom_du_fichier_sans_json>`.

---

## Les 4 apps (modules) et ce qu’il y a dedans

| Module (dossier dans `app/`) | Rôle | Fiches JSON (dans `models_zones/<nom>/`) |
|-------------------------------|------|------------------------------------------|
| **admin** | Utilisateurs, super-admin, logs, notifications | user, super_admin, audit_log, notification, preference_notification |
| **administration** | Scolarité : années, classes, matières, annonces, bibliothèque, forum, EDT | annee_academique, niveau, filiere, classe, matiere, affectation_enseignant, administration_ecole, annonce, lecture_annonce, emploi_du_temps, evenement, categorie, tag, ressource, consultation_ressource, exemplaire, emprunt, reservation, message, forum, sujet, reponse, reaction_reponse |
| **eleve** | Côté étudiant : profil, rendus TP, tentatives QCM | etudiant, rendu_tp, tentative_qcm, reponse_etudiant_qcm |
| **prof** | Côté prof : profil, cours, chapitres, TP, QCM | enseignant, cours, chapitre, ressource_cours, exercice, tp, fichier_support_tp, qcm, question_qcm, reponse_qcm |

Chaque ligne de la colonne "Fiches JSON" = un fichier `.json` dans le dossier de la zone.  
Une fois l’app créée, tu peux lancer une commande `--generate-from-zone <app> <nom_sans_json>` pour chaque fiche et le module se remplit tout seul.

---

## En une phrase

**Les "modules" sont les 4 dossiers app/admin, app/administration, app/eleve, app/prof. Ils sont créés par des commandes qui lisent les JSON dans models_zones et génèrent le code Django (modèles + API + permissions).**
