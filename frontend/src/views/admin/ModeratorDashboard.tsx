import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import ModeratorPanel from './Panels/ModeratorPanel';

const ModeratorDashboard = () => {
    const { user, isAuthenticated, loading } = useAuthStore();
    const [isModerator, setIsModerator] = useState<boolean>(false);

    useEffect(() => {
        if (user && user.role) {
            // Vérifier si l'utilisateur est modérateur, administrateur ou super-administrateur
            const roleName = user.role.nom_role?.toLowerCase() || '';
            setIsModerator(
                roleName === 'modérateur' || 
                roleName === 'administrateur' || 
                roleName === 'super-administrateur'
            );
        }
    }, [user]);

    // Afficher un message de chargement pendant la vérification de l'authentification
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p>Chargement...</p>
            </div>
        );
    }

    // Rediriger vers la page de connexion si l'utilisateur n'est pas authentifié
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Rediriger vers la page d'accueil si l'utilisateur n'est pas modérateur
    if (!isModerator) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Espace de modération</h1>
                <p className="text-gray-600">Bienvenue dans l'espace de modération des ressources</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
                <ModeratorPanel />
            </div>
        </div>
    );
};

export default ModeratorDashboard;
