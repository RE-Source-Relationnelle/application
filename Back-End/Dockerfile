FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Copier le fichier des dépendances
COPY requirements.txt /app/requirements.txt

# Installer les dépendances
RUN pip install --upgrade pip && pip install --no-cache-dir -r /app/requirements.txt

# Copier le reste du code backend
COPY . /app

EXPOSE 5001

CMD ["python", "main.py"]
