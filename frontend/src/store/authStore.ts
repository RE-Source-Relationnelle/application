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

// Fonction améliorée pour extraire un cookie spécifique
const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(';').shift();
    return cookieValue || null;
  }
  return null;
};

// Variable pour suivre si un rafraîchissement est en cours
let refreshingPromise: Promise<string | null> | null = null;
let refreshInterval: number | null = null;
// Variable pour suivre si une récupération de rôle est en cours
let fetchingRolePromise: Promise<any> | null = null;

// Fonction pour vérifier si le token est sur le point d'expirer
const isTokenExpiring = (): boolean => {
  // Vérifier si le token expire dans les 30 secondes (au lieu de 2 minutes)
  const tokenExpiresAt = localStorage.getItem('tokenExpiresAt');
  if (!tokenExpiresAt) {
    console.log('Pas de date d\'expiration stockée, considéré comme expirant');
    return true;
  }
  
  const expirationTime = parseInt(tokenExpiresAt, 10);
  const currentTime = Math.floor(Date.now() / 1000);
  const timeRemaining = expirationTime - currentTime;
  
  console.log(`Temps restant avant expiration: ${timeRemaining} secondes`);
  
  // Si le token expire dans moins de 30 secondes, considérer qu'il est en train d'expirer
  return timeRemaining < 30;
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
  async (config) => {
    const token = getCookie('access_token');
    
    // Vérifier si le token est sur le point d'expirer
    if (token && isTokenExpiring()) {
      console.log('Token sur le point d\'expirer, rafraîchissement préventif...');
      try {
        // Utiliser la fonction refreshToken du store pour obtenir un nouveau token
        const authStore = useAuthStore.getState();
        const newToken = await authStore.refreshToken();
        
        if (newToken && config.headers) {
          config.headers['Authorization'] = `Bearer ${newToken}`;
          config.headers['token'] = newToken;
          return config;
        }
      } catch (error) {
        console.error('Échec du rafraîchissement préventif du token:', error);
        // Continuer avec le token actuel même s'il est sur le point d'expirer
      }
    }
    
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
      config.headers['token'] = token;
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
        
        const token = getCookie('access_token');
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
      login: async (mail: string, password: string) => {
        set({ loading: true, error: null });
        
        try {
          console.log('Tentative de connexion...');
          const response = await axios.post(
            `${API_URL}/auth/auth_from_password`,
            { mail, password },
            { withCredentials: true }
          );
          
          console.log('Réponse de connexion:', response.data);
          
          // Stocker la date d'expiration de l'access_token
          if (response.data.expiration_access_token) {
            const expirationDate = new Date(response.data.expiration_access_token);
            localStorage.setItem('tokenExpiresAt', Math.floor(expirationDate.getTime() / 1000).toString());
            console.log(`Date d'expiration stockée: ${expirationDate.toISOString()}`);
            
            // Configurer un intervalle pour rafraîchir le token périodiquement
            // Rafraîchir toutes les 45 secondes (si le token expire après 60 secondes)
            if (refreshInterval) {
              clearInterval(refreshInterval);
            }
            refreshInterval = window.setInterval(() => {
              const authStore = useAuthStore.getState();
              console.log('Rafraîchissement périodique du token...');
              authStore.refreshToken();
            }, 45000); // 45 secondes
          }
          
          // Le backend définit déjà les cookies, pas besoin de les redéfinir ici
          
          // Formater les données utilisateur
          const userData: User = {
            id: response.data.user_id || '',
            email: mail,
            mail: mail,
            nom: response.data.nom || '',
            prenom: response.data.prenom || '',
            username: response.data.username || ''
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
      register: async (formData: RegisterFormData) => {
        set({ loading: true, error: null });
        
        try {
          console.log('Tentative d\'inscription...', formData);
          const response = await api.post('/auth/register', formData);
          
          console.log('Réponse d\'inscription:', response.data);
          
          if (response.data.access_token) {
            setCookie('access_token', response.data.access_token, {
              'max-age': 60, // 1 minute
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
          // Nettoyer l'intervalle de rafraîchissement
          if (refreshInterval) {
            clearInterval(refreshInterval);
            refreshInterval = null;
          }
          
          await api.post('/auth/logout');
          
          // Supprimer les cookies
          deleteCookie('access_token');
          deleteCookie('refresh_token');
          
          // Réinitialiser le state
          set({ 
            user: null, 
            isAuthenticated: false,
            loading: false
          });
        } catch (error) {
          console.error('Erreur lors de la déconnexion:', error);
        }
      },

      clearError: () => set({ error: null }),

      // Mettre à jour le profil utilisateur
      updateProfile: async (userData: Partial<User>) => {
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
        // Si une récupération est déjà en cours, retourner la promesse existante
        if (fetchingRolePromise) {
          console.log('Récupération du rôle déjà en cours, réutilisation de la promesse existante');
          return fetchingRolePromise;
        }
        
        // Créer une nouvelle promesse de récupération
        fetchingRolePromise = (async () => {
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
          } finally {
            // Réinitialiser la promesse de récupération
            setTimeout(() => {
              fetchingRolePromise = null;
            }, 1000); // Attendre 1 seconde avant de permettre une nouvelle récupération
          }
        })();
        
        return fetchingRolePromise;
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
            const response = await axios.post(
              `${API_URL}/auth/refresh_token`,
              {}, // Pas besoin d'envoyer le refresh_token, il sera lu depuis les cookies côté serveur
              { withCredentials: true }
            );
            
            console.log('Réponse du rafraîchissement:', response.data);
            
            // Stocker la date d'expiration pour pouvoir vérifier proactivement
            if (response.data.expiration_access_token) {
              const expirationDate = new Date(response.data.expiration_access_token);
              localStorage.setItem('tokenExpiresAt', Math.floor(expirationDate.getTime() / 1000).toString());
              console.log(`Nouvelle date d'expiration stockée: ${expirationDate.toISOString()}`);
            }
            
            // Le backend définit déjà les cookies, pas besoin de les redéfinir ici
            return response.data.access_token || null;
          } catch (error) {
            console.error('Erreur lors du rafraîchissement du token:', error);
            // En cas d'échec, déconnexion
            set({ 
              user: null, 
              isAuthenticated: false,
              loading: false
            });
            return null;
          } finally {
            // Réinitialiser la promesse de rafraîchissement
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
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      })
    }
  )
);

export default useAuthStore;