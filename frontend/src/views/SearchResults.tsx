import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import ResourceCard from '../components/features/ressources/ResourceCard';
import useSearchStore from '../store/searchStore';
import useFavoritesStore from '../store/favoritesStore';
import useAuthStore from '../store/authStore';
import { Search, Filter, X } from 'lucide-react';

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const { fetchFavorites } = useFavoritesStore();
  const { 
    query, 
    results, 
    loading, 
    error, 
    hasSearched,
    searchResources,
    setQuery,
    clearResults,
    categoryFilter,
    setCategoryFilter,
    getFilteredResults
  } = useSearchStore();

  // Charger les favoris si l'utilisateur est connecté
  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites();
    }
  }, [isAuthenticated, fetchFavorites]);

  // Récupérer la requête de recherche depuis l'URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const queryParam = searchParams.get('q');
    const categoryParam = searchParams.get('category');
    
    if (queryParam) {
      setQuery(queryParam);
      
      // Appliquer le filtre de catégorie s'il est présent dans l'URL
      if (categoryParam) {
        setCategoryFilter(categoryParam);
      }
      
      searchResources();
    } else if (query) {
      // Si l'URL ne contient pas de requête mais que le store en a une,
      // mettre à jour l'URL avec le filtre de catégorie actif
      let url = `/search?q=${encodeURIComponent(query)}`;
      
      if (categoryFilter) {
        url += `&category=${categoryFilter}`;
      }
      
      navigate(url, { replace: true });
    } else {
      // Si ni l'URL ni le store n'ont de requête, rediriger vers le feed
      navigate('/feed');
    }

    // Nettoyer les résultats lors du démontage du composant
    return () => {
      clearResults();
    };
  }, [location.search]);

  // Mettre à jour l'URL lorsque le filtre de catégorie change
  useEffect(() => {
    if (query && hasSearched) {
      let url = `/search?q=${encodeURIComponent(query)}`;
      
      if (categoryFilter) {
        url += `&category=${categoryFilter}`;
      }
      
      navigate(url, { replace: true });
    }
  }, [categoryFilter]);

  // Obtenir les résultats filtrés
  const filteredResults = getFilteredResults();

  // Extraire les catégories uniques des résultats
  const uniqueCategories = [...new Map(
    results
      .filter(r => r.category)
      .map(r => [r.category?._id, r.category])
  ).values()];

  // Gérer la suppression des filtres
  const clearFilters = () => {
    setCategoryFilter(null);
  };

  return (
    <MainLayout showSidebars={true} onOpenPostModal={() => {}}>
      <div className="max-w-4xl mx-auto">
        {/* Titre de la page et bouton de filtres */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            {hasSearched ? `Résultats pour "${query}"` : 'Recherche'}
          </h1>
          
          {results.length > 0 && (
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-1 text-sm text-gray-600 hover:text-primary"
            >
              <Filter className="h-4 w-4" />
              <span>{showFilters ? 'Masquer les filtres' : 'Filtrer les résultats'}</span>
            </button>
          )}
        </div>
        
        {/* Section des filtres */}
        {showFilters && results.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold">Filtres</h2>
              {categoryFilter && (
                <button 
                  onClick={clearFilters}
                  className="text-xs text-gray-500 hover:text-primary flex items-center"
                >
                  <X className="h-3 w-3 mr-1" />
                  Effacer tous les filtres
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Filtre par catégorie */}
              {uniqueCategories.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Catégorie
                  </label>
                  <select
                    value={categoryFilter || ''}
                    onChange={(e) => setCategoryFilter(e.target.value || null)}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">Toutes les catégories</option>
                    {uniqueCategories.map((category) => (
                      <option key={category?._id} value={category?._id}>
                        {category?.nom}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            
            {/* Statistiques des résultats */}
            <div className="mt-4 text-sm text-gray-500">
              Affichage de {filteredResults.length} sur {results.length} résultats
            </div>
          </div>
        )}

        {/* Affichage des résultats */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Erreur ! </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        ) : filteredResults.length > 0 ? (
          <div className="space-y-4">
            {filteredResults.map((resource) => (
              <ResourceCard 
                key={resource._id} 
                resource={resource} 
                author={resource.author}
                category={resource.category}
              />
            ))}
          </div>
        ) : hasSearched ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {results.length > 0 
                ? "Aucun résultat ne correspond aux filtres sélectionnés" 
                : "Aucun résultat trouvé"}
            </h3>
            <p className="text-gray-600">
              {results.length > 0 
                ? "Essayez de modifier ou supprimer les filtres pour voir plus de résultats." 
                : "Aucune ressource ne correspond à votre recherche. Essayez avec d'autres termes."}
            </p>
          </div>
        ) : null}
      </div>
    </MainLayout>
  );
};

export default SearchResults;
