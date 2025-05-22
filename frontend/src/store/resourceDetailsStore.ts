import { create } from 'zustand';
import { api } from './authStore';
import { Resource, Comment } from '../types/types';

interface ResourceDetailsState {
  // États
  resource: Resource | null;
  comments: Comment[];
  loading: boolean;
  loadingComments: boolean;
  error: string | null;
  commentError: string | null;
  
  // Actions
  fetchResource: (resourceId: string) => Promise<void>;
  fetchComments: (resourceId: string) => Promise<void>;
  addComment: (resourceId: string, content: string) => Promise<Comment | null>;
  resetState: () => void;
}

const useResourceDetailsStore = create<ResourceDetailsState>((set, get) => ({
  // États initiaux
  resource: null,
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
      } else {
        set({ 
          resource: null,
          loading: false,
          error: 'Ressource non trouvée'
        });
      }
    } catch (err: any) {
      console.error('Erreur lors de la récupération de la ressource:', err);
      
      let errorMessage = 'Erreur lors de la récupération de la ressource';
      
      if (err.response) {
        errorMessage = err.response.data?.error || errorMessage;
      } else if (err.request) {
        errorMessage = 'Impossible de se connecter au serveur. Veuillez vérifier que le serveur est en cours d\'exécution.';
      }
      
      set({ 
        resource: null,
        loading: false,
        error: errorMessage
      });
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
      
      // Trier les commentaires par date (les plus récents d'abord)
      const sortedComments = response.data.sort((a: Comment, b: Comment) => {
        // Fonction pour extraire la date à partir de différents formats
        const getTimestamp = (comment: Comment): number => {
          const dateValue = comment.date_publication || comment.created_at;
          
          if (!dateValue) return 0;
          
          if (typeof dateValue === 'object' && '$date' in dateValue) {
            // Format MongoDB { $date: string }
            return new Date(dateValue.$date).getTime();
          }
          
          if (typeof dateValue === 'string') {
            // Format string
            return new Date(dateValue).getTime();
          }
          
          return 0;
        };
        
        return getTimestamp(b) - getTimestamp(a);
      });
      
      set({ 
        comments: sortedComments,
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
      
      // Ajouter le nouveau commentaire à la liste
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
  
  // Réinitialiser l'état du store
  resetState: () => {
    set({
      resource: null,
      comments: [],
      loading: false,
      loadingComments: false,
      error: null,
      commentError: null
    });
  }
}));

export default useResourceDetailsStore;