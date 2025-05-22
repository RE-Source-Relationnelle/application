import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import useAuthStore from '../store/authStore';
import useResourceDetailsStore from '../store/resourceDetailsStore';
import { Heart, Share2, MessageSquareText } from 'lucide-react';

const ResourceDetail = () => {
    const { id } = useParams<{ id: string }>();
    const [newComment, setNewComment] = useState('');
    const { user } = useAuthStore();
    
    // Utiliser le store pour les détails de la ressource et les commentaires
    const { 
        resource, 
        comments, 
        loading, 
        loadingComments, 
        error, 
        commentError,
        fetchResource,
        fetchComments,
        addComment,
        resetState
    } = useResourceDetailsStore();

    // Charger la ressource si l'ID est disponible
    useEffect(() => {
        if (id) {
            fetchResource(id);
        }
        
        return () => {
            resetState();
        };
    }, [id, fetchResource, resetState]);

    // Charger les commentaires quand la ressource est chargée
    useEffect(() => {
        if (resource && id) {
            fetchComments(id);
        }
    }, [resource, id, fetchComments]);

    // Formater la date pour l'affichage
    const formatDate = (dateValue: string | { $date: string } | undefined) => {
        if (!dateValue) return 'Date inconnue';
        
        let dateString: string;
        if (typeof dateValue === 'object' && '$date' in dateValue) {
            dateString = dateValue.$date;
        } else {
            dateString = dateValue as string;
        }
        
        const date = new Date(dateString);
        
        if (isNaN(date.getTime())) {
            return 'Date invalide';
        }
        
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
        
        if (diffInHours < 24) {
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
    };

    // Gestion de soumission du commentaire
    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        
        if (!user) {
            return;
        }
        
        const result = await addComment(id || '', newComment);
        
        if (result) {
            setNewComment('');
        }
    };

    // Gestion de chargement
    if (loading) {
        return (
            <MainLayout showSidebars={true} onOpenPostModal={() => {}}>
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
            </MainLayout>
        );
    }

    // Gestion d'erreur
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

    // Gestion de ressource non trouvée
    if (!resource) {
        return (
            <MainLayout showSidebars={true} onOpenPostModal={() => {}}>
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded relative mx-4 my-4" role="alert">
                    <strong className="font-bold">Attention ! </strong>
                    <span className="block sm:inline">Ressource non trouvée.</span>
                </div>
            </MainLayout>
        );
    }

    // Affichage du post
    return (
        <MainLayout showSidebars={true} onOpenPostModal={() => {}}>
            <div className="max-w-4xl mx-auto px-4 pb-4">
                <div className="bg-white rounded-lg ring-gray-200 ring-1 sm:rounded-lg w-full">
                    {/* En-tête du post */}
                    <div className="p-3 px-4 sm:p-4">
                        <div className="flex items-start">
                            <div 
                                className="w-12 h-12 rounded-full flex items-center justify-center bg-primary/20 text-primary font-semibold text-lg mr-2 sm:mr-3"
                            >
                                {user?.prenom?.charAt(0) || user?.username?.charAt(0) || "U"}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-sm sm:text-base">{user?.prenom} {user?.nom}</h3>
                                <p className="text-xs text-gray-500 flex items-center">
                                    <span>{formatDate(resource.createdAt)}</span>
                                    <span className="mx-1">•</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Contenu du post */}
                    <div className="px-4 sm:px-4 pb-2">
                        <h2 className="text-2xl font-semibold mb-4">{resource.titre}</h2>
                        <div 
                            className="text-sm sm:text-base mb-3 prose prose-lg max-w-none"
                        >
                            {resource.contenu}
                        </div>
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
                        >
                            <Heart className="h-4 w-4" />
                            <span className="text-sm">Favoris</span>
                        </button>
                        <button 
                            className="flex-1 flex items-center justify-center space-x-1 py-2 text-gray-500 hover:bg-gray-100 rounded-md"
                        >
                            <MessageSquareText className="h-4 w-4" />
                            <span className="text-sm">Commenter</span>
                        </button>
                        <button 
                            className="flex-1 flex items-center justify-center space-x-1 py-2 text-gray-500 hover:bg-gray-100 rounded-md"
                        >
                            <Share2 className="h-4 w-4" />
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
                                    className="w-10 h-10 rounded-full flex items-center justify-center bg-primary/20 text-primary font-semibold text-base flex-shrink-0"
                                >
                                    {user?.prenom?.charAt(0) || user?.username?.charAt(0) || "U"}
                                </div>
                                <div className="flex-1 ring-1 ring-gray-200 rounded-md">
                                    <textarea
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Ajouter un commentaire..."
                                        className="w-full p-3 focus:outline-none bg-transparent"
                                        rows={3}
                                    />
                                    <div className="mt-2 flex justify-end pr-2 pb-2">
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                            disabled={!newComment.trim()}
                                        >
                                            Commenter
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            {commentError && (
                                <div className="mt-2 text-red-500 text-sm">
                                    {commentError}
                                </div>
                            )}
                        </form>

                        {/* Liste des commentaires */}
                        {loadingComments ? (
                            <div className="flex justify-center items-center h-32">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                            </div>
                        ) : comments.length === 0 ? (
                            <div className="text-center text-gray-500 py-4">
                                Aucun commentaire pour le moment
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {comments.map((comment) => {
                                    const prenom = comment.prenom_utilisateur || (comment.id_user === user?.id ? user?.prenom : '');
                                    const nom = comment.nom_utilisateur || (comment.id_user === user?.id ? user?.nom : 'Anonyme');
                                    
                                    return (
                                        <div key={comment._id} className="flex space-x-4">
                                            <div 
                                                className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-semibold text-base flex-shrink-0"
                                            >
                                                {prenom?.charAt(0) || "?"}
                                            </div>
                                            <div className="flex-1">
                                                <div className="bg-gray-50 rounded-lg p-3">
                                                    <div className="flex items-center space-x-2 mb-1">
                                                        <span className="font-semibold text-sm">{prenom} {nom}</span>
                                                        <span className="text-xs text-gray-500">•</span>
                                                        <span className="text-xs text-gray-500">
                                                            {formatDate(comment.date_publication || comment.created_at)}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-700">{comment.contenu || comment.content}</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default ResourceDetail;
