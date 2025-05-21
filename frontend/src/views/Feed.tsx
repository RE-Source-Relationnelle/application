import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import MainLayout from '../components/layout/MainLayout'
import PostModal from '../components/features/PostModal'
import useAuthStore from '../store/authStore'
import { Resource } from '../types/types'
import axios from 'axios'

const Feed = () => {
    const [isPostModalOpen, setIsPostModalOpen] = useState(false)
    const { user, fetchUserRole } = useAuthStore()
    const [resources, setResources] = useState<Resource[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [viewedResources, setViewedResources] = useState<string[]>([])
    const navigate = useNavigate()

    useEffect(() => {
        // Récupérer le rôle de l'utilisateur si nécessaire
        if (!user?.role) {
            fetchUserRole().then(() => {
                console.log('Rôle récupéré dans Feed')
            })
        }
        
        // Charger les ressources aléatoires
        const fetchRandomResources = async () => {
            try {
                setLoading(true);
                const resourcesPromises = Array(3).fill(null).map(() => 
                    axios.get('http://localhost:5001/resources/randomressource', {
                        withCredentials: true,
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        }
                    })
                );

                const responses = await Promise.all(resourcesPromises);
                const newResources = responses
                    .map(response => response.data)
                    .filter(resource => resource && !resource.message); // Filtrer les réponses "plus de ressources"

                setResources(newResources);
                setError(null);
            } catch (err: any) {
                console.error('Erreur lors de la récupération des ressources:', err);
                if (err.response) {
                    setError(err.response.data?.error || 'Erreur lors de la récupération des ressources');
                } else if (err.request) {
                    setError('Impossible de se connecter au serveur. Veuillez vérifier que le serveur est en cours d\'exécution.');
                } else {
                    setError('Une erreur est survenue lors de la récupération des ressources');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchRandomResources();
    }, [user, fetchUserRole]);

    // Ajouter les ressources vues à l'historique lors de l'actualisation de la page
    useEffect(() => {
        const addViewedResourcesToHistory = async () => {
            for (const resourceId of viewedResources) {
                try {
                    await axios.post(`http://localhost:5001/resources/add_to_history/${resourceId}`, {}, {
                        withCredentials: true,
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        }
                    });
                } catch (err) {
                    console.error(`Erreur lors de l'ajout de la ressource ${resourceId} à l'historique:`, err);
                }
            }
        };

        if (viewedResources.length > 0) {
            addViewedResourcesToHistory();
        }
    }, [viewedResources]);

    const handlePostSubmit = (content: string) => {
        if (content.trim()) {
            // TODO: Implémenter l'envoi du post à l'API
            console.log('Nouveau post:', content)
        }
    }

    const openPostModal = () => {
        setIsPostModalOpen(true);
    }

    const closePostModal = () => {
        setIsPostModalOpen(false);
    }

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

    const handleResourceClick = (resourceId: string) => {
        // Ajouter la ressource à la liste des ressources vues
        setViewedResources(prev => [...prev, resourceId]);
        // Naviguer vers la page de détails
        navigate(`/feed/ResourceDetail/${resourceId}`);
    };

    // Fonction pour obtenir les initiales de l'utilisateur
    const getUserInitials = (name: string) => {
        if (!name) return '?';
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Fonction pour générer une couleur de fond basée sur le nom
    const getBackgroundColor = (name: string) => {
        if (!name) return '#E5E7EB';
        const colors = [
            '#F87171', // rouge
            '#60A5FA', // bleu
            '#34D399', // vert
            '#FBBF24', // jaune
            '#A78BFA', // violet
            '#F472B6', // rose
            '#4ADE80', // vert clair
            '#FB923C', // orange
        ];
        const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return colors[index % colors.length];
    };

    return (
        <>
            <MainLayout onOpenPostModal={openPostModal} showSidebars={true}>
                <div className="w-full mx-auto space-y-4 sm:px-0">
                    {/* Création de post (visible uniquement sur desktop) */}
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

                    {/* Séparateur */}
                    <div className="hidden lg:flex items-center space-x-2 px-1 my-4">
                        <div className="flex-1 h-px bg-gray-300"></div>
                        <span className="text-xs text-gray-500 whitespace-nowrap">Publications récentes</span>
                        <div className="flex-1 h-px bg-gray-300"></div>
                    </div>

                    {/* Feed dynamique */}
                    {loading ? (
                        <div className="flex justify-center items-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                            <strong className="font-bold">Erreur ! </strong>
                            <span className="block sm:inline">{error}</span>
                        </div>
                    ) : resources.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            Aucune ressource disponible pour le moment.
                        </div>
                    ) : (
                        resources.map((resource: Resource) => (
                            <div 
                                key={resource._id} 
                                className="bg-white rounded-lg ring-gray-200 ring-1 sm:rounded-lg w-full cursor-pointer hover:ring-2 hover:ring-gray-300 transition-all"
                            >
                                {/* En-tête du post */}
                                <div 
                                    className="p-3 px-4 sm:p-4 cursor-pointer"
                                    onClick={() => handleResourceClick(resource._id)}
                                >
                                    <div className="flex items-start">
                                        <div 
                                            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg mr-2 sm:mr-3"
                                            style={{ backgroundColor: getBackgroundColor(user?.nom || '') }}
                                        >
                                            {getUserInitials(user?.nom || '')}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-sm sm:text-base">{user?.nom || 'Anonyme'}</h3>
                                            <p className="text-xs text-gray-500">{user?.role?.nom_role || 'Utilisateur'}</p>
                                            <p className="text-xs text-gray-500 flex items-center">
                                                <span>{formatDate(resource.createdAt)}</span>
                                                <span className="mx-1">•</span>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </p>
                                        </div>
                                        <button 
                                            className="text-gray-500 hover:text-gray-700"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                // TODO: Implémenter les actions du menu
                                            }}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Contenu du post */}
                                <div 
                                    className="px-4 sm:px-4 pb-2 cursor-pointer"
                                    onClick={() => handleResourceClick(resource._id)}
                                >
                                    <h2 className="text-lg font-semibold mb-2">{resource.titre}</h2>
                                    <div 
                                        className="text-sm sm:text-base mb-3 prose prose-sm max-w-none"
                                        dangerouslySetInnerHTML={{ __html: resource.contenu }}
                                    />
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
                                            // TODO: Implémenter la fonctionnalité "J'aime"
                                        }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                        </svg>
                                        <span className="text-sm">J'aime</span>
                                    </button>
                                    <button 
                                        className="flex-1 flex items-center justify-center space-x-1 py-2 text-gray-500 hover:bg-gray-100 rounded-md"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            // TODO: Implémenter la fonctionnalité de commentaire
                                        }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                        </svg>
                                        <span className="text-sm">Commenter</span>
                                    </button>
                                    <button 
                                        className="flex-1 flex items-center justify-center space-x-1 py-2 text-gray-500 hover:bg-gray-100 rounded-md"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            // TODO: Implémenter la fonctionnalité de partage
                                        }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                        </svg>
                                        <span className="text-sm">Partager</span>
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </MainLayout>
            
            {/* Modal de création de post */}
            <PostModal 
                isOpen={isPostModalOpen} 
                onClose={closePostModal} 
                onSubmit={handlePostSubmit} 
            />
        </>
    )
}

export default Feed