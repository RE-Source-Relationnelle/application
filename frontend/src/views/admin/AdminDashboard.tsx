import { useState, useEffect } from 'react';
import { BarChart3, Users, FileText, Tag, Shield } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useResourcesStore from '../../store/resourcesStore';
import { Resource } from '../../types/types';

// Composants fictifs pour la démonstration
const StatisticsPanel = () => (
    <div className="space-y-4">
        <h2 className="text-xl font-semibold">Statistiques d'utilisation</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg ring-1 ring-gray-200">
                <h3 className="text-sm font-medium text-gray-500">Utilisateurs actifs</h3>
                <p className="text-2xl font-bold">1,245</p>
                <p className="text-xs text-green-500">+12% depuis le mois dernier</p>
            </div>

            <div className="bg-white p-4 rounded-lg ring-1 ring-gray-200">
                <h3 className="text-sm font-medium text-gray-500">Nouveaux posts</h3>
                <p className="text-2xl font-bold">342</p>
                <p className="text-xs text-green-500">+5% depuis le mois dernier</p>
            </div>

            <div className="bg-white p-4 rounded-lg ring-1 ring-gray-200">
                <h3 className="text-sm font-medium text-gray-500">Interactions</h3>
                <p className="text-2xl font-bold">2,456</p>
                <p className="text-xs text-red-500">-3% depuis le mois dernier</p>
            </div>

            <div className="bg-white p-4 rounded-lg ring-1 ring-gray-200">
                <h3 className="text-sm font-medium text-gray-500">Temps moyen</h3>
                <p className="text-2xl font-bold">8m 12s</p>
                <p className="text-xs text-green-500">+2% depuis le mois dernier</p>
            </div>
        </div>

        <div className="bg-white p-4 rounded-lg ring-1 ring-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-4">Activité des utilisateurs (30 derniers jours)</h3>
            <div className="h-64 flex items-end space-x-2">
                {Array.from({ length: 30 }).map((_, i) => {
                    const height = Math.random() * 100;
                    return (
                        <div key={i} className="flex-1 flex flex-col items-center">
                            <div
                                className="w-full bg-primary rounded-t"
                                style={{ height: `${height}%` }}
                            ></div>
                            {i % 5 === 0 && <span className="text-xs mt-1">{i + 1}</span>}
                        </div>
                    );
                })}
            </div>
        </div>
    </div>
);

const UsersPanel = () => (
    <div className="space-y-4">
        <h2 className="text-xl font-semibold">Gestion des utilisateurs</h2>

        <div className="bg-white rounded-lg ring-1 ring-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateur</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {[
                        { id: 1, name: "Emma Lefevre", email: "emma.lefevre@example.com", role: "Super Admin", status: "Actif" },
                        { id: 2, name: "Thomas Dubois", email: "thomas.dubois@example.com", role: "Admin", status: "Actif" },
                        { id: 3, name: "Sophie Martin", email: "sophie.martin@example.com", role: "Utilisateur", status: "Actif" },
                        { id: 4, name: "Lucas Bernard", email: "lucas.bernard@example.com", role: "Modérateur", status: "Inactif" },
                        { id: 5, name: "Camille Petit", email: "camille.petit@example.com", role: "Utilisateur", status: "Actif" },
                    ].map((user) => (
                        <tr key={user.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{user.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{user.role}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'Actif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {user.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <button className="text-primary hover:text-secondary mr-2">Modifier</button>
                                <button className="text-red-600 hover:text-red-800">Suspendre</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

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

const CategoriesPanel = () => {
    const { categories, loadingCategories, error, fetchCategories, createCategory, deleteCategory } = useResourcesStore();
    const [newCategory, setNewCategory] = useState("");
    const [newCategoryDescription, setNewCategoryDescription] = useState("");
    const [showDescriptionField, setShowDescriptionField] = useState(false);

    // Charger les catégories au montage du composant
    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleAddCategory = async () => {
        if (newCategory.trim()) {
            await createCategory(newCategory, newCategoryDescription);
            setNewCategory("");
            setNewCategoryDescription("");
            setShowDescriptionField(false);
        }
    };

    const handleDeleteCategory = async (id: string) => {
        // Vérifier si la catégorie est utilisée par des ressources
        const categoryInUse = categories.find(cat => cat._id === id)?.resourceCount && categories.find(cat => cat._id === id)?.resourceCount! > 0;
        
        if (categoryInUse) {
            alert("Impossible de supprimer une catégorie utilisée par des ressources.");
            return;
        }
        
        if (confirm("Êtes-vous sûr de vouloir supprimer cette catégorie ?")) {
            await deleteCategory(id);
        }
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
            <h2 className="text-xl font-semibold">Gestion des catégories</h2>

            <div className="bg-white p-4 rounded-lg ring-1 ring-gray-200">
                <div className="mb-4">
                    <div className="flex mb-2">
                        <input
                            type="text"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            placeholder="Nom de la catégorie"
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-primary focus:border-primary"
                        />
                        {!showDescriptionField ? (
                            <button
                                onClick={() => setShowDescriptionField(true)}
                                className="px-4 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 focus:outline-none"
                            >
                                + Description
                            </button>
                        ) : null}
                        <button
                            onClick={handleAddCategory}
                            className="px-4 py-2 bg-primary text-white rounded-r-md hover:bg-secondary focus:outline-none"
                            disabled={!newCategory.trim()}
                        >
                            Ajouter
                        </button>
                    </div>
                    
                    {showDescriptionField && (
                        <div className="mt-2">
                            <textarea
                                value={newCategoryDescription}
                                onChange={(e) => setNewCategoryDescription(e.target.value)}
                                placeholder="Description (optionnelle)"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                                rows={3}
                            />
                            <button
                                onClick={() => setShowDescriptionField(false)}
                                className="mt-1 text-sm text-gray-500 hover:text-gray-700"
                            >
                                Masquer la description
                            </button>
                        </div>
                    )}
                </div>

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
                                            <div className="text-sm font-medium text-gray-900">{category.nom}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-500 max-w-md truncate">
                                                {category.description || <span className="text-gray-400 italic">Aucune description</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">{category.resourceCount || 0}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <button
                                                onClick={() => handleDeleteCategory(category._id)}
                                                className="text-red-600 hover:text-red-800"
                                                disabled={!!(category.resourceCount && category.resourceCount > 0)}
                                                title={category.resourceCount && category.resourceCount > 0 ? "Impossible de supprimer une catégorie utilisée par des ressources" : ""}
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
        </div>
    );
};

const AdminsPanel = () => {
    const [admins, setAdmins] = useState([
        { id: 1, name: "Emma Lefevre", email: "emma.lefevre@example.com", role: "Super Admin" },
        { id: 2, name: "Thomas Dubois", email: "thomas.dubois@example.com", role: "Admin" },
        { id: 3, name: "Lucas Bernard", email: "lucas.bernard@example.com", role: "Modérateur" },
    ]);

    const [newAdmin, setNewAdmin] = useState({
        email: "",
        role: "Modérateur"
    });

    const handleAddAdmin = () => {
        if (newAdmin.email.trim()) {
            setAdmins([
                ...admins,
                {
                    id: admins.length + 1,
                    name: newAdmin.email.split('@')[0].replace('.', ' '),
                    email: newAdmin.email,
                    role: newAdmin.role
                }
            ]);
            setNewAdmin({ email: "", role: "Modérateur" });
        }
    };

    const handleDeleteAdmin = (id: number) => {
        setAdmins(admins.filter(admin => admin.id !== id));
    };

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Gestion des administrateurs</h2>

            <div className="bg-white p-4 rounded-lg ring-1 ring-gray-200">
                <div className="flex mb-4 space-x-2">
                    <input
                        type="email"
                        value={newAdmin.email}
                        onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                        placeholder="Email"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                    />
                    <select
                        value={newAdmin.role}
                        onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value })}
                        className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                    >
                        <option value="Modérateur">Modérateur</option>
                        <option value="Admin">Admin</option>
                        <option value="Super Admin">Super Admin</option>
                    </select>
                    <button
                        onClick={handleAddAdmin}
                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary focus:outline-none"
                    >
                        Ajouter
                    </button>
                </div>

                <div className="overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {admins.map((admin) => (
                                <tr key={admin.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{admin.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">{admin.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">{admin.role}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <button
                                            onClick={() => handleDeleteAdmin(admin.id)}
                                            className="text-red-600 hover:text-red-800"
                                            disabled={admin.email === "emma.lefevre@example.com"} // Ne pas permettre de supprimer le super admin principal
                                        >
                                            Supprimer
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('statistics');
    const { user } = useAuthStore();

    // Déterminer si l'utilisateur est super admin
    const isSuperAdmin = user?.mail === "emma.lefevre@example.com";

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold mb-6">Tableau de bord d'administration</h1>

                <div className="flex flex-col md:flex-row">
                    {/* Sidebar de navigation */}
                    <div className="w-full md:w-64 mb-6 md:mb-0 md:mr-6">
                        <div className="bg-white rounded-lg ring-1 ring-gray-200 overflow-hidden">
                            <div className="p-4 border-b">
                                <h2 className="font-semibold">Menu d'administration</h2>
                            </div>

                            <nav className="p-2 flex flex-col gap-2">
                                <button
                                    onClick={() => setActiveTab('statistics')}
                                    className={`flex items-center w-full px-4 py-2 rounded-md text-left ${activeTab === 'statistics' ? 'bg-primary text-white' : 'hover:bg-gray-100'}`}
                                >
                                    <BarChart3 className="h-5 w-5 mr-2" />
                                    <span>Statistiques</span>
                                </button>

                                <button
                                    onClick={() => setActiveTab('users')}
                                    className={`flex items-center w-full px-4 py-2 rounded-md text-left ${activeTab === 'users' ? 'bg-primary text-white' : 'hover:bg-gray-100'}`}
                                >
                                    <Users className="h-5 w-5 mr-2" />
                                    <span>Utilisateurs</span>
                                </button>

                                <button
                                    onClick={() => setActiveTab('posts')}
                                    className={`flex items-center w-full px-4 py-2 rounded-md text-left ${activeTab === 'posts' ? 'bg-primary text-white' : 'hover:bg-gray-100'}`}
                                >
                                    <FileText className="h-5 w-5 mr-2" />
                                    <span>Publications</span>
                                </button>

                                <button
                                    onClick={() => setActiveTab('categories')}
                                    className={`flex items-center w-full px-4 py-2 rounded-md text-left ${activeTab === 'categories' ? 'bg-primary text-white' : 'hover:bg-gray-100'}`}
                                >
                                    <Tag className="h-5 w-5 mr-2" />
                                    <span>Catégories</span>
                                </button>

                                {isSuperAdmin && (
                                    <button
                                        onClick={() => setActiveTab('admins')}
                                        className={`flex items-center w-full px-4 py-2 rounded-md text-left ${activeTab === 'admins' ? 'bg-primary text-white' : 'hover:bg-gray-100'}`}
                                    >
                                        <Shield className="h-5 w-5 mr-2" />
                                        <span>Administrateurs</span>
                                    </button>
                                )}
                            </nav>
                        </div>
                    </div>

                    {/* Contenu principal */}
                    <div className="flex-1">
                        <div className="bg-white rounded-lg ring-1 ring-gray-200 p-6">
                            {activeTab === 'statistics' && <StatisticsPanel />}
                            {activeTab === 'users' && <UsersPanel />}
                            {activeTab === 'posts' && <PostsPanel />}
                            {activeTab === 'categories' && <CategoriesPanel />}
                            {activeTab === 'admins' && isSuperAdmin && <AdminsPanel />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;