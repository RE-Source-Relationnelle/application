import { create } from 'zustand';
import axios from 'axios';
import { Resource, Category } from '../types/types';
import useCategoryStore from './categoryStore';

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
    // Ajouter aussi le token dans un en-tête 'token' pour compatibilité avec le backend actuel
    config.headers['token'] = token;
  }
  
  return config;
}, error => {
  return Promise.reject(error);
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
  createCategory: (name: string, description?: string) => Promise<Category | undefined>;
  updateCategory: (id: string, name: string, description?: string) => Promise<Category | undefined>;
  deleteCategory: (id: string) => Promise<void>;
  clearError: () => void;
}

const useResourcesStore = create<ResourcesState>((set, get) => ({
  // État initial
  resources: [],
  loading: false,
  error: null,
  categories: [],
  loadingCategories: false,

  // Récupérer les ressources
  fetchResources: async () => {
    set({ loading: true });
    try {
      const response = await api.get('/resources/');
      set({ resources: response.data, loading: false });
    } catch (err: any) {
      console.error('Erreur lors de la récupération des ressources:', err);
      set({ 
        error: err.response?.data?.error || 'Erreur lors de la récupération des ressources', 
        loading: false 
      });
    }
  },

  // Récupérer les catégories (utilise maintenant le categoryStore)
  fetchCategories: async () => {
    set({ loadingCategories: true });
    try {
      // Utiliser le categoryStore pour récupérer les catégories
      const categoryStore = useCategoryStore.getState();
      await categoryStore.fetchCategories();
      
      // Récupérer les catégories du categoryStore
      const categories = categoryStore.categories;
      
      // Calculer le nombre de ressources par catégorie
      const resources = get().resources;
      const categoriesWithCount = categories.map(category => {
        const count = resources.filter(r => r.id_categorie === category._id).length;
        return { ...category, resourceCount: count };
      });
      
      set({ categories: categoriesWithCount, loadingCategories: false });
    } catch (err: any) {
      console.error('Erreur lors de la récupération des catégories:', err);
      set({ 
        error: err.response?.data?.error || 'Erreur lors de la récupération des catégories', 
        loadingCategories: false 
      });
    }
  },

  // Supprimer une ressource
  deleteResource: async (id: string) => {
    set({ loading: true });
    try {
      await api.delete(`/resources/${id}`);
      
      const updatedResources = get().resources.filter(resource => resource._id !== id);
      set({ resources: updatedResources, loading: false });
      
      // Mettre à jour le comptage des ressources par catégorie
      get().fetchCategories();
    } catch (err: any) {
      console.error('Erreur lors de la suppression de la ressource:', err);
      set({ 
        error: err.response?.data?.error || 'Erreur lors de la suppression de la ressource', 
        loading: false 
      });
    }
  },

  // Approuver une ressource
  approveResource: async (id: string, comment?: string) => {
    set({ loading: true });
    try {
      await api.post(`/resources/approve/${id}`, { comment });
      
      const updatedResources = get().resources.map(resource => {
        if (resource._id === id) {
          return { 
            ...resource, 
            date_validation: new Date().toISOString(),
            commentaire_validation: comment || null
          };
        }
        return resource;
      });
      
      set({ resources: updatedResources, loading: false });
    } catch (err: any) {
      console.error('Erreur lors de l\'approbation de la ressource:', err);
      set({ 
        error: err.response?.data?.error || 'Erreur lors de l\'approbation de la ressource', 
        loading: false 
      });
    }
  },

  // Mettre à jour la catégorie d'une ressource
  updateResourceCategory: async (id: string, categoryId: string) => {
    set({ loading: true });
    try {
      await api.put(`/resources/${id}`, { id_categorie: categoryId });
      
      const updatedResources = get().resources.map(resource => {
        if (resource._id === id) {
          return { ...resource, id_categorie: categoryId };
        }
        return resource;
      });
      
      set({ resources: updatedResources, loading: false });
      
      // Mettre à jour le comptage des ressources par catégorie
      await get().fetchCategories();
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour de la catégorie:', err);
      set({ 
        error: err.response?.data?.error || 'Erreur lors de la mise à jour de la catégorie', 
        loading: false 
      });
    }
  },

  // Créer une nouvelle catégorie
  createCategory: async (name: string, description?: string) => {
    set({ loadingCategories: true });
    try {
      try {
        const response = await api.post('/resources/categories', { nom: name, description });
        
        const newCategory = { ...response.data, resourceCount: 0 };
        set(state => ({ 
          categories: [...state.categories, newCategory], 
          loadingCategories: false 
        }));
        
        // Mettre à jour les catégories dans le categoryStore
        const categoryStore = useCategoryStore.getState();
        categoryStore.fetchCategories();
        
        return newCategory;
      } catch (apiErr: any) {
        console.warn('API /resources/categories (POST) non disponible, simulation locale:', apiErr);
        
        const newId = `cat_${Date.now()}`;
        const newCategory = { 
          _id: newId, 
          nom: name, 
          description: description || '', 
          resourceCount: 0 
        };
        
        set(state => ({ 
          categories: [...state.categories, newCategory], 
          loadingCategories: false 
        }));
        
        return newCategory;
      }
    } catch (err: any) {
      console.error('Erreur lors de la création de la catégorie:', err);
      set({ 
        error: err.response?.data?.error || 'Erreur lors de la création de la catégorie', 
        loadingCategories: false 
      });
      return undefined;
    }
  },

  // Mettre à jour une catégorie
  updateCategory: async (id: string, name: string, description?: string) => {
    set({ loadingCategories: true });
    try {
      try {
        const response = await api.put(`/resources/categories/${id}`, { 
          nom: name, 
          description 
        });
        
        const updatedCategory = { ...response.data };
        set(state => ({ 
          categories: state.categories.map(cat => 
            cat._id === id ? { ...updatedCategory, resourceCount: cat.resourceCount } : cat
          ), 
          loadingCategories: false 
        }));
        
        // Mettre à jour les catégories dans le categoryStore
        const categoryStore = useCategoryStore.getState();
        categoryStore.fetchCategories();
        
        return updatedCategory;
      } catch (apiErr: any) {
        console.warn('API /resources/categories (PUT) non disponible, simulation locale:', apiErr);
        
        const updatedCategory = { 
          _id: id, 
          nom: name, 
          description: description || '' 
        };
        
        set(state => ({ 
          categories: state.categories.map(cat => 
            cat._id === id ? { ...cat, ...updatedCategory } : cat
          ), 
          loadingCategories: false 
        }));
        
        return updatedCategory as Category;
      }
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour de la catégorie:', err);
      set({ 
        error: err.response?.data?.error || 'Erreur lors de la mise à jour de la catégorie', 
        loadingCategories: false 
      });
      return undefined;
    }
  },

  // Supprimer une catégorie
  deleteCategory: async (id: string) => {
    set({ loadingCategories: true });
    try {
      const resources = get().resources;
      const isUsed = resources.some(resource => resource.id_categorie === id);
      
      if (isUsed) {
        throw new Error('Cette catégorie est utilisée par des ressources et ne peut pas être supprimée.');
      }
      
      try {
        await api.delete(`/resources/categories/${id}`);
        
        set(state => ({ 
          categories: state.categories.filter(cat => cat._id !== id), 
          loadingCategories: false 
        }));
        
        // Mettre à jour les catégories dans le categoryStore
        const categoryStore = useCategoryStore.getState();
        categoryStore.fetchCategories();
      } catch (apiErr: any) {
        console.warn('API /resources/categories (DELETE) non disponible, simulation locale:', apiErr);
        
        set(state => ({ 
          categories: state.categories.filter(cat => cat._id !== id), 
          loadingCategories: false 
        }));
      }
    } catch (err: any) {
      console.error('Erreur lors de la suppression de la catégorie:', err);
      set({ 
        error: err instanceof Error ? err.message : 
              err.response?.data?.error || 'Erreur lors de la suppression de la catégorie', 
        loadingCategories: false 
      });
    }
  },

  // Effacer les erreurs
  clearError: () => set({ error: null })
}));

export default useResourcesStore;
