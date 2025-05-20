import { useState, useEffect } from 'react';
import useRoleStore, { Role, CreateRoleData, UpdateRoleData } from '../../store/roleStore';
import useAuthStore from '../../store/authStore';
import { PlusCircle, Edit, Trash2, X, Check } from 'lucide-react';

const RolesPanel = () => {
    const { roles, loading, error, fetchRoles, createRole, updateRole, deleteRole } = useRoleStore();
    const { user } = useAuthStore();
    
    // Vérifier si l'utilisateur est administrateur ou super-administrateur
    const isAdmin = user?.role?.nom_role === "administrateur" || user?.role?.nom_role === "super-administrateur";
    
    // État local pour le formulaire de création
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newRole, setNewRole] = useState<CreateRoleData>({
        nom_role: '',
        description: '',
        permissions: []
    });
    
    // État local pour l'édition
    const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
    const [editingRole, setEditingRole] = useState<UpdateRoleData>({
        nom_role: '',
        description: '',
        permissions: []
    });
    
    // Charger les rôles au montage du composant
    useEffect(() => {
        fetchRoles();
    }, [fetchRoles]);
    
    // Gestionnaire pour la création d'un rôle
    const handleCreateRole = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            await createRole(newRole);
            setShowCreateForm(false);
            setNewRole({
                nom_role: '',
                description: '',
                permissions: []
            });
        } catch (err) {
            console.error('Erreur lors de la création du rôle:', err);
        }
    };
    
    // Gestionnaire pour la mise à jour d'un rôle
    const handleUpdateRole = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!editingRoleId) return;
        
        try {
            await updateRole(editingRoleId, editingRole);
            setEditingRoleId(null);
        } catch (err) {
            console.error('Erreur lors de la mise à jour du rôle:', err);
        }
    };
    
    // Gestionnaire pour la suppression d'un rôle
    const handleDeleteRole = async (id: string) => {
        console.log(` Tentative de suppression du rôle avec l'ID: ${id}`);
        
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce rôle ? Cette action est irréversible.')) {
            try {
                console.log(' Confirmation reçue, appel de la fonction deleteRole');
                const result = await deleteRole(id);
                
                if (result) {
                    console.log(' Suppression réussie, mise à jour de l\'interface');
                } else {
                    console.error(' La suppression a échoué');
                    alert('La suppression du rôle a échoué. Veuillez vérifier les logs pour plus de détails.');
                }
            } catch (err) {
                console.error(' Erreur lors de la suppression du rôle:', err);
                alert('Une erreur est survenue lors de la suppression du rôle.');
            }
        } else {
            console.log(' Suppression annulée par l\'utilisateur');
        }
    };
    
    // Démarrer l'édition d'un rôle
    const startEditing = (role: Role) => {
        setEditingRoleId(role._id);
        setEditingRole({
            nom_role: role.nom_role,
            description: role.description || '',
            permissions: role.permissions || []
        });
    };
    
    // Annuler l'édition
    const cancelEditing = () => {
        setEditingRoleId(null);
    };
    
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Gestion des rôles</h2>
                <button
                    onClick={() => setShowCreateForm(true)}
                    className="flex items-center px-3 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition"
                >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    <span>Ajouter un rôle</span>
                </button>
            </div>
            
            {/* Formulaire de création */}
            {showCreateForm && (
                <div className="bg-white p-4 rounded-lg ring-1 ring-gray-200 mb-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-medium">Nouveau rôle</h3>
                        <button
                            onClick={() => setShowCreateForm(false)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                    
                    <form onSubmit={handleCreateRole} className="space-y-4">
                        <div>
                            <label htmlFor="nom_role" className="block text-sm font-medium text-gray-700 mb-1">
                                Nom du rôle *
                            </label>
                            <input
                                type="text"
                                id="nom_role"
                                value={newRole.nom_role}
                                onChange={(e) => setNewRole({ ...newRole, nom_role: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                id="description"
                                value={newRole.description || ''}
                                onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                rows={3}
                            />
                        </div>
                        
                        <div className="flex justify-end space-x-2">
                            <button
                                type="button"
                                onClick={() => setShowCreateForm(false)}
                                className="px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                className="px-3 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
                                disabled={loading}
                            >
                                {loading ? 'Création...' : 'Créer le rôle'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
            
            {/* Message d'erreur */}
            {error && (
                <div className="bg-red-50 p-4 rounded-md text-red-700 mb-4">
                    {error}
                </div>
            )}
            
            {/* Liste des rôles */}
            <div className="bg-white rounded-lg ring-1 ring-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Nom du rôle
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Description
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {roles.map((role) => (
                            <tr key={role._id}>
                                {editingRoleId === role._id ? (
                                    // Mode édition
                                    <>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input
                                                type="text"
                                                value={editingRole.nom_role || ''}
                                                onChange={(e) => setEditingRole({ ...editingRole, nom_role: e.target.value })}
                                                className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                                required
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <textarea
                                                value={editingRole.description || ''}
                                                onChange={(e) => setEditingRole({ ...editingRole, description: e.target.value })}
                                                className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                                rows={2}
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={handleUpdateRole}
                                                className="text-green-600 hover:text-green-900 mr-2"
                                                disabled={loading}
                                            >
                                                <Check className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={cancelEditing}
                                                className="text-gray-600 hover:text-gray-900"
                                            >
                                                <X className="h-5 w-5" />
                                            </button>
                                        </td>
                                    </>
                                ) : (
                                    // Mode affichage
                                    <>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{role.nom_role}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-500">{role.description || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => startEditing(role)}
                                                className="text-indigo-600 hover:text-indigo-900 mr-2"
                                                disabled={loading}
                                            >
                                                <Edit className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteRole(role._id)}
                                                className="text-red-600 hover:text-red-900"
                                                disabled={loading || role.nom_role === 'super-administrateur'}
                                                title={role.nom_role === 'super-administrateur' || role.nom_role === 'administrateur' ? 'Les rôles système ne peuvent pas être supprimés' : ''}
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                        
                        {roles.length === 0 && !loading && (
                            <tr>
                                <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                                    Aucun rôle trouvé
                                </td>
                            </tr>
                        )}
                        
                        {loading && (
                            <tr>
                                <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                                    Chargement...
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            <div className="text-sm text-gray-500">
                <p>* Les rôles système (super-administrateur et administrateur) ne peuvent pas être supprimés.</p>
                <p>* Les modifications apportées aux rôles peuvent affecter les permissions des utilisateurs.</p>
            </div>
        </div>
    );
};

export default RolesPanel;
