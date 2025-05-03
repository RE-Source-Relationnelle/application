# RE-Source-Relationnelle - Frontend

Ce projet est la partie frontend de l'application RE-Source-Relationnelle, un réseau social axé sur la création de liens sociaux autour de thèmes comme la famille et la santé.

## Stack Technique

- **React 18** avec **TypeScript**
- **Vite** comme bundler
- **Tailwind CSS** pour le styling
- **React Router** pour la navigation
- **Zustand** pour la gestion d'état
- **Axios** pour les requêtes HTTP
- **Heroicons** pour les icônes

## Structure du Projet

```
src/
├── components/         # Composants réutilisables
│   ├── features/       # Composants liés à des fonctionnalités spécifiques
│   └── layout/         # Composants de mise en page (Navbar, Sidebar, etc.)
├── store/              # Stores Zustand pour la gestion d'état
├── types/              # Définitions de types TypeScript
├── views/              # Composants de page
│   ├── admin/          # Pages d'administration
│   ├── auth/           # Pages d'authentification
│   └── user/           # Pages liées à l'utilisateur
└── App.tsx             # Point d'entrée de l'application
```

## Installation

```bash
# Installer les dépendances
npm install ou pnpm install

# Lancer le serveur de développement
npm run dev ou pnpm run dev

# Construire pour la production
npm run build ou pnpm run build
```

## Fonctionnalités

- **Authentification** : Inscription, connexion, récupération de mot de passe
- **Flux Social** : Affichage des posts avec possibilité de filtrer par catégorie
- **Profil Utilisateur** : Gestion des informations personnelles
- **Administration** : Tableau de bord pour les administrateurs avec statistiques, gestion des utilisateurs, des posts et des catégories

## Configuration de l'API

L'application se connecte par défaut à l'API backend à l'adresse `http://localhost:8000`. Cette configuration peut être modifiée dans le fichier `src/store/authStore.ts`.

## Rôles Utilisateurs

- **Utilisateur** : Accès aux fonctionnalités de base du réseau social
- **Modérateur** : Capacités de modération des contenus
- **Admin** : Accès au tableau de bord d'administration avec statistiques, gestion des utilisateurs, des posts et des catégories
- **Super Admin** : Toutes les fonctionnalités admin + gestion des administrateurs
