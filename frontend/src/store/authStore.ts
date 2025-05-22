import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import axios from 'axios';
import { User, RegisterFormData } from '../types/types';

const API_URL = 'http://localhost:5001';

// Créer et exporter l'instance API pour qu'elle puisse être utilisée ailleurs
export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Fonction pour extraire un cookie spécifique
export const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(';').shift();
    return cookieValue || null;
  }
  return null;
};

// Fonction pour définir un cookie
const setCookie = (name: string, value: string, options: Record<string, any> = {}) => {
  const optionsWithDefaults = {
    path: '/',
    ...options
  };
  
  let cookieString = `${name}=${value}`;
  
  Object.entries(optionsWithDefaults).forEach(([key, value]) => {
    cookieString += `; ${key}`;
    if (typeof value !== 'boolean' || value === false) {
      cookieString += `=${value}`;
    }
  });
  
  document.cookie = cookieString;
};

// Fonction pour supprimer un cookie
const deleteCookie = (name: string) => {
  setCookie(name, '', { 'max-age': -1 });
};

// Variable pour suivre si un rafraîchissement est en cours
let refreshingPromise: Promise<boolean> | null = null;

// Intercepteur pour ajouter le token à chaque requête
api.interceptors.request.use(
  async (config) => {
    // Récupérer le token depuis les cookies
    const token = getCookie('access_token');
    
    if (token && config.headers) {
      // Ajouter le token aux en-têtes de la requête
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur pour gérer les erreurs 401 (non autorisé)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Si l'erreur est 401 (non autorisé) et que la requête n'a pas déjà été retentée
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('Erreur 401 interceptée, tentative de rafraîchissement du token...', originalRequest.url);
      
      // Marquer la requête comme étant retentée
      originalRequest._retry = true;
      
      try {
        // Si un rafraîchissement est déjà en cours, attendre qu'il se termine
        if (refreshingPromise) {
          console.log('Rafraîchissement déjà en cours, attente...');
          const result = await refreshingPromise;
          
          if (result) {
            console.log('Token rafraîchi avec succès par un autre processus, nouvelle tentative de la requête originale');
            
            // Récupérer le nouveau token depuis les cookies
            const newToken = getCookie('access_token');
            if (newToken && originalRequest.headers) {
              // Mettre à jour le token dans la requête originale
              originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            }
            
            return api(originalRequest);
          } else {
            console.log('Échec du rafraîchissement du token par un autre processus');
            throw new Error('Échec du rafraîchissement du token');
          }
        }
        
        // Sinon, lancer un nouveau rafraîchissement
        const result = await useAuthStore.getState().refreshToken();
        
        if (result) {
          console.log('Token rafraîchi avec succès, nouvelle tentative de la requête originale');
          
          // Récupérer le nouveau token depuis les cookies
          const newToken = getCookie('access_token');
          if (newToken && originalRequest.headers) {
            // Mettre à jour le token dans la requête originale
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          }
          
          return api(originalRequest);
        } else {
          console.log('Échec du rafraîchissement du token');
          throw new Error('Échec du rafraîchissement du token');
        }
      } catch (refreshError) {
        console.error('Erreur lors du rafraîchissement du token:', refreshError);
        
        // Si le rafraîchissement échoue, propager l'erreur
        return Promise.reject(error);
      }
    }
    
    // Si ce n'est pas une erreur 401 ou si la requête a déjà été retentée, propager l'erreur
    return Promise.reject(error);
  }
);

interface AuthState {
  // État
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<any>;
  register: (formData: RegisterFormData) => Promise<any>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  fetchUserRole: () => Promise<any>;
  refreshToken: () => Promise<boolean>;
}

// Création du store avec persistance
const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      // Vérifier l'état d'authentification actuel
      checkAuth: async () => {
        if (get().loading) return;
        
        const token = getCookie('access_token');
        if (!token) {
          // Si pas de token, essayer de le rafraîchir
          const refreshSuccess = await get().refreshToken();
          if (!refreshSuccess && get().isAuthenticated) {
            // Si le rafraîchissement échoue et que l'utilisateur était authentifié, le déconnecter
            set({ user: null, isAuthenticated: false });
          }
          return;
        }
        
        set({ loading: true });
        
        try {
          console.log('Vérification de l\'authentification...');
          const response = await api.get('/auth/me');
          console.log('Réponse de /auth/me:', response.data);
          
          set({ 
            user: response.data, 
            isAuthenticated: true,
            loading: false,
            error: null
          });
        } catch (error) {
          console.error('Erreur lors de la vérification de l\'authentification:', error);
          
          // Si l'erreur est 401, essayer de rafraîchir le token
          if (axios.isAxiosError(error) && error.response?.status === 401) {
            const refreshSuccess = await get().refreshToken();
            if (!refreshSuccess) {
              set({ 
                user: null, 
                isAuthenticated: false,
                loading: false,
                error: 'Session expirée, veuillez vous reconnecter'
              });
            } else {
              // Si le rafraîchissement réussit, réessayer de vérifier l'authentification
              return get().checkAuth();
            }
          } else {
            set({ 
              loading: false,
              error: 'Erreur lors de la vérification de l\'authentification'
            });
          }
        }
      },

      // Connexion
      login: async (mail: string, password: string) => {
        set({ loading: true, error: null });
        
        try {
          console.log('Tentative de connexion...');
          const response = await api.post('/auth/auth_from_password', { mail, password });
          console.log('Réponse de auth_from_password:', response.data);
          
          // Les cookies sont automatiquement définis par le backend
          
          set({ 
            user: response.data,
            isAuthenticated: true,
            loading: false,
            error: null
          });
          
          return response.data;
        } catch (error) {
          console.error('Erreur lors de la connexion:', error);
          
          let errorMessage = 'Erreur lors de la connexion';
          
          if (axios.isAxiosError(error) && error.response) {
            errorMessage = error.response.data.error || errorMessage;
          }
          
          set({ 
            loading: false,
            error: errorMessage
          });
          
          throw error;
        }
      },

      // Inscription
      register: async (formData: RegisterFormData) => {
        set({ loading: true, error: null });
        
        try {
          console.log('Tentative d\'inscription...');
          const response = await api.post('/auth/register', formData);
          console.log('Réponse de register:', response.data);
          
          // Connexion automatique après inscription
          return get().login(formData.mail, formData.password);
        } catch (error) {
          console.error('Erreur lors de l\'inscription:', error);
          
          let errorMessage = 'Erreur lors de l\'inscription';
          
          if (axios.isAxiosError(error) && error.response) {
            errorMessage = error.response.data.error || errorMessage;
          }
          
          set({ 
            loading: false,
            error: errorMessage
          });
          
          throw error;
        }
      },

      // Déconnexion
      logout: async () => {
        try {
          console.log('Déconnexion...');
          
          // Supprimer les cookies
          deleteCookie('access_token');
          deleteCookie('refresh_token');
          
          // Optionnel : appeler le backend pour invalider les tokens
          try {
            await api.post('/auth/logout');
          } catch (error) {
            console.warn('Erreur lors de la déconnexion côté serveur:', error);
            // Continuer même si l'appel au backend échoue
          }
          
          set({ 
            user: null,
            isAuthenticated: false,
            loading: false,
            error: null
          });
          
          // Redirection gérée par le composant qui appelle cette fonction
        } catch (error) {
          console.error('Erreur lors de la déconnexion:', error);
          set({ error: 'Erreur lors de la déconnexion' });
        }
      },

      // Effacer les erreurs
      clearError: () => {
        set({ error: null });
      },

      // Mettre à jour le profil utilisateur
      updateProfile: async (userData: Partial<User>) => {
        set({ loading: true, error: null });
        
        try {
          console.log('Mise à jour du profil...');
          const response = await api.put('/users/update_profile', userData);
          console.log('Réponse de update_profile:', response.data);
          
          // Utiliser les données retournées par le serveur pour mettre à jour l'état
          // Si le serveur ne renvoie pas l'utilisateur complet, fusionner avec l'état actuel
          const updatedUser = response.data.user || response.data;
          
          set({ 
            user: { 
              ...get().user, 
              ...updatedUser 
            } as User,
            loading: false,
            error: null
          });
          
          // Afficher un message de confirmation dans la console
          console.log('Profil mis à jour avec succès');
          
          return updatedUser;
        } catch (error) {
          console.error('Erreur lors de la mise à jour du profil:', error);
          
          let errorMessage = 'Erreur lors de la mise à jour du profil';
          
          if (axios.isAxiosError(error) && error.response) {
            errorMessage = error.response.data.error || errorMessage;
          }
          
          set({ 
            loading: false,
            error: errorMessage
          });
          
          throw error;
        }
      },

      // Récupérer le rôle de l'utilisateur
      fetchUserRole: async () => {
        if (!get().user || !get().isAuthenticated) {
          console.warn('Tentative de récupération du rôle sans utilisateur authentifié');
          return null;
        }
        
        try {
          console.log('Récupération du rôle utilisateur...');
          const response = await api.get('/users/role');
          console.log('Réponse de get_role:', response.data);
          
          // Extraire les données du rôle
          const roleData = response.data.role || response.data;
          console.log('Données du rôle structurées:', roleData);
          
          // Mettre à jour l'utilisateur avec son rôle
          set({ 
            user: { 
              ...get().user, 
              role: {
                role_id: roleData.role_id || roleData.id,
                nom_role: roleData.nom_role
              }
            } as User
          });
          
          return roleData;
        } catch (error) {
          console.error('Erreur lors de la récupération du rôle:', error);
          
          // Ne pas définir d'erreur dans le state pour ne pas perturber l'UI
          
          return null;
        }
      },

      // Rafraîchir le token
      refreshToken: async () => {
        // Si un rafraîchissement est déjà en cours, retourner la promesse existante
        if (refreshingPromise) {
          console.log('Rafraîchissement déjà en cours, réutilisation de la promesse existante');
          return refreshingPromise;
        }
        
        // Créer une nouvelle promesse de rafraîchissement
        refreshingPromise = (async () => {
          try {
            console.log('Tentative de rafraîchissement du token...');
            
            // Appeler l'endpoint de rafraîchissement
            // Le refresh_token est envoyé automatiquement via les cookies
            const response = await axios.post(
              `${API_URL}/auth/refresh_token`,
              {}, // Corps vide
              { 
                withCredentials: true // Important pour envoyer et recevoir les cookies
              }
            );
            
            console.log('Rafraîchissement réussi');
            
            // Les nouveaux tokens sont automatiquement définis comme cookies par le backend
            // Pas besoin de les extraire ou de les définir manuellement
            
            return true;
          } catch (error) {
            console.error('Erreur lors du rafraîchissement du token:', error);
            
            // En cas d'échec, vérifier si l'utilisateur est toujours considéré comme authentifié
            if (get().isAuthenticated) {
              // Déconnecter l'utilisateur si le rafraîchissement échoue
              set({ 
                user: null, 
                isAuthenticated: false,
                loading: false,
                error: 'Session expirée, veuillez vous reconnecter'
              });
            }
            
            return false;
          } finally {
            // Réinitialiser la promesse de rafraîchissement après un délai
            setTimeout(() => {
              refreshingPromise = null;
            }, 1000); // Attendre 1 seconde avant de permettre un nouveau rafraîchissement
          }
        })();
        
        return refreshingPromise;
      },
    }),
    {
      name: 'auth-store', 
      storage: createJSONStorage(() => localStorage), 
      partialize: (state) => ({ 
        // Ne persister que ces propriétés
        user: state.user,
        isAuthenticated: state.isAuthenticated
        // Ne pas persister loading ou error
      }),
    }
  )
);

export default useAuthStore;