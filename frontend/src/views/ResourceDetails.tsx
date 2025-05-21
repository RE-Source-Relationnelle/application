import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import useAuthStore from '../store/authStore';
import { Resource } from '../types/types';
import axios from 'axios';

const ResourceDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [resource, setResource] = useState<Resource | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newComment, setNewComment] = useState('');
    const { user } = useAuthStore();

    useEffect(() => {
        const fetchResource = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`/api/resources/${id}`, {
                    withCredentials: true
                });
                setResource(response.data);
                setError(null);
            } catch (err: any) {
                console.error('Erreur lors de la récupération de la ressource:', err);
                setError(err.response?.data?.error || 'Erreur lors de la récupération de la ressource');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchResource();
        }
    }, [id]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            // TODO: Implémenter l'envoi du commentaire à l'API
            console.log('Nouveau commentaire:', newComment);
            setNewComment('');
        } catch (err) {
            console.error('Erreur lors de l\'envoi du commentaire:', err);
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
                {/* En-tête de la ressource */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-full bg-gray-200"></div>
                            <div>
                                <h3 className="font-semibold text-lg">{user?.nom || 'Anonyme'}</h3>
                                <p className="text-sm text-gray-500">{user?.role?.nom_role || 'Utilisateur'}</p>
                            </div>
                        </div>
                        <div className="text-sm text-gray-500">
                            {formatDate(resource.createdAt)}
                        </div>
                    </div>

                    <h1 className="text-3xl font-bold mb-6">{resource.titre}</h1>

                    {/* Contenu de la ressource */}
                    <div 
                        className="prose prose-lg max-w-none mb-8"
                        dangerouslySetInnerHTML={{ __html: resource.contenu }}
                    />

                    {/* Statut de validation */}
                    {resource.approved && (
                        <div className="mt-6 p-4 bg-green-50 rounded-lg">
                            <div className="flex items-center text-green-700">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="font-medium">Ressource validée</span>
                            </div>
                            {resource.commentaire_validation && (
                                <p className="mt-2 text-green-600">
                                    Commentaire: {resource.commentaire_validation}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Section des commentaires */}
                    <div className="mt-8 border-t pt-6">
                        <h2 className="text-xl font-semibold mb-4">Commentaires</h2>
                        
                        {/* Formulaire de commentaire */}
                        <form onSubmit={handleCommentSubmit} className="mb-6">
                            <div className="flex items-start space-x-4">
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0"></div>
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
                        <div className="space-y-4">
                            {/* TODO: Ajouter la liste des commentaires ici */}
                            <div className="text-center text-gray-500 py-4">
                                Aucun commentaire pour le moment
                            </div>
                        </div>
                    </div>

                    {/* Bouton de retour */}
                    <div className="mt-8">
                        <button
                            onClick={() => navigate('/feed')}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Retour au feed
                        </button>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default ResourceDetails;