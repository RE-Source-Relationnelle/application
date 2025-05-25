import { create } from 'zustand';
import { Resource, User, Category } from '../types/types';
import { api } from './authStore';
import useCategoryStore from './categoryStore';

interface CategoryResourcesState {
  resources: (Resource & { 
    author?: User | null;
    category?: Category | null;
  })[];
  filteredResources: (Resource & { 
    author?: User | null;
    category?: Category | null;
  })[];
  selectedCategoryId: string | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchAllResources: () => Promise<void>;
  setSelectedCategory: (categoryId: string | null) => void;
  filterResourcesByCategory: () => void;
  resetResources: () => void;
  fetchResourceAuthor: (resourceId: string, publisherId: string) => Promise<void>;
  fetchResourceCategory: (resourceId: string, categoryId: string) => Promise<void>;
}

const useCategoryResourcesStore = create<CategoryResourcesState>((set, get) => ({
  resources: [],
  filteredResources: [],
  selectedCategoryId: null,
  loading: false,
  error: null,
  
  fetchAllResources: async () => {
    const { loading } = get();
    
    // Éviter les appels multiples
    if (loading) return;
    
    set({ loading: true });
    
    try {
      const response = await api.get('/resources/');
      
      if (response.data && Array.isArray(response.data)) {
        // Filtrer seulement les ressources validées
        const validatedResources = response.data.filter(resource => 
          resource.date_validation !== null && resource.date_validation !== undefined
        );
        
        // Trier par date de publication (plus récent en premier)
        validatedResources.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.date_publication?.date || 0);
          const dateB = new Date(b.createdAt || b.date_publication?.date || 0);
          return dateB.getTime() - dateA.getTime();
        });
        
        // Ajouter les champs author et category initialisés à null
        const resourcesWithExtra = validatedResources.map(resource => ({
          ...resource,
          author: null,
          category: null
        }));
        
        set({ 
          resources: resourcesWithExtra,
          error: null
        });
        
        // Appliquer le filtre de catégorie si nécessaire
        get().filterResourcesByCategory();
        
        // Récupérer les informations des auteurs et des catégories pour chaque ressource
        for (const resource of resourcesWithExtra) {
          if (resource.id_publieur) {
            get().fetchResourceAuthor(resource._id, resource.id_publieur);
          }
          if (resource.id_categorie) {
            get().fetchResourceCategory(resource._id, resource.id_categorie);
          }
        }
      } else {
        set({ error: 'Aucune ressource trouvée' });
      }
    } catch (err: any) {
      console.error('Erreur lors de la récupération des ressources:', err);
      
      let errorMessage = 'Une erreur est survenue.';
      if (err.response) {
        errorMessage = err.response.data?.error || 'Erreur lors de la récupération des ressources';
      } else if (err.request) {
        errorMessage = 'Impossible de se connecter au serveur.';
      }
      
      set({ error: errorMessage });
    } finally {
      set({ loading: false });
    }
  },
  
  // Définir la catégorie sélectionnée et filtrer les ressources
  setSelectedCategory: (categoryId: string | null) => {
    set({ selectedCategoryId: categoryId });
    get().filterResourcesByCategory();
  },
  
  // Filtrer les ressources par catégorie
  filterResourcesByCategory: () => {
    const { resources, selectedCategoryId } = get();
    
    if (!selectedCategoryId) {
      // Si aucune catégorie n'est sélectionnée, afficher toutes les ressources
      set({ filteredResources: resources });
    } else {
      // Filtrer les ressources par catégorie
      const filtered = resources.filter(resource => 
        resource.id_categorie === selectedCategoryId || 
        resource.category?._id === selectedCategoryId
      );
      set({ filteredResources: filtered });
    }
  },
  
  fetchResourceAuthor: async (resourceId: string, publisherId: string) => {
    try {
      const isDev = window.location.hostname === 'localhost';
      
      if (isDev) {
        console.log(`Tentative de récupération de l'auteur pour la ressource ${resourceId} (id_publieur: ${publisherId})`);
      }
      
      try {
        // Utiliser la route admin pour récupérer les utilisateurs si l'utilisateur est admin
        const currentUser = localStorage.getItem('auth-store');
        let isAdmin = false;
        
        if (currentUser) {
          try {
            const userData = JSON.parse(currentUser);
            if (userData.state?.user?.role?.nom_role === 'administrateur' || 
                userData.state?.user?.role?.nom_role === 'super-administrateur') {
              isAdmin = true;
            }
          } catch (e) {
            console.warn('Impossible de parser les données utilisateur du localStorage');
          }
        }
        
        // Si l'utilisateur est admin, on peut essayer d'utiliser la route admin
        if (isAdmin) {
          try {
            const response = await api.get('/admin/get_users');
            if (response.data && Array.isArray(response.data)) {
              const authorData = response.data.find(user => user._id === publisherId);
              
              if (authorData) {
                set(state => ({
                  resources: state.resources.map(resource => 
                    resource._id === resourceId 
                      ? { ...resource, author: authorData } 
                      : resource
                  )
                }));
                
                get().filterResourcesByCategory();
                return;
              }
            }
          } catch (adminError) {
            console.warn('Impossible d\'utiliser la route admin pour récupérer les utilisateurs:', adminError);
          }
        }
        
        set(state => ({
          resources: state.resources.map(resource => 
            resource._id === resourceId 
              ? { 
                  ...resource, 
                  author: {
                    id: publisherId,
                    email: '',
                    nom: 'Utilisateur',
                    prenom: '',
                  } 
                } 
              : resource
          )
        }));
        
        get().filterResourcesByCategory();
        
      } catch (apiError: any) {
        if (isDev) {
          console.warn(`Impossible de récupérer l'auteur pour la ressource ${resourceId}. L'API n'est peut-être pas disponible.`);
        }
        
        set(state => ({
          resources: state.resources.map(resource => 
            resource._id === resourceId 
              ? { 
                  ...resource, 
                  author: {
                    id: publisherId,
                    email: '',
                    nom: 'Utilisateur',
                    prenom: '',
                  } 
                } 
              : resource
          )
        }));
        
        get().filterResourcesByCategory();
      }
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'auteur pour la ressource ${resourceId}:`, error);
    }
  },
  
  fetchResourceCategory: async (resourceId: string, categoryId: string) => {
    try {
      const categoryStore = useCategoryStore.getState();
      
      if (categoryStore.categories.length === 0) {
        await categoryStore.fetchCategories();
      }
      
      const category = categoryStore.categories.find(cat => cat._id === categoryId);
      
      if (category) {
        set(state => ({
          resources: state.resources.map(resource => 
            resource._id === resourceId 
              ? { ...resource, category } 
              : resource
          )
        }));
      } else {
        try {
          const response = await api.get(`/categories/category/${categoryId}`);
          if (response.data) {
            set(state => ({
              resources: state.resources.map(resource => 
                resource._id === resourceId 
                  ? { ...resource, category: response.data } 
                  : resource
              )
            }));
          }
        } catch (directError) {
          console.warn(`Impossible de récupérer directement la catégorie ${categoryId}:`, directError);
        }
      }
      
      get().filterResourcesByCategory();
    } catch (error) {
      console.error(`Erreur lors de la récupération de la catégorie pour la ressource ${resourceId}:`, error);
    }
  },
  
  resetResources: () => {
    set({
      resources: [],
      filteredResources: [],
      selectedCategoryId: null,
      loading: false,
      error: null
    });
  }
}));

export default useCategoryResourcesStore; 