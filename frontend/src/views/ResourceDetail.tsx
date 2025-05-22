import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import useAuthStore from '../store/authStore';
import { Resource, Comment } from '../types/types';
import axios from 'axios';

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

    const formatDate = (dateObj: { $date: string } | string | undefined) => {
        console.log('Formatting date input (raw):', JSON.stringify(dateObj));
        console.log('Type of date input:', typeof dateObj);
        
        if (!dateObj) {
            console.log('Date object is null or undefined');
            return 'À l\'instant';
        }
        
        try {
            // Extraire la date du format MongoDB
            let dateString: string;
            if (typeof dateObj === 'object' && dateObj !== null) {
                console.log('Date is an object:', JSON.stringify(dateObj));
                if ('$date' in dateObj) {
                    dateString = dateObj.$date;
                    console.log('Extracted $date:', dateString);
                } else {
                    console.log('No $date property found in object');
                    return 'À l\'instant';
                }
            } else {
                dateString = dateObj as string;
                console.log('Date is a string:', dateString);
            }

            // Gérer le format ISO avec fuseau horaire
            const date = new Date(dateString);
            console.log('Parsed date:', date.toISOString());
            
            if (isNaN(date.getTime())) {
                console.error('Invalid date:', dateString);
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
            console.error('Erreur lors du formatage de la date:', error);
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

            console.log('Envoi du commentaire avec le token...');
            console.log('URL:', `http://localhost:5001/resources/comments/${id}`);
            console.log('Données envoyées:', { content: newComment });
            
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

            console.log('Réponse complète du serveur:', response.data);
            console.log('Status:', response.status);
            console.log('Headers:', response.headers);

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
        </MainLayout>
    );
};

export default ResourceDetail;

