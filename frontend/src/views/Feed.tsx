import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

import MainLayout from '../components/layout/MainLayout'
import PostModal from '../components/features/PostModal'

import useAuthStore from '../store/authStore'

import { Resource } from '../types/types'

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

const getUserInitials = (name: string) => {
    if (!name) return '?';
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

const getBackgroundColor = (name: string) => {
    if (!name) return '#E5E7EB';
    const colors = ['#F87171', '#60A5FA', '#34D399', '#FBBF24', '#A78BFA', '#F472B6', '#4ADE80', '#FB923C'];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
}

const Feed = () => {
    const [isPostModalOpen, setIsPostModalOpen] = useState(false)
    const { user, fetchUserRole } = useAuthStore()
    const [resources, setResources] = useState<Resource[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [hasMore, setHasMore] = useState(true)
    const navigate = useNavigate()
    const isFetchingRef = useRef(false)

    const loadInitialResources = (count: number) => {
        let loaded = 0;
        const loadNext = () => {
            if (loaded < count) {
                fetchRandomResources(() => {
                    loaded++;
                    loadNext();
                });
            }
        };
        loadNext();
    };

    const fetchRandomResources = async (callback?: () => void) => {
        if (!hasMore || isFetchingRef.current) return;

        isFetchingRef.current = true;
        setLoading(true);

        try {
            const response = await axios.get('http://localhost:5001/resources/randomressource', {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            const newResources = Array.isArray(response.data) ? response.data : [response.data];
            if (newResources.length > 0 && !newResources[0].message) {
                setResources(prev => [...prev, ...newResources]);
            } else {
                setHasMore(false);
            }
            setError(null);
        } catch (err: any) {
            console.error('Erreur lors de la récupération des ressources:', err);
            if (err.response) {
                setError(err.response.data?.error || 'Erreur lors de la récupération des ressources');
            } else if (err.request) {
                setError('Impossible de se connecter au serveur.');
            } else {
                setError('Une erreur est survenue.');
            }
        } finally {
            setLoading(false);
            isFetchingRef.current = false;
            if (callback) callback();
        }
    };

    useEffect(() => {
        if (!user?.role) {
            fetchUserRole();
        }
        loadInitialResources(5);
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

    const handleResourceClick = (id: string) => navigate(`/feed/ResourceDetail/${id}`);
    const openPostModal = () => setIsPostModalOpen(true);
    const closePostModal = () => setIsPostModalOpen(false);

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

                    {resources.map((resource, index) => (
                        <div
                            key={resource._id || index}
                            className="bg-white rounded-lg ring-gray-200 ring-1 sm:rounded-lg w-full cursor-pointer hover:ring-2 hover:ring-gray-300 transition-all"
                            onClick={() => handleResourceClick(resource._id)}
                        >
                            <div className="p-4">
                                <div className="flex items-start">
                                    <div
                                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg mr-3"
                                        style={{ backgroundColor: getBackgroundColor(user?.nom || '') }}
                                    >
                                        {getUserInitials(user?.nom || '')}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-sm sm:text-base">{user?.nom || 'Anonyme'}</h3>
                                        <p className="text-xs text-gray-500">{user?.role?.nom_role || 'Utilisateur'}</p>
                                        <p className="text-xs text-gray-500">{formatDate(resource.createdAt)}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="px-4 pb-2">
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
                        </div>
                    ))}

                    {loading && (
                        <div className="flex justify-center items-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                            <strong className="font-bold">Erreur ! </strong>
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}

                    {!hasMore && !loading && (
                        <div className="text-center py-8 text-gray-500">
                            Plus de ressources disponibles.
                        </div>
                    )}
                </div>
            </MainLayout>

            <PostModal isOpen={isPostModalOpen} onClose={closePostModal} onSubmit={handlePostSubmit} />
        </>
    );
};

export default Feed;

