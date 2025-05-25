import { ReactNode } from 'react';

export interface ProtectedRouteProps {
    children: ReactNode;
}

export interface User {
    id: string;
    email: string;
    mail?: string;
    nom?: string;
    prenom?: string;
    username?: string;
    genre?: string;
    role?: {
        role_id: string | null;
        nom_role: string;
    };
    created_at?: string;
}

export interface RegisterFormData {
    nom: string;
    prenom: string;
    mail: string;
    password: string;
    username: string;
    genre?: string;
}

export interface Resource {
    _id: string;
    titre: string;
    contenu: string;
    id_publieur: string;
    id_categorie?: string;
    createdAt: string;
    approved?: boolean;
    id_validateur?: string;
    date_validation?: string | null;
    commentaire_validation?: string | null;
}

export interface Category {
    _id: string;
    nom: string;
    description?: string;
    resourceCount?: number;
}

export interface Comment {
    _id: string;
    // Format GET
    id_user?: string;
    id_ressource?: string;
    contenu?: string;
    format?: string;
    date_publication?: string | { $date: string };
    createdAt?: string | { $date: string };
    // Format POST
    content?: string;
    created_at?: string;
    resource_id?: string;
    user_id?: string;
    // Informations utilisateur
    nom_utilisateur?: string;
    prenom_utilisateur?: string;
    // Nouveau: Support pour les réponses aux commentaires
    parent_comment_id?: string | null; // null = commentaire racine, string = réponse à un commentaire
    replies?: Comment[]; // Liste des réponses (pour le frontend)
    replies_count?: number; // Nombre de réponses (pour l'affichage)
}

export interface Favorite {
    _id: string;
    id_user: string;
    id_ressource: string;
    created_at: string;
}
