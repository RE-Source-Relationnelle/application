import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import useAuthStore from '../../store/authStore';
import useFavoritesStore from '../../store/favoritesStore';
import { Eye, Trash2, Heart } from 'lucide-react';

const Profile = () => {
    const navigate = useNavigate();
    const { user, logout, updateProfile } = useAuthStore();
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('informations');

    // Store des favoris
    const { favorites, loading: favoritesLoading, fetchFavorites, removeFavorite } = useFavoritesStore();

    // États pour le formulaire d'informations personnelles
    const [formData, setFormData] = useState({
        prenom: user?.prenom || '',
        nom: user?.nom || '',
        username: user?.username || '',
        email: user?.email || user?.mail || '',
        genre: user?.genre || ''
    });

    // États pour le formulaire de changement de mot de passe
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // États pour les messages de succès/erreur
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // État pour la confirmation de suppression de compte
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');

    // Mettre à jour le formulaire quand l'utilisateur change
    useEffect(() => {
        if (user) {
            setFormData({
                prenom: user.prenom || '',
                nom: user.nom || '',
                username: user.username || '',
                email: user.email || user.mail || '',
                genre: user.genre || ''
            });
        }
    }, [user]);

    // Charger les favoris quand l'onglet activité est sélectionné
    useEffect(() => {
        if (activeTab === 'activite' && user) {
            fetchFavorites();
        }
    }, [activeTab, user, fetchFavorites]);

    const openPostModal = () => {
        setIsPostModalOpen(true);
    };

    const handleTabChange = (tab: 'informations' | 'securite' | 'compte' | 'activite') => {
        setActiveTab(tab);
        setSuccessMessage('');
        setErrorMessage('');
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordData({
            ...passwordData,
            [name]: value
        });
    };

    const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            await updateProfile({
                prenom: formData.prenom,
                nom: formData.nom,
                username: formData.username,
                mail: formData.email,
                genre: formData.genre
            });
            setSuccessMessage('Vos informations ont été mises à jour avec succès.');
            setErrorMessage('');
        } catch (error) {
            setErrorMessage('Une erreur est survenue lors de la mise à jour de vos informations.');
            setSuccessMessage('');
            console.error('Erreur de mise à jour du profil:', error);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Vérification que les mots de passe correspondent
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setErrorMessage('Les nouveaux mots de passe ne correspondent pas.');
            setSuccessMessage('');
            return;
        }

        try {
            // TODO: Implémenter l'appel API pour changer le mot de passe
            console.log('Changement de mot de passe avec:', passwordData);
            setSuccessMessage('Votre mot de passe a été mis à jour avec succès.');
            setErrorMessage('');

            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error) {
            setErrorMessage('Une erreur est survenue lors de la mise à jour de votre mot de passe.');
            setSuccessMessage('');
            console.error('Erreur de changement de mot de passe:', error);
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== 'SUPPRIMER') {
            setErrorMessage('Veuillez saisir "SUPPRIMER" pour confirmer.');
            return;
        }

        try {
            // TODO: Implémenter l'appel API pour supprimer le compte
            console.log('Suppression du compte');
            await logout();
            navigate('/');
        } catch (error) {
            setErrorMessage('Une erreur est survenue lors de la suppression de votre compte.');
            console.error('Erreur de suppression de compte:', error);
        }
    };

    // Supprimer un favori
    const handleRemoveFavorite = async (resourceId: string) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette ressource de vos favoris ?')) {
            const success = await removeFavorite(resourceId);
            if (success) {
                setSuccessMessage('Ressource supprimée des favoris');
                // Rafraîchir les favoris après suppression
                fetchFavorites();
            } else {
                setErrorMessage('Erreur lors de la suppression du favori');
            }
        }
    };

    // Formater la date pour l'affichage
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    return (
        <MainLayout onOpenPostModal={openPostModal} showSidebars={false}>
            <div className="bg-white ring-gray-200 ring-1 rounded-lg overflow-hidden w-full">
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">Paramètres du compte</h1>

                    {/* Navigation des onglets */}
                    <div className="flex flex-col md:flex-row border-b border-gray-200 mb-6">
                        <button
                            className={`py-3 px-6 text-sm font-medium focus:outline-none ${activeTab === 'informations'
                                    ? 'text-primary border-b-2 border-primary'
                                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            onClick={() => handleTabChange('informations')}
                        >
                            Informations personnelles
                        </button>
                        <button
                            className={`py-3 px-6 text-sm font-medium focus:outline-none ${activeTab === 'securite'
                                    ? 'text-primary border-b-2 border-primary'
                                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            onClick={() => handleTabChange('securite')}
                        >
                            Sécurité
                        </button>
                        <button
                            className={`py-3 px-6 text-sm font-medium focus:outline-none ${activeTab === 'compte'
                                    ? 'text-primary border-b-2 border-primary'
                                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            onClick={() => handleTabChange('compte')}
                        >
                            Gestion du compte
                        </button>
                        <button
                            className={`py-3 px-6 text-sm font-medium focus:outline-none ${activeTab === 'activite'
                                    ? 'text-primary border-b-2 border-primary'
                                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            onClick={() => handleTabChange('activite')}
                        >
                            Activité
                        </button>
                    </div>

                    {/* Messages de succès/erreur */}
                    {successMessage && (
                        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-green-700">{successMessage}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {errorMessage && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-700">{errorMessage}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Onglet Informations personnelles */}
                    {activeTab === 'informations' && (
                        <form onSubmit={handleUpdateProfile}>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="prenom" className="block text-sm font-medium text-gray-700">Prénom</label>
                                        <input
                                            type="text"
                                            name="prenom"
                                            id="prenom"
                                            value={formData.prenom}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="nom" className="block text-sm font-medium text-gray-700">Nom</label>
                                        <input
                                            type="text"
                                            name="nom"
                                            id="nom"
                                            value={formData.nom}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">Nom d'utilisateur</label>
                                    <input
                                        type="text"
                                        name="username"
                                        id="username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Adresse e-mail</label>
                                    <input
                                        type="email"
                                        name="email"
                                        id="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="genre" className="block text-sm font-medium text-gray-700">Genre</label>
                                    <select
                                        name="genre"
                                        id="genre"
                                        value={formData.genre}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                                    >
                                        <option value="">Sélectionner</option>
                                        <option value="homme">Homme</option>
                                        <option value="femme">Femme</option>
                                        <option value="autre">Autre</option>
                                        <option value="non-precise">Je préfère ne pas préciser</option>
                                    </select>
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                    >
                                        Enregistrer les modifications
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}

                    {/* Onglet Sécurité */}
                    {activeTab === 'securite' && (
                        <form onSubmit={handleUpdatePassword}>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">Mot de passe actuel</label>
                                    <input
                                        type="password"
                                        name="currentPassword"
                                        id="currentPassword"
                                        value={passwordData.currentPassword}
                                        onChange={handlePasswordChange}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">Nouveau mot de passe</label>
                                    <input
                                        type="password"
                                        name="newPassword"
                                        id="newPassword"
                                        value={passwordData.newPassword}
                                        onChange={handlePasswordChange}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                                        required
                                    />
                                    <p className="mt-1 text-xs text-gray-500">Le mot de passe doit contenir au moins 8 caractères, dont une majuscule, une minuscule et un chiffre.</p>
                                </div>

                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirmer le nouveau mot de passe</label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        id="confirmPassword"
                                        value={passwordData.confirmPassword}
                                        onChange={handlePasswordChange}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                                        required
                                    />
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                    >
                                        Mettre à jour le mot de passe
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}

                    {/* Onglet Gestion du compte */}
                    {activeTab === 'compte' && (
                        <div className="space-y-6">
                            <div className="bg-red-50 p-4 rounded-md">
                                <h3 className="text-lg font-medium text-red-800">Zone de danger</h3>
                                <div className="mt-3">
                                    <p className="text-sm text-red-700">
                                        La suppression de votre compte est définitive et irréversible. Toutes vos données personnelles, publications et interactions seront supprimées.
                                    </p>
                                </div>

                                {!showDeleteConfirmation ? (
                                    <div className="mt-4">
                                        <button
                                            type="button"
                                            onClick={() => setShowDeleteConfirmation(true)}
                                            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                        >
                                            Supprimer mon compte
                                        </button>
                                    </div>
                                ) : (
                                    <div className="mt-4 space-y-4">
                                        <p className="text-sm text-red-700 font-medium">
                                            Pour confirmer la suppression, veuillez saisir "SUPPRIMER" ci-dessous :
                                        </p>
                                        <input
                                            type="text"
                                            value={deleteConfirmText}
                                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                                            className="mt-1 block w-full border-red-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                                            placeholder="SUPPRIMER"
                                        />
                                        <div className="flex space-x-3">
                                            <button
                                                type="button"
                                                onClick={handleDeleteAccount}
                                                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                            >
                                                Confirmer la suppression
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowDeleteConfirmation(false);
                                                    setDeleteConfirmText('');
                                                }}
                                                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                            >
                                                Annuler
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Onglet Activité */}
                    {activeTab === 'activite' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-semibold">Mes ressources favoris</h2>
                                <div className="flex items-center space-x-2">
                                    <Heart className="h-5 w-5 text-red-500 fill-current" />
                                    <span className="text-sm text-gray-600">{favorites.length} ressource{favorites.length > 1 ? 's' : ''}</span>
                                </div>
                            </div>

                            {favoritesLoading ? (
                                <div className="flex justify-center p-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                                </div>
                            ) : favorites.length === 0 ? (
                                <div className="text-center py-8">
                                    <Heart className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun favori</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Vous n'avez pas encore ajouté de ressources à vos favoris.
                                    </p>
                                </div>
                            ) : (
                                <div className="bg-white rounded-lg ring-1 ring-gray-200 overflow-hidden">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ressource</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ajouté le</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {favorites.map((favorite) => (
                                                <tr key={favorite.favorite_id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-start space-x-3">
                                                            <div className="flex-shrink-0">
                                                                <Heart className="h-5 w-5 text-red-500 fill-current" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                {favorite.resource ? (
                                                                    <>
                                                                        <p className="text-sm font-medium text-gray-900 truncate max-w-md">
                                                                            {favorite.resource.titre}
                                                                        </p>
                                                                        <div 
                                                                            className="text-sm text-gray-500 truncate max-w-md"
                                                                            dangerouslySetInnerHTML={{ 
                                                                                __html: favorite.resource.contenu.length > 100 
                                                                                    ? favorite.resource.contenu.substring(0, 100) + '...' 
                                                                                    : favorite.resource.contenu 
                                                                            }}
                                                                        />
                                                                    </>
                                                                ) : (
                                                                    <p className="text-sm text-gray-500 italic">
                                                                        Ressource supprimée ou indisponible
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-500">
                                                            {formatDate(favorite.created_at)}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex items-center space-x-2">
                                                            {favorite.resource && (
                                                                <button
                                                                    onClick={() => window.open(`/feed/ressource/${favorite.resource.id}`, '_blank')}
                                                                    className="text-primary hover:text-secondary"
                                                                    title="Voir la ressource"
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => handleRemoveFavorite(favorite.resource.id)}
                                                                className="text-red-600 hover:text-red-800"
                                                                title="Supprimer des favoris"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
};

export default Profile;