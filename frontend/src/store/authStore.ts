import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import axios from 'axios'
import { User, RegisterFormData } from '../types/types';

// Configuration de axios
const api = axios.create({
  baseURL: 'http://localhost:8000',
  withCredentials: true
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
  updateProfile: (userData: Partial<User>) => Promise<void>;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      loading: false, // Commencer avec loading à false pour éviter le flash
      error: null,

      // Vérifier l'état d'authentification actuel
      checkAuth: async () => {
        // Ne pas mettre loading à true si déjà authentifié
        if (!get().isAuthenticated) {
          set({ loading: true });
        }
        
        try {
          console.log('Vérification de l\'authentification...');
          const response = await api.get('/users/get_own_profile');
          console.log('Réponse de get_own_profile:', response.data);
          set({ 
            user: response.data, 
            isAuthenticated: true,
            loading: false,
            error: null
          });
        } catch (err: any) {
          console.error('Erreur lors de la vérification d\'authentification:', err);
          
          // Si l'utilisateur est déjà authentifié selon le localStorage, 
          // ne pas le déconnecter en cas d'erreur temporaire
          const currentUser = get().user;
          const isCurrentlyAuthenticated = get().isAuthenticated;
          
          if (currentUser && isCurrentlyAuthenticated && err?.response?.status === 401) {
            console.log('Erreur 401 mais utilisateur déjà authentifié, conservation de l\'état');
            set({ loading: false });
            return; // Ne pas réinitialiser l'état
          }
          
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
            nom: response.data.nom,
            prenom: response.data.prenom,
            username: response.data.username
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
      clearError: () => set({ error: null }),
      
      // Mettre à jour le profil utilisateur
      updateProfile: async (userData: Partial<User>) => {
        set({ loading: true });
        try {
          // S'assurer que si email est fourni, il est également envoyé comme mail
          const dataToSend = { ...userData };
          if (userData.email && !userData.mail) {
            dataToSend.mail = userData.email;
          }
          
          const response = await api.put('/users/update_profile', dataToSend);
          
          // Mettre à jour l'utilisateur dans le store avec les nouvelles données
          const currentUser = get().user;
          if (currentUser) {
            set({ 
              user: { ...currentUser, ...userData },
              loading: false,
              error: null 
            });
          }
          
          return response.data;
        } catch (err: any) {
          set({ 
            error: err.response?.data?.error || "Erreur lors de la mise à jour du profil",
            loading: false
          });
          throw err;
        }
      }
    }),
    {
      name: 'auth-store', // Nom du store pour la persistance
      storage: createJSONStorage(() => localStorage), // Utiliser localStorage pour la persistance
    }
  )
);

// Vérifier l'auth au démarrage
useAuthStore.getState().checkAuth();

export default useAuthStore;