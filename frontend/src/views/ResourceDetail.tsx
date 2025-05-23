import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import useAuthStore from '../store/authStore';
import { Resource, Comment } from '../types/types';
import axios from 'axios';

// Composant de notification
const Notification = ({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);

        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg transform transition-all duration-500 ease-in-out ${
            type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
            <div className="flex items-center">
                <span className="mr-2">
                    {type === 'success' ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    )}
                </span>
                <p>{message}</p>
            </div>
        </div>
    );
};

const ResourceDetail = () => {
    const { id } = useParams<{ id: string }>();
    const { id_resource } = useParams<{ id_resource: string }>();
    const navigate = useNavigate();
    const [resource, setResource] = useState<Resource | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newComment, setNewComment] = useState('');
    const { user } = useAuthStore();
    const [comments, setComments] = useState<Comment[]>([]);
    const [loadingComments, setLoadingComments] = useState(false);
    const [commentError, setCommentError] = useState<string | null>(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const [favoriteError, setFavoriteError] = useState<string | null>(null);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

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

    useEffect(() => {
        const fetchResource = async () => {
            if (!id) {
                setError('ID de ressource manquant');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const response = await axios.get(`http://localhost:5001/resources/ressource=${id}`, {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                });

                if (response.data) {
                    console.log('Ressource récupérée:', response.data);
                    setResource(response.data);
                    setError(null);
                } else {
                    setError('Ressource non trouvée');
                }
            } catch (err: any) {
                console.error('Erreur lors de la récupération de la ressource:', err);
                if (err.response) {
                    setError(err.response.data?.error || 'Erreur lors de la récupération de la ressource');
                } else if (err.request) {
                    setError('Impossible de se connecter au serveur. Veuillez vérifier que le serveur est en cours d\'exécution.');
                } else {
                    setError('Une erreur est survenue lors de la récupération de la ressource');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchResource();
    }, [id]);

    // Charger les commentaires quand la ressource est chargée
    useEffect(() => {
        console.log('useEffect resource changed:', resource);
        if (resource) {
            console.log('Fetching comments for resource:', resource._id);
            fetchComments();
        }
    }, [resource]);

    // Fonction pour charger les commentaires
    const fetchComments = async () => {
        try {
            console.log('Fetching comments for resource:', id);
            setLoadingComments(true);
            setCommentError(null);
            const response = await axios.get(`http://localhost:5001/resources/comments/${id}`, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            console.log('Comments response complète:', JSON.stringify(response.data, null, 2));
            // Log pour déboguer les dates
            response.data.forEach((comment: Comment, index: number) => {
                console.log(`Comment ${index}:`, {
                    id: comment._id,
                    date: comment.date_publication || comment.created_at,
                    type: typeof (comment.date_publication || comment.created_at),
                    raw: JSON.stringify(comment.date_publication || comment.created_at)
                });
            });
            setComments(response.data);
        } catch (err: any) {
            console.error('Erreur lors de la récupération des commentaires:', err);
            setCommentError('Impossible de charger les commentaires');
        } finally {
            setLoadingComments(false);
        }
    };

    // Charger les commentaires au chargement du composant
    useEffect(() => {
        console.log('Component mounted, fetching comments');
        fetchComments();
    }, []);

    // Vérifier si la ressource est dans les favoris
    useEffect(() => {
        const checkFavoriteStatus = async () => {
            if (!user || !id) return;

            try {
                const response = await axios.get(`http://localhost:5001/resources/favoris`, {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                });

                const favorites = response.data;
                const isResourceFavorite = favorites.some((fav: any) => fav.id_ressource === id);
                setIsFavorite(isResourceFavorite);
            } catch (err) {
                console.error('Erreur lors de la vérification des favoris:', err);
            }
        };

        checkFavoriteStatus();
    }, [user, id]);

    const formatDate = (dateObj: { $date: string } | string | undefined) => {
        if (!dateObj) {
            return 'À l\'instant';
        }
        
        try {
            // Extraire la date du format MongoDB
            let dateString: string;
            if (typeof dateObj === 'object' && dateObj !== null) {
                if ('$date' in dateObj) {
                    dateString = dateObj.$date;
                } else {
                    return 'À l\'instant';
                }
            } else {
                dateString = dateObj as string;
            }

            // Gérer le format ISO avec fuseau horaire
            const date = new Date(dateString);
            
            if (isNaN(date.getTime())) {
                return 'À l\'instant';
            }

            const now = new Date();
            const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
            
            if (diffInHours < 24) {
                if (diffInHours < 1) {
                    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
                    return `Il y a ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`;
                }
                return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
            } else {
                return date.toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }
        } catch (error) {
            return 'À l\'instant';
        }
    };

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !id) return;

        try {
            // Vérifier si l'utilisateur est connecté
            if (!user) {
                setCommentError('Vous devez être connecté pour commenter');
                return;
            }
            

            const response = await axios.post(`http://localhost:5001/resources/comments/${id}`, 
                { content: newComment },
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                }
            );

            // Ajouter le nouveau commentaire à la liste
            setComments(prev => [response.data, ...prev]);
            setNewComment('');
            setCommentError(null);
        } catch (err: any) {
            console.error('Erreur lors de l\'envoi du commentaire:', err);
            console.error('Status:', err.response?.status);
            console.error('Data:', err.response?.data);
            if (err.response?.status === 401) {
                setCommentError('Vous devez être connecté pour commenter');
            } else {
                setCommentError('Impossible d\'envoyer le commentaire');
            }
        }
    };

    // Fonction pour gérer l'ajout/suppression des favoris
    const handleFavoriteClick = async () => {
        if (!user) {
            setNotification({ message: 'Vous devez être connecté pour ajouter aux favoris', type: 'error' });
            return;
        }

        try {
            // Récupérer le token depuis le store d'authentification
            const token = document.cookie.split('; ').find(row => row.startsWith('access_token='))?.split('=')[1];
            
            if (!token) {
                setNotification({ message: 'Session expirée, veuillez vous reconnecter', type: 'error' });
                return;
            }

            // Utilisation de la route /favorite/<resource_id> pour ajouter un favori
            const response = await axios.post(`http://localhost:5001/resources/favorite/${id}`, {}, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            // Si le favori est créé avec succès (status 201)
            if (response.status === 201) {
                setIsFavorite(true);
                setNotification({ message: 'Ressource ajoutée aux favoris', type: 'success' });
            }
        } catch (err: any) {
            console.error('Erreur lors de l\'ajout aux favoris:', err);
            // Si la ressource est déjà en favoris (status 400)
            if (err.response?.status === 400 && err.response?.data?.error === 'Cette ressource est déjà dans vos favoris') {
                setIsFavorite(true);
                setNotification({ message: 'Cette ressource est déjà dans vos favoris', type: 'success' });
            } else if (err.response?.status === 401) {
                setNotification({ message: 'Session expirée, veuillez vous reconnecter', type: 'error' });
            } else {
                setNotification({ message: 'Impossible d\'ajouter aux favoris', type: 'error' });
            }
        }
    };

    // Fonction pour copier l'URL dans le presse-papier
    const handleShareClick = async () => {
        const url = window.location.href;
        try {
            await navigator.clipboard.writeText(url);
            setNotification({ message: 'Lien copié dans le presse-papier', type: 'success' });
        } catch (err) {
            setNotification({ message: 'Impossible de copier le lien', type: 'error' });
        }
    };

    if (loading) {
        return (
            <MainLayout showSidebars={true} onOpenPostModal={() => {}}>
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
            </MainLayout>
        );
    }

    if (error) {
        return (
            <MainLayout showSidebars={true} onOpenPostModal={() => {}}>
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mx-4 my-4" role="alert">
                    <strong className="font-bold">Erreur ! </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            </MainLayout>
        );
    }

    if (!resource) {
        return (
            <MainLayout showSidebars={true} onOpenPostModal={() => {}}>
                <div className="text-center py-8 text-gray-500">
                    Ressource non trouvée
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout showSidebars={true} onOpenPostModal={() => {}}>
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-white rounded-lg ring-gray-200 ring-1 sm:rounded-lg w-full">
                    {/* En-tête du post */}
                    <div className="p-3 px-4 sm:p-4">
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
                                onClick={() => navigate('/feed')}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    
                    {/* Contenu du post */}
                    <div className="px-4 sm:px-4 pb-2">
                        <h2 className="text-2xl font-semibold mb-4">{resource.titre}</h2>
                        <div 
                            className="text-sm sm:text-base mb-3 prose prose-lg max-w-none"
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
                            className={`flex-1 flex items-center justify-center space-x-1 py-2 ${
                                isFavorite ? 'text-red-500' : 'text-gray-500'
                            } hover:bg-gray-100 rounded-md transition-all duration-300 ease-in-out transform hover:scale-105`}
                            onClick={handleFavoriteClick}
                        >
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                className={`h-5 w-5 transition-all duration-300 ${isFavorite ? 'scale-110' : 'scale-100'}`}
                                fill={isFavorite ? "currentColor" : "none"} 
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                            >
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                                />
                            </svg>
                            <span className="text-sm transition-all duration-300">
                                {isFavorite ? 'Favori' : 'Ajouter aux favoris'}
                            </span>
                        </button>
                        <button 
                            className="flex-1 flex items-center justify-center space-x-1 py-2 text-gray-500 hover:bg-gray-100 rounded-md transition-all duration-300 ease-in-out transform hover:scale-105"
                            onClick={(e) => {
                                e.stopPropagation();
                            }}
                        >
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                className="h-5 w-5 transition-all duration-300 hover:scale-110" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                            </svg>
                            <span className="text-sm transition-all duration-300">Commenter</span>
                        </button>
                        <button 
                            className="flex-1 flex items-center justify-center space-x-1 py-2 text-gray-500 hover:bg-gray-100 rounded-md transition-all duration-300 ease-in-out transform hover:scale-105"
                            onClick={handleShareClick}
                        >
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                className="h-5 w-5 transition-all duration-300 hover:scale-110" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                            <span className="text-sm transition-all duration-300">Partager</span>
                        </button>
                    </div>

                    {/* Section des commentaires */}
                    <div className="px-4 py-4 border-t border-gray-200">
                        <h3 className="text-lg font-semibold mb-4">Commentaires</h3>
                        
                        {/* Formulaire de commentaire */}
                        <form onSubmit={handleCommentSubmit} className="mb-6">
                            <div className="flex items-start space-x-4">
                                <div 
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-base flex-shrink-0"
                                    style={{ backgroundColor: getBackgroundColor(user?.nom || '') }}
                                >
                                    {getUserInitials(user?.nom || '')}
                                </div>
                                <div className="flex-1">
                                    <textarea
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Ajouter un commentaire..."
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        rows={3}
                                    />
                                    <div className="mt-2 flex justify-end">
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                        >
                                            Commenter
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>

                        {/* Liste des commentaires */}
                        {loadingComments ? (
                            <div className="flex justify-center items-center h-32">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                            </div>
                        ) : commentError ? (
                            <div className="text-red-500 text-center py-4">
                                {commentError}
                            </div>
                        ) : comments.length === 0 ? (
                            <div className="text-center text-gray-500 py-4">
                                Aucun commentaire pour le moment
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {comments.map((comment) => (
                                    <div key={comment._id} className="flex space-x-4">
                                        <div 
                                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-base flex-shrink-0"
                                            style={{ backgroundColor: getBackgroundColor(user?.nom || '') }}
                                        >
                                            {getUserInitials(user?.nom || '')}
                                        </div>
                                        <div className="flex-1">
                                            <div className="bg-gray-50 rounded-lg p-3">
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <span className="font-semibold text-sm">{user?.nom || 'Anonyme'}</span>
                                                    <span className="text-xs text-gray-500">{user?.role?.nom_role || 'Utilisateur'}</span>
                                                    <span className="text-xs text-gray-500">•</span>

                                                    <span className="text-xs text-gray-500">
                                                        {formatDate(comment.date_publication || comment.created_at)}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-700">{comment.contenu || comment.content}</p>

                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Notification */}
            {notification && (
                <Notification
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}
        </MainLayout>
    );
};

export default ResourceDetail;

