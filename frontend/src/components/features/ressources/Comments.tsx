import { useState, useEffect } from 'react';
import axios from 'axios';
import useAuthStore from '../../../store/authStore';

interface Comment {
    _id: string;
    contenu: string;
    date_creation: string;
    id_utilisateur: string;
    id_ressource: string;
}

interface CommentsProps {
    resourceId: string;
}

const Comments = ({ resourceId }: CommentsProps) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuthStore();

    const fetchComments = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`http://guillaume-lechevallier.freeboxos.fr:5001/resources/${resourceId}/comments`, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            setComments(response.data);
            setError(null);
        } catch (err: any) {
            console.error('Erreur lors de la récupération des commentaires:', err);
            setError('Impossible de charger les commentaires');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [resourceId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            setLoading(true);
            const response = await axios.post(
                `http://guillaume-lechevallier.freeboxos.fr:5001/resources/${resourceId}/comments`,
                { contenu: newComment },
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                }
            );
            setComments(prev => [...prev, response.data]);
            setNewComment('');
            setError(null);
        } catch (err: any) {
            console.error('Erreur lors de l\'ajout du commentaire:', err);
            setError('Impossible d\'ajouter le commentaire');
        } finally {
            setLoading(false);
        }
    };

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

    return (
        <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Commentaires</h3>
            
            {/* Formulaire d'ajout de commentaire */}
            <form onSubmit={handleSubmit} className="mb-6">
                <div className="flex gap-2">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Ajouter un commentaire..."
                        className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                    />
                    <button
                        type="submit"
                        disabled={loading || !newComment.trim()}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
                    >
                        {loading ? 'Envoi...' : 'Commenter'}
                    </button>
                </div>
            </form>

            {/* Liste des commentaires */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4">
                    {error}
                </div>
            )}

            <div className="space-y-4">
                {comments.map((comment) => (
                    <div key={comment._id} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center">
                                    {user?.nom?.[0]?.toUpperCase() || '?'}
                                </div>
                                <span className="font-medium">{user?.nom || 'Anonyme'}</span>
                            </div>
                            <span className="text-sm text-gray-500">
                                {formatDate(comment.date_creation)}
                            </span>
                        </div>
                        <p className="text-gray-700">{comment.contenu}</p>
                    </div>
                ))}
            </div>

            {loading && (
                <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
            )}
        </div>
    );
};

export default Comments; 