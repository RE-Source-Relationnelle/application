import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import MainLayout from '../components/layout/MainLayout'
import PostModal from '../components/features/PostModal'
import useAuthStore from '../store/authStore'
import useResourceRandomStore from '../store/resourceRandom'
import { Heart, MessageSquareText, Share2, ChevronDown } from 'lucide-react'

// Fonction pour formater la date
const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 24) {
        return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
    } else {
        return date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }
}

// Fonction pour obtenir les initiales
const getUserInitials = (prenom: string, nom: string) => {
    if (!prenom && !nom) return 'A';
    return (prenom?.charAt(0) || '') + (nom?.charAt(0) || '');
}

// Fonction pour tronquer le contenu HTML
const truncateHTML = (html: string, maxLength: number = 250) => {
    // Créer un élément div temporaire pour parser le HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Obtenir le texte brut
    const text = tempDiv.textContent || tempDiv.innerText || '';
    
    // Vérifier si le texte dépasse la longueur maximale
    if (text.length <= maxLength) {
        return { html, isTruncated: false };
    }
    
    // Tronquer le texte
    const truncatedText = text.substring(0, maxLength) + '...';
    
    return { 
        html: truncatedText, 
        isTruncated: true 
    };
};

const Feed = () => {
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [expandedResources, setExpandedResources] = useState<{ [key: string]: boolean }>({});
    const { user, fetchUserRole } = useAuthStore();
    const navigate = useNavigate();
    
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
        loadInitialResources(5);
        
        // Nettoyage lors du démontage du composant
        return () => {
            useResourceRandomStore.getState().resetResources();
        };
    }, []);

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

    const handlePostSubmit = (content: string) => {
        if (content.trim()) {
            console.log('Nouveau post:', content);
        }
    }

    const handleResourceClick = (id: string) => navigate(`/feed/ressource/${id}`);
    const openPostModal = () => setIsPostModalOpen(true);
    const closePostModal = () => setIsPostModalOpen(false);
    
    const toggleResourceExpand = (resourceId: string, event: React.MouseEvent) => {
        event.stopPropagation();
        setExpandedResources(prev => ({
            ...prev,
            [resourceId]: !prev[resourceId]
        }));
    };

    return (
        <>
            <MainLayout onOpenPostModal={openPostModal} showSidebars={true}>
                <div className="w-full mx-auto space-y-4 sm:px-0">
                    <div className="bg-white rounded-lg ring-gray-200 ring-1 p-3 sm:p-4 hidden sm:block">
                        <div className="flex items-center space-x-2 sm:space-x-3 mb-3">
                            <div
                                onClick={openPostModal}
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

                    {resources.map((resource, index) => {
                        // Tronquer le contenu HTML si nécessaire
                        const isExpanded = expandedResources[resource._id] || false;
                        const { html: truncatedContent, isTruncated } = !isExpanded 
                            ? truncateHTML(resource.contenu) 
                            : { html: resource.contenu, isTruncated: false };
                        
                        return (
                            <div
                                key={resource._id || index}
                                className="bg-white rounded-lg ring-gray-200 ring-1 sm:rounded-lg w-full cursor-pointer hover:ring-2 hover:ring-gray-300 transition-all"
                            >
                                <div className="p-4">
                                    <div className="flex items-start">
                                        <div
                                            className="w-12 h-12 rounded-full flex items-center justify-center bg-primary/20 text-primary font-semibold text-lg mr-3"
                                        >
                                            {resource.author 
                                                ? getUserInitials(resource.author.prenom || '', resource.author.nom || '') 
                                                : 'A'}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-sm sm:text-base">
                                                {resource.author 
                                                    ? `${resource.author.prenom || ''} ${resource.author.nom || ''}` 
                                                    : 'Anonyme'}
                                            </h3>
                                            <p className="text-xs text-gray-500">{formatDate(resource.createdAt)}</p>
                                            {resource.category && (
                                                <p className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full inline-block mt-1">
                                                    {resource.category.nom}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="px-4 pb-2">
                                    <h2 className="text-lg font-semibold mb-2">{resource.titre}</h2>
                                    <div
                                        className="text-sm sm:text-base mb-3 prose prose-sm max-w-none"
                                        dangerouslySetInnerHTML={{ __html: isExpanded ? resource.contenu : truncatedContent }}
                                    />
                                    
                                    {isTruncated && (
                                        <button 
                                            onClick={(e) => toggleResourceExpand(resource._id, e)}
                                            className="text-primary font-medium text-sm flex items-center mb-3 hover:underline"
                                        >
                                            {isExpanded ? 'Voir moins' : 'Voir plus'}
                                            <ChevronDown className={`h-4 w-4 ml-1 ${isExpanded ? 'transform rotate-180' : ''}`} />
                                        </button>
                                    )}
                                    
                                    {resource.approved && (
                                        <div className="text-xs text-green-600 mb-2">
                                            ✓ Ressource validée
                                            {resource.commentaire_validation && (
                                                <p className="text-gray-600 mt-1">
                                                    Commentaire: {resource.commentaire_validation}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                                
                                {/* Actions sur le post */}
                                <div className="px-4 py-1 flex justify-between border-t border-gray-200">
                                    <button 
                                        className="flex-1 flex items-center justify-center space-x-1 py-2 text-gray-500 hover:bg-gray-100 rounded-md"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            console.log('Favoris', resource._id);
                                        }}
                                    >
                                        <Heart className="h-4 w-4" />
                                        <span className="text-sm">Favoris</span>
                                    </button>
                                    <button 
                                        className="flex-1 flex items-center justify-center space-x-1 py-2 text-gray-500 hover:bg-gray-100 rounded-md"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleResourceClick(resource._id);
                                        }}
                                    >
                                        <MessageSquareText className="h-4 w-4" />
                                        <span className="text-sm">Commenter</span>
                                    </button>
                                    <button 
                                        className="flex-1 flex items-center justify-center space-x-1 py-2 text-gray-500 hover:bg-gray-100 rounded-md"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            console.log('Partager', resource._id);
                                        }}
                                    >
                                        <Share2 className="h-4 w-4" />
                                        <span className="text-sm">Partager</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })}

                    {loading && (
                        <div className="flex justify-center p-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            <p>{error}</p>
                            <button
                                onClick={() => fetchRandomResources()}
                                className="mt-2 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-md text-sm font-medium"
                            >
                                Réessayer
                            </button>
                        </div>
                    )}

                    {!hasMore && resources.length > 0 && (
                        <div className="text-center py-6 text-gray-500">
                            Vous avez atteint la fin des publications disponibles.
                        </div>
                    )}
                </div>
            </MainLayout>

            <PostModal
                isOpen={isPostModalOpen}
                onClose={closePostModal}
                onSubmit={handlePostSubmit}
            />
        </>
    )
}

export default Feed;
