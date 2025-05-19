import { create } from 'zustand';
import axios from 'axios';
import { Resource, Category } from '../types/types';

// Réutiliser la même configuration axios que dans authStore
const api = axios.create({
  baseURL: 'http://localhost:8000',
  withCredentials: true
});

interface ResourcesState {
  // État
  resources: Resource[];
  loading: boolean;
  error: string | null;
  categories: Category[];
  loadingCategories: boolean;

  // Actions
  fetchResources: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  deleteResource: (id: string) => Promise<void>;
  approveResource: (id: string, comment?: string) => Promise<void>;
  updateResourceCategory: (id: string, categoryId: string) => Promise<void>;
  createCategory: (name: string, description?: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  clearError: () => void;
}

const useResourcesStore = create<ResourcesState>((set, get) => ({
  resources: [],
  loading: false,
  error: null,
  categories: [],
  loadingCategories: false,

  fetchResources: async () => {
    set({ loading: true });
    try {
      const response = await api.get('/resources/');
      set({ resources: response.data, loading: false, error: null });
    } catch (error) {
      console.error('Erreur lors de la récupération des ressources:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erreur inconnue', 
        loading: false 
      });
    }
  },

  fetchCategories: async () => {
    set({ loadingCategories: true });
    try {
      const response = await api.get('/resources/categories');
      set({ categories: response.data, loadingCategories: false });
    } catch (error) {
      console.error('Erreur lors de la récupération des catégories:', error);
      set({ loadingCategories: false });
    }
  },

  deleteResource: async (id: string) => {
    set({ loading: true });
    try {
      await api.delete(`/resources/${id}`);
      set(state => ({
        resources: state.resources.filter(resource => resource._id !== id),
        loading: false,
        error: null
      }));
    } catch (error) {
      console.error(`Erreur lors de la suppression de la ressource ${id}:`, error);
      set({ 
        error: error instanceof Error ? error.message : 'Erreur inconnue', 
        loading: false 
      });
    }
  },

  approveResource: async (id: string, comment?: string) => {
    set({ loading: true });
    try {
      const currentDate = new Date().toISOString();
      await api.put(`/resources/${id}/approve`, { 
        date_validation: currentDate,
        commentaire_validation: comment || 'Approuvé par un administrateur'
      });
      
      set(state => ({
        resources: state.resources.map(resource => 
          resource._id === id 
            ? { 
                ...resource, 
                date_validation: currentDate,
                commentaire_validation: comment || 'Approuvé par un administrateur'
              } 
            : resource
        ),
        loading: false,
        error: null
      }));
    } catch (error) {
      console.error(`Erreur lors de l'approbation de la ressource ${id}:`, error);
      set({ 
        error: error instanceof Error ? error.message : 'Erreur inconnue', 
        loading: false 
      });
    }
  },

  updateResourceCategory: async (id: string, categoryId: string) => {
    set({ loading: true });
    try {
      await api.put(`/resources/${id}`, { id_categorie: categoryId });
      
      set(state => ({
        resources: state.resources.map(resource => 
          resource._id === id 
            ? { ...resource, id_categorie: categoryId } 
            : resource
        ),
        loading: false,
        error: null
      }));
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de la catégorie de la ressource ${id}:`, error);
      set({ 
        error: error instanceof Error ? error.message : 'Erreur inconnue', 
        loading: false 
      });
    }
  },

  createCategory: async (name: string, description?: string) => {
    set({ loadingCategories: true });
    try {
      const response = await api.post('/resources/categories', { 
        nom: name,
        description: description || ''
      });
      
      const newCategory = response.data;
      
      set(state => ({
        categories: [...state.categories, newCategory],
        loadingCategories: false,
        error: null
      }));
      
      return newCategory;
    } catch (error) {
      console.error('Erreur lors de la création de la catégorie:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erreur inconnue', 
        loadingCategories: false 
      });
    }
  },

  deleteCategory: async (id: string) => {
    set({ loadingCategories: true });
    try {
      await api.delete(`/resources/categories/${id}`);
      
      set(state => ({
        categories: state.categories.filter(category => category._id !== id),
        loadingCategories: false,
        error: null
      }));
    } catch (error) {
      console.error(`Erreur lors de la suppression de la catégorie ${id}:`, error);
      set({ 
        error: error instanceof Error ? error.message : 'Erreur inconnue', 
        loadingCategories: false 
      });
    }
  },

  clearError: () => set({ error: null })
}));

export default useResourcesStore;
