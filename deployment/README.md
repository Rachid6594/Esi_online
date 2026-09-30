# Déploiement ESI-Online sur un VPS unique

Un seul serveur nginx qui sert les fichiers statiques et les médias, et qui
passe le reste à Django sous gunicorn, avec PostgreSQL en base.

```
nginx ──┬── /media/     → /srv/esi-online/media/        (disque direct)
        ├── /static/    → backend/esi_online/staticfiles/ (disque direct)
        └── tout le reste → gunicorn (127.0.0.1:8000) → PostgreSQL
```

Les documents déposés ne repassent pas par Django. Un cours de 80 Mo serait
sinon envoyé en mémoire à travers la socket, puis réécrit : le double du
trafic, et le timeout de 300 s qui finit par couper le dépôt.

## Arborescence attendue sur le serveur

```
/srv/esi-online/
├── backend/                 # dépôt, .venv, .env
├── frontend/
├── deployment/              # ce dossier
└── media/                   # documents déposés, hors du dépôt git
```

`media/` est volontairement hors du dépôt : un `git pull` ou un redéploiement
ne doit jamais pouvoir remplacer les fichiers téléversés.

## Mise en place

```bash
# 1. Utilisateur système, sans shell
sudo adduser --system --group --home /srv/esi-online esi

# 2. Code et dépendances
sudo -u esi git clone <url> /srv/esi-online
cd /srv/esi-online/backend
sudo -u esi python3.14 -m venv .venv
sudo -u esi .venv/bin/pip install -r requirements.txt

# 3. Supports des fichiers déposés
sudo -u esi mkdir -p /srv/esi-online/media
sudo chown -R esi:esi /srv/esi-online

# 4. Base
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
En production, renseignez alors `CORS_ALLOWED_ORIGINS` avec l'origine du front
si elle diffère du domaine de l'API.

## Migration et collecte

```bash
cd /srv/esi-online/backend
sudo -u esi .venv/bin/python esi_online/manage.py migrate --noinput
sudo -u esi .venv/bin/python esi_online/manage.py collectstatic --noinput
```

## Service et proxy

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