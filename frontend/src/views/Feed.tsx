import { useState, useEffect } from 'react'
import MainLayout from '../components/layout/MainLayout'
import ResourceModal from '../components/features/ressources/ResourceModal'
import useAuthStore from '../store/authStore'
import useResourceRandomStore from '../store/resourceRandomStore'
import ResourceCard from '../components/features/ressources/ResourceCard'
import useResourcesStore from '../store/resourcesStore'
import useFavoritesStore from '../store/favoritesStore'

const Feed = () => {
    const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
    const { user, fetchUserRole, isAuthenticated } = useAuthStore();
    const { createResource } = useResourcesStore();
    const { fetchFavorites } = useFavoritesStore();
    
    // Utiliser le store pour les ressources aléatoires
    const { 
        resources, 
        loading, 
        error, 
        hasMore,
        loadInitialResources,
        fetchRandomResources
    } = useResourceRandomStore();

    useEffect(() => {
        if (!user?.role) {
            fetchUserRole();
        }
        
        // Charger les favoris si l'utilisateur est connecté
        if (isAuthenticated) {
            fetchFavorites();
        }
        
        loadInitialResources(5);
        
        // Nettoyage lors du démontage du composant
        return () => {
            useResourceRandomStore.getState().resetResources();
        };
    }, [isAuthenticated, fetchFavorites]);

    // Gestion du scroll infini
    useEffect(() => {
        const handleScroll = () => {
            const position = window.innerHeight + window.scrollY;
            const pageHeight = document.body.offsetHeight;

            if (position >= pageHeight - 100) {
                fetchRandomResources();
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [hasMore]);

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

                    <div className="hidden lg:flex items-center space-x-2 px-1 my-4">
                        <div className="flex-1 h-px bg-gray-300"></div>
                        <span className="text-xs text-gray-500 whitespace-nowrap">Publications récentes</span>
                        <div className="flex-1 h-px bg-gray-300"></div>
                    </div>

                    <div className="space-y-4">
                        {loading && resources.length === 0 ? (
                            <div className="flex justify-center items-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                            </div>
                        ) : error ? (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                                <strong className="font-bold">Erreur ! </strong>
                                <span className="block sm:inline">{error}</span>
                            </div>
                        ) : resources.length === 0 && !loading ? (
                            <div className="text-center py-6 px-6 bg-white rounded-lg ring-gray-200 ring-1">
                                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 shadow-sm">
                                    <h3 className="text-lg font-medium text-gray-700 mb-2">
                                        Aucune ressource disponible
                                    </h3>
                                    <p className="text-gray-500 mb-4">
                                        Revenez plus tard pour découvrir de nouveaux contenus.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            resources.map((resource, index) => (
                                <ResourceCard 
                                    key={resource._id || index}
                                    resource={resource}
                                    author={resource.author}
                                    category={resource.category}
                                />
                            ))
                        )}

                        {loading && resources.length > 0 && (
                            <div className="flex justify-center items-center py-6">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        )}

                        {!loading && !hasMore && resources.length > 0 && (
                            <div className="text-center py-6 px-6 bg-white rounded-lg ring-gray-200 ring-1">
                                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 shadow-sm">
                                    <h3 className="text-lg font-medium text-gray-700 mb-2">Vous avez consulté toutes les dernières ressources</h3>
                                    <p className="text-gray-500 mb-4">Revenez plus tard pour découvrir de nouveaux contenus</p>
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
                initialData={{ 
                    titre: '', 
                    contenu: '', 
                    id_categorie: '' 
                }}
            />
        </>
    );
};

export default Feed;
