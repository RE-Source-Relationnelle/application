import { create } from 'zustand';
import { Category } from '../types/types';
import { api, getCookie } from './authStore'; // Importer l'instance API partagée et la fonction getCookie

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
      console.log(`Tentative de suppression de la catégorie avec ID: ${id}`);
      
      // Vérifier que le token est bien présent
      const accessToken = getCookie('access_token');
      console.log('Token utilisé:', accessToken ? 'présent' : 'absent');
      
      // Utiliser la méthode DELETE avec l'ID dans l'URL
      const response = await api.delete(`/categories/delete_category/${id}`);
      
      console.log('Réponse de suppression:', response.data);
      
      // Mettre à jour l'état local en supprimant la catégorie
      set(state => ({ 
        categories: state.categories.filter(cat => cat._id !== id),
        loading: false 
      }));
    } catch (err: any) {
      console.error('Erreur lors de la suppression de la catégorie:', err);
      console.error('Status:', err.response?.status);
      console.error('Message:', err.response?.data || err.message);
      
      // Si l'erreur est 401, essayer de rafraîchir le token manuellement
      if (err.response?.status === 401) {
        try {
          // Tenter de rafraîchir le token manuellement
          const refreshResult = await import('./authStore').then(module => module.default.getState().refreshToken());
          
          if (refreshResult) {
            console.log('Token rafraîchi manuellement, nouvelle tentative...');
            // Réessayer la requête après le rafraîchissement
            return await get().deleteCategory(id);
          }
        } catch (refreshError) {
          console.error('Échec du rafraîchissement manuel:', refreshError);
        }
      }
      
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