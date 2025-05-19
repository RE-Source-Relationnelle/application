import { create } from 'zustand';
import axios from 'axios';
import { Category } from '../types/types';

// Configuration de l'API
const api = axios.create({
  baseURL: 'http://localhost:8000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercepteur pour ajouter le token à chaque requête
api.interceptors.request.use(config => {
  // Récupérer le token depuis les cookies
  const cookies = document.cookie.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);
  
  const token = cookies['access_token'];
  
  if (token && config.headers) {
    // Ajouter le token dans l'en-tête Authorization
    config.headers['Authorization'] = `Bearer ${token}`;
    // Ajouter aussi le token dans un en-tête 'token' pour compatibilité avec le backend
    config.headers['token'] = token;
  }
  
  return config;
}, error => {
  return Promise.reject(error);
});

interface CategoryState {
  // État
  categories: Category[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchCategories: () => Promise<void>;
  clearError: () => void;
}

const useCategoryStore = create<CategoryState>((set) => ({
  // État initial
  categories: [],
  loading: false,
  error: null,
  
  // Récupérer les catégories
  fetchCategories: async () => {
    set({ loading: true, error: null });
    try {
      console.log('Tentative de récupération des catégories depuis l\'API...');
      
      // Utiliser la route correcte /resources/categories
      const response = await api.get('/categories');
      console.log('Catégories récupérées avec succès:', response.data);
      
      set({ 
        categories: response.data, 
        loading: false 
      });
    } catch (err: any) {
      console.error('Erreur lors de la récupération des catégories:', err);
      console.error('Status:', err.response?.status);
      console.error('Message:', err.response?.data || err.message);
      
      set({ 
        error: err.response?.data?.error || 'Erreur lors de la récupération des catégories', 
        loading: false 
      });
    }
  },
  
  // Effacer les erreurs
  clearError: () => set({ error: null })
}));

export default useCategoryStore;