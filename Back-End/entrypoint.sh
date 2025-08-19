#!/usr/bin/env bash
set -euo pipefail

DOMAIN="guillaume-lechevallier.freeboxos.fr"
SRC="/etc/letsencrypt/live/${DOMAIN}"
DST="/app/certs"

# Vérif présence des liens dans live/
if [ ! -L "${SRC}/fullchain.pem" ] || [ ! -L "${SRC}/privkey.pem" ]; then
  echo "❌ Certs absents dans ${SRC} (génère-les avec certbot)."
  ls -l "${SRC}" || true
  exit 1
fi

# Copie en déréférençant les symlinks (les 'archive' sont root-only)
mkdir -p "${DST}"
cp -L "${SRC}/fullchain.pem" "${DST}/fullchain.pem"
cp -L "${SRC}/privkey.pem"   "${DST}/privkey.pem"

# Rendre lisible par l'user applicatif
chown appuser:appuser "${DST}/fullchain.pem" "${DST}/privkey.pem"
chmod 640            "${DST}/fullchain.pem" "${DST}/privkey.pem"

# Démarrer gunicorn en HTTPS avec ces copies
exec gosu appuser \
  gunicorn --bind 0.0.0.0:5001 \
           --certfile "${DST}/fullchain.pem" \
           --keyfile  "${DST}/privkey.pem" \
           --workers 2 --threads 2 --timeout 60 main:app
