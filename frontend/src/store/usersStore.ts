import { create } from 'zustand';
import axios from 'axios';

// Définition des types
export interface User {
  _id: string;
  nom: string;
  prenom: string;
  mail: string;
  role_id?: string;
  role_info?: {
    nom_role: string;
    permissions: string[];
  };
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface UserStore {
  users: User[];
  loading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  updateUser: (userId: string, userData: Partial<User>) => Promise<User>;
  deleteUser: (userId: string) => Promise<void>;
}

// Configuration de l'API
const api = axios.create({
  baseURL: "http://localhost:5001",
  withCredentials: true,
});

// Création du store
const useUsersStore = create<UserStore>((set) => ({
  users: [],
  loading: false,
  error: null,

  // Récupérer tous les utilisateurs
  fetchUsers: async () => {
    try {
      set({ loading: true, error: null });
      console.log('Récupération des utilisateurs...');
      
      const response = await api.get('/admin/get_users');
      
      console.log('Utilisateurs récupérés:', response.data);
      set({ users: response.data, loading: false });
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Une erreur est survenue lors de la récupération des utilisateurs', 
        loading: false 
      });
    }
  },

  // Mettre à jour un utilisateur
  updateUser: async (userId: string, userData: Partial<User>) => {
    try {
      set({ loading: true, error: null });
      console.log(`Mise à jour de l'utilisateur ${userId}:`, userData);
      
      const response = await api.put(`/admin/update_user/${userId}`, userData);
      
      console.log('Utilisateur mis à jour:', response.data);
      
      // Mettre à jour la liste des utilisateurs
      set((state) => ({
        users: state.users.map(user => 
          user._id === userId ? { ...user, ...response.data } : user
        ),
        loading: false
      }));
      
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'utilisateur ${userId}:`, error);
      set({ 
        error: error instanceof Error ? error.message : `Une erreur est survenue lors de la mise à jour de l'utilisateur`, 
        loading: false 
      });
      throw error;
    }
  },

  // Supprimer un utilisateur
  deleteUser: async (userId: string) => {
    try {
      set({ loading: true, error: null });
      console.log(`Suppression de l'utilisateur ${userId}...`);
      
      await api.delete(`/admin/delete_user/${userId}`);
      
      console.log(`Utilisateur ${userId} supprimé avec succès`);
      
      // Mettre à jour la liste des utilisateurs
      set((state) => ({
        users: state.users.filter(user => user._id !== userId),
        loading: false
      }));
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'utilisateur ${userId}:`, error);
      set({ 
        error: error instanceof Error ? error.message : `Une erreur est survenue lors de la suppression de l'utilisateur`, 
        loading: false 
      });
      throw error;
    }
  }
}));

export default useUsersStore;