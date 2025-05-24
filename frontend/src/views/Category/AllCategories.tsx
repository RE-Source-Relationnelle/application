import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import useCategoryStore from '../../store/categoryStore';
import { ArrowLeft, Filter, FileText } from 'lucide-react';

const AllCategories = () => {
  const navigate = useNavigate();
  const { categories, fetchCategories, loading } = useCategoryStore();

  // Charger les catégories au montage du composant
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return (
    <MainLayout showSidebars={true} onOpenPostModal={() => {}}>
      <div className="max-w-4xl mx-auto px-4 pb-6">
        {/* En-tête avec bouton retour */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/feed')}
            className="flex items-center text-gray-600 hover:text-primary transition-colors mr-4"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Retour au feed
          </button>
        </div>

        {/* Titre de la page */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Filter className="h-8 w-8 text-primary mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Toutes les catégories</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Découvrez toutes les catégories de ressources disponibles et explorez les contenus qui vous intéressent.
          </p>
        </div>

        {/* Liste des catégories */}
        <div className="space-y-4">
          {loading ? (
            // Skeleton loader
            <div className="space-y-4">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg p-6 shadow-sm animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="h-6 bg-gray-200 rounded w-1/3 mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="ml-4">
                      <div className="h-10 w-24 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : categories.length > 0 ? (
            <>
              <div className="mb-4 text-sm text-gray-500">
                {categories.length} catégorie{categories.length > 1 ? 's' : ''} disponible{categories.length > 1 ? 's' : ''}
              </div>
              
              {categories.map((category) => (
                <Link
                  key={category._id}
                  to={`/categories/${category._id}`}
                  className="block bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-primary/20"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h2 className="text-xl font-semibold text-gray-900 group-hover:text-primary transition-colors">
                          {category.nom}
                        </h2>
                      </div>
                      
                      {category.description ? (
                        <p className="text-gray-600 mb-3 line-clamp-2">
                          {category.description}
                        </p>
                      ) : (
                        <p className="text-gray-400 italic mb-3">
                          Aucune description disponible
                        </p>
                      )}
                      
                      <div className="flex items-center text-sm text-gray-500">
                        <FileText className="h-4 w-4 mr-1" />
                        <span>
                          {category.resourceCount || 0} ressource{(category.resourceCount || 0) > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    
                    <div className="ml-6 flex-shrink-0">
                      <div className="bg-primary/10 text-primary px-4 py-2 rounded-lg font-medium hover:bg-primary hover:text-white transition-colors">
                        Explorer
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </>
          ) : (
            // Message quand aucune catégorie n'est trouvée
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Filter className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Aucune catégorie disponible</h3>
              <p className="text-gray-600 mb-6">
                Il n'y a actuellement aucune catégorie configurée dans le système.
              </p>
            </div>
          )}
        </div>

        {/* Section d'information supplémentaire */}
        {categories.length > 0 && !loading && (
          <div className="mt-12 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Comment utiliser les catégories ?
            </h3>
            <div className="text-gray-600 space-y-2">
              <p>• Cliquez sur une catégorie pour voir toutes les ressources qu'elle contient</p>
              <p>• Utilisez les catégories pour trouver rapidement des ressources sur des sujets spécifiques</p>
              <p>• Lorsque vous créez une nouvelle ressource, n'oubliez pas de la classer dans la bonne catégorie</p>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default AllCategories; 