import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import axios from 'axios';
import { User, RegisterFormData } from '../types/types';

// Configuration de base pour axios
const API_URL = 'http://localhost:5001';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Fonction pour récupérer le token depuis les cookies
const getTokenFromCookies = (): string | null => {
  const cookies = document.cookie.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);
  
  return cookies['access_token'] || null;
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

const deleteCookie = (name: string) => {
  setCookie(name, '', { 'max-age': -1 });
};

// Intercepteur pour ajouter le token à chaque requête
api.interceptors.request.use(
  (config) => {
    const token = getTokenFromCookies();
    
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
      // Ajouter aussi le token dans l'en-tête 'token' pour compatibilité avec le backend
      config.headers['token'] = token;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs 401 (non autorisé)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Si l'erreur est 401 et que la requête n'a pas déjà été retentée
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Utiliser la fonction refreshToken du store
        const authStore = useAuthStore.getState();
        const newToken = await authStore.refreshToken();
        
        if (newToken) {
          // Mettre à jour l'en-tête avec le nouveau token
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          originalRequest.headers['token'] = newToken;
          
          // Réessayer la requête originale
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('Échec du rafraîchissement du token:', refreshError);
        // En cas d'échec, rediriger vers la page de connexion
        window.location.href = '/login';
        return Promise.reject(refreshError);
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
  refreshToken: () => Promise<string | null>;
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
        
        const token = getTokenFromCookies();
        if (!token && !get().isAuthenticated) {
          return;
        }
        
        set({ loading: true });
        
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
          
          set({ 
            user: null, 
            isAuthenticated: false,
            loading: false,
            error: err?.response?.data?.error || 'Erreur lors de la vérification d\'authentification'
          });
        }
      },

      // Connexion
      login: async (email, password) => {
        set({ loading: true, error: null });
        
        try {
          console.log('Tentative de connexion...');
          const response = await api.post('/auth/auth_from_password', { 
            mail: email,
            password 
          });
          
          console.log('Réponse de connexion:', response.data);
          
          // Stocker le token dans un cookie
          if (response.data.access_token) {
            setCookie('access_token', response.data.access_token, {
              'max-age': 900, // 15 minutes
              'SameSite': 'Lax'
            });
          }
          
          // Stocker aussi le refresh token
          if (response.data.refresh_token) {
            setCookie('refresh_token', response.data.refresh_token, {
              'max-age': 604800, // 7 jours
              'SameSite': 'Lax'
            });
          }
          
          const userData: User = {
            id: response.data.user_id || '',
            email: email,
            mail: email,
            nom: response.data.nom || '',
            prenom: response.data.prenom || '',
            username: response.data.username || ''
            // Le rôle sera récupéré séparément
          };
          
          console.log('Données utilisateur formatées:', userData);
          
          set({ 
            user: userData, 
            isAuthenticated: true, 
            loading: false,
            error: null 
          });
          
          // Récupérer le rôle de l'utilisateur
          const { fetchUserRole } = get();
          await fetchUserRole();
          
          return response.data;
        } catch (err: any) {
          console.error('Erreur lors de la connexion:', err);
          
          set({ 
            loading: false, 
            error: err?.response?.data?.error || 'Erreur lors de la connexion'
          });
          
          throw err;
        }
      },

      // Inscription
      register: async (formData) => {
        set({ loading: true, error: null });
        
        try {
          console.log('Tentative d\'inscription...', formData);
          const response = await api.post('/auth/register', formData);
          
          console.log('Réponse d\'inscription:', response.data);
          
          if (response.data.access_token) {
            setCookie('access_token', response.data.access_token, {
              'max-age': 900, // 15 minutes
              'SameSite': 'Lax'
            });
          }
          
          // Stocker aussi le refresh token
          if (response.data.refresh_token) {
            setCookie('refresh_token', response.data.refresh_token, {
              'max-age': 604800, // 7 jours
              'SameSite': 'Lax'
            });
          }
          
          const userData: User = {
            id: response.data.user_id || '',
            email: formData.mail,
            mail: formData.mail,
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
          console.error('Erreur lors de l\'inscription:', err);
          
          set({ 
            loading: false, 
            error: err?.response?.data?.error || 'Erreur lors de l\'inscription'
          });
          
          throw err;
        }
      },

      // Déconnexion
      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch (err) {
          console.error('Erreur lors de la déconnexion:', err);
        }
        
        // Supprimer les cookies
        deleteCookie('access_token');
        deleteCookie('refresh_token');
        
        set({ 
          user: null, 
          isAuthenticated: false,
          error: null
        });
      },

      clearError: () => set({ error: null }),

      // Mettre à jour le profil utilisateur
      updateProfile: async (userData) => {
        set({ loading: true, error: null });
        
        try {
          const response = await api.put('/users/update_profile', userData);
          
          set(state => ({ 
            user: state.user ? { ...state.user, ...userData } : null,
            loading: false,
            error: null
          }));
          
          return response.data;
        } catch (err: any) {
          console.error('Erreur lors de la mise à jour du profil:', err);
          
          set({ 
            loading: false, 
            error: err?.response?.data?.error || 'Erreur lors de la mise à jour du profil'
          });
          
          throw err;
        }
      },

      // Récupérer le rôle de l'utilisateur
      fetchUserRole: async () => {
        try {
          console.log('Récupération du rôle utilisateur...');
          const response = await api.get('/users/role');
          console.log('Rôle récupéré:', response.data);
          
          const { user } = get();
          if (user) {
            // Mettre à jour l'utilisateur avec son rôle
            set({
              user: {
                ...user,
                role: response.data
              }
            });
          }
          
          return response.data;
        } catch (err: any) {
          console.error('Erreur lors de la récupération du rôle:', err);
          // Ne pas définir d'erreur dans le state pour ne pas perturber l'interface
          return null;
        }
      },

      // Rafraîchir le token
      refreshToken: async () => {
        const refreshToken = document.cookie
          .split(';')
          .find(c => c.trim().startsWith('refresh_token='))
          ?.split('=')[1];
          
        if (!refreshToken) {
          console.log('Pas de refresh token disponible');
          // Pas de refresh token, déconnexion
          set({ 
            user: null, 
            isAuthenticated: false,
            loading: false
          });
          return null;
        }
        
        try {
          console.log('Tentative de rafraîchissement du token...');
          const response = await axios.post(
            `${API_URL}/auth/refresh_token`,
            { refresh_token: refreshToken },
            { withCredentials: true }
          );
          
          console.log('Réponse du rafraîchissement:', response.data);
          
          // Le cookie access_token devrait être défini automatiquement par le backend
          // Mais on le définit aussi côté client par sécurité
          if (response.data.access_token) {
            setCookie('access_token', response.data.access_token, {
              'max-age': 900, // 15 minutes
              'SameSite': 'Lax'
            });
            return response.data.access_token;
          }
          return null;
        } catch (error) {
          console.error('Erreur lors du rafraîchissement du token:', error);
          // En cas d'échec, déconnexion
          set({ 
            user: null, 
            isAuthenticated: false,
            loading: false
          });
          return null;
        }
      },
    }),
    {
      name: 'auth-store', 
      storage: createJSONStorage(() => localStorage), 
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      })
    }
  )
);

export default useAuthStore;