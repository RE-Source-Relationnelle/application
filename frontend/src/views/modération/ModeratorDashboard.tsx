import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import ModeratorPanel from './Panels/ModeratorPanel';

const ModeratorDashboard = () => {
    const { user, isAuthenticated, loading } = useAuthStore();
    const [isModerator, setIsModerator] = useState<boolean>(false);
    const [roleChecked, setRoleChecked] = useState<boolean>(false);

    useEffect(() => {
        if (user && user.role) {
            const roleName = user.role.nom_role?.toLowerCase() || '';
            const hasModerationAccess = 
                roleName === 'modérateur' || 
                roleName === 'moderateur' || 
                roleName === 'administrateur' || 
                roleName === 'super-administrateur';
            
            setIsModerator(hasModerationAccess);
        }
        setRoleChecked(true);
    }, [user]);

    if (loading || !roleChecked) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p>Chargement...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!isModerator) {
        return <Navigate to="/feed" replace />;
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
