# -*- coding: utf-8 -*-
# Script global pour générer l'infra Docker (backend Flask + frontend React)
# Ajout de gestion automatique pour "requirements.txt" ou "requirement.txt"

import os
import subprocess
import sys
import json

def main():
    # URL du repo à cloner
    repo_url = "https://github.com/RE-Source-Relationnelle/application.git"
    repo_dir = "application"

    # Clone du repo si inexistant
    if not os.path.isdir(repo_dir):
        print(f"[INFO] Clonage du dépôt {repo_url} ...")
        subprocess.run(["git", "clone", repo_url, repo_dir], check=True)
    else:
        print(f"[INFO] Le dossier '{repo_dir}' existe déjà, on continue...")

    # Dossiers importants
    backend_dir = os.path.join(repo_dir, "Back-End")
    frontend_dir = os.path.join(repo_dir, "frontend")
    compose_path = os.path.join(repo_dir, "docker-compose.yml")

    # Vérif existence
    if not os.path.isdir(backend_dir):
        print(f"[ERREUR] Backend introuvable : {backend_dir}")
        sys.exit(1)
    if not os.path.isdir(frontend_dir):
        print(f"[ERREUR] Frontend introuvable : {frontend_dir}")
        sys.exit(1)

    # ---- Détection requirements.txt ----
    req_file = None
    for candidate in ["requirements.txt", "requirement.txt"]:
        if os.path.isfile(os.path.join(backend_dir, candidate)):
            req_file = candidate
            break
    if not req_file:
        print("[ERREUR] Aucun fichier requirements* trouvé dans Back-End/")
        sys.exit(1)
    print(f"[INFO] Fichier de dépendances détecté : {req_file}")

    # ---- Dockerfile backend (Flask) ----
    backend_dockerfile = f"""FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Copier le fichier des dépendances
COPY {req_file} /app/{req_file}

# Installer les dépendances
RUN pip install --upgrade pip && pip install --no-cache-dir -r /app/{req_file}

# Copier le reste du code backend
COPY . /app

EXPOSE 5000

CMD ["python", "main.py"]
"""
    with open(os.path.join(backend_dir, "Dockerfile"), "w", encoding="utf-8") as f:
        f.write(backend_dockerfile)
    print("[OK] Dockerfile backend généré.")

    # ---- Détection build frontend (CRA ou Vite) ----
    frontend_build_dir = "build"  # défaut
    package_json = os.path.join(frontend_dir, "package.json")
    if os.path.isfile(package_json):
        try:
            with open(package_json, "r", encoding="utf-8") as f:
                pkg = json.load(f)
            if "vite" in json.dumps(pkg).lower():
                frontend_build_dir = "dist"
                print("[INFO] Vite détecté → build = dist/")
            else:
                print("[INFO] CRA détecté → build = build/")
        except Exception as e:
            print(f"[WARN] Impossible de lire package.json ({e}) → build=build/")
    else:
        print("[WARN] Pas de package.json frontend → build=build/")

    # ---- Dockerfile frontend (React → Nginx) ----
    frontend_dockerfile = f"""FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
RUN rm -f /etc/nginx/conf.d/default.conf
COPY <<'NGINX' /etc/nginx/conf.d/app.conf
server {{
  listen 80;
  server_name _;
  root /usr/share/nginx/html;

  location / {{
    try_files $uri /index.html;
  }}
}}
NGINX

COPY --from=build /app/{frontend_build_dir} /usr/share/nginx/html
EXPOSE 80
"""
    with open(os.path.join(frontend_dir, "Dockerfile"), "w", encoding="utf-8") as f:
        f.write(frontend_dockerfile)
    print("[OK] Dockerfile frontend généré.")

    # ---- docker-compose.yml ----
    compose_content = """version: "3.9"

services:
  backend:
    build:
      context: ./Back-End
      dockerfile: Dockerfile
    image: app-back:latest
    container_name: app-back
    ports:
      - "8000:5000"
    environment:
      - FLASK_ENV=production
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    image: app-front:latest
    container_name: app-front
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped
"""
    with open(compose_path, "w", encoding="utf-8") as f:
        f.write(compose_content)
    print("[OK] docker-compose.yml généré.")

    print("\n🎉 Setup Docker complet prêt !")
    print("👉 Étapes suivantes :")
    print(f"  1) cd {repo_dir}")
    print("  2) docker compose build")
    print("  3) docker compose up -d")
    print("  4) Frontend dispo sur http://localhost")
    print("  5) Backend dispo sur http://localhost:8000")

if __name__ == "__main__":
    main()
