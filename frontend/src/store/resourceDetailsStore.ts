import { create } from 'zustand';
import { api } from './authStore';
import { Resource, Comment, User, Category } from '../types/types';
import useCategoryStore from './categoryStore';

interface ResourceDetailsState {
  // États
  resource: Resource | null;
  author: User | null;
  category: Category | null;
  comments: Comment[];
  loading: boolean;
  loadingComments: boolean;
  error: string | null;
  commentError: string | null;
  
  // Actions
  fetchResource: (resourceId: string) => Promise<void>;
  fetchComments: (resourceId: string) => Promise<void>;
  fetchSubComments: (resourceId: string, commentId: string) => Promise<Comment[]>;
  fetchAuthor: (publisherId: string) => Promise<void>;
  fetchCategory: (categoryId: string) => Promise<void>;
  addComment: (resourceId: string, content: string) => Promise<Comment | null>;
  addReply: (resourceId: string, parentCommentId: string, content: string) => Promise<Comment | null>;
  deleteComment: (resourceId: string, commentId: string) => Promise<boolean>;
  resetState: () => void;
}

const useResourceDetailsStore = create<ResourceDetailsState>((set) => ({
  // États initiaux
  resource: null,
  author: null,
  category: null,
  comments: [],
  loading: false,
  loadingComments: false,
  error: null,
  commentError: null,
  
  // Récupérer les détails d'une ressource
  fetchResource: async (resourceId: string) => {
    if (!resourceId) {
      set({ error: 'ID de ressource manquant', loading: false });
      return;
    }
    
    try {
      set({ loading: true, error: null });
      console.log(`Récupération de la ressource avec ID: ${resourceId}`);
      
      const response = await api.get(`/resources/ressource=${resourceId}`);
      
      if (response.data) {
        console.log('Ressource récupérée:', response.data);
        set({ 
          resource: response.data,
          loading: false,
          error: null
        });
        
        // Si la ressource a un id_publieur, récupérer les informations de l'auteur
        if (response.data.id_publieur) {
          const store = useResourceDetailsStore.getState();
          store.fetchAuthor(response.data.id_publieur);
        }
        
        // Si la ressource a un id_categorie, récupérer les informations de la catégorie
        if (response.data.id_categorie) {
          const store = useResourceDetailsStore.getState();
          store.fetchCategory(response.data.id_categorie);
        }
      } else {
        set({ 
          resource: null,
          loading: false,
          error: 'Ressource non trouvée'
        });
      }
    } catch (err: any) {
      console.error('Erreur lors de la récupération de la ressource:', err);
      
      let errorMessage = 'Une erreur est survenue.';
      if (err.response) {
        errorMessage = err.response.data?.error || 'Erreur lors de la récupération de la ressource';
      } else if (err.request) {
        errorMessage = 'Impossible de se connecter au serveur.';
      }
      
      set({ 
        resource: null,
        loading: false,
        error: errorMessage
      });
    }
  },
  
  // Récupérer l'auteur d'une ressource
  fetchAuthor: async (publisherId: string) => {
    if (!publisherId) return;
    
    try {
      const isDev = process.env.NODE_ENV === 'development';
      
      if (isDev) {
        console.log(`Tentative de récupération de l'auteur avec ID: ${publisherId}`);
      }
      
      const currentUser = localStorage.getItem('auth-store');
      let isAdmin = false;
      
      if (currentUser) {
        try {
          const userData = JSON.parse(currentUser);
          if (userData.state?.user?.role?.nom_role === 'administrateur' || 
              userData.state?.user?.role?.nom_role === 'super-administrateur') {
            isAdmin = true;
          }
        } catch (e) {
          console.warn('Impossible de parser les données utilisateur du localStorage');
        }
      }
      
      if (isAdmin) {
        try {
          const response = await api.get('/admin/get_users');
          if (response.data && Array.isArray(response.data)) {
            const authorData = response.data.find(user => user._id === publisherId);
            
            if (authorData) {
              set({ author: authorData });
              return;
            }
          }
        } catch (adminError) {
          console.warn('Impossible d\'utiliser la route admin pour récupérer les utilisateurs:', adminError);
        }
      }
      
      set({ 
        author: {
          id: publisherId,
          email: '',
          nom: 'Utilisateur',
          prenom: '',
        } 
      });
      
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'auteur:`, error);
      
      set({ 
        author: {
          id: publisherId,
          email: '',
          nom: 'Utilisateur',
          prenom: '',
        } 
      });
    }
  },

  // Récupérer la catégorie d'une ressource
  fetchCategory: async (categoryId: string) => {
    if (!categoryId) return;
    
    try {
      const categoryStore = useCategoryStore.getState();
      
      if (categoryStore.categories.length === 0) {
        await categoryStore.fetchCategories();
      }
      
      const category = categoryStore.categories.find(cat => cat._id === categoryId);
      
      if (category) {
        set({ category });
      } else {
        try {
          const response = await api.get(`/categories/category/${categoryId}`);
          if (response.data) {
            set({ category: response.data });
          }
        } catch (directError) {
          console.warn(`Impossible de récupérer directement la catégorie ${categoryId}:`, directError);
        }
      }
    } catch (error) {
      console.error(`Erreur lors de la récupération de la catégorie:`, error);
    }
  },
  
  // Récupérer les commentaires d'une ressource
  fetchComments: async (resourceId: string) => {
    if (!resourceId) {
      set({ commentError: 'ID de ressource manquant', loadingComments: false });
      return;
    }
    
    try {
      set({ loadingComments: true, commentError: null });
      console.log(`Récupération des commentaires pour la ressource: ${resourceId}`);
      
      const response = await api.get(`/resources/comments/${resourceId}`);
      
      console.log('Commentaires récupérés:', response.data);
      
      const sortedComments = response.data.sort((a: Comment, b: Comment) => {
        const getTimestamp = (comment: Comment): number => {
          const dateValue = comment.date_publication || comment.created_at;
          
          if (!dateValue) return 0;
          
          if (typeof dateValue === 'object' && '$date' in dateValue) {
            return new Date(dateValue.$date).getTime();
          }
          
          if (typeof dateValue === 'string') {
            return new Date(dateValue).getTime();
          }
          
          return 0;
        };
        
        return getTimestamp(b) - getTimestamp(a);
      });

      // Pour chaque commentaire, récupérer ses sous-commentaires
      const commentsWithReplies = await Promise.all(
        sortedComments.map(async (comment: Comment) => {
          try {
            const replies = await useResourceDetailsStore.getState().fetchSubComments(resourceId, comment._id);
            return {
              ...comment,
              replies: replies,
              replies_count: replies.length
            };
          } catch (error) {
            console.warn(`Impossible de récupérer les sous-commentaires pour ${comment._id}:`, error);
            return {
              ...comment,
              replies: [],
              replies_count: 0
            };
          }
        })
      );
      
      set({ 
        comments: commentsWithReplies,
        loadingComments: false,
        commentError: null
      });
    } catch (err: any) {
      console.error('Erreur lors de la récupération des commentaires:', err);
      
      let errorMessage = 'Erreur lors de la récupération des commentaires';
      
      if (err.response) {
        errorMessage = err.response.data?.error || errorMessage;
      } else if (err.request) {
        errorMessage = 'Impossible de se connecter au serveur.';
      }
      
      set({ 
        loadingComments: false,
        commentError: errorMessage
      });
    }
  },
  
  // Récupérer les sous-commentaires d'un commentaire spécifique
  fetchSubComments: async (resourceId: string, commentId: string) => {
    try {
      console.log(`Récupération des sous-commentaires pour commentaire ${commentId} dans ressource ${resourceId}`);
      const response = await api.get(`/resources/sous_comments/${resourceId}/replies/${commentId}`);
      console.log('Sous-commentaires récupérés:', response.data);
      return response.data || [];
    } catch (err: any) {
      console.error(`Erreur lors de la récupération des sous-commentaires pour ${commentId}:`, err);
      if (err.response) {
        console.error('Status:', err.response.status);
        console.error('Data:', err.response.data);
      }
      return [];
    }
  },
  
  // Ajouter un commentaire
  addComment: async (resourceId: string, content: string) => {
    if (!content.trim()) {
      set({ commentError: 'Le commentaire ne peut pas être vide' });
      return null;
    }
    
    try {
      set({ commentError: null });
      console.log('Envoi du commentaire avec le token...');
      console.log('URL:', `resources/comments/${resourceId}`);
      console.log('Données envoyées:', { content });
      
      const response = await api.post(`resources/comments/${resourceId}`, { content });
      
      console.log('Réponse complète du serveur:', response.data);
      
      set(state => ({ 
        comments: [response.data, ...state.comments],
        commentError: null
      }));
      
      return response.data;
    } catch (err: any) {
      console.error('Erreur lors de l\'envoi du commentaire:', err);
      console.error('Status:', err.response?.status);
      console.error('Data:', err.response?.data);
      
      let errorMessage = 'Impossible d\'envoyer le commentaire';
      
      if (err.response?.status === 401) {
        errorMessage = 'Vous devez être connecté pour commenter';
      } else if (err.response) {
        errorMessage = err.response.data?.error || errorMessage;
      }
      
      set({ commentError: errorMessage });
      return null;
    }
  },
  
  // Ajouter une réponse à un commentaire
  addReply: async (resourceId: string, parentCommentId: string, content: string) => {
    if (!content.trim()) {
      set({ commentError: 'La réponse ne peut pas être vide' });
      return null;
    }
    
    try {
      set({ commentError: null });
      console.log('Envoi de la réponse avec le token...');
      console.log('URL:', `resources/sous_comments/${resourceId}/replies/${parentCommentId}`);
      console.log('Données envoyées:', { content });
      
      const response = await api.post(`resources/sous_comments/${resourceId}/replies/${parentCommentId}`, { 
        content
      });
      
      console.log('Réponse complète du serveur:', response.data);
      
      // Adapter la réponse au format attendu par le frontend
      const adaptedReply = {
        _id: response.data._id,
        contenu: response.data.content, // content -> contenu
        content: response.data.content,
        id_user: response.data.user_id,
        user_id: response.data.user_id,
        comment_id: response.data.comment_id,
        created_at: response.data.created_at,
        nom_utilisateur: response.data.nom_utilisateur || '',
        prenom_utilisateur: response.data.prenom_utilisateur || ''
      };
      
      // Mettre à jour les commentaires avec la nouvelle réponse
      set(state => {
        const updatedComments = state.comments.map((comment: Comment) => {
          if (comment._id === parentCommentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), adaptedReply],
              replies_count: (comment.replies_count || 0) + 1
            };
          }
          return comment;
        });
        
        return {
          comments: updatedComments,
          commentError: null
        };
      });
      
      return adaptedReply;
    } catch (err: any) {
      console.error('Erreur lors de l\'envoi de la réponse:', err);
      console.error('Status:', err.response?.status);
      console.error('Data:', err.response?.data);
      
      let errorMessage = 'Impossible d\'envoyer la réponse';
      
      if (err.response?.status === 401) {
        errorMessage = 'Vous devez être connecté pour répondre';
      } else if (err.response) {
        errorMessage = err.response.data?.error || errorMessage;
      }
      
      set({ commentError: errorMessage });
      return null;
    }
  },
  
  // Supprimer un commentaire (pour les modérateurs)
  deleteComment: async (resourceId: string, commentId: string) => {
    if (!resourceId || !commentId) {
      set({ commentError: 'ID de ressource ou de commentaire manquant' });
      return false;
    }
    
    try {
      console.log(`Suppression du commentaire avec ID: ${commentId} de la ressource: ${resourceId}`);
      
      // Appel à l'API pour supprimer le commentaire
      await api.delete(`/resources/comments/${commentId}`);
      
      // Mettre à jour la liste des commentaires localement
      set((state) => ({
        comments: state.comments.filter(comment => comment._id !== commentId),
        commentError: null
      }));
      
      return true;
    } catch (error: any) {
      console.error('Erreur lors de la suppression du commentaire:', error);
      set({ 
        commentError: error.response?.data?.error || 'Erreur lors de la suppression du commentaire'
      });
      return false;
    }
  },

  // Réinitialiser l'état du store
  resetState: () => {
    set({
      resource: null,
      author: null,
      category: null,
      comments: [],
      loading: false,
      loadingComments: false,
      error: null,
      commentError: null
    });
  }
}));

export default useResourceDetailsStore;