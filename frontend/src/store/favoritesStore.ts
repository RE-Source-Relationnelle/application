import { create } from 'zustand';
import axios from 'axios';

interface Favorite {
    _id: string;
    user_id: string;
    resource_id: string;
    created_at: string;
}

interface FavoriteWithDetails {
    favorite_id: string;
    created_at: string;
    resource: {
        id: string;
        titre: string;
        contenu: string;
        categorie: string;
        date_publication: string;
        id_publieur: string;
    };
}

interface FavoritesState {
    // État
    favorites: FavoriteWithDetails[];
    loading: boolean;
    error: string | null;
    isFavorite: (resourceId: string) => boolean;
    
    // Actions
    fetchFavorites: () => Promise<void>;
    addFavorite: (resourceId: string) => Promise<boolean>;
    removeFavorite: (resourceId: string) => Promise<boolean>;
    checkIfFavorite: (resourceId: string) => Promise<boolean>;
    resetState: () => void;
}

const useFavoritesStore = create<FavoritesState>((set, get) => ({
    // État initial
    favorites: [],
    loading: false,
    error: null,

    // Vérifier si une ressource est en favoris
    isFavorite: (resourceId: string) => {
        const { favorites } = get();
        return favorites.some(fav => fav.resource.id === resourceId);
    },

    // Récupérer tous les favoris de l'utilisateur
    fetchFavorites: async () => {
        set({ loading: true, error: null });
        
        try {
            const response = await axios.get('http://localhost:5001/resources/favorites', {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            set({ 
                favorites: response.data,
                loading: false,
                error: null
            });
        } catch (error: any) {
            console.error('Erreur lors de la récupération des favoris:', error);
            set({ 
                loading: false,
                error: error.response?.data?.error || 'Erreur lors de la récupération des favoris'
            });
        }
    },

    // Ajouter une ressource aux favoris
    addFavorite: async (resourceId: string) => {
        set({ loading: true, error: null });
        
        try {
            const response = await axios.post(`http://localhost:5001/resources/favorite/${resourceId}`, {}, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            if (response.status === 201) {
                // Rafraîchir la liste des favoris pour obtenir les détails complets
                await get().fetchFavorites();
                set({ loading: false, error: null });
                return true;
            }
            return false;
        } catch (error: any) {
            console.error('Erreur lors de l\'ajout aux favoris:', error);
            
            if (error.response?.status === 400 && 
                error.response?.data?.error === 'Cette ressource est déjà dans vos favoris') {
                // La ressource est déjà en favoris, récupérer la liste mise à jour
                await get().fetchFavorites();
                set({ loading: false, error: null });
                return true;
            }
            
            set({ 
                loading: false,
                error: error.response?.data?.error || 'Erreur lors de l\'ajout aux favoris'
            });
            return false;
        }
    },

    // Supprimer une ressource des favoris
    removeFavorite: async (resourceId: string) => {
        set({ loading: true, error: null });
        
        try {
            const response = await axios.delete(`http://localhost:5001/resources/favorite/${resourceId}`, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            if (response.status === 200) {
                // Supprimer le favori de la liste locale
                set(state => ({
                    favorites: state.favorites.filter(fav => fav.resource.id !== resourceId),
                    loading: false,
                    error: null
                }));
                return true;
            }
            return false;
        } catch (error: any) {
            console.error('Erreur lors de la suppression du favori:', error);
            set({ 
                loading: false,
                error: error.response?.data?.error || 'Erreur lors de la suppression du favori'
            });
            return false;
        }
    },

    // Vérifier si une ressource est en favoris (avec appel API)
    checkIfFavorite: async (resourceId: string) => {
        try {
            const response = await axios.get('http://localhost:5001/resources/favorites', {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            const favorites = response.data;
            const isFavorite = favorites.some((fav: any) => fav.resource.id === resourceId);
            
            // Mettre à jour la liste locale si elle n'est pas à jour
            set({ favorites: response.data });
            
            return isFavorite;
        } catch (error) {
            console.error('Erreur lors de la vérification des favoris:', error);
            return false;
        }
    },

    // Réinitialiser l'état
    resetState: () => {
        set({
            favorites: [],
            loading: false,
            error: null
        });
    }
}));

export default useFavoritesStore; 