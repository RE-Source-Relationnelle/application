import { useState, useEffect } from 'react';
import useResourcesStore from '../../../store/resourcesStore';
import { Resource } from '../../../types/types';
import { Trash2, SquarePen, Eye, Plus } from 'lucide-react';

const PostsPanel = () => {
    const { resources, loading, error, categories, fetchResources, fetchCategories, deleteResource, approveResource, updateResourceCategory, updateResource, createResource } = useResourcesStore();
    const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
    const [editingResource, setEditingResource] = useState<{ id: string, titre: string, contenu: string, id_categorie?: string } | null>(null);
    const [showEditModal, setShowEditModal] = useState<boolean>(false);
    const [newResource, setNewResource] = useState<{ titre: string, contenu: string, id_categorie?: string } | null>(null);
    const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

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
        const comment = prompt('Commentaire d\'approbation (optionnel):');
        await approveResource(id, comment || undefined);
    };

    const handleSaveCategory = async (resourceId: string) => {
        if (selectedCategoryId) {
            await updateResourceCategory(resourceId, selectedCategoryId);
        }
        setEditingCategoryId(null);
    };

    const handleEditResource = (resource: Resource) => {
        console.log("Catégories disponibles lors de l'édition:", categories);
        setEditingResource({
            id: resource._id,
            titre: resource.titre,
            contenu: resource.contenu,
            id_categorie: resource.id_categorie
        });
        setShowEditModal(true);
    };

    const handleSaveResource = async () => {
        if (editingResource) {
            await updateResource(editingResource.id, {
                titre: editingResource.titre,
                contenu: editingResource.contenu,
                id_categorie: editingResource.id_categorie
            });
            setEditingResource(null);
            setShowEditModal(false);
        }
    };

    const handleCreateResource = () => {
        setNewResource({
            titre: '',
            contenu: '',
            id_categorie: ''
        });
        setShowCreateModal(true);
    };

    const handleSaveNewResource = async () => {
        if (newResource) {
            await createResource(newResource);
            setNewResource(null);
            setShowCreateModal(false);
        }
    };

    const getCategoryName = (categoryId?: string) => {
        if (!categoryId) return 'Non catégorisé';
        const category = categories.find(cat => cat._id === categoryId);
        return category ? category.nom : 'Non catégorisé';
    };

    const isResourceApproved = (resource: Resource) => {
        return !!resource.date_validation;
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
                <button
                    className="px-4 py-2 bg-primary text-white rounded-md flex items-center gap-2 hover:bg-secondary"
                    onClick={handleCreateResource}
                >
                    <Plus size={16} />
                    Créer une ressource
                </button>
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
                        {resources.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                                    Aucune ressource trouvée
                                </td>
                            </tr>
                        ) : (
                            resources.map((resource) => (
                                <tr key={resource._id}>
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
                                            onClick={() => window.open(`/resources/${resource._id}`, '_blank')}
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
                                        {editingResource && editingResource.id === resource._id && (
                                            <button
                                                className="text-green-600 hover:text-green-800"
                                                onClick={handleSaveResource}
                                            >
                                                Sauvegarder
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modale d'édition de ressource */}
            {showEditModal && editingResource && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
                        <h3 className="text-lg font-medium mb-4">Modifier la ressource</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                                <input
                                    type="text"
                                    value={editingResource.titre}
                                    onChange={(e) => setEditingResource({ ...editingResource, titre: e.target.value })}
                                    className="w-full p-2 border rounded"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Contenu</label>
                                <textarea
                                    value={editingResource.contenu}
                                    onChange={(e) => setEditingResource({ ...editingResource, contenu: e.target.value })}
                                    className="w-full p-2 border rounded h-40"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                                <select
                                    className="w-full p-2 border rounded"
                                    value={editingResource.id_categorie || ''}
                                    onChange={(e) => setEditingResource({ ...editingResource, id_categorie: e.target.value })}
                                >
                                    <option value="">Non catégorisé</option>
                                    {categories.map(cat => (
                                        <option key={cat._id} value={cat._id}>{cat.nom}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex justify-end space-x-2 pt-4">
                                <button
                                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                                    onClick={() => {
                                        setEditingResource(null);
                                        setShowEditModal(false);
                                    }}
                                >
                                    Annuler
                                </button>
                                <button
                                    className="px-4 py-2 bg-primary text-white rounded hover:bg-secondary"
                                    onClick={handleSaveResource}
                                >
                                    Sauvegarder
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modale de création de ressource */}
            {showCreateModal && newResource && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
                        <h3 className="text-lg font-medium mb-4">Créer une nouvelle ressource</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                                <input
                                    type="text"
                                    value={newResource.titre}
                                    onChange={(e) => setNewResource({ ...newResource, titre: e.target.value })}
                                    className="w-full p-2 border rounded"
                                    placeholder="Titre de la ressource"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Contenu</label>
                                <textarea
                                    value={newResource.contenu}
                                    onChange={(e) => setNewResource({ ...newResource, contenu: e.target.value })}
                                    className="w-full p-2 border rounded h-40"
                                    placeholder="Contenu de la ressource"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                                <select
                                    className="w-full p-2 border rounded"
                                    value={newResource.id_categorie || ''}
                                    onChange={(e) => setNewResource({ ...newResource, id_categorie: e.target.value })}
                                >
                                    <option value="">Non catégorisé</option>
                                    {categories.map(cat => (
                                        <option key={cat._id} value={cat._id}>{cat.nom}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex justify-end space-x-2 pt-4">
                                <button
                                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                                    onClick={() => {
                                        setNewResource(null);
                                        setShowCreateModal(false);
                                    }}
                                >
                                    Annuler
                                </button>
                                <button
                                    className="px-4 py-2 bg-primary text-white rounded hover:bg-secondary"
                                    onClick={handleSaveNewResource}
                                >
                                    Créer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PostsPanel;