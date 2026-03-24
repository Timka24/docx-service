#!/bin/sh

set -e

if [ -z "$1" ]; then
  echo "Usage: ./restore_db.sh /path/to/backup.dump"
  exit 1
fi

BACKUP_FILE="$1"
CONTAINER="docx-postgres"
DB="docxdb"
USER="docx"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "Backup file not found: $BACKUP_FILE"
  exit 1
fi

echo "Stopping app containers..."
docker-compose stop app worker pdf-worker

echo "Copying backup into container..."
docker cp "$BACKUP_FILE" "$CONTAINER:/tmp/restore.dump"

echo "Recreating database..."
docker exec -i "$CONTAINER" psql -U "$USER" -d postgres -c "DROP DATABASE IF EXISTS $DB;"
docker exec -i "$CONTAINER" psql -U "$USER" -d postgres -c "CREATE DATABASE $DB;"

echo "Restoring backup..."
docker exec -i "$CONTAINER" pg_restore -U "$USER" -d "$DB" /tmp/restore.dump

echo "Cleaning up..."
docker exec -i "$CONTAINER" rm -f /tmp/restore.dump

echo "Starting app containers..."
docker-compose start app worker pdf-worker

echo "Restore completed successfully."