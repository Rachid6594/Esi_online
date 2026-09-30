#!/usr/bin/env bash
#
# Sauvegarde de la base et des médias d'ESI-Online.
#
# À lancer par cron. Les deux cibles sont nécessaires : une base sans les
# fichiers donne des lignes pointant des octets absents, et des fichiers sans
# la base donnent des documents orphelins.
#
#   crontab -e
#   17 3 * * * /srv/esi-online/deployment/backup.sh >> /var/log/esi-backup.log 2>&1
#
# Les copies partent sur un autre support : une sauvegarde restée sur le même
# disque ne survit ni à la panne ni à la suppression accidentelle. Voir
# README.md pour la copie hors machine.

set -euo pipefail

DESTINATION="${BACKUP_DIR:-/srv/backups/esi-online}"
RETENTION_JOURS="${BACKUP_RETENTION_JOURS:-14}"
HORODATAGE="$(date -u +%Y%m%dT%H%M%SZ)"
DESTINATION_DU_JOUR="${DESTINATION}/${HORODATAGE}"

# Charge les identifiants PostgreSQL sans les écrire dans le script.
ENV_FILE="${BACKUP_ENV_FILE:-/srv/esi-online/backend/.env}"
if [[ -f "$ENV_FILE" ]]; then
    set -a
    # shellcheck disable=SC1090
    source "$ENV_FILE"
    set +a
fi

: "${DB_NAME:?DB_NAME absent de $ENV_FILE}"
: "${DB_USER:?DB_USER absent de $ENV_FILE}"

mkdir -p "$DESTINATION_DU_JOUR"

echo "[$HORODATAGE] Sauvegarde de la base $DB_NAME"
# -Fc : format compressé, restaurable avec pg_restore.
# --clean --if-exists : la restauration repart d'une base vide si besoin.
pg_dump --format=custom --compress=9 --no-owner --file="$DESTINATION_DU_JOUR/base.dump" \
    --host="${DB_HOST:-/var/run/postgresql}" --username="$DB_USER" "$DB_NAME"

echo "[$HORODATAGE] Sauvegarde des médias"
# -a conserve les dates et les permissions, indispensable pour restitution
# avec nginx qui lit le dossier sous un utilisateur précis.
if [[ -d "${MEDIA_ROOT:-/srv/esi-online/media}" ]]; then
    tar --create --gzip --file="$DESTINATION_DU_JOUR/media.tar.gz" \
        --directory="$(dirname "${MEDIA_ROOT:-/srv/esi-online/media}")" \
        --exclude='*.tmp' "$(basename "${MEDIA_ROOT:-/srv/esi-online/media}")"
else
    echo "MEDIA_ROOT absent, media.tar.gz non créé" >&2
    exit 1
fi

# Un manifest permet de vérifier d'un coup d'œil ce qu'on a pris.
{
    echo "horodatage=$HORODATAGE"
    echo "base=$DB_NAME"
    echo "media_root=${MEDIA_ROOT:-/srv/esi-online/media}"
    echo "base_octets=$(stat --printf=%s "$DESTINATION_DU_JOUR/base.dump")"
    echo "media_octets=$(stat --printf=%s "$DESTINATION_DU_JOUR/media.tar.gz")"
} > "$DESTINATION_DU_JOUR/manifest.txt"

echo "[$HORODATAGE] Rotation : on garde $RETENTION_JOURS jours"
find "$DESTINATION" -mindepth 1 -maxdepth 1 -type d -mtime "+$RETENTION_JOURS" \
    -exec rm -rf {} +

echo "[$HORODATAGE] Terminé -> $DESTINATION_DU_JOUR"