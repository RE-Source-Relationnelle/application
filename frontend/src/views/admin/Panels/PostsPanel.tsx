import React, { useState, useEffect } from 'react';
import useResourcesStore from '../../../store/resourcesStore';
import { Resource } from '../../../types/types';

const PostsPanel = () => {
    const { resources, loading, error, categories, fetchResources, fetchCategories, deleteResource, approveResource, updateResourceCategory } = useResourcesStore();
    const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
    
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

    const handleEditCategory = (resourceId: string, currentCategoryId?: string) => {
        setEditingCategoryId(resourceId);
        setSelectedCategoryId(currentCategoryId || '');
    };

    const handleSaveCategory = async (resourceId: string) => {
        if (selectedCategoryId) {
            await updateResourceCategory(resourceId, selectedCategoryId);
        }
        setEditingCategoryId(null);
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
            <h2 className="text-xl font-semibold">Gestion des ressources</h2>

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
                                                <button 
                                                    className="ml-2 text-primary hover:text-secondary text-xs"
                                                    onClick={() => handleEditCategory(resource._id, resource.id_categorie)}
                                                >
                                                    Modifier
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">
                                            {new Date(resource.createdAt).toLocaleDateString('fr-FR')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            isResourceApproved(resource)
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {isResourceApproved(resource) ? 'Approuvé' : 'En attente'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <button 
                                            className="text-primary hover:text-secondary mr-2"
                                            onClick={() => window.open(`/resources/${resource._id}`, '_blank')}
                                        >
                                            Voir
                                        </button>
                                        {!isResourceApproved(resource) && (
                                            <button 
                                                className="text-green-600 hover:text-green-800 mr-2"
                                                onClick={() => handleApproveResource(resource._id)}
                                            >
                                                Approuver
                                            </button>
                                        )}
                                        <button 
                                            className="text-red-600 hover:text-red-800"
                                            onClick={() => handleDeleteResource(resource._id)}
                                        >
                                            Supprimer
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PostsPanel;