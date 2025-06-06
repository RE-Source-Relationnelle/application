import { create } from 'zustand';
import { Resource, Category } from '../types/types';
import useCategoryStore from './categoryStore';
import { api } from './authStore';

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
  approveResource: (id: string, comment?: string) => Promise<any>;
  updateResourceCategory: (id: string, categoryId: string) => Promise<void>;
  updateResource: (id: string, data: Partial<Resource>) => Promise<void>;
  createResource: (data: { titre: string, contenu: string, id_categorie?: string }) => Promise<void>;
  createCategory: (name: string, description?: string) => Promise<void>;
  updateCategory: (id: string, name: string, description?: string) => Promise<void>;
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
      const categoryStore = useCategoryStore.getState();
      await categoryStore.fetchCategories();
      
      const categories = categoryStore.categories;
      console.log("Catégories récupérées du categoryStore:", categories);
      
      if (categories.length === 0) {
        console.log("Aucune catégorie trouvée dans le categoryStore, tentative de récupération directe");
        const response = await api.get('/categories/all_categories');
        console.log("Réponse directe de l'API:", response.data);
        
        if (response.data && response.data.length > 0) {
          set({ categories: response.data, loadingCategories: false });
          return;
        }
      }
      
      const resources = get().resources;
      const categoriesWithCount = categories.map(category => {
        const categoryId = category._id.toString();
        const count = resources.filter(r => {
          const resourceCategoryId = r.id_categorie ? r.id_categorie.toString() : '';
          return resourceCategoryId === categoryId;
        }).length;
        
        return { ...category, resourceCount: count };
      });
      
      console.log("Catégories avec comptage:", categoriesWithCount);
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
      await api.delete(`/resources/delete/${id}`);
      
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
      const response = await api.post(`/resources/approve/${id}`, { comment });
      
      const updatedResources = get().resources.map(resource => {
        if (resource._id === id) {
          return { 
            ...resource, 
            approved: true,
            date_validation: new Date().toISOString(),
            commentaire_validation: comment || null
          };
        }
        return resource;
      });
      
      set({ resources: updatedResources, loading: false });
      return response.data; // Retourner la ressource mise à jour
    } catch (err: any) {
      console.error('Erreur lors de l\'approbation de la ressource:', err);
      set({ 
        error: err.response?.data?.error || 'Erreur lors de l\'approbation de la ressource', 
        loading: false 
      });
      throw err; // Propager l'erreur pour permettre au composant de la gérer
    }
  },

  // Mettre à jour la catégorie d'une ressource
  updateResourceCategory: async (id: string, categoryId: string) => {
    set({ loading: true });
    try {
      await api.put(`/resources/update/${id}`, { categories: categoryId });
      
      const updatedResources = get().resources.map(resource => {
        if (resource._id === id) {
          return { ...resource, id_categorie: categoryId };
        }
        return resource;
      });
      
      set({ resources: updatedResources, loading: false });
      
      // Mettre à jour le comptage des ressources par catégorie
      get().fetchCategories();
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour de la catégorie:', err);
      set({ 
        error: err.response?.data?.error || 'Erreur lors de la mise à jour de la catégorie', 
        loading: false 
      });
    }
  },

  // Mettre à jour une ressource
  updateResource: async (id: string, data: Partial<Resource>) => {
    set({ loading: true });
    try {
      await api.put(`/resources/update/${id}`, data);
      
      const updatedResources = get().resources.map(resource => {
        if (resource._id === id) {
          return { ...resource, ...data };
        }
        return resource;
      });
      
      set({ resources: updatedResources, loading: false });
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour de la ressource:', err);
      set({ 
        error: err.response?.data?.error || 'Erreur lors de la mise à jour de la ressource', 
        loading: false 
      });
    }
  },
  
  // Créer une nouvelle ressource
  createResource: async (data: { titre: string, contenu: string, id_categorie?: string }) => {
    set({ loading: true });
    try {
      // Adapter les noms de champs pour le backend
      const backendData = {
        title: data.titre,
        content: data.contenu,
        categorie: data.id_categorie || ''
      };
      
      const response = await api.post('/resources/create_resources', backendData);
      
      // Ajouter la nouvelle ressource à la liste
      const newResource = response.data;
      set({ 
        resources: [...get().resources, newResource],
        loading: false 
      });
      
      return newResource;
    } catch (err: any) {
      console.error('Erreur lors de la création de la ressource:', err);
      set({ 
        error: err.response?.data?.error || 'Erreur lors de la création de la ressource', 
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
