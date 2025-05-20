# Application de Gestion de Ressources Relationnelles

Cette application est une API RESTful permettant la gestion de ressources, de catégories et d'utilisateurs avec un système d'authentification et de modération. Elle offre une plateforme complète pour le partage et la gestion de ressources entre utilisateurs, avec un système de modération et de catégorisation avancé.

## Table des matières
- [Vue d'ensemble](#vue-densemble)
- [Architecture](#architecture)
- [Installation](#installation)
- [Configuration](#configuration)
- [Structure du Projet](#structure-du-projet)
- [Routes de l'API](#routes-de-lapi)
  - [Authentification](#authentification)
  - [Utilisateurs](#utilisateurs)
  - [Ressources](#ressources)
  - [Catégories](#catégories)
  - [Commentaires](#commentaires)
  - [Favoris](#favoris)
- [Gestion des Erreurs](#gestion-des-erreurs)
- [Sécurité](#sécurité)
- [Base de Données](#base-de-données)
- [Exemples d'Utilisation](#exemples-dutilisation)
- [Bonnes Pratiques](#bonnes-pratiques)
- [Dépannage](#dépannage)
- [Contribution](#contribution)

## Vue d'ensemble

L'application Resource Relationnel est conçue pour faciliter le partage et la gestion de ressources entre utilisateurs. Elle offre les fonctionnalités suivantes :

- **Gestion des Utilisateurs** : Inscription, authentification, gestion de profil
- **Gestion des Ressources** : Création, modification, suppression et partage de ressources
- **Système de Modération** : Approbation des ressources par les modérateurs
- **Catégorisation** : Organisation des ressources par catégories et sous-catégories
- **Interaction Sociale** : Commentaires, réponses aux commentaires, favoris
- **Système de Rôles** : Différents niveaux d'accès (utilisateur, modérateur, administrateur)

## Architecture

L'application est construite avec une architecture moderne et évolutive :

- **Backend** : Flask (Python)
- **Base de données** : MongoDB
- **Authentification** : JWT (JSON Web Tokens)
- **API** : RESTful
- **Sécurité** : Validation des données, protection contre les injections, gestion des CORS

### Diagramme d'Architecture
```
[Client] <---> [API REST] <---> [Base de Données MongoDB]
   ^              ^
   |              |
   v              v
[Authentification] [Validation]
```

## Installation

### Prérequis
- Python 3.8 ou supérieur
- MongoDB 4.4 ou supérieur
- pip (gestionnaire de paquets Python)
- Git

### Étapes d'Installation

1. **Cloner le Repository**
   ```bash
   git clone https://github.com/votre-username/resource-relationnel.git
   cd resource-relationnel
   ```

2. **Créer un Environnement Virtuel**
   ```bash
   python -m venv venv
   # Sur Windows
   venv\Scripts\activate
   # Sur Unix ou MacOS
   source venv/bin/activate
   ```

3. **Installer les Dépendances**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configurer les Variables d'Environnement**
   Créer un fichier `.env` à la racine du projet :
   ```env
   SECRET_KEY=votre_clé_secrète_très_longue_et_complexe
   MONGODB_URI=mongodb://localhost:27017/resource_relationnel
   FLASK_ENV=development
   FLASK_APP=main.py
   ```

5. **Initialiser la Base de Données**
   ```bash
   python scripts/init_db.py
   ```

6. **Lancer l'Application**
   ```bash
   python main.py
   ```

## Configuration

### Variables d'Environnement

| Variable | Description | Valeur par défaut |
|----------|-------------|-------------------|
| `SECRET_KEY` | Clé secrète pour JWT | (requis) |
| `MONGODB_URI` | URI de connexion MongoDB | mongodb://localhost:27017/resource_relationnel |
| `FLASK_ENV` | Environnement Flask | development |
| `FLASK_APP` | Point d'entrée de l'application | main.py |
| `JWT_ACCESS_TOKEN_EXPIRES` | Durée de validité du token d'accès | 3600 (1 heure) |
| `JWT_REFRESH_TOKEN_EXPIRES` | Durée de validité du token de rafraîchissement | 604800 (7 jours) |

### Configuration de la Base de Données

La base de données MongoDB est structurée avec les collections suivantes :

- `users` : Informations des utilisateurs
- `resources` : Ressources publiées
- `resources_pending` : Ressources en attente d'approbation
- `categories` : Catégories de ressources
- `comments` : Commentaires sur les ressources
- `subcomments` : Réponses aux commentaires
- `favorites` : Ressources favorites des utilisateurs
- `tokens` : Tokens d'authentification
- `roles` : Rôles utilisateurs

## Structure du Projet

```
.
├── config/                 # Configuration
│   ├── __init__.py
│   ├── config.py          # Variables de configuration
│   └── database.py        # Configuration MongoDB
├── routes/                # Routes de l'API
│   ├── auth/             # Authentification
│   ├── users/            # Gestion utilisateurs
│   ├── resources/        # Gestion ressources
│   ├── categories/       # Gestion catégories
│   └── __init__.py
├── utils/                # Utilitaires
│   ├── auth.py          # Fonctions d'authentification
│   └── validators.py     # Validation des données
├── scripts/              # Scripts utilitaires
│   └── init_db.py       # Initialisation base de données
├── tests/               # Tests unitaires et d'intégration
├── main.py              # Point d'entrée
├── requirements.txt     # Dépendances
└── README.md           # Documentation
```

## Routes de l'API

### Authentification

#### POST /auth/register
- **Description** : Création d'un nouveau compte utilisateur
- **Données requises** :
  ```json
  {
    "nom": "string",
    "prenom": "string",
    "mail": "string",
    "password": "string",
    "username": "string",
    "genre": "string"
  }
  ```
- **Validation** :
  - Email unique
  - Mot de passe minimum 8 caractères
  - Username unique
- **Réponse** :
  ```json
  {
    "message": "Utilisateur créé avec succès",
    "user": {
      "id": "string",
      "username": "string",
      "mail": "string",
      "nom": "string",
      "prenom": "string"
    },
    "tokens": {
      "access_token": "string",
      "refresh_token": "string"
    }
  }
  ```
- **Codes d'erreur** :
  - 400 : Données invalides
  - 409 : Email ou username déjà utilisé
  - 500 : Erreur serveur

#### POST /auth/auth_from_password
- **Description** : Authentification avec email et mot de passe
- **Données requises** :
  ```json
  {
    "mail": "string",
    "password": "string"
  }
  ```
- **Validation** :
  - Email format valide
  - Mot de passe non vide
- **Réponse** :
  ```json
  {
    "user": {
      "id": "string",
      "username": "string",
      "mail": "string",
      "nom": "string",
      "prenom": "string"
    },
    "tokens": {
      "access_token": "string",
      "refresh_token": "string"
    }
  }
  ```
- **Codes d'erreur** :
  - 400 : Données invalides
  - 401 : Identifiants incorrects
  - 500 : Erreur serveur

#### POST /auth/refresh_token
- **Description** : Renouvellement du token d'accès
- **Données requises** :
  ```json
  {
    "refresh_token": "string"
  }
  ```
- **Réponse** : Nouveau token d'accès

#### POST /auth/logout
- **Description** : Déconnexion de l'utilisateur
- **Headers requis** : Token d'authentification
- **Réponse** : Message de confirmation

### Utilisateurs

#### GET /users/get_own_profile
- **Description** : Récupération du profil de l'utilisateur connecté
- **Headers requis** : Token d'authentification
- **Réponse** : Informations du profil utilisateur

#### PUT /users/update_profile
- **Description** : Mise à jour du profil utilisateur
- **Headers requis** : Token d'authentification
- **Données possibles** :
  ```json
  {
    "prenom": "string",
    "nom": "string",
    "username": "string",
    "email": "string",
    "genre": "string"
  }
  ```
- **Réponse** : Profil utilisateur mis à jour

### Ressources

#### GET /resources/
- **Description** : Liste toutes les ressources
- **Réponse** : Liste des ressources avec leurs détails

#### GET /resources/ressource=<id>
- **Description** : Récupère une ressource spécifique
- **Paramètres** : ID de la ressource
- **Réponse** : Détails de la ressource

#### POST /resources/create_resources
- **Description** : Création d'une nouvelle ressource
- **Headers requis** : Token d'authentification
- **Données requises** :
  ```json
  {
    "title": "string",
    "content": "string",
    "categorie": "string"
  }
  ```
- **Réponse** : Ressource créée

#### PUT /resources/update/<resource_id>
- **Description** : Mise à jour d'une ressource existante
- **Headers requis** : Token d'authentification
- **Données possibles** :
  ```json
  {
    "title": "string",
    "content": "string",
    "categories": "string"
  }
  ```
- **Réponse** : Ressource mise à jour

#### DELETE /resources/delete/<resource_id>
- **Description** : Suppression d'une ressource
- **Headers requis** : Token d'authentification
- **Permissions** : Propriétaire ou modérateur
- **Réponse** : Message de confirmation

#### GET /resources/pending
- **Description** : Liste les ressources en attente d'approbation
- **Headers requis** : Token d'authentification
- **Permissions** : Modérateur uniquement
- **Réponse** : Liste des ressources en attente

#### POST /resources/approve/<resource_id>
- **Description** : Approuve une ressource en attente
- **Headers requis** : Token d'authentification
- **Permissions** : Modérateur uniquement
- **Réponse** : Ressource approuvée

#### GET /resources/randomressource
- **Description** : Récupère une ressource aléatoire non consultée
- **Headers requis** : Token d'authentification
- **Réponse** : Ressource aléatoire

### Catégories

#### GET /categories/
- **Description** : Liste toutes les catégories
- **Réponse** : Liste des catégories avec leurs détails

#### POST /categories/create_category
- **Description** : Création d'une nouvelle catégorie
- **Headers requis** : Token d'authentification
- **Permissions** : Administrateur ou super-administrateur
- **Données requises** :
  ```json
  {
    "nom_categorie": "string",
    "description": "string",
    "parent_id": "string" // optionnel
  }
  ```
- **Réponse** : Catégorie créée

#### PUT /categories/update_category/<category_id>
- **Description** : Mise à jour d'une catégorie
- **Headers requis** : Token d'authentification
- **Permissions** : Administrateur ou super-administrateur
- **Données possibles** :
  ```json
  {
    "nom_categorie": "string",
    "description": "string",
    "parent_id": "string",
    "is_active": boolean
  }
  ```
- **Réponse** : Catégorie mise à jour

#### DELETE /categories/delete_category/<category_id>
- **Description** : Suppression d'une catégorie
- **Headers requis** : Token d'authentification
- **Permissions** : Administrateur ou super-administrateur
- **Réponse** : Message de confirmation

### Commentaires

#### POST /resources/comments/<resource_id>
- **Description** : Ajoute un commentaire à une ressource
- **Headers requis** : Token d'authentification
- **Données requises** :
  ```json
  {
    "content": "string"
  }
  ```
- **Réponse** : Commentaire créé

#### POST /resources/sous_comments/replies/<comment_id>
- **Description** : Ajoute une réponse à un commentaire
- **Headers requis** : Token d'authentification
- **Données requises** :
  ```json
  {
    "content": "string"
  }
  ```
- **Réponse** : Sous-commentaire créé

### Favoris

#### POST /resources/favorite/<resource_id>
- **Description** : Ajoute une ressource aux favoris
- **Headers requis** : Token d'authentification
- **Réponse** : Favori créé

## Gestion des Erreurs

### Format des Réponses d'Erreur

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Description détaillée de l'erreur",
    "details": {
      "field": "Nom du champ en erreur",
      "reason": "Raison spécifique de l'erreur"
    }
  }
}
```

### Codes d'Erreur Standards

| Code | Description | Exemple |
|------|-------------|---------|
| 400 | Requête invalide | Données manquantes ou mal formatées |
| 401 | Non authentifié | Token manquant ou expiré |
| 403 | Accès non autorisé | Permissions insuffisantes |
| 404 | Ressource non trouvée | ID invalide |
| 409 | Conflit | Email déjà utilisé |
| 422 | Données invalides | Validation échouée |
| 500 | Erreur serveur | Exception non gérée |

## Sécurité

### Authentification

- Utilisation de JWT (JSON Web Tokens)
- Tokens d'accès avec expiration courte (1 heure)
- Tokens de rafraîchissement avec expiration longue (7 jours)
- Stockage sécurisé des tokens dans des cookies HTTP-only
- Validation des tokens à chaque requête

### Protection des Données

- Validation des données d'entrée
- Protection contre les injections MongoDB
- Hachage des mots de passe avec bcrypt
- Protection CORS configurée
- Headers de sécurité (HSTS, CSP, etc.)

### Gestion des Permissions

- Système de rôles (utilisateur, modérateur, administrateur)
- Vérification des permissions à chaque requête
- Validation des propriétaires de ressources
- Journalisation des actions sensibles

## Base de Données

### Schéma des Collections

#### Users
```json
{
  "_id": "ObjectId",
  "username": "string",
  "mail": "string",
  "password": "string (hashé)",
  "nom": "string",
  "prenom": "string",
  "genre": "string",
  "role_id": "ObjectId",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

#### Resources
```json
{
  "_id": "ObjectId",
  "title": "string",
  "content": "string",
  "category_id": "ObjectId",
  "user_id": "ObjectId",
  "status": "string (pending/approved/rejected)",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

[Autres schémas...]

## Exemples d'Utilisation

### Création d'un Compte

```python
import requests

def create_account():
    url = "http://localhost:5000/auth/register"
    data = {
        "nom": "Dupont",
        "prenom": "Jean",
        "mail": "jean.dupont@example.com",
        "password": "MotDePasse123!",
        "username": "jdupont",
        "genre": "M"
    }
    response = requests.post(url, json=data)
    return response.json()
```

### Authentification

```python
def login():
    url = "http://localhost:5000/auth/auth_from_password"
    data = {
        "mail": "jean.dupont@example.com",
        "password": "MotDePasse123!"
    }
    response = requests.post(url, json=data)
    return response.json()
```

### Création d'une Ressource

```python
def create_resource(token):
    url = "http://localhost:5000/resources/create_resources"
    headers = {"Authorization": f"Bearer {token}"}
    data = {
        "title": "Ma Ressource",
        "content": "Contenu de la ressource",
        "categorie": "category_id"
    }
    response = requests.post(url, json=data, headers=headers)
    return response.json()
```

## Bonnes Pratiques

### Développement

1. **Code**
   - Suivre les conventions PEP 8
   - Documenter le code avec des docstrings
   - Écrire des tests unitaires
   - Utiliser des types hints

2. **Sécurité**
   - Ne jamais commiter de données sensibles
   - Valider toutes les entrées utilisateur
   - Utiliser des requêtes paramétrées
   - Mettre à jour régulièrement les dépendances

3. **Performance**
   - Indexer la base de données
   - Mettre en cache les requêtes fréquentes
   - Optimiser les requêtes MongoDB
   - Utiliser la pagination pour les listes

## Dépannage

### Problèmes Courants

1. **Erreur de Connexion à MongoDB**
   - Vérifier que MongoDB est en cours d'exécution
   - Vérifier l'URI de connexion
   - Vérifier les permissions

2. **Erreurs d'Authentification**
   - Vérifier la validité du token
   - Vérifier l'expiration
   - Vérifier le format du token

3. **Erreurs de Validation**
   - Vérifier le format des données
   - Vérifier les champs requis
   - Vérifier les contraintes

### Logs

Les logs sont disponibles dans :
- `logs/app.log` : Logs de l'application
- `logs/error.log` : Logs d'erreurs
- `logs/access.log` : Logs d'accès

## Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

### Standards de Code

- Suivre les conventions PEP 8
- Ajouter des tests pour les nouvelles fonctionnalités
- Mettre à jour la documentation
- Maintenir la couverture de tests > 80%

### Processus de Review

1. Vérification du code
2. Exécution des tests
3. Review de la documentation
4. Tests de performance
5. Validation de la sécurité 
