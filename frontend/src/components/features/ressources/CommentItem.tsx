import { useState } from 'react';
import { Comment } from '../../../types/types';
import useAuthStore from '../../../store/authStore';

interface CommentItemProps {
    comment: Comment;
    onReply?: (parentCommentId: string, content: string) => Promise<void>;
    canReply?: boolean; // Détermine si l'utilisateur peut répondre (uniquement sur la page détail)
    level?: number; // Niveau d'imbrication (0 = commentaire racine, 1 = réponse, etc.)
}

const CommentItem = ({ comment, onReply, canReply = false, level = 0 }: CommentItemProps) => {
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [isReplying, setIsReplying] = useState(false);
    const { user } = useAuthStore();

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

        // Toujours afficher la date complète
        return date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleReplySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyContent.trim() || !onReply) return;

        try {
            setIsReplying(true);
            await onReply(comment._id, replyContent);
            setReplyContent('');
            setShowReplyForm(false);
        } catch (error) {
            console.error('Erreur lors de l\'ajout de la réponse:', error);
        } finally {
            setIsReplying(false);
        }
    };

    // Limitons l'imbrication à 2 niveaux (commentaire -> réponse)
    const maxNestingLevel = 1;
    const isNestingAllowed = level < maxNestingLevel;

    return (
        <div className={`${level > 0 ? 'ml-8 mt-3' : 'mb-4'}`}>
            <div className={`${level > 0 ? 'border-l-2 border-gray-200 pl-4' : 'bg-gray-50 p-4 rounded-lg'}`}>
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-medium">
                            {comment.nom_utilisateur?.charAt(0)?.toUpperCase() || 
                             comment.prenom_utilisateur?.charAt(0)?.toUpperCase() || 
                             user?.prenom?.charAt(0)?.toUpperCase() || 
                             'U'}
                        </div>
                        <div>
                            <span className="font-medium text-sm">
                                {comment.nom_utilisateur || comment.prenom_utilisateur || user?.prenom || 'Utilisateur'}
                            </span>
                            <span className="text-xs text-gray-500 ml-2">
                                {formatDate(comment.date_publication || comment.created_at)}
                            </span>
                        </div>
                    </div>
                </div>
                
                <p className="text-gray-700 mb-2">{comment.contenu || comment.content}</p>
                
                {/* Bouton répondre - uniquement sur la page détail et pour les commentaires racines ou premier niveau */}
                {canReply && isNestingAllowed && user && (
                    <button
                        onClick={() => setShowReplyForm(!showReplyForm)}
                        className="text-sm text-primary hover:text-primary/80 font-medium"
                    >
                        {showReplyForm ? 'Annuler' : 'Répondre'}
                    </button>
                )}

                {/* Formulaire de réponse */}
                {showReplyForm && canReply && (
                    <form onSubmit={handleReplySubmit} className="mt-3">
                        <div className="flex items-start gap-2">
                            <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-medium">
                                {user?.prenom?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div className="flex-1">
                                <textarea
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    placeholder="Écrivez votre réponse..."
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                                    rows={2}
                                />
                                <div className="flex justify-end gap-2 mt-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowReplyForm(false);
                                            setReplyContent('');
                                        }}
                                        className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!replyContent.trim() || isReplying}
                                        className="px-3 py-1 bg-primary text-white rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:bg-gray-400 text-sm"
                                    >
                                        {isReplying ? 'Envoi...' : 'Répondre'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                )}

                {/* Affichage des réponses */}
                {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-3">
                        {comment.replies.map((reply) => (
                            <CommentItem
                                key={reply._id}
                                comment={reply}
                                onReply={onReply}
                                canReply={canReply}
                                level={level + 1}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommentItem; 