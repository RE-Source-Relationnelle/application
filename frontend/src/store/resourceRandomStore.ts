import { create } from 'zustand';
import { Resource, User, Category } from '../types/types';
import { api } from './authStore';
import useCategoryStore from './categoryStore';

interface ResourceRandomState {
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
  hasMore: boolean;
  isFetching: boolean;
  
  // Actions
  fetchRandomResources: (callback?: () => void) => Promise<void>;
  loadInitialResources: (count: number) => void;
  resetResources: () => void;
  fetchResourceAuthor: (resourceId: string, publisherId: string) => Promise<void>;
  fetchResourceCategory: (resourceId: string, categoryId: string) => Promise<void>;
  setSelectedCategory: (categoryId: string | null) => void;
  filterResourcesByCategory: () => void;
}

const useResourceRandomStore = create<ResourceRandomState>((set, get) => ({
  resources: [],
  filteredResources: [],
  selectedCategoryId: null,
  loading: false,
  error: null,
  hasMore: true,
  isFetching: false,
  
  fetchRandomResources: async (callback?: () => void) => {
    const { hasMore, isFetching } = get();
    
    if (!hasMore || isFetching) return;
    
    set({ loading: true, isFetching: true });
    
    try {
      const response = await api.get('/resources/randomressource');
      
      const newResources = Array.isArray(response.data) ? response.data : [response.data];
      
      if (newResources.length > 0 && !newResources[0].message) {
        // Filtrer les ressources pour éviter les doublons
        const currentResources = get().resources;
        const currentIds = new Set(currentResources.map(r => r._id));
        
        // Ne garder que les ressources qui ne sont pas déjà dans la liste
        const uniqueNewResources = newResources.filter(resource => !currentIds.has(resource._id));
        
        if (uniqueNewResources.length === 0) {
          // Si toutes les ressources sont des doublons, on considère qu'il n'y a plus de ressources à charger
          set({ hasMore: false });
          set({ loading: false, isFetching: false });
          if (callback) callback();
          return;
        }
        
        // Ajouter les nouvelles ressources avec des champs author et category initialisés à null
        const resourcesWithExtra = uniqueNewResources.map(resource => ({
          ...resource,
          author: null,
          category: null
        }));
        
        const updatedResources = [...currentResources, ...resourcesWithExtra];
        
        set(state => ({ 
          resources: updatedResources,
          error: null
        }));
        
        // Appliquer le filtre de catégorie si nécessaire
        get().filterResourcesByCategory();
        
        // Récupérer les informations des auteurs et des catégories pour chaque nouvelle ressource
        for (const resource of resourcesWithExtra) {
          if (resource.id_publieur) {
            get().fetchResourceAuthor(resource._id, resource.id_publieur);
          }
          if (resource.id_categorie) {
            get().fetchResourceCategory(resource._id, resource.id_categorie);
          }
        }
      } else {
        set({ hasMore: false });
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
      set({ loading: false, isFetching: false });
      if (callback) callback();
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
      // Vérifier si nous sommes en mode développement
      const isDev = process.env.NODE_ENV === 'development';
      
      if (isDev) {
        console.log(`Tentative de récupération de l'auteur pour la ressource ${resourceId} (id_publieur: ${publisherId})`);
      }
      
      try {
        // Utiliser la route admin pour récupérer les utilisateurs si l'utilisateur est admin
        // Sinon, utiliser un auteur par défaut
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
            // Utiliser la route admin qui liste tous les utilisateurs
            const response = await api.get('/admin/get_users');
            if (response.data && Array.isArray(response.data)) {
              // Trouver l'utilisateur correspondant à l'ID du publieur
              const authorData = response.data.find(user => user._id === publisherId);
              
              if (authorData) {
                set(state => ({
                  resources: state.resources.map(resource => 
                    resource._id === resourceId 
                      ? { ...resource, author: authorData } 
                      : resource
                  )
                }));
                
                // Réappliquer le filtre de catégorie
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
        
        // Réappliquer le filtre de catégorie
        get().filterResourcesByCategory();
        
      } catch (apiError: any) {
        // Si l'erreur est liée à CORS ou à un problème réseau, on ne fait rien
        // mais on évite de spammer la console avec des erreurs
        if (isDev) {
          console.warn(`Impossible de récupérer l'auteur pour la ressource ${resourceId}. L'API n'est peut-être pas disponible.`);
        }
        
        // Mettre à jour la ressource avec un auteur par défaut pour éviter de réessayer
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
        
        // Réappliquer le filtre de catégorie
        get().filterResourcesByCategory();
      }
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'auteur pour la ressource ${resourceId}:`, error);
    }
  },
  
  fetchResourceCategory: async (resourceId: string, categoryId: string) => {
    try {
      // Récupérer les catégories depuis le store
      const categoryStore = useCategoryStore.getState();
      
      // Si les catégories ne sont pas encore chargées, les récupérer
      if (categoryStore.categories.length === 0) {
        await categoryStore.fetchCategories();
      }
      
      // Chercher la catégorie correspondante
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
        // Si la catégorie n'est pas trouvée dans le store, essayer de la récupérer directement
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
      
      // Réappliquer le filtre de catégorie
      get().filterResourcesByCategory();
    } catch (error) {
      console.error(`Erreur lors de la récupération de la catégorie pour la ressource ${resourceId}:`, error);
    }
  },
  
  loadInitialResources: (count: number) => {
    let loaded = 0;
    const { fetchRandomResources } = get();
    
    const loadNext = () => {
      if (loaded < count) {
        fetchRandomResources(() => {
          loaded++;
          loadNext();
        });
      }
    };
    
    loadNext();
  },
  
  resetResources: () => {
    set({
      resources: [],
      filteredResources: [],
      selectedCategoryId: null,
      loading: false,
      error: null,
      hasMore: true,
      isFetching: false
    });
  }
}));

export default useResourceRandomStore;