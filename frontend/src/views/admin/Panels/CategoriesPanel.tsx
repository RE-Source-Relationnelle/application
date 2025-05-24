import { useState, useEffect } from 'react';
import useCategoryStore from '../../../store/categoryStore';

// Panel de gestion des catégories
const CategoriesPanel = () => {
    const { categories, loading: loadingCategories, error, fetchCategories, updateCategory, createCategory } = useCategoryStore();
    const [newCategory, setNewCategory] = useState("");
    const [newCategoryDescription, setNewCategoryDescription] = useState("");
    const [showDescriptionField, setShowDescriptionField] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState<{id: string, nom: string, description: string} | null>(null);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleAddCategory = async () => {
        if (newCategory.trim()) {
            await createCategory(newCategory, newCategoryDescription);
            setNewCategory("");
            setNewCategoryDescription("");
            setShowDescriptionField(false);
            setShowAddForm(false); 
            fetchCategories();
        }
    };

    const handleDeleteCategory = async (id: string) => {
        const categoryInUse = categories.find(cat => cat._id === id)?.resourceCount && categories.find(cat => cat._id === id)?.resourceCount! > 0;
        
        if (categoryInUse) {
            alert("Impossible de supprimer une catégorie utilisée par des ressources.");
            return;
        }
        
        if (confirm("Êtes-vous sûr de vouloir supprimer cette catégorie ?")) {
            try {
                const { api } = await import('../../../store/authStore');
                await api.delete(`/categories/delete_category/${id}`);
                
                alert("Catégorie supprimée avec succès");
                fetchCategories();
            } catch (error: any) {
                console.error("Erreur lors de la suppression:", error);
                alert(`Erreur lors de la suppression: ${error.message}`);
            }
        }
    };
    
    const startEditing = (category: any) => {
        setEditingCategory({
            id: category._id,
            nom: category.nom,
            description: category.description || ""
        });
    };
    
    const cancelEditing = () => {
        setEditingCategory(null);
    };
    
    const saveCategory = async () => {
        if (editingCategory && editingCategory.nom.trim()) {
            await updateCategory(
                editingCategory.id, 
                editingCategory.nom, 
                editingCategory.description
            );
            setEditingCategory(null);
            fetchCategories();
        }
    };
    const cancelAddForm = () => {
        setShowAddForm(false);
        setNewCategory("");
        setNewCategoryDescription("");
        setShowDescriptionField(false);
    };

    if (loadingCategories) {
        return <div className="flex justify-center p-8"><p>Chargement des catégories...</p></div>;
    }

    if (error) {
        return (
            <div className="bg-red-50 p-4 rounded-md">
                <p className="text-red-700">Erreur: {error}</p>
                <button 
                    className="mt-2 text-sm text-primary hover:text-secondary"
                    onClick={() => fetchCategories()}
                >
                    Réessayer
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Gestion des catégories</h2>
                {!showAddForm && (
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary focus:outline-none flex items-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Ajouter une catégorie
                    </button>
                )}
            </div>

            <div className="bg-white p-4 rounded-lg ring-1 ring-gray-200">
                {showAddForm && (
                    <div className="mb-4 p-4 border border-gray-200 rounded-md bg-gray-50">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="font-medium">Nouvelle catégorie</h3>
                            <button
                                onClick={cancelAddForm}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                        <div className="mb-3">
                            <label htmlFor="category-name" className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                            <input
                                id="category-name"
                                type="text"
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                placeholder="Nom de la catégorie"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                            />
                        </div>
                        
                        <div className="mb-3">
                            <div className="flex justify-between items-center mb-1">
                                <label htmlFor="category-description" className="block text-sm font-medium text-gray-700">Description (optionnelle)</label>
                                <button
                                    onClick={() => setShowDescriptionField(!showDescriptionField)}
                                    className="text-xs text-gray-500 hover:text-gray-700"
                                >
                                    {showDescriptionField ? "Masquer" : "Afficher"}
                                </button>
                            </div>
                            {showDescriptionField && (
                                <textarea
                                    id="category-description"
                                    value={newCategoryDescription}
                                    onChange={(e) => setNewCategoryDescription(e.target.value)}
                                    placeholder="Description de la catégorie"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                                    rows={3}
                                />
                            )}
                        </div>
                        
                        <div className="flex justify-end">
                            <button
                                onClick={cancelAddForm}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none mr-2"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleAddCategory}
                                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary focus:outline-none"
                                disabled={!newCategory.trim()}
                            >
                                Ajouter
                            </button>
                        </div>
                    </div>
                )}

                <div className="overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ressources</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {categories.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                                        Aucune catégorie trouvée
                                    </td>
                                </tr>
                            ) : (
                                categories.map((category) => (
                                    <tr key={category._id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {editingCategory && editingCategory.id === category._id ? (
                                                <input
                                                    type="text"
                                                    value={editingCategory.nom}
                                                    onChange={(e) => setEditingCategory({...editingCategory, nom: e.target.value})}
                                                    className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                                                />
                                            ) : (
                                                <div className="text-sm font-medium text-gray-900">{category.nom}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {editingCategory && editingCategory.id === category._id ? (
                                                <textarea
                                                    value={editingCategory.description}
                                                    onChange={(e) => setEditingCategory({...editingCategory, description: e.target.value})}
                                                    className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                                                    rows={2}
                                                />
                                            ) : (
                                                <div className="text-sm text-gray-500 max-w-md truncate">
                                                    {category.description || <span className="text-gray-400 italic">Aucune description</span>}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">{category.resourceCount || 0}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {editingCategory && editingCategory.id === category._id ? (
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={saveCategory}
                                                        className="text-green-600 hover:text-green-800"
                                                        disabled={!editingCategory.nom.trim()}
                                                    >
                                                        Enregistrer
                                                    </button>
                                                    <button
                                                        onClick={cancelEditing}
                                                        className="text-gray-600 hover:text-gray-800"
                                                    >
                                                        Annuler
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex space-x-3">
                                                    <button
                                                        onClick={() => startEditing(category)}
                                                        className="text-blue-600 hover:text-blue-800"
                                                    >
                                                        Modifier
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteCategory(category._id)}
                                                        className="text-red-600 hover:text-red-800"
                                                        disabled={!!(category.resourceCount && category.resourceCount > 0)}
                                                        title={category.resourceCount && category.resourceCount > 0 ? "Impossible de supprimer une catégorie utilisée par des ressources" : ""}
                                                    >
                                                        Supprimer
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CategoriesPanel;