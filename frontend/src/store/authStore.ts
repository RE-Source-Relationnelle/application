import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import axios from 'axios';
import { User, RegisterFormData } from '../types/types';

const API_URL = 'https://guillaume-lechevallier.freeboxos.fr:5001/';

// Créer et exporter l'instance API pour qu'elle puisse être utilisée ailleurs
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },     
  withCredentials: true
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
    const token = getCookie('access_token');
    
    if (token && config.headers) {
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
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('Erreur 401 interceptée, tentative de rafraîchissement du token...', originalRequest.url);
      
      originalRequest._retry = true;
      
      try {
        if (refreshingPromise) {
          console.log('Rafraîchissement déjà en cours, attente...');
          const result = await refreshingPromise;
          
          if (result) {
            console.log('Token rafraîchi avec succès par un autre processus, nouvelle tentative de la requête originale');
            
            const newToken = getCookie('access_token');
            if (newToken && originalRequest.headers) {
              originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            }
            
            return api(originalRequest);
          } else {
            console.log('Échec du rafraîchissement du token par un autre processus');
            throw new Error('Échec du rafraîchissement du token');
          }
        }
        
        const result = await useAuthStore.getState().refreshToken();
        
        if (result) {
          console.log('Token rafraîchi avec succès, nouvelle tentative de la requête originale');
          
          const newToken = getCookie('access_token');
          if (newToken && originalRequest.headers) {
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          }
          
          return api(originalRequest);
        } else {
          console.log('Échec du rafraîchissement du token');
          throw new Error('Échec du rafraîchissement du token');
        }
      } catch (refreshError) {
        console.error('Erreur lors du rafraîchissement du token:', refreshError);
        
        return Promise.reject(error);
      }
    }
    
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

      checkAuth: async () => {
        if (get().loading) return;
        
        const token = getCookie('access_token');
        if (!token) {
          const refreshSuccess = await get().refreshToken();
          if (!refreshSuccess && get().isAuthenticated) {
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
          
          deleteCookie('access_token');
          deleteCookie('refresh_token');
          
          try {
            await api.post('/auth/logout');
          } catch (error) {
            console.warn('Erreur lors de la déconnexion côté serveur:', error);
          }
          
          set({ 
            user: null,
            isAuthenticated: false,
            loading: false,
            error: null
          });
          
        } catch (error) {
          console.error('Erreur lors de la déconnexion:', error);
          set({ error: 'Erreur lors de la déconnexion' });
        }
      },

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
          
          const updatedUser = response.data.user || response.data;
          
          set({ 
            user: { 
              ...get().user, 
              ...updatedUser 
            } as User,
            loading: false,
            error: null
          });
          
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
          
          const roleData = response.data.role || response.data;
          console.log('Données du rôle structurées:', roleData);
          
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
          
          return null;
        }
      },

      // Rafraîchir le token
      refreshToken: async () => {
        if (refreshingPromise) {
          console.log('Rafraîchissement déjà en cours, réutilisation de la promesse existante');
          return refreshingPromise;
        }
        
        refreshingPromise = (async () => {
          try {
            console.log('Tentative de rafraîchissement du token...');
            
            const response = await axios.post(
              `${API_URL}/auth/refresh_token`,
              {}, 
              { 
                withCredentials: true
              }
            );
            
            console.log('Rafraîchissement réussi');
            
            return true;
          } catch (error) {
            console.error('Erreur lors du rafraîchissement du token:', error);
            
            if (get().isAuthenticated) {
              set({ 
                user: null, 
                isAuthenticated: false,
                loading: false,
                error: 'Session expirée, veuillez vous reconnecter'
              });
            }
            
            return false;
          } finally {
            setTimeout(() => {
              refreshingPromise = null;
            }, 1000); 
          }
        })();
        
        return refreshingPromise;
      },
    }),
    {
      name: 'auth-store', 
      storage: createJSONStorage(() => localStorage), 
      partialize: (state) => ({ 
        user: state.user,
        isAuthenticated: state.isAuthenticated
      }),
    }
  )
);

export default useAuthStore;
