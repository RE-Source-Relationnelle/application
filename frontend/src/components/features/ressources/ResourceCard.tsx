import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageSquareText, Share2, ChevronDown } from 'lucide-react';
import { Resource, User, Category } from '../../../types/types';
import { useToast } from '../../../contexts/ToastContext';
import useFavoritesStore from '../../../store/favoritesStore';

interface ResourceCardProps {
  resource: Resource;
  author?: User | null;
  category?: Category | null;
}

// Fonction pour formater la date
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
};

// Fonction pour obtenir les initiales
const getUserInitials = (prenom: string, nom: string) => {
  if (!prenom && !nom) return 'A';
  return (prenom?.charAt(0) || '') + (nom?.charAt(0) || '');
};

// Fonction pour tronquer le contenu HTML
const truncateHTML = (html: string, maxLength: number = 250) => {
  // Créer un élément div temporaire pour parser le HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // Obtenir le texte brut
  const text = tempDiv.textContent || tempDiv.innerText || '';
  
  // Vérifier si le texte dépasse la longueur maximale
  if (text.length <= maxLength) {
    return { html, isTruncated: false };
  }
  
  // Tronquer le texte
  const truncatedText = text.substring(0, maxLength) + '...';
  
  return { 
    html: truncatedText, 
    isTruncated: true 
  };
};

const ResourceCard = ({ resource, author, category }: ResourceCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore();
  
  // Tronquer le contenu HTML si nécessaire
  const { html: truncatedContent, isTruncated } = !isExpanded 
    ? truncateHTML(resource.contenu) 
    : { html: resource.contenu, isTruncated: false };
  
  const handleResourceClick = () => {
    navigate(`/feed/ressource/${resource._id}`);
  };
  
  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };
  
  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const resourceId = resource._id;
      const isCurrentlyFavorite = isFavorite(resourceId);
      let success = false;
      
      if (isCurrentlyFavorite) {
        success = await removeFavorite(resourceId);
        if (success) {
          showToast('Ressource supprimée des favoris', 'success');
        }
      } else {
        success = await addFavorite(resourceId);
        if (success) {
          showToast('Ressource ajoutée aux favoris', 'success');
        }
      }
      
      if (!success) {
        showToast('Une erreur est survenue', 'error');
      }
    } catch (error) {
      showToast('Une erreur est survenue', 'error');
    }
  };
  
  const handleShareClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const url = `${window.location.origin}/feed/ressource/${resource._id}`;
    try {
      await navigator.clipboard.writeText(url);
      showToast('Lien copié dans le presse-papier', 'success');
    } catch (err) {
      showToast('Impossible de copier le lien', 'error');
    }
  };

  return (
    <div
      className="bg-white rounded-lg ring-gray-200 ring-1 sm:rounded-lg w-full"
    >
      <div className="p-4">
        <div className="flex items-start">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center bg-primary/20 text-primary font-semibold text-lg mr-3"
          >
            {author 
              ? getUserInitials(author.prenom || '', author.nom || '') 
              : 'A'}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm sm:text-base">
              {author 
                ? `${author.prenom || ''} ${author.nom || ''}` 
                : 'Anonyme'}
            </h3>
            <p className="text-xs text-gray-500">{formatDate(resource.createdAt)}</p>
            {category && (
              <p className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full inline-block mt-1">
                {category.nom}
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="px-4 pb-2">
        <h2 className="text-lg font-semibold mb-2">{resource.titre}</h2>
        <div
          className="text-sm sm:text-base mb-3 content-container"
          dangerouslySetInnerHTML={{ __html: isExpanded ? resource.contenu : truncatedContent }}
        />
        
        {isTruncated && (
          <button 
            onClick={handleResourceClick}
            className="text-primary font-medium text-sm flex items-center mb-3 hover:underline"
          >
            Voir plus
          </button>
        )}
        
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
      
      <div className="px-4 py-1 flex justify-between border-t border-gray-200">
        <button 
          className={`flex-1 flex items-center justify-center space-x-1 py-2 ${
            isFavorite(resource._id) ? 'text-red-500' : 'text-gray-500'
          } hover:bg-gray-100 rounded-md transition-all duration-300 ease-in-out transform hover:scale-105`}
          onClick={handleFavoriteClick}
        >
          <Heart 
            className={`h-5 w-5 transition-all duration-300 ${
              isFavorite(resource._id) ? 'fill-current scale-110' : 'scale-100'
            }`}
          />
          <span className="text-sm transition-all duration-300">
            {isFavorite(resource._id) ? 'Favori' : 'Ajouter aux favoris'}
          </span>
        </button>
        <button 
          className="flex-1 flex items-center justify-center space-x-1 py-2 text-gray-500 hover:bg-gray-100 rounded-md transition-all duration-300 ease-in-out transform hover:scale-105"
          onClick={handleResourceClick}
        >
          <MessageSquareText className="h-5 w-5 transition-all duration-300 hover:scale-110" />
          <span className="text-sm transition-all duration-300">Commenter</span>
        </button>
        <button 
          className="flex-1 flex items-center justify-center space-x-1 py-2 text-gray-500 hover:bg-gray-100 rounded-md transition-all duration-300 ease-in-out transform hover:scale-105"
          onClick={handleShareClick}
        >
          <Share2 className="h-5 w-5 transition-all duration-300 hover:scale-110" />
          <span className="text-sm transition-all duration-300">Partager</span>
        </button>
      </div>
    </div>
  );
};

export default ResourceCard;
