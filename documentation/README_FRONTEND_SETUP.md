Guide d'installation Backend pour un développeur Frontend
=====================================================

Ce guide court explique comment configurer localement la base de données, lancer le serveur Django et accéder à la documentation Swagger/OpenAPI. Destiné à un développeur Frontend sans expérience Django.

**Prérequis**
- **Python** : 3.10+ installé (vérifier avec `python --version`).
- **PostgreSQL** : installé et fonctionnel localement (ou accès à une instance distante).
- **Git** : dépôt cloné et code disponible localement.

**Fichiers de référence**
- **Configuration Django** : [backend/esi_online/esi_online/settings.py](backend/esi_online/esi_online/settings.py#L98)
- **Routes de la doc OpenAPI/Swagger** : [backend/esi_online/esi_online/urls.py](backend/esi_online/esi_online/urls.py#L26-L28)
- **Dépendances Python** : [backend/requirements.txt](backend/requirements.txt)

1) Créer et activer l'environnement virtuel a la racine du projet

PowerShell (Windows) :
```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

Bash (Linux / WSL / macOS) :
```bash
python -m venv .venv
source .venv/bin/activate
```

2) Installer les dépendances (Il faut etre dans C:\Users\HP\Documents\Esi_online\backend\)

```bash
pip install --upgrade pip
pip install -r backend/requirements.txt
```

3) Préparer la base de données PostgreSQL

Option A — créer localement (exemples `psql`) :
```bash
# en tant qu'utilisateur postgres
psql -U postgres -c "CREATE DATABASE esi_online;"
psql -U postgres -c "CREATE USER esi_user WITH PASSWORD 'change_me';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE esi_online TO esi_user;"
```

Option B — utiliser une base distante : demande les accès (host, port, user, password, dbname).

4) Créer le fichier `.env` dans C:\Users\HP\Documents\Esi_online\backend\esi_online

Le projet charge les variables via `django-environ`. Créer un fichier `.env` à la racine de la configuration Django (dossier `backend/esi_online/esi_online` ou `backend/esi_online/` selon votre setup). Exemple minimal :

```
SECRET_KEY=forgot
DEBUG=True
DB_NAME=esi_online
DB_USER=esi_user
DB_PASSWORD=forgot
DB_HOST=localhost
DB_PORT=5432
# CORS (optionnel)
CORS_ALLOW_ALL_ORIGINS=True
FRONTEND_URL=http://localhost:3000
```

Remarque : la clé `DATABASES` est dans [backend/esi_online/esi_online/settings.py](backend/esi_online/esi_online/settings.py#L98). Vérifier que `ENGINE` est `django.db.backends.postgresql`.

5) Appliquer les migrations et créer un superuser

Se placer dans le dossier contenant `manage.py` (chemin : `backend/esi_online/`) puis :

```bash
cd backend/esi_online
python manage.py migrate
python manage.py createsuperuser
```

6) Lancer le serveur de développement

```bash
python manage.py runserver 0.0.0.0:8000
```

Accès local typique : `http://localhost:8000/`.

7) Accéder à la documentation Swagger / OpenAPI

- Swagger UI (interface interactive) : `http://localhost:8000/api/docs/`
- Schéma OpenAPI (JSON/YAML) : `http://localhost:8000/api/schema/`
- ReDoc : `http://localhost:8000/api/redoc/`

Ces routes sont définies dans [backend/esi_online/esi_online/urls.py](backend/esi_online/esi_online/urls.py#L26-L28).

8) Trouver les endpoints d'authentification (connexion)

- Le projet expose les apps sous le préfixe `/api/` — regardez la section `api/auth/` dans Swagger (`/api/docs/`) pour retrouver le(s) endpoint(s) d'auth (login, refresh token, etc.).
- Si vous avez besoin d'un point direct, ouvrez Swagger et cherchez `auth` ou `token`.

9) Tests rapides depuis le terminal (exemples)

Récupérer la liste des endpoints via curl (Swagger JSON) :
```bash
curl http://localhost:8000/api/schema/ -s | jq .paths | less
```

Obtenir un token (exemple hypothétique — vérifier le chemin dans Swagger) :
```bash
curl -X POST http://localhost:8000/api/auth/token/ -d "username=you&password=pass"
```

10) Résolution des erreurs fréquentes
- Erreur de connexion DB : vérifier `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` et que PostgreSQL accepte les connexions (écoute locale, pg_hba.conf).
- Module manquant à l'import : assurez-vous d'avoir installé `backend/requirements.txt` dans le bon environnement.
- Problème d'encodage `.env` : `settings.py` tente `utf-8` puis `cp1252` sur Windows.

Besoin d'aide ?
- Je peux ajouter ce guide au dépôt (par exemple `backend/README_FRONTEND_SETUP.md`) — veux-tu que je l'enregistre ?
