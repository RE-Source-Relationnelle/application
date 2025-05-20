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
