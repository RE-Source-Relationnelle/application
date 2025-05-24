import { create } from 'zustand';
import { api } from './authStore';
import { User, Resource, Favorite } from '../types/types';

interface StatisticsState {
  users: User[];
  resources: Resource[];
  pendingResources: any[];
  favorites: Favorite[];
  loading: boolean;
  error: string | null;
  
  fetchAllData: () => Promise<void>;
}

export const useStatisticsStore = create<StatisticsState>((set, get) => ({
  users: [],
  resources: [],
  pendingResources: [],
  favorites: [],
  loading: false,
  error: null,
  
  fetchAllData: async () => {
    set({ loading: true, error: null });
    
    try {
      const usersResponse = await api.get('/admin/get_users');
      const resourcesResponse = await api.get('/resources/');
      const pendingResourcesResponse = await api.get('/resources/pending');
      const favoritesResponse = await api.get('/resources/favorites');
      
      set({
        users: usersResponse.data || [],
        resources: resourcesResponse.data || [],
        pendingResources: pendingResourcesResponse.data || [],
        favorites: favoritesResponse.data || [],
        loading: false
      });
    } catch (err) {
      console.error('Erreur lors de la récupération des statistiques:', err);
      set({ 
        error: 'Erreur lors de la récupération des statistiques. Veuillez réessayer plus tard.',
        loading: false 
      });
    }
  }
}));