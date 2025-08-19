#!/usr/bin/env bash
set -euo pipefail

DOMAIN="guillaume-lechevallier.freeboxos.fr"
EMAIL="admin@example.com"   # remplace par ton mail

echo "[1/3] Démarrage nginx + apps (HTTP uniquement pour l’instant)..."
docker compose up -d nginx frontend backend

echo "[2/3] Obtention des certificats Let's Encrypt pour $DOMAIN ..."
docker compose run --rm certbot certonly --webroot \
  --webroot-path=/var/www/certbot \
  -d "$DOMAIN" \
  --agree-tos --email "$EMAIL" --non-interactive

echo "[3/3] Reload nginx avec les certificats..."
docker compose exec nginx nginx -s reload

echo "✔ HTTPS OK sur https://$DOMAIN"
