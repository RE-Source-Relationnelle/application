# Backend de l'Application Resource Relationnel

Ce projet est le backend d'une application Flask qui gère les ressources et l'authentification des utilisateurs.

## Structure du Projet

```
.
├── config/           # Configuration de l'application
│   ├── config.py     # Variables de configuration
│   └── database.py   # Configuration de la base de données
├── routes/           # Routes de l'application
│   ├── auth/         # Routes d'authentification
│   └── resources/    # Routes des ressources
├── main.py           # Point d'entrée de l'application
└── requirements.txt  # Dépendances du projet
```

## Prérequis

- Python 3.x
- MongoDB
- pip (gestionnaire de paquets Python)

## Installation

1. Clonez le dépôt
2. Créez un environnement virtuel Python :
   ```bash
   python -m venv venv
   source venv/bin/activate  # Sur Windows : venv\Scripts\activate
   ```
3. Installez les dépendances :
   ```bash
   pip install -r requirements.txt
   ```
4. Configurez les variables d'environnement dans un fichier `.env` à la racine du projet

## Configuration

Créez un fichier `.env` à la racine du projet avec les variables suivantes :
```
MONGODB_URI=votre_uri_mongodb
JWT_SECRET_KEY=votre_clé_secrète
```

## Lancement de l'Application

Pour démarrer l'application en mode développement :
```bash
python main.py
```

L'application sera accessible sur `http://localhost:5000`

## API Endpoints

### Authentification
- `/auth/login` - Connexion
- `/auth/register` - Inscription

### Ressources
- `/api/resources` - Gestion des ressources

## Technologies Utilisées

- Flask - Framework web Python
- Flask-CORS - Gestion des CORS
- PyMongo - Client MongoDB
- PyJWT - Gestion des tokens JWT
- bcrypt - Hachage des mots de passe
- python-dotenv - Gestion des variables d'environnement

## Sécurité

- Authentification JWT
- Hachage des mots de passe avec bcrypt
- Protection CORS
- Variables d'environnement pour les données sensibles 