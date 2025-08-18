# Image de base Python légère
FROM python:3.12-slim

# Éviter la génération de .pyc et forcer le flush stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Répertoire de travail
WORKDIR /app

# Copier le fichier des dépendances (nom demandé : requirement.txt)
COPY requirement.txt /app/requirement.txt

# Installer pip à jour et installer les dépendances sans cache
RUN pip install --upgrade pip \
    && pip install --no-cache-dir -r /app/requirement.txt

# Copier tout le code backend dans l'image
COPY . /app

# Exposer le port interne Flask (5000 par défaut)
EXPOSE 5000

# Lancer l'application (dev/prod simple). Si tu utilises gunicorn, remplace la ligne ci-dessous par gunicorn.
CMD ["python", "main.py"]
