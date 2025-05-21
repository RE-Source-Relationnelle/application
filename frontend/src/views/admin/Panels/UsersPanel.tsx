import { useState, useEffect } from 'react';
import useUsersStore from '../../../store/usersStore';
import useRoleStore from '../../../store/roleStore';

const UsersPanel = () => {
    const { users, loading, error, fetchUsers, updateUser, deleteUser } = useUsersStore();
    const { roles, fetchRoles } = useRoleStore();
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({
        nom: '',
        prenom: '',
        mail: '',
        role_id: '',
        is_active: true
    });
    
    // État pour le modal de confirmation de suppression
    const [deleteConfirmation, setDeleteConfirmation] = useState<{
        isOpen: boolean;
        userId: string;
        userName: string;
    }>({
        isOpen: false,
        userId: '',
        userName: ''
    });

    // Charger les utilisateurs et les rôles au montage du composant
    useEffect(() => {
        fetchUsers();
        fetchRoles();
    }, [fetchUsers, fetchRoles]);

    // Filtrer pour n'afficher que les utilisateurs avec les rôles "Citoyen" et "Modérateur"
    const filteredUsers = users.filter(user => {
        const roleName = user.role_info?.nom_role || getRoleName(user.role_id);
        return roleName === "Citoyen" || roleName === "Modérateur";
    });

    // Filtrer les rôles pour n'afficher que "Citoyen" et "Modérateur" dans le sélecteur
    const allowedRoles = roles.filter(role => 
        role.nom_role === "Citoyen" || role.nom_role === "Modérateur"
    );

    // Fonction pour commencer l'édition d'un utilisateur
    const handleEditUser = (user: any) => {
        setEditingUserId(user._id);
        setEditForm({
            nom: user.nom || '',
            prenom: user.prenom || '',
            mail: user.mail || '',
            role_id: user.role_id || '',
            is_active: user.is_active !== false // Par défaut actif si non spécifié
        });
    };

    // Fonction pour annuler l'édition
    const handleCancelEdit = () => {
        setEditingUserId(null);
    };

    // Fonction pour sauvegarder les modifications
    const handleSaveUser = async (userId: string) => {
        try {
            // Vérifier que le rôle sélectionné est autorisé (Citoyen ou Modérateur)
            const selectedRole = roles.find(role => role._id === editForm.role_id);
            if (selectedRole && (selectedRole.nom_role !== "Citoyen" && selectedRole.nom_role !== "Modérateur")) {
                alert("Vous ne pouvez attribuer que les rôles Citoyen ou Modérateur dans cette section.");
                return;
            }

            await updateUser(userId, editForm);
            setEditingUserId(null);
        } catch (error) {
            console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
            alert("Une erreur est survenue lors de la mise à jour de l'utilisateur.");
        }
    };

    // Fonction pour ouvrir le modal de confirmation de suppression
    const handleConfirmDelete = (userId: string, userName: string) => {
        setDeleteConfirmation({
            isOpen: true,
            userId,
            userName
        });
    };

    // Fonction pour fermer le modal de confirmation
    const handleCancelDelete = () => {
        setDeleteConfirmation({
            isOpen: false,
            userId: '',
            userName: ''
        });
    };

    // Fonction pour supprimer un utilisateur
    const handleDeleteUser = async () => {
        try {
            await deleteUser(deleteConfirmation.userId);
            handleCancelDelete();
        } catch (error) {
            console.error("Erreur lors de la suppression de l'utilisateur:", error);
            alert("Une erreur est survenue lors de la suppression de l'utilisateur.");
        }
    };

    // Fonction pour basculer le statut actif/inactif d'un utilisateur
    const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
        try {
            await updateUser(userId, { is_active: !currentStatus });
        } catch (error) {
            console.error("Erreur lors de la mise à jour du statut de l'utilisateur:", error);
            alert("Une erreur est survenue lors de la mise à jour du statut de l'utilisateur.");
        }
    };

    // Obtenir le nom du rôle à partir de l'ID
    const getRoleName = (roleId: string | undefined) => {
        if (!roleId) return 'Non défini';
        const role = roles.find(r => r._id === roleId);
        return role ? role.nom_role : 'Non défini';
    };

    if (loading) {
        return <div className="flex justify-center p-8"><p>Chargement des utilisateurs...</p></div>;
    }

    if (error) {
        return (
            <div className="bg-red-50 p-4 rounded-md">
                <p className="text-red-700">Erreur: {error}</p>
                <button 
                    className="mt-2 text-sm text-primary hover:text-secondary"
                    onClick={() => fetchUsers()}
                >
                    Réessayer
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Gestion des utilisateurs (Citoyens et Modérateurs)</h2>

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
                        {filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                                    Aucun utilisateur trouvé
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map((user) => (
                                <tr key={user._id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {editingUserId === user._id ? (
                                            <div className="flex space-x-2">
                                                <input
                                                    type="text"
                                                    value={editForm.prenom}
                                                    onChange={(e) => setEditForm({ ...editForm, prenom: e.target.value })}
                                                    placeholder="Prénom"
                                                    className="w-1/2 px-2 py-1 border border-gray-300 rounded-md"
                                                />
                                                <input
                                                    type="text"
                                                    value={editForm.nom}
                                                    onChange={(e) => setEditForm({ ...editForm, nom: e.target.value })}
                                                    placeholder="Nom"
                                                    className="w-1/2 px-2 py-1 border border-gray-300 rounded-md"
                                                />
                                            </div>
                                        ) : (
                                            <div className="text-sm font-medium text-gray-900">
                                                {user.prenom} {user.nom}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {editingUserId === user._id ? (
                                            <input
                                                type="email"
                                                value={editForm.mail}
                                                onChange={(e) => setEditForm({ ...editForm, mail: e.target.value })}
                                                placeholder="Email"
                                                className="w-full px-2 py-1 border border-gray-300 rounded-md"
                                            />
                                        ) : (
                                            <div className="text-sm text-gray-500">{user.mail}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {editingUserId === user._id ? (
                                            <select
                                                value={editForm.role_id}
                                                onChange={(e) => setEditForm({ ...editForm, role_id: e.target.value })}
                                                className="w-full px-2 py-1 border border-gray-300 rounded-md"
                                            >
                                                <option value="">Sélectionner un rôle</option>
                                                {allowedRoles.map(role => (
                                                    <option key={role._id} value={role._id}>
                                                        {role.nom_role}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <div className="text-sm text-gray-500">
                                                {user.role_info ? user.role_info.nom_role : getRoleName(user.role_id)}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {editingUserId === user._id ? (
                                            <select
                                                value={editForm.is_active ? 'active' : 'inactive'}
                                                onChange={(e) => setEditForm({ ...editForm, is_active: e.target.value === 'active' })}
                                                className="w-full px-2 py-1 border border-gray-300 rounded-md"
                                            >
                                                <option value="active">Actif</option>
                                                <option value="inactive">Inactif</option>
                                            </select>
                                        ) : (
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.is_active !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {user.is_active !== false ? 'Actif' : 'Inactif'}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {editingUserId === user._id ? (
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleSaveUser(user._id)}
                                                    className="text-green-600 hover:text-green-800"
                                                >
                                                    Enregistrer
                                                </button>
                                                <button
                                                    onClick={handleCancelEdit}
                                                    className="text-gray-600 hover:text-gray-800"
                                                >
                                                    Annuler
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleEditUser(user)}
                                                    className="text-primary hover:text-secondary"
                                                >
                                                    Modifier
                                                </button>
                                                <button
                                                    onClick={() => handleToggleStatus(user._id, user.is_active !== false)}
                                                    className={`${user.is_active !== false ? 'text-orange-600 hover:text-orange-800' : 'text-green-600 hover:text-green-800'}`}
                                                >
                                                    {user.is_active !== false ? 'Désactiver' : 'Activer'}
                                                </button>
                                                <button
                                                    onClick={() => handleConfirmDelete(user._id, `${user.prenom} ${user.nom}`)}
                                                    className="text-red-600 hover:text-red-800"
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

            {/* Modal de confirmation de suppression */}
            {deleteConfirmation.isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg max-w-md w-full">
                        <h3 className="text-lg font-medium mb-4">Confirmer la suppression</h3>
                        <p className="mb-6">
                            Êtes-vous sûr de vouloir supprimer l'utilisateur <span className="font-semibold">{deleteConfirmation.userName}</span> ?
                            Cette action est irréversible.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={handleCancelDelete}
                                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleDeleteUser}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                            >
                                Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersPanel;