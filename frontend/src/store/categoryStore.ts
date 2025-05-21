import { create } from 'zustand';
import axios from 'axios';
import { Category } from '../types/types';

// Configuration de l'API
const api = axios.create({
  baseURL: 'http://localhost:5001',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercepteur pour ajouter le token à chaque requête
api.interceptors.request.use(config => {
  const cookies = document.cookie.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);
  
  const token = cookies['access_token'];
  
  if (token && config.headers) {
    config.headers['Authorization'] = `Bearer ${token}`;
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
  createCategory: (nom: string, description: string) => Promise<void>;
  updateCategory: (id: string, nom: string, description: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  clearError: () => void;
}

const useCategoryStore = create<CategoryState>((set, get) => ({
  // État initial
  categories: [],
  loading: false,
  error: null,
  
  // Récupérer les catégories
  fetchCategories: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/categories/all_categories');
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
  
  // Créer une nouvelle catégorie
  createCategory: async (nom: string, description: string) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/categories/create_category', {
        nom_categorie: nom,
        description_categorie: description
      });
      
      // Mettre à jour l'état local avec la nouvelle catégorie
      set(state => ({
        categories: [...state.categories, { ...response.data, nom, description }],
        loading: false
      }));
      
      return response.data;
    } catch (err: any) {
      console.error('Erreur lors de la création de la catégorie:', err);
      console.error('Status:', err.response?.status);
      console.error('Message:', err.response?.data || err.message);
      
      set({
        error: err.response?.data?.error || 'Erreur lors de la création de la catégorie',
        loading: false
      });
      throw err;
    }
  },
  
  // Mettre à jour une catégorie
  updateCategory: async (id: string, nom: string, description: string) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put(`/categories/update_category/${id}`, { 
        nom_categorie: nom, 
        description_categorie: description 
      });
      
      // Mettre à jour l'état local avec la catégorie modifiée
      set(state => ({ 
        categories: state.categories.map(cat => 
          cat._id === id ? { ...cat, nom, description_categorie: description } : cat
        ),
        loading: false 
      }));
      
      return response.data;
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour de la catégorie:', err);
      console.error('Status:', err.response?.status);
      console.error('Message:', err.response?.data || err.message);
      
      set({ 
        error: err.response?.data?.error || 'Erreur lors de la mise à jour de la catégorie', 
        loading: false 
      });
      throw err;
    }
  },
  
  // Supprimer une catégorie
  deleteCategory: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/categories/delete_category/${id}`);
      
      // Mettre à jour l'état local en supprimant la catégorie
      set(state => ({ 
        categories: state.categories.filter(cat => cat._id !== id),
        loading: false 
      }));
    } catch (err: any) {
      console.error('Erreur lors de la suppression de la catégorie:', err);
      console.error('Status:', err.response?.status);
      console.error('Message:', err.response?.data || err.message);
      
      set({ 
        error: err.response?.data?.error || 'Erreur lors de la suppression de la catégorie', 
        loading: false 
      });
      throw err;
    }
  },
  
  clearError: () => set({ error: null })
}));

export default useCategoryStore;