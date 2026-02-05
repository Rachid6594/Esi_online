# Models zones

Définitions des modèles par zone (une zone = une app). Le menu et le générateur lisent les JSON ici pour créer modèle, repository, service et API.

- **Zone** = dossier (ex. `espace_admin`, `academic`, `library`).
- **Un modèle** = un fichier `{nom_en_minuscules}.json` dans la zone.

## Format JSON

```json
{
  "model_name": "AnneeAcademique",
  "app_name": "espace_admin",
  "fields": {
    "libelle": { "type": "char", "max_length": 50 },
    "date_debut": { "type": "date" },
    "date_fin": { "type": "date" },
    "is_active": { "type": "bool", "default": false }
  },
  "meta": {
    "db_table": "annees_academiques",
    "verbose_name": "Année académique",
    "verbose_name_plural": "Années académiques"
  }
}
```

- **model_name** : nom de la classe du modèle (PascalCase).
- **app_name** : app Django cible (dossier dans `app/`).
- **fields** : dictionnaire `nom_champ` → `{ "type": "char"|"text"|"int"|"date"|"datetime"|"bool"|"email"|..., "max_length"?: number, "null"?: bool, "blank"?: bool, "default"?: value }`.
- **meta** (optionnel) : `db_table`, `verbose_name`, `verbose_name_plural`.

Types de champs courants : `char`, `text`, `int`, `float`, `decimal`, `bool`, `date`, `datetime`, `time`, `email`, `url`, `slug`, `json`, `fk`, `one2one`, `m2m`. Pour les relations : `to` (ex. `"authentification.User"`), `related_name`, `on_delete` (pour fk/one2one).

## Les 4 apps (domaines)

Le schéma est organisé en **4 apps** :

| App | Rôle | Modèles principaux |
|-----|------|--------------------|
| **admin** | Technique / plateforme (User, super-admin, logs, notifications) | User, SuperAdmin, AuditLog, Notification, PreferenceNotification |
| **administration** | Scolarité / école (structure, annonces, bibliothèque, forum, EDT) | AnneeAcademique, Niveau, Filiere, Classe, Matiere, AffectationEnseignant, AdministrationEcole, Annonce, LectureAnnonce, EmploiDuTemps, Evenement, Categorie, Tag, Ressource, Exemplaire, Emprunt, Reservation, Message, Forum, Sujet, Reponse, ReactionReponse, ConsultationRessource |
| **eleve** | Espace étudiant | Etudiant, RenduTP, TentativeQCM, ReponseEtudiantQCM |
| **prof** | Espace enseignant | Enseignant, Cours, Chapitre, RessourceCours, Exercice, TP, FichierSupportTP, QCM, QuestionQCM, ReponseQCM |

Les apps correspondantes doivent exister dans `app/` avant de générer (créer avec `--create-app` ou `--create-app-full`).

## Quelles apps créer, et dans quel ordre

Créer **les 4 apps** dans cet ordre (à cause des clés étrangères) :

| Ordre | App | Dépend de |
|-------|-----|-----------|
| 1 | **admin** | — (User est la base) |
| 2 | **administration** | admin |
| 3 | **eleve** | admin, administration |
| 4 | **prof** | admin, administration |

**Commandes :**

```bash
python run_menu.py --create-app-full admin
python run_menu.py --create-app-full administration
python run_menu.py --create-app-full eleve
python run_menu.py --create-app-full prof
```

Ensuite, générer les modèles **par zone** dans le même ordre : d’abord `admin`, puis `administration`, puis `eleve`, puis `prof`.

> **Note :** Les dossiers `authentification`, `espace_admin`, `academic`, `library`, `courses`, `schedule`, `communication`, `forum`, `logs` correspondent à l’ancienne structure (9 apps). Tu peux les supprimer pour n’avoir que les 4 zones **admin**, **administration**, **eleve**, **prof**.

## Utilisation

1. Déposer un JSON dans la zone (ex. `espace_admin/annee_academique.json`).
2. **Menu** : `python run_menu.py` → option **4** (Générer à partir d’un modèle) ou **6** (Lister les modèles).
3. **CLI** :
   - Générer : `python run_menu.py --generate-from-zone espace_admin annee_academique`
   - Lister : `python run_menu.py --list-zones`
