# Application de Gestion de Ressources Relationnelles

Cette application est une API RESTful permettant la gestion de ressources, de catégories et d'utilisateurs avec un système d'authentification et de modération.
 
## Table des matières
- [Installation](#installation)
- [Configuration](#configuration)
- [Routes de l'API](#routes-de-lapi)
  - [Authentification](#authentification)
  - [Utilisateurs](#utilisateurs)
  - [Ressources](#ressources)
  - [Catégories](#catégories)
  - [Commentaires](#commentaires)
  - [Favoris](#favoris)

## Installation

1. Cloner le repository
2. Installer les dépendances :
```bash
pip install -r requirements.txt
```
3. Configurer les variables d'environnement (voir section Configuration)
4. Lancer l'application :
```bash
python main.py
```

## Configuration

L'application nécessite les variables d'environnement suivantes :
- `SECRET_KEY` : Clé secrète pour le chiffrement des tokens JWT
- `MONGODB_URI` : URI de connexion à la base de données MongoDB

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
- **Réponse** : Informations utilisateur et tokens d'authentification

#### POST /auth/auth_from_password
- **Description** : Authentification avec email et mot de passe
- **Données requises** :
  ```json
  {
    "mail": "string",
    "password": "string"
  }
  ```
- **Réponse** : Tokens d'authentification et informations utilisateur

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

## Gestion des erreurs

L'API utilise des codes HTTP standard pour indiquer le succès ou l'échec des requêtes :
- 200 : Succès
- 201 : Création réussie
- 400 : Requête invalide
- 401 : Non authentifié
- 403 : Accès non autorisé
- 404 : Ressource non trouvée
- 500 : Erreur serveur

Les réponses d'erreur suivent le format :
```json
{
  "error": "Description de l'erreur"
}
```

## Sécurité

- Authentification via JWT (JSON Web Tokens)
- Tokens d'accès avec expiration (1 heure)
- Tokens de rafraîchissement avec expiration (7 jours)
- Validation des données d'entrée
- Gestion des permissions basée sur les rôles
- Protection contre les injections MongoDB 
