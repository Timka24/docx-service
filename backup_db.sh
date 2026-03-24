#!/bin/sh

set -e

BACKUP_DIR="$(pwd)/backups"
DATE=$(date +%Y-%m-%d_%H-%M-%S)

CONTAINER="docx-postgres"
DB="docxdb"
USER="docx"

mkdir -p "$BACKUP_DIR"

echo "Start backup: $DATE"

docker exec "$CONTAINER" pg_dump -U "$USER" -d "$DB" -F c -f "/tmp/backup.dump"
docker cp "$CONTAINER:/tmp/backup.dump" "$BACKUP_DIR/backup_$DATE.dump"
docker exec "$CONTAINER" rm -f "/tmp/backup.dump"

# чистим старые (старше 14 дней)
find "$BACKUP_DIR" -type f -name "*.dump" -mtime +14 -delete

echo "Backup done: backup_$DATE.dump"