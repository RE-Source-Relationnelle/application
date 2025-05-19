import { create } from 'zustand';
import axios from 'axios';
import { Resource, Category } from '../types/types';

// Réutiliser la même configuration axios que dans authStore
const api = axios.create({
  baseURL: 'http://localhost:8000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercepteur pour ajouter le token à chaque requête (comme dans authStore)
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

// Catégories temporaires en attendant l'implémentation backend
const defaultCategories: Category[] = [
  { _id: 'cat_1', nom: 'Famille', description: 'Ressources liées à la famille', resourceCount: 0 },
  { _id: 'cat_2', nom: 'Santé', description: 'Ressources liées à la santé et au bien-être', resourceCount: 0 },
  { _id: 'cat_3', nom: 'Éducation', description: 'Ressources éducatives', resourceCount: 0 },
  { _id: 'cat_4', nom: 'Environnement', description: 'Ressources liées à l\'environnement', resourceCount: 0 }
];

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
  deleteCategory: (id: string) => Promise<void>;
  clearError: () => void;
}

const useResourcesStore = create<ResourcesState>((set, get) => ({
  resources: [],
  loading: false,
  error: null,
  categories: [...defaultCategories],
  loadingCategories: false,

  fetchResources: async () => {
    set({ loading: true });
    try {
      const response = await api.get('/resources/');
      
      // Mettre à jour le compteur de ressources par catégorie
      const resources = response.data;
      const categoryCounts: Record<string, number> = {};
      
      resources.forEach((resource: Resource) => {
        if (resource.id_categorie) {
          categoryCounts[resource.id_categorie] = (categoryCounts[resource.id_categorie] || 0) + 1;
        }
      });
      
      // Mettre à jour les compteurs dans les catégories
      set(state => ({
        resources: resources,
        categories: state.categories.map(cat => ({
          ...cat,
          resourceCount: categoryCounts[cat._id] || 0
        })),
        loading: false,
        error: null
      }));
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
      // Temporairement, on utilise les catégories par défaut
      // Dans le futur, quand l'API sera prête:
      // const response = await api.get('/resources/categories');
      // set({ categories: response.data, loadingCategories: false });
      
      // Pour l'instant, on simule un délai et on utilise les catégories par défaut
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Ne pas écraser les catégories si elles existent déjà
      set(state => ({
        categories: state.categories.length > 0 ? state.categories : [...defaultCategories],
        loadingCategories: false
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des catégories:', error);
      // En cas d'erreur, utiliser quand même les catégories par défaut
      set(state => ({ 
        categories: state.categories.length > 0 ? state.categories : [...defaultCategories],
        loadingCategories: false 
      }));
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
      
      // Mettre à jour la ressource localement
      set(state => {
        const updatedResources = state.resources.map(resource => 
          resource._id === id 
            ? { ...resource, id_categorie: categoryId } 
            : resource
        );
        
        // Recalculer les compteurs de ressources par catégorie
        const categoryCounts: Record<string, number> = {};
        updatedResources.forEach(resource => {
          if (resource.id_categorie) {
            categoryCounts[resource.id_categorie] = (categoryCounts[resource.id_categorie] || 0) + 1;
          }
        });
        
        // Mettre à jour les catégories avec les nouveaux compteurs
        const updatedCategories = state.categories.map(cat => ({
          ...cat,
          resourceCount: categoryCounts[cat._id] || 0
        }));
        
        return {
          resources: updatedResources,
          categories: updatedCategories,
          loading: false,
          error: null
        };
      });
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
      // Temporairement, on simule la création d'une catégorie
      // Dans le futur, quand l'API sera prête:
      // const response = await api.post('/resources/categories', { nom: name, description: description || '' });
      // const newCategory = response.data;
      
      // Pour l'instant, on crée une catégorie locale avec un ID généré
      const newCategory: Category = {
        _id: `cat_${Date.now()}`,
        nom: name,
        description: description || '',
        resourceCount: 0
      };
      
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
      // Temporairement, on simule la suppression d'une catégorie
      // Dans le futur, quand l'API sera prête:
      // await api.delete(`/resources/categories/${id}`);
      
      // Pour l'instant, on supprime simplement la catégorie de l'état local
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
