import { create } from 'zustand';
import { Resource, User, Category } from '../types/types';
import { api } from './authStore';

interface SearchState {
  // État
  query: string;
  results: (Resource & { 
    author?: User | null;
    category?: Category | null;
  })[];
  loading: boolean;
  error: string | null;
  hasSearched: boolean;
  
  // Filtres avancés
  categoryFilter: string | null;
  
  // Actions
  setQuery: (query: string) => void;
  searchResources: () => Promise<void>;
  clearResults: () => void;
  fetchResourceAuthor: (resourceId: string, publisherId: string) => Promise<void>;
  fetchResourceCategory: (resourceId: string, categoryId: string) => Promise<void>;
  setCategoryFilter: (categoryId: string | null) => void;
  getFilteredResults: () => (Resource & { author?: User | null; category?: Category | null; })[];
}

const useSearchStore = create<SearchState>((set, get) => ({
  query: '',
  results: [],
  loading: false,
  error: null,
  hasSearched: false,
  categoryFilter: null,
  
  // Définir la requête de recherche
  setQuery: (query: string) => {
    set({ query });
  },
  
  // Définir le filtre par catégorie
  setCategoryFilter: (categoryId: string | null) => {
    set({ categoryFilter: categoryId });
  },
  
  // Obtenir les résultats filtrés
  getFilteredResults: () => {
    const { results, categoryFilter } = get();
    
    return results.filter(resource => {
      // Filtre par catégorie
      if (categoryFilter && resource.category) {
        if (resource.category._id !== categoryFilter) {
          return false;
        }
      }
      
      return true;
    });
  },
  
  // Rechercher des ressources
  searchResources: async () => {
    const { query } = get();
    
    if (!query.trim()) {
      set({ results: [], error: null, hasSearched: true });
      return;
    }
    
    set({ loading: true, error: null });
    
    try {
      // Nous savons que l'endpoint de recherche n'existe pas, donc nous allons directement
      // utiliser le fallback sans essayer l'endpoint qui génère des erreurs CORS
      console.log('Utilisation du fallback pour la recherche');
      const response = await api.get('/resources/');
      
      if (response.data && Array.isArray(response.data)) {
        const queryLower = query.toLowerCase();
        
        // Récupérer toutes les catégories en une seule requête
        let allCategories = [];
        try {
          const categoriesResponse = await api.get('/categories/all_categories');
          if (categoriesResponse.data && Array.isArray(categoriesResponse.data)) {
            allCategories = categoriesResponse.data;
          }
        } catch (error) {
          console.warn('Impossible de récupérer les catégories:', error);
        }
        
        // Première étape : filtrer par titre et contenu
        // ET par catégorie si nous avons les données des catégories
        const filteredResources = response.data.filter((resource: Resource) => {
          // Vérifier le titre et le contenu
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = resource.contenu;
          const textContent = tempDiv.textContent || tempDiv.innerText || '';
          
          const matchesTitleOrContent = 
            resource.titre.toLowerCase().includes(queryLower) ||
            textContent.toLowerCase().includes(queryLower);
          
          if (matchesTitleOrContent) return true;
          
          // Vérifier la catégorie si nous avons les données
          if (allCategories.length > 0 && resource.id_categorie) {
            const category = allCategories.find(cat => cat._id === resource.id_categorie);
            if (category && category.nom && category.nom.toLowerCase().includes(queryLower)) {
              return true;
            }
          }
          
          return false;
        });
        
        // Ajouter les champs author et category initialisés
        const resourcesWithExtra = filteredResources.map((resource: Resource) => {
          // Si nous avons déjà la catégorie, l'ajouter directement
          let category = null;
          if (allCategories.length > 0 && resource.id_categorie) {
            category = allCategories.find(cat => cat._id === resource.id_categorie) || null;
          }
          
          return {
            ...resource,
            author: null,
            category
          };
        });
        
        set({ 
          results: resourcesWithExtra,
          error: null,
          hasSearched: true
        });
        
        // Récupérer les informations des auteurs pour chaque ressource
        // et des catégories si nous ne les avons pas déjà
        for (const resource of resourcesWithExtra) {
          if (resource.id_publieur) {
            get().fetchResourceAuthor(resource._id, resource.id_publieur);
          }
          
          if (resource.id_categorie && !resource.category) {
            get().fetchResourceCategory(resource._id, resource.id_categorie);
          }
        }
      } else {
        set({ 
          results: [],
          error: null,
          hasSearched: true
        });
      }
    } catch (err: any) {
      console.error('Erreur lors de la recherche:', err);
      
      let errorMessage = 'Une erreur est survenue lors de la recherche.';
      if (err.response) {
        errorMessage = err.response.data?.error || 'Erreur lors de la recherche';
      } else if (err.request) {
        errorMessage = 'Impossible de se connecter au serveur.';
      }
      
      set({ 
        error: errorMessage,
        hasSearched: true
      });
    } finally {
      set({ loading: false });
    }
  },
  
  // Effacer les résultats
  clearResults: () => {
    set({ 
      results: [],
      error: null,
      hasSearched: false
    });
  },
  
  // Récupérer les informations de l'auteur d'une ressource
  fetchResourceAuthor: async (resourceId: string, publisherId: string) => {
    try {
      // Vérifier si nous sommes en mode développement
      const isDev = process.env.NODE_ENV === 'development';
      
      if (isDev) {
        console.log(`Tentative de récupération de l'auteur pour la ressource ${resourceId} (id_publieur: ${publisherId})`);
      }
      
      try {
        // Essayer d'abord de récupérer l'utilisateur via l'API publique
        try {
          const response = await api.get(`/users/${publisherId}`);
          if (response.data) {
            set(state => ({
              results: state.results.map(resource => 
                resource._id === resourceId 
                  ? { ...resource, author: response.data } 
                  : resource
              )
            }));
            return;
          }
        } catch (publicError) {
          console.warn('Impossible de récupérer l\'utilisateur via l\'API publique:', publicError);
        }
        
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
              const authorData = response.data.find((user: User) => user.id === publisherId);
              
              if (authorData) {
                set(state => ({
                  results: state.results.map(resource => 
                    resource._id === resourceId 
                      ? { ...resource, author: authorData } 
                      : resource
                  )
                }));
                return;
              }
            }
          } catch (adminError) {
            console.warn('Impossible d\'utiliser la route admin pour récupérer les utilisateurs:', adminError);
          }
        }
        
        // Essayer de récupérer les utilisateurs via l'API publique
        try {
          const usersResponse = await api.get('/users');
          if (usersResponse.data && Array.isArray(usersResponse.data)) {
            const authorData = usersResponse.data.find((user: User) => user.id === publisherId);
            
            if (authorData) {
              set(state => ({
                results: state.results.map(resource => 
                  resource._id === resourceId 
                    ? { ...resource, author: authorData } 
                    : resource
                )
              }));
              return;
            }
          }
        } catch (usersError) {
          console.warn('Impossible de récupérer la liste des utilisateurs:', usersError);
        }
        
        // Fallback: utiliser un auteur par défaut
        set(state => ({
          results: state.results.map(resource => 
            resource._id === resourceId 
              ? { 
                  ...resource, 
                  author: {
                    id: publisherId,
                    _id: publisherId,
                    email: '',
                    nom: 'Utilisateur',
                    prenom: '',
                  } as User
                } 
              : resource
          )
        }));
      } catch (error) {
        console.error('Erreur dans fetchResourceAuthor:', error);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'auteur:', error);
    }
  },
  
  // Récupérer les informations de la catégorie d'une ressource
  fetchResourceCategory: async (resourceId: string, categoryId: string) => {
    try {
      // Récupérer la catégorie depuis l'API
      const response = await api.get('/categories/all_categories');
      
      if (response.data && Array.isArray(response.data)) {
        const categoryData = response.data.find((cat: Category) => cat._id === categoryId);
        
        if (categoryData) {
          set(state => ({
            results: state.results.map(resource => 
              resource._id === resourceId 
                ? { ...resource, category: categoryData } 
                : resource
            )
          }));
        }
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de la catégorie:', error);
    }
  }
}));

export default useSearchStore;
