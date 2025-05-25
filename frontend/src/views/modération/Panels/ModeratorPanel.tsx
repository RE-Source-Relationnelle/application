import { useState, useEffect } from 'react';
import useResourcesStore from '../../../store/resourcesStore';
import { Resource } from '../../../types/types';
import { Trash2, Eye } from 'lucide-react';
import { useToast } from '../../../contexts/ToastContext';

const ModeratorPanel = () => {
    const { resources, loading, error, fetchResources, deleteResource, approveResource } = useResourcesStore();
    const [viewingResource, setViewingResource] = useState<Resource | null>(null);
    const { showToast } = useToast();

    useEffect(() => {
        fetchResources();
    }, [fetchResources]);

    // Supprimer une ressource
    const handleDeleteResource = async (id: string) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette ressource ?')) {
            try {
                await deleteResource(id);
                showToast('La ressource a été supprimée avec succès !', 'success');
                fetchResources();
            } catch (error) {
                console.error('Erreur lors de la suppression:', error);
                showToast('Une erreur est survenue lors de la suppression de la ressource.', 'error');
            }
        }
    };

    // Approuver une ressource
    const handleApproveResource = async (id: string) => {
        try {
            const comment = prompt('Commentaire d\'approbation (optionnel):');
            
            if (!confirm('Êtes-vous sûr de vouloir approuver cette ressource ?')) {
                return;
            }
            
            await approveResource(id, comment || undefined);
            
            fetchResources();
            
            showToast('La ressource a été approuvée avec succès !', 'success');
        } catch (error) {
            console.error('Erreur lors de l\'approbation:', error);
            showToast('Une erreur est survenue lors de l\'approbation de la ressource.', 'error');
        }
    };

    // Afficher une ressource
    const handleViewResource = (resource: Resource) => {
        setViewingResource(resource);
    };

    // Fermer la vue de la ressource
    const closeResourceView = () => {
        setViewingResource(null);
    };

    // Fonction pour déterminer si une ressource est en attente d'approbation
    const isResourcePending = (resource: Resource) => {
        return resource.approved === false || (!resource.date_validation && !resource.approved);
    };

    // Filtrer uniquement les ressources en attente
    const pendingResources = resources.filter(isResourcePending);

    if (loading) {
        return <div className="flex justify-center p-8"><p>Chargement des ressources...</p></div>;
    }

    if (error) {
        return (
            <div className="bg-red-50 p-4 rounded-md">
                <p className="text-red-700">Erreur: {error}</p>
                <button
                    className="mt-2 text-sm text-primary hover:text-secondary"
                    onClick={() => fetchResources()}
                >
                    Réessayer
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Modération des ressources</h2>
                <div className="text-sm text-gray-500">
                    {pendingResources.length} ressource{pendingResources.length !== 1 ? 's' : ''} en attente
                </div>
            </div>

            {viewingResource && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold">{viewingResource.titre}</h3>
                            <button 
                                onClick={closeResourceView}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="mb-4">
                            <p className="text-sm text-gray-500">
                                Auteur: {viewingResource.id_publieur ? viewingResource.id_publieur : 'Anonyme'} | 
                                Date: {new Date(viewingResource.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="content-container mb-6" dangerouslySetInnerHTML={{ __html: viewingResource.contenu }} />
                        <div className="flex space-x-3 justify-end">
                            <button
                                onClick={() => {
                                    closeResourceView();
                                    handleDeleteResource(viewingResource._id);
                                }}
                                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center gap-2"
                            >
                                <Trash2 size={16} />
                                Supprimer
                            </button>
                            <button
                                onClick={() => {
                                    closeResourceView();
                                    handleApproveResource(viewingResource._id);
                                }}
                                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                            >
                                Approuver
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-lg ring-1 ring-gray-200 overflow-hidden">
                {/* Version desktop : tableau */}
                <div className="hidden md:block">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Titre</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Auteur</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {pendingResources.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                                        Aucune ressource en attente de modération
                                    </td>
                                </tr>
                            ) : (
                                pendingResources.map((resource) => (
                                    <tr key={resource._id}>
                                        <td className="px-6 py-4 whitespace-nowrap max-w-[200px]">
                                            <div className="text-sm font-medium text-gray-900 truncate max-w-full" title={resource.titre}>
                                                {resource.titre}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">
                                                {resource.id_publieur ? 'ID: ' + resource.id_publieur.substring(0, 8) + '...' : 'Anonyme'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">
                                                {new Date(resource.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex space-x-2 justify-end">
                                                <button
                                                    onClick={() => handleViewResource(resource)}
                                                    className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1"
                                                >
                                                    <Eye size={16} />
                                                    Voir
                                                </button>
                                                <button
                                                    onClick={() => handleApproveResource(resource._id)}
                                                    className="text-green-600 hover:text-green-900"
                                                >
                                                    Approuver
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteResource(resource._id)}
                                                    className="text-red-600 hover:text-red-900 flex items-center gap-1"
                                                >
                                                    <Trash2 size={16} />
                                                    Supprimer
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Version mobile : liste de cartes */}
                <div className="md:hidden">
                    {pendingResources.length === 0 ? (
                        <div className="p-4 text-center text-sm text-gray-500">
                            Aucune ressource en attente de modération
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-200">
                            {pendingResources.map((resource) => (
                                <li key={resource._id} className="p-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <div className="text-sm font-medium text-gray-900 truncate max-w-[200px]" title={resource.titre}>
                                                {resource.titre}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {new Date(resource.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            Auteur: {resource.id_publieur ? 'ID: ' + resource.id_publieur.substring(0, 8) + '...' : 'Anonyme'}
                                        </div>
                                        <div className="flex space-x-2 pt-2">
                                            <button
                                                onClick={() => handleViewResource(resource)}
                                                className="flex-1 text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded-md flex items-center justify-center gap-1"
                                            >
                                                <Eye size={14} />
                                                Voir
                                            </button>
                                            <button
                                                onClick={() => handleApproveResource(resource._id)}
                                                className="flex-1 text-xs px-2 py-1 bg-green-100 text-green-700 rounded-md"
                                            >
                                                Approuver
                                            </button>
                                            <button
                                                onClick={() => handleDeleteResource(resource._id)}
                                                className="flex-1 text-xs px-2 py-1 bg-red-100 text-red-700 rounded-md flex items-center justify-center gap-1"
                                            >
                                                <Trash2 size={14} />
                                                Supprimer
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ModeratorPanel;
