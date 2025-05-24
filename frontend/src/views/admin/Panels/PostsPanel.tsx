import { useState, useEffect } from 'react';
import useResourcesStore from '../../../store/resourcesStore';
import { Resource } from '../../../types/types';
import { Trash2, SquarePen, Eye, Plus, Filter } from 'lucide-react';
import ResourceModal from '../../../components/features/ressources/ResourceModal';
import { useToast } from '../../../contexts/ToastContext';

const PostsPanel = () => {
    const { resources, loading, error, categories, fetchResources, fetchCategories, deleteResource, approveResource, updateResourceCategory, updateResource, createResource } = useResourcesStore();
    const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingResource, setEditingResource] = useState<{ id?: string; titre: string; contenu: string; id_categorie?: string } | null>(null);
    const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved'>('all');
    const { showToast } = useToast();

    // Charger les ressources et les catégories au montage du composant
    useEffect(() => {
        fetchResources();
        fetchCategories();
    }, [fetchResources, fetchCategories]);

    const handleDeleteResource = async (id: string) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette ressource ?')) {
            await deleteResource(id);
        }
    };

    const handleApproveResource = async (id: string) => {
        try {
            const comment = prompt('Commentaire d\'approbation (optionnel):');
            
            // Confirmer l'action
            if (!confirm('Êtes-vous sûr de vouloir approuver cette ressource ?')) {
                return;
            }
            
            await approveResource(id, comment || undefined);
            
            // Rafraîchir la liste des ressources pour s'assurer que tout est à jour
            fetchResources();
            
            showToast('La ressource a été approuvée avec succès !', 'success');
        } catch (error) {
            console.error('Erreur lors de l\'approbation:', error);
            showToast('Une erreur est survenue lors de l\'approbation de la ressource.', 'error');
        }
    };

    const handleSaveCategory = async (resourceId: string) => {
        if (selectedCategoryId) {
            await updateResourceCategory(resourceId, selectedCategoryId);
        }
        setEditingCategoryId(null);
    };

    const handleEditResource = (resource: Resource) => {
        setEditingResource({
            id: resource._id,
            titre: resource.titre,
            contenu: resource.contenu,
            id_categorie: resource.id_categorie
        });
        setIsEditModalOpen(true);
    };

    const handleSubmitEditResource = async (data: { id?: string; titre: string; contenu: string; id_categorie?: string }) => {
        try {
            if (data.id) {
                await updateResource(data.id, data);
                showToast('La ressource a été mise à jour avec succès !', 'success');
                fetchResources(); // Rafraîchir la liste des ressources
            }
            setIsEditModalOpen(false);
        } catch (error) {
            console.error('Erreur lors de la mise à jour:', error);
            showToast('Une erreur est survenue lors de la mise à jour de la ressource.', 'error');
        }
    };

    const handleCreateResource = () => {
        setIsCreateModalOpen(true);
    };

    const handleSubmitCreateResource = async (data: { titre: string; contenu: string; id_categorie?: string }) => {
        try {
            await createResource(data);
            showToast('La ressource a été créée avec succès !', 'success');
            fetchResources(); // Rafraîchir la liste des ressources
            setIsCreateModalOpen(false);
        } catch (error) {
            console.error('Erreur lors de la création:', error);
            showToast('Une erreur est survenue lors de la création de la ressource.', 'error');
        }
    };

    const getCategoryName = (categoryId?: string) => {
        if (!categoryId) return 'Non catégorisé';
        const category = categories.find(cat => cat._id === categoryId);
        return category ? category.nom : 'Non catégorisé';
    };

    const isResourceApproved = (resource: Resource) => {
        return resource.approved === true || !!resource.date_validation;
    };

    const filteredResources = () => {
        if (filterStatus === 'all') return resources;
        if (filterStatus === 'pending') return resources.filter(r => !isResourceApproved(r));
        if (filterStatus === 'approved') return resources.filter(r => isResourceApproved(r));
        return resources;
    };

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
                <h2 className="text-xl font-semibold">Gestion des ressources</h2>
                <div className="flex space-x-2">
                    <div className="relative">
                        <button
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md flex items-center gap-2 hover:bg-gray-300"
                            onClick={() => setFilterStatus(filterStatus === 'all' ? 'pending' : filterStatus === 'pending' ? 'approved' : 'all')}
                        >
                            <Filter size={16} />
                            {filterStatus === 'all' ? 'Toutes' : filterStatus === 'pending' ? 'En attente' : 'Approuvées'}
                        </button>
                    </div>
                    <button
                        className="px-4 py-2 bg-primary text-white rounded-md flex items-center gap-2 hover:bg-secondary"
                        onClick={handleCreateResource}
                    >
                        <Plus size={16} />
                        Créer une ressource
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg ring-1 ring-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Titre</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Auteur</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catégorie</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredResources().length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                                    {filterStatus === 'pending' 
                                        ? 'Aucune ressource en attente d\'approbation' 
                                        : filterStatus === 'approved' 
                                            ? 'Aucune ressource approuvée'
                                            : 'Aucune ressource trouvée'}
                                </td>
                            </tr>
                        ) : (
                            filteredResources().map((resource) => (
                                <tr key={resource._id} className={!isResourceApproved(resource) ? 'bg-yellow-50' : ''}>
                                    <td className="px-6 py-4 whitespace-nowrap max-w-[200px]">
                                        {editingResource && editingResource.id === resource._id ? (
                                            <input
                                                type="text"
                                                value={editingResource.titre}
                                                onChange={(e) => setEditingResource({ ...editingResource, titre: e.target.value })}
                                                className="w-full p-2 text-sm border rounded"
                                            />
                                        ) : (
                                            <div className="text-sm font-medium text-gray-900 truncate max-w-full" title={resource.titre}>
                                                {resource.titre}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">
                                            {resource.id_publieur ? 'ID: ' + resource.id_publieur.substring(0, 8) + '...' : 'Anonyme'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {editingCategoryId === resource._id ? (
                                            <div className="flex items-center space-x-2">
                                                <select
                                                    className="text-sm border rounded px-2 py-1"
                                                    value={selectedCategoryId}
                                                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                                                >
                                                    <option value="">Non catégorisé</option>
                                                    {categories.map(cat => (
                                                        <option key={cat._id} value={cat._id}>{cat.nom}</option>
                                                    ))}
                                                </select>
                                                <button
                                                    className="text-green-600 hover:text-green-800 text-sm"
                                                    onClick={() => handleSaveCategory(resource._id)}
                                                >
                                                    ✓
                                                </button>
                                                <button
                                                    className="text-red-600 hover:text-red-800 text-sm"
                                                    onClick={() => setEditingCategoryId(null)}
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="text-sm text-gray-500 flex items-center">
                                                {getCategoryName(resource.id_categorie)}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">
                                            {new Date(resource.createdAt).toLocaleDateString('fr-FR')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${isResourceApproved(resource)
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {isResourceApproved(resource) ? 'Approuvé' : 'En attente'}
                                        </span>
                                        {resource.commentaire_validation && (
                                            <div className="mt-1 text-xs text-gray-500 max-w-xs truncate" title={resource.commentaire_validation}>
                                                Commentaire: {resource.commentaire_validation}
                                            </div>
                                        )}
                                    </td>
                                    <td className="flex items-center px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {!isResourceApproved(resource) && (
                                            <button
                                                className="text-green-600 hover:text-green-800 mr-2"
                                                onClick={() => handleApproveResource(resource._id)}
                                            >
                                                Approuver
                                            </button>
                                        )}
                                        <button
                                            className="text-primary hover:text-secondary mr-2"
                                            onClick={() => window.open(`/feed/ressource/${resource._id}`, '_blank')}
                                        >
                                            <Eye />
                                        </button>
                                        <button
                                            className="text-red-600 hover:text-red-800 mr-2"
                                            onClick={() => handleDeleteResource(resource._id)}
                                        >
                                            <Trash2 />
                                        </button>
                                        <button
                                            className="text-blue-600 hover:text-blue-800"
                                            onClick={() => handleEditResource(resource)}
                                        >
                                            <SquarePen />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {isCreateModalOpen && (
                <ResourceModal
                    isOpen={isCreateModalOpen}
                    mode="create"
                    initialData={{ titre: '', contenu: '', id_categorie: '' }}
                    onSubmit={handleSubmitCreateResource}
                    onClose={() => setIsCreateModalOpen(false)}
                />
            )}

            {isEditModalOpen && editingResource && (
                <ResourceModal
                    isOpen={isEditModalOpen}
                    mode="edit"
                    initialData={editingResource}
                    onSubmit={handleSubmitEditResource}
                    onClose={() => setIsEditModalOpen(false)}
                />
            )}
        </div>
    );
};

export default PostsPanel;