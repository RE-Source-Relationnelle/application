import { create } from 'zustand'
import axios from 'axios'
import { User, RegisterFormData } from '../types/types';

// Configuration de axios
const api = axios.create({
  baseURL: 'http://localhost:8000',
  withCredentials: true // Important pour les cookies
})

interface AuthState {
  // État
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (formData: RegisterFormData) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  loading: true, // Commencer avec loading à true
  error: null,

  // Vérifier l'état d'authentification actuel
  checkAuth: async () => {
    try {
      const response = await api.get('/auth/me');
      set({ 
        user: response.data, 
        isAuthenticated: true,
        loading: false,
        error: null
      });
    } catch (err: any) {
      if (err?.response?.status !== 401) {
        console.error('Auth check failed:', err);
      }
      set({ 
        user: null, 
        isAuthenticated: false,
        loading: false 
      });
    }
  },

  // Connexion - adaptée pour utiliser auth_from_password
  login: async (email, password) => {
    set({ loading: true });
    try {
      const response = await api.post('/auth/auth_from_password', { 
        mail: email,
        password 
      });
      
      // Extraire les données pertinentes de la réponse
      const userData = {
        id: response.data.user_id || '',
        email: email,
        // Autres propriétés si nécessaire
      };
      
      set({ 
        user: userData, 
        isAuthenticated: true, 
        loading: false,
        error: null 
      });
      
      return response.data;
    } catch (err: any) {
      set({ 
        error: err.response?.data?.error || 'Échec de la connexion. Veuillez réessayer.',
        isAuthenticated: false,
        loading: false
      });
      throw err;
    }
  },

  // Inscription
  register: async (formData: RegisterFormData) => {
    set({ loading: true });
    try {
      const response = await api.post('/auth/register', formData);
      
      // Extraire les données pertinentes de la réponse
      const userData = {
        id: response.data.user_id || '',
        email: formData.mail,
        nom: formData.nom,
        prenom: formData.prenom,
        username: formData.username
      };
      
      set({ 
        user: userData, 
        isAuthenticated: true, 
        loading: false,
        error: null 
      });
      
      return response.data;
    } catch (err: any) {
      set({ 
        error: err.response?.data?.error || "Erreur lors de l'inscription",
        isAuthenticated: false,
        loading: false
      });
      throw err;
    }
  },

  // Déconnexion
  logout: async () => {
    try {
      await api.post('/auth/logout');
      set({ user: null, isAuthenticated: false });
    } catch (err: any) {
      console.error('Logout error:', err);
      // Même en cas d'erreur, on réinitialise l'état côté client
      set({ user: null, isAuthenticated: false });
    }
  },

  // Effacer les erreurs
  clearError: () => set({ error: null })
}));

// Vérifier l'auth au démarrage
useAuthStore.getState().checkAuth();

export default useAuthStore;