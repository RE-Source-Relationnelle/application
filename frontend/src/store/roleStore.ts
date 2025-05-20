import { create } from 'zustand';
import axios from 'axios';

// Type pour un rôle
export interface Role {
  _id: string;
  nom_role: string;
  description?: string;
  permissions?: string[];
}

// Type pour la création d'un rôle
export interface CreateRoleData {
  nom_role: string;
  description?: string;
  permissions?: string[];
}

// Type pour la mise à jour d'un rôle
export interface UpdateRoleData {
  nom_role?: string;
  description?: string;
  permissions?: string[];
}

// Configuration de l'API
const api = axios.create({
  baseURL: 'http://localhost:5001',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interface du store
interface RoleState {
  roles: Role[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchRoles: () => Promise<Role[]>;
  createRole: (roleData: CreateRoleData) => Promise<Role>;
  updateRole: (id: string, roleData: UpdateRoleData) => Promise<Role>;
  deleteRole: (id: string) => Promise<boolean>;
  clearError: () => void;
}

// Création du store
const useRoleStore = create<RoleState>((set, get) => ({
  roles: [],
  loading: false,
  error: null,
  
  // Récupérer tous les rôles
  fetchRoles: async () => {
    set({ loading: true, error: null });
    
    try {
      const response = await api.get('/admin/all_roles');
      console.log('Rôles récupérés:', response.data);
      
      set({ 
        roles: response.data,
        loading: false 
      });
      
      return response.data;
    } catch (err: any) {
      console.error('Erreur lors de la récupération des rôles:', err);
      
      set({ 
        loading: false, 
        error: err?.response?.data?.error || 'Erreur lors de la récupération des rôles'
      });
      
      return [];
    }
  },
  
  // Créer un nouveau rôle
  createRole: async (roleData: CreateRoleData) => {
    set({ loading: true, error: null });
    
    try {
      const response = await api.post('/admin/create_role', roleData);
      console.log('Rôle créé:', response.data);
      
      // Mettre à jour la liste des rôles
      const { roles } = get();
      set({ 
        roles: [...roles, response.data],
        loading: false 
      });
      
      return response.data;
    } catch (err: any) {
      console.error('Erreur lors de la création du rôle:', err);
      
      set({ 
        loading: false, 
        error: err?.response?.data?.error || 'Erreur lors de la création du rôle'
      });
      
      throw err;
    }
  },
  
  // Mettre à jour un rôle existant
  updateRole: async (id: string, roleData: UpdateRoleData) => {
    set({ loading: true, error: null });
    
    try {
      const response = await api.put(`/admin/update_role/${id}`, roleData);
      console.log('Rôle mis à jour:', response.data);
      
      // Mettre à jour la liste des rôles
      const { roles } = get();
      const updatedRoles = roles.map(role => 
        role._id === id ? { ...role, ...response.data } : role
      );
      
      set({ 
        roles: updatedRoles,
        loading: false 
      });
      
      return response.data;
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour du rôle:', err);
      
      set({ 
        loading: false, 
        error: err?.response?.data?.error || 'Erreur lors de la mise à jour du rôle'
      });
      
      throw err;
    }
  },
  
  // Supprimer un rôle
  deleteRole: async (id: string) => {
    set({ loading: true, error: null });
    
    try {
      await api.delete(`/admin/delete_role/${id}`);
      console.log('Rôle supprimé:', id);
      
      // Mettre à jour la liste des rôles
      const { roles } = get();
      const filteredRoles = roles.filter(role => role._id !== id);
      
      set({ 
        roles: filteredRoles,
        loading: false 
      });
      
      return true;
    } catch (err: any) {
      console.error('Erreur lors de la suppression du rôle:', err);
      
      set({ 
        loading: false, 
        error: err?.response?.data?.error || 'Erreur lors de la suppression du rôle'
      });
      
      return false;
    }
  },
  
  // Effacer les erreurs
  clearError: () => set({ error: null })
}));

export default useRoleStore;
