import { ReactNode } from 'react';

export interface ProtectedRouteProps {
    children: ReactNode;
}

export interface User {
    id: string;
    email: string;
    nom?: string;
    prenom?: string;
    username?: string;
}

export interface RegisterFormData {
    nom: string;
    prenom: string;
    mail: string;
    password: string;
    username: string;
    genre: string;
}