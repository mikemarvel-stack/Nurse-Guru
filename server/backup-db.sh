#!/bin/bash

# Database backup script for Nurse Guru
# Usage: ./backup-db.sh

set -e

BACKUP_DIR="./backups"
DB_PATH="./prisma/dev.db"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/backup_${TIMESTAMP}.db"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Check if database exists
if [ ! -f "$DB_PATH" ]; then
    echo "Error: Database file not found at $DB_PATH"
    exit 1
fi

# Create backup
echo "Creating backup..."
sqlite3 "$DB_PATH" ".backup '$BACKUP_FILE'"

# Compress backup
echo "Compressing backup..."
gzip "$BACKUP_FILE"

echo "Backup created: ${BACKUP_FILE}.gz"

# Keep only last 7 backups
echo "Cleaning old backups..."
ls -t "${BACKUP_DIR}"/backup_*.db.gz | tail -n +8 | xargs -r rm

echo "Backup complete!"
