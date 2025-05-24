import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import ResourceCard from '../../components/features/ressources/ResourceCard';
import ResourceModal from '../../components/features/ressources/ResourceModal';
import useCategoryStore from '../../store/categoryStore';
import useResourceRandomStore from '../../store/resourceRandomStore';
import useResourcesStore from '../../store/resourcesStore';
import { useToast } from '../../contexts/ToastContext';
import { ArrowLeft, Filter } from 'lucide-react';

const CategoryFeed = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const { showToast } = useToast();
  
  // Stores
  const { categories, fetchCategories, loading: categoriesLoading } = useCategoryStore();
  const { 
    filteredResources, 
    loading: resourcesLoading, 
    setSelectedCategory, 
    fetchRandomResources,
    resetResources 
  } = useResourceRandomStore();
  const { createResource } = useResourcesStore();

  // Trouver la catégorie actuelle
  const currentCategory = categories.find(cat => cat._id === categoryId);

  // Charger les données nécessaires
  useEffect(() => {
    if (categoryId) {
      // Charger les catégories si elles ne sont pas déjà chargées
      if (categories.length === 0) {
        fetchCategories();
      }
      
      // Réinitialiser les ressources et définir le filtre de catégorie
      resetResources();
      setSelectedCategory(categoryId);
      
      // Charger quelques ressources initiales
      for (let i = 0; i < 5; i++) {
        fetchRandomResources();
      }
    }
  }, [categoryId, categories.length]);

  // Fonction pour charger plus de ressources
  const handleLoadMore = () => {
    fetchRandomResources();
  };

  // Gestion de la création d'une ressource
  const handleCreateResource = async (data: { titre: string, contenu: string, id_categorie?: string }) => {
    try {
      // Utiliser la catégorie actuelle si aucune catégorie n'est spécifiée
      const resourceData = {
        ...data,
        id_categorie: data.id_categorie || categoryId
      };
      
      const result = await createResource(resourceData);
      
      showToast(
        'Votre ressource a été créée avec succès et est en attente de validation par un modérateur.',
        'success'
      );
      
      // Recharger les ressources pour afficher la nouvelle ressource
      resetResources();
      setSelectedCategory(categoryId || null);
      for (let i = 0; i < 3; i++) {
        fetchRandomResources();
      }
    } catch (error) {
      console.error('Erreur lors de la création de la ressource:', error);
      showToast(
        'Une erreur est survenue lors de la création de la ressource. Veuillez réessayer.',
        'error'
      );
    }
  };

  return (
    <MainLayout showSidebars={true} onOpenPostModal={() => setIsResourceModalOpen(true)}>
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

        {/* Titre de la catégorie */}
        <div className="mb-6">
          {categoriesLoading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ) : currentCategory ? (
            <div>
              <div className="flex items-center mb-2">
                <Filter className="h-6 w-6 text-primary mr-2" />
                <h1 className="text-3xl font-bold text-gray-900">{currentCategory.nom}</h1>
              </div>
              {currentCategory.description && (
                <p className="text-gray-600 text-lg">{currentCategory.description}</p>
              )}
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  {filteredResources.length === 0 
                    ? "Aucune ressource trouvée" 
                    : `${filteredResources.length} ressource${filteredResources.length > 1 ? 's' : ''} trouvée${filteredResources.length > 1 ? 's' : ''}`
                  }
                </p>
                <button
                  onClick={() => setIsResourceModalOpen(true)}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors text-sm"
                >
                  Ajouter une ressource
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Catégorie non trouvée</h1>
              <p className="text-gray-600">Cette catégorie n'existe pas ou a été supprimée.</p>
            </div>
          )}
        </div>

        {/* Liste des ressources */}
        {currentCategory && (
          <div className="space-y-6">
            {resourcesLoading && filteredResources.length === 0 ? (
              // Skeleton loader pour le chargement initial
              <div className="space-y-4">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="bg-white rounded-lg p-6 shadow-sm animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                      <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredResources.length > 0 ? (
              <>
                {filteredResources.map((resource) => (
                  <ResourceCard 
                    key={resource._id} 
                    resource={resource} 
                    author={resource.author}
                    category={resource.category}
                  />
                ))}
                
                {/* Bouton pour charger plus de ressources */}
                <div className="text-center py-6">
                  <button
                    onClick={handleLoadMore}
                    disabled={resourcesLoading}
                    className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {resourcesLoading ? 'Chargement...' : 'Charger plus de ressources'}
                  </button>
                </div>
              </>
            ) : (
              // Message quand aucune ressource n'est trouvée
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Filter className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Aucune ressource dans cette catégorie</h3>
                <p className="text-gray-600 mb-6">
                  Soyez le premier à partager une ressource dans cette catégorie !
                </p>
                <button
                  onClick={() => setIsResourceModalOpen(true)}
                  className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Créer la première ressource
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de création de ressource */}
      <ResourceModal 
        isOpen={isResourceModalOpen}
        onClose={() => setIsResourceModalOpen(false)}
        mode="create"
        onSubmit={handleCreateResource}
        initialData={{ 
          titre: '', 
          contenu: '', 
          id_categorie: categoryId || '' 
        }}
      />
    </MainLayout>
  );
};

export default CategoryFeed; 