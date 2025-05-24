import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import useCategoryStore from '../../store/categoryStore';
import { ArrowLeft, Filter, FileText, ChevronRight } from 'lucide-react';

const AllCategories = () => {
  const navigate = useNavigate();
  const { categories, fetchCategories, loading } = useCategoryStore();

  // Charger les catégories au montage du composant
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return (
    <MainLayout showSidebars={true} onOpenPostModal={() => {}}>
      <div className="w-full mx-auto space-y-4 sm:px-0">
        {/* En-tête avec bouton retour */}
        <div className="bg-white rounded-lg ring-gray-200 ring-1 p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/feed')}
              className="flex items-center text-gray-600 hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Retour au feed
            </button>
          </div>
        </div>

        {/* Titre de la page */}
        <div className="bg-white rounded-lg ring-gray-200 ring-1 p-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mr-4 shadow-lg">
              <Filter className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Toutes les catégories</h1>
              <p className="text-gray-600 text-lg mt-1">
                Explorez nos différentes catégories de ressources
              </p>
            </div>
          </div>
          {!loading && (
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                {categories.length} catégorie{categories.length !== 1 ? 's' : ''} disponible{categories.length !== 1 ? 's' : ''}
              </p>
              <div className="text-xs text-gray-400">
                Cliquez sur une catégorie pour explorer son contenu
              </div>
            </div>
          )}
        </div>

        {/* Séparateur comme dans le feed */}
        <div className="hidden lg:flex items-center space-x-2 px-1 my-4">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="text-xs text-gray-500 whitespace-nowrap">Catégories disponibles</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        {/* Liste des catégories */}
        <div className="space-y-4">
          {loading ? (
            // Skeleton loader pour le chargement
            <div className="space-y-4">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg p-6 shadow-sm ring-1 ring-gray-200 animate-pulse">
                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-xl mr-4"></div>
                    <div className="flex-1">
                      <div className="h-6 bg-gray-200 rounded w-1/3 mb-3"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : categories.length > 0 ? (
            categories.map((category) => (
              <Link
                key={category._id}
                to={`/categories/${category._id}`}
                className="group block bg-white rounded-lg ring-gray-200 ring-1 p-6 hover:ring-2 hover:ring-primary/30 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-center">
                  {/* Icône de catégorie */}
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center mr-6 group-hover:from-primary/20 group-hover:to-primary/30 transition-all duration-200 shadow-sm">
                    <FileText className="h-8 w-8 text-primary" />
                  </div>
                  
                  {/* Contenu de la catégorie */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary transition-colors">
                        {category.nom}
                      </h3>
                      <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
                    </div>
                    
                    {category.description && (
                      <p className="text-gray-600 text-base line-clamp-2 mb-3 leading-relaxed">
                        {category.description}
                      </p>
                    )}
                    
                    <div className="flex items-center text-sm text-primary opacity-0 group-hover:opacity-100 transition-all duration-200">
                      <span className="font-medium">Explorer cette catégorie</span>
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            // Message quand aucune catégorie n'est trouvée
            <div className="text-center py-12 px-6 bg-white rounded-lg ring-gray-200 ring-1">
              <div className="bg-gray-50 rounded-lg p-8 border border-gray-200 shadow-sm">
                <div className="text-gray-300 mb-6">
                  <Filter className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-700">Aucune catégorie disponible</h3>
                <p className="text-gray-500 mb-6">
                  Il n'y a pas encore de catégories créées. Les administrateurs peuvent en ajouter depuis le panneau d'administration.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Message d'encouragement */}
        {!loading && categories.length > 0 && (
          <div className="text-center py-6 px-6 bg-white rounded-lg ring-gray-200 ring-1">
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Vous ne trouvez pas ce que vous cherchez ?
              </h3>
              <p className="text-gray-500 mb-4">
                N'hésitez pas à contribuer en partageant vos propres ressources dans les catégories existantes.
              </p>
              <Link
                to="/feed"
                className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour au feed principal
              </Link>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default AllCategories; 