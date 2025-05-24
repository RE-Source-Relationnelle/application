import { useState, useEffect } from 'react'
import { useSearchParams, useLocation } from 'react-router-dom'
import MainLayout from '../components/layout/MainLayout'
import ResourceModal from '../components/features/ressources/ResourceModal'
import useAuthStore from '../store/authStore'
import useResourceRandomStore from '../store/resourceRandomStore'
import useCategoryResourcesStore from '../store/categoryResourcesStore'
import useCategoryStore from '../store/categoryStore'
import ResourceCard from '../components/features/ressources/ResourceCard'
import useResourcesStore from '../store/resourcesStore'

const Feed = () => {
    const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const { user, fetchUserRole } = useAuthStore();
    const { createResource } = useResourcesStore();
    const { categories, fetchCategories } = useCategoryStore();
    
    // Obtenir l'ID de catégorie depuis les paramètres URL
    const categoryId = searchParams.get('category');
    
    // Utiliser le store approprié selon s'il y a un filtre de catégorie ou non
    const randomStore = useResourceRandomStore();
    const categoryStore = useCategoryResourcesStore();
    
    // Déterminer quel store utiliser
    const isFilteredByCategory = !!categoryId;
    const activeStore = isFilteredByCategory ? categoryStore : randomStore;
    
    const { 
        filteredResources, 
        loading, 
        error, 
        hasMore
    } = activeStore;

    // Obtenir le nom de la catégorie pour l'affichage
    const currentCategory = categories.find(cat => cat._id === categoryId);

    useEffect(() => {
        if (!user?.role) {
            fetchUserRole();
        }
        
        // Charger les catégories pour obtenir les noms
        fetchCategories();
        
        if (isFilteredByCategory) {
            // Mode catégorie : charger toutes les ressources et filtrer
            categoryStore.fetchAllResources();
            categoryStore.setSelectedCategory(categoryId);
        } else {
            // Mode normal : utiliser les ressources aléatoires
            randomStore.loadInitialResources(5);
        }
        
        // Nettoyage lors du démontage du composant
        return () => {
            if (isFilteredByCategory) {
                categoryStore.resetResources();
            } else {
                randomStore.resetResources();
            }
        };
    }, [categoryId, isFilteredByCategory]);

    // Gestion du scroll infini seulement pour le feed normal (pas filtré)
    useEffect(() => {
        if (isFilteredByCategory) return; // Pas de scroll infini pour les catégories
        
        const handleScroll = () => {
            const position = window.innerHeight + window.scrollY;
            const pageHeight = document.body.offsetHeight;

            if (position >= pageHeight - 100) {
                randomStore.fetchRandomResources();
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [hasMore, isFilteredByCategory]);

    const handleResourceSubmit = async (data: { titre: string, contenu: string, id_categorie?: string }) => {
        try {
            await createResource(data);
            setIsResourceModalOpen(false);
        } catch (error) {
            console.error('Erreur lors de la création de la ressource:', error);
        }
    };

    const openResourceModal = () => setIsResourceModalOpen(true);
    const closeResourceModal = () => setIsResourceModalOpen(false);

    return (
        <>
            <MainLayout onOpenPostModal={openResourceModal} showSidebars={true}>
                <div className="w-full mx-auto space-y-4 sm:px-0">
                    <div className="bg-white rounded-lg ring-gray-200 ring-1 p-3 sm:p-4 hidden sm:block">
                        <div className="flex items-center space-x-2 sm:space-x-3 mb-3">
                            <div
                                onClick={openResourceModal}
                                className="flex-1 py-2.5 px-3 bg-gray-100 hover:bg-gray-200 rounded-full text-sm sm:text-base text-gray-500 cursor-pointer"
                            >
                                Commencer un post
                            </div>
                        </div>
                    </div>

                    {/* En-tête avec titre de catégorie si filtré */}
                    {isFilteredByCategory && (
                        <div className="bg-white rounded-lg ring-gray-200 ring-1 p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-800">
                                        {currentCategory ? currentCategory.nom : 'Catégorie'}
                                    </h2>
                                    {currentCategory?.description && (
                                        <p className="text-gray-600 mt-1">{currentCategory.description}</p>
                                    )}
                                </div>
                                <div className="text-sm text-gray-500">
                                    {filteredResources.length} ressource{filteredResources.length !== 1 ? 's' : ''}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="hidden lg:flex items-center space-x-2 px-1 my-4">
                        <div className="flex-1 h-px bg-gray-300"></div>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                            {isFilteredByCategory ? 'Ressources de la catégorie' : 'Publications récentes'}
                        </span>
                        <div className="flex-1 h-px bg-gray-300"></div>
                    </div>

                    <div className="space-y-4">
                        {loading && filteredResources.length === 0 ? (
                            <div className="flex justify-center items-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                            </div>
                        ) : error ? (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                                <strong className="font-bold">Erreur ! </strong>
                                <span className="block sm:inline">{error}</span>
                            </div>
                        ) : filteredResources.length === 0 && !loading ? (
                            <div className="text-center py-6 px-6 bg-white rounded-lg ring-gray-200 ring-1">
                                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 shadow-sm">
                                    <h3 className="text-lg font-medium text-gray-700 mb-2">
                                        {isFilteredByCategory ? 'Aucune ressource dans cette catégorie' : 'Aucune ressource disponible'}
                                    </h3>
                                    <p className="text-gray-500 mb-4">
                                        {isFilteredByCategory 
                                            ? 'Il n\'y a pas encore de ressources dans cette catégorie. Revenez plus tard ou explorez d\'autres catégories.'
                                            : 'Revenez plus tard pour découvrir de nouveaux contenus.'
                                        }
                                    </p>
                                </div>
                            </div>
                        ) : (
                            filteredResources.map((resource, index) => (
                                <ResourceCard 
                                    key={resource._id || index}
                                    resource={resource}
                                    author={resource.author}
                                    category={resource.category}
                                />
                            ))
                        )}

                        {loading && filteredResources.length > 0 && (
                            <div className="flex justify-center items-center py-6">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        )}

                        {!loading && !isFilteredByCategory && (!hasMore || filteredResources.length === 0) && filteredResources.length > 0 && (
                            <div className="text-center py-6 px-6 bg-white rounded-lg ring-gray-200 ring-1">
                                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 shadow-sm">
                                    <h3 className="text-lg font-medium text-gray-700 mb-2">Vous avez consulté toutes les dernières ressources</h3>
                                    <p className="text-gray-500 mb-4">Revenez plus tard pour découvrir de nouveaux contenus ou explorez d'autres catégories</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </MainLayout>

            <ResourceModal 
                isOpen={isResourceModalOpen}
                onClose={closeResourceModal}
                onSubmit={handleResourceSubmit}
                mode="create"
            />
        </>
    );
};

export default Feed;
