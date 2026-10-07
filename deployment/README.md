# Déploiement ESI-Online sur un VPS unique

Un seul serveur nginx qui sert la SPA React (build Vite), les fichiers
statiques et les médias, et qui passe le reste à Django sous gunicorn, avec
PostgreSQL en base.

```
nginx ──┬── /            → frontend/dist                    (SPA, fallback index.html)
        ├── /media/      → /srv/esi-online/media/           (disque direct)
        ├── /static/     → backend/esi_online/staticfiles/  (disque direct)
        ├── /api/        → gunicorn (127.0.0.1:8000) → PostgreSQL
        └── /django-admin/ → gunicorn (site Django)
```

Les documents déposés ne repassent pas par Django. Un cours de 80 Mo serait
sinon envoyé en mémoire à travers la socket, puis réécrit : le double du
trafic, et le timeout de 300 s qui finit par couper le dépôt.

La SPA occupe les routes `/admin`, `/home`, … Le site Django a donc été
déplacé sous `/django-admin/` et n'est plus accessible sur `/admin/`.

## Arborescence attendue sur le serveur

```
/srv/esi-online/
├── backend/                 # dépôt, .venv, .env
├── frontend/                # dépôt, node_modules, dist/ (build Vite)
├── deployment/              # ce dossier
└── media/                   # documents déposés, hors du dépôt git
```

`media/` est volontairement hors du dépôt : un `git pull` ou un redéploiement
ne doit jamais pouvoir remplacer les fichiers téléversés.

## Mise en place

```bash
# 1. Utilisateur système, sans shell
sudo adduser --system --group --home /srv/esi-online esi

# 2. Code et dépendances (backend)
sudo -u esi git clone <url> /srv/esi-online
cd /srv/esi-online/backend
sudo -u esi python3.14 -m venv .venv
sudo -u esi .venv/bin/pip install -r requirements.txt

# 3. Code et dépendances (frontend)
cd /srv/esi-online/frontend
sudo -u esi npm ci
# VITE_API_URL reste vide (même origine : nginx sert front et API sur un seul
# domaine). Ne pas créer de .env.local avec une autre valeur.
sudo -u esi npm run build

# 4. Supports des fichiers déposés
sudo -u esi mkdir -p /srv/esi-online/media
sudo chown -R esi:esi /srv/esi-online

# 5. Base
sudo -u postgres createuser --pwprompt esi
sudo -u postgres createdb --owner=esi esi_online
```

## Variables d'environnement

`backend/.env`, en chmod 600, propriétaire `esi`. Le modèle est versionné :
`backend/.env.example` liste toutes les variables avec leur défaut et ce qu'il
faut changer en production.

```bash
sudo -u esi cp backend/.env.example backend/.env
sudo -u esi chmod 600 backend/.env
sudo -u esi nano backend/.env
```

```ini
DEBUG=false
SECRET_KEY=<généré par : python -c "import secrets;print(secrets.token_urlsafe(64))">
ALLOWED_HOSTS=esi.example.dz
# Mot de passe du superutilisateur « admin » créé à la première migration.
# Sans cette variable, la migration tombe sur une valeur par défaut connue
# (à changer immédiatement). Voir DB_ENGINE ci-dessous.
ADMIN_INITIAL_PASSWORD=<mot de passe fort>

# DB_ENGINE=postgresql active PostgreSQL (lu par settings.py) ; en
# développement on laisse la valeur par défaut « sqlite ».
DB_ENGINE=postgresql
DB_NAME=esi_online
DB_USER=esi
DB_PASSWORD=<mot de passe>
DB_HOST=/var/run/postgresql
DB_PORT=5432

MEDIA_ROOT=/srv/esi-online/media
```

Avec `DEBUG=false`, le démarrage échoue si `SECRET_KEY` est encore la valeur par
défaut ou si `ALLOWED_HOSTS` ne contient que `localhost`. C'est volontaire :
une instance qui démarre avec une clé connue permet de forger un jeton JWT.

`CORS_ALLOW_ALL_ORIGINS` vaut `DEBUG` par défaut, donc il passe à `false` seul.
La SPA étant servie par le même nginx que l'API (même origine), aucune origine
CORS n'est à renseigner. Ne l'ouvrez que si le front et l'API vivaient sur des
domaines différents (cas non prévu par ce runbook).

## Migration et build

Le `migrate` crée le superutilisateur `admin` (mot de passe `ADMIN_INITIAL_PASSWORD`
du `.env`). `collectstatic` ne sert plus que le site Django `/django-admin/` — la
SPA est servie directement depuis `frontend/dist` par nginx.
du `.env`). `collectstatic` ne sert plus que le site Django `/django-admin/` — la
SPA est servie directement depuis `frontend/dist` par nginx.

```bash
cd /srv/esi-online/backend
sudo -u esi .venv/bin/python esi_online/manage.py migrate --noinput
sudo -u esi .venv/bin/python esi_online/manage.py collectstatic --noinput
```

Le build du front se lance au déploiement (étape 3 plus haut) :
`VITE_API_URL` doit rester vide pour que la SPA appelle l'API en même origine.

## Service et proxy

Le nom de domaine apparaît à deux endroits : `ALLOWED_HOSTS` (Django) et
`server_name` (`deployment/nginx/esi_online.conf`, placeholder `_`). Les deux
doivent pointer vers le même domaine, remplacé partout avant la mise en ligne.

```bash
sudo cp deployment/systemd/esi-online.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now esi-online

sudo cp deployment/nginx/esi_online.conf /etc/nginx/sites-available/esi_online
sudo ln -s /etc/nginx/sites-available/esi_online /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Sauvegardes

```bash
sudo install -m 750 deployment/backup.sh /srv/esi-online/deployment/backup.sh
sudo crontab -u esi -e
```

```cron
17 3 * * * /srv/esi-online/deployment/backup.sh >> /srv/esi-online/backup.log 2>&1
```

Le script prend la base **et** les médias. Les deux sont nécessaires : la base
seule donne des lignes qui pointent vers des octets absents, les fichiers
seuls donnent des documents orphelins. Il garde 14 jours par défaut
(`BACKUP_RETENTION_JOURS`).

### Copie hors machine

Une sauvegarde restée sur le même disque ne survit ni à la panne du disque ni à
la suppression accidentelle. Un `rsync` vers une machine distante ou un stockage
objet suffit :

```bash
rsync -a --delete /srv/backups/esi-online/ backup@vps-de-secours:/srv/backups/esi-online/
```

ou, en dépôt vers un stockage objet :

```bash
rclone sync /srv/backups/esi-online/ distant:esi-online-sauvegardes
```

## HTTPS

Décommentez le `return 301 https://...` du bloc `server`, puis :

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d esi.example.dz
```

### Les quatre réglages qui vont avec

`manage.py check --deploy` signale encore `SECURE_HSTS_SECONDS`,
`SECURE_SSL_REDIRECT`, `SESSION_COOKIE_SECURE` et `CSRF_COOKIE_SECURE`. Ce ne
sont pas des oublis : Django ne les active pas tout seul parce que les activer
avant que le certificat existe casse le site, et parce que HSTS est
irréversible — un navigateur qui l'a mémorisé refuse le HTTP ensuite, même si
le certificat saute.

Une fois `certbot` installé et la redirection active, ajoutez au `.env` :

```ini
SECURE_SSL_REDIRECT=true
SESSION_COOKIE_SECURE=true
CSRF_COOKIE_SECURE=true
SECURE_HSTS_SECONDS=31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS=true
SECURE_HSTS_PRELOAD=true
```

Les trois premiers ne demandent aucune ligne de code. Les trois derniers
demandent de les lire dans `settings.py` (`env.bool` / `env.int`), car
`check --deploy` les cherche par nom.

Vérifiez ensuite :

```bash
sudo -u esi .venv/bin/python esi_online/manage.py check --deploy
```

## Après le déploiement

```bash
sudo systemctl status esi-online
sudo journalctl -u esi-online -f
curl -I https://esi.example.dz/api/auth/me/   # 401 attendu : token requis
curl -s https://esi.example.dz/ | grep -q "<div id=\"root\">" && echo "SPA ok"
# Le site Django (maintenance) reste accessible sur /django-admin/
curl -I https://esi.example.dz/django-admin/login/ # 200 attendu
```

Un dépôt d'un document doit créer un fichier sous
`/srv/esi-online/media/uploads/admin/`, et non sous le dépôt git.

## Repli : le média servi par Django

Si nginx sert `/media/` sans problème, rien à faire. En cas de souci de
permissions sur le disque, la solution de repli est la ligne suivante dans
`urls.py`, qui délègue à Django — plus lent, et c'est notamment pour cela que
la configuration nginx existe :

```python
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```