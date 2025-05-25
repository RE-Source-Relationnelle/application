import { useState, useEffect } from 'react';
import useUsersStore, { User as AdminUser } from '../../../store/usersStore';
import useRoleStore from '../../../store/roleStore';
import useAuthStore from '../../../store/authStore';

const AdminsPanel = () => {
    const { users, loading, error, fetchUsers, updateUser } = useUsersStore();
    const { roles, fetchRoles } = useRoleStore();
    const { user: currentUser } = useAuthStore();
    const [newAdmin, setNewAdmin] = useState({
        email: "",
        role: ""
    });
    
    // Vérifier si l'utilisateur courant est un super-admin
    const isSuperAdmin = currentUser?.role?.nom_role === "super-administrateur";
    
    // Filtrer les utilisateurs qui sont admin ou super-admin
    const adminUsers = users.filter((user: AdminUser) => 
        user.role_info?.nom_role === "administrateur" || 
        user.role_info?.nom_role === "super-administrateur"
    );

    useEffect(() => {
        // Charger les utilisateurs et les rôles au chargement du composant
        fetchUsers();
        fetchRoles();
    }, [fetchUsers, fetchRoles]);

    // Trouver les rôles d'admin disponibles
    const adminRoles = roles.filter(role => 
        role.nom_role === "administrateur" || 
        role.nom_role === "super-administrateur"
    );

    // Log tous les rôles pour débogage
    useEffect(() => {
        if (roles.length > 0) {
            console.log("Tous les rôles disponibles:", roles);
            console.log("Rôle Citoyen existe:", roles.some(role => role.nom_role === "Citoyen"));
            console.log("Rôle citoyen (minuscule) existe:", roles.some(role => role.nom_role === "citoyen"));
            console.log("Rôles contenant 'citoyen' (insensible à la casse):", 
                roles.filter(role => role.nom_role.toLowerCase().includes("citoyen")));
        }
    }, [roles]);

    const handleAddAdmin = async () => {
        if (newAdmin.email.trim() && newAdmin.role) {
            try {
                // Trouver l'utilisateur par email
                const userToUpdate = users.find((user: AdminUser) => user.mail === newAdmin.email);
                
                if (userToUpdate) {
                    // Vérifier si on essaie de promouvoir en super-admin alors qu'on n'est pas super-admin
                    const selectedRole = roles.find(role => role.nom_role === newAdmin.role);
                    
                    if (selectedRole) {
                        // Vérifier si on a le droit de promouvoir à ce rôle
                        if (selectedRole.nom_role === "super-administrateur" && !isSuperAdmin) {
                            alert("Vous n'avez pas les droits pour promouvoir un utilisateur en super-administrateur");
                            return;
                        }
                        
                        // Mettre à jour le rôle de l'utilisateur
                        await updateUser(userToUpdate._id, { role_id: selectedRole._id });
                        // Rafraîchir la liste des utilisateurs
                        fetchUsers();
                        setNewAdmin({ email: "", role: "" });
                    }
                } else {
                    alert("Utilisateur non trouvé avec cet email");
                }
            } catch (error) {
                console.error("Erreur lors de l'ajout d'un administrateur:", error);
                alert("Erreur lors de l'ajout d'un administrateur");
            }
        }
    };

    const handleDeleteAdmin = async (userId: string, userRole: string) => {
        // Vérifier si l'utilisateur courant est un super-admin qui essaie de rétrograder un autre super-admin
        if (userRole === "super-administrateur" && !isSuperAdmin) {
            alert("Vous n'avez pas les droits pour rétrograder un super-administrateur");
            return;
        }
        
        try {
            // Trouver le rôle "Citoyen" pour rétrograder l'admin (recherche insensible à la casse)
            const citizenRole = roles.find(role => 
                role.nom_role.toLowerCase() === "citoyen".toLowerCase()
            );
            
            if (citizenRole) {
                // Rétrograder l'admin en citoyen au lieu de le supprimer complètement
                await updateUser(userId, { role_id: citizenRole._id });
                // Rafraîchir la liste des utilisateurs
                fetchUsers();
            } else {
                console.error("Rôle Citoyen non trouvé. Rôles disponibles:", roles.map(r => r.nom_role));
                alert("Impossible de trouver le rôle Citoyen");
            }
        } catch (error) {
            console.error("Erreur lors de la suppression d'un administrateur:", error);
            alert("Erreur lors de la suppression d'un administrateur");
        }
    };

    // Fonction pour déterminer si un utilisateur peut être modifié
    const canManageUser = (userRole: string) => {
        // Un super-admin ne peut pas être modifié par un non super-admin
        if (userRole === "super-administrateur" && !isSuperAdmin) {
            return false;
        }
        
        // Un super-admin ne peut pas être modifié par un autre super-admin
        if (userRole === "super-administrateur" && isSuperAdmin && currentUser?.id !== userRole) {
            return false;
        }
        
        return true;
    };

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Gestion des administrateurs</h2>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    Erreur: {error}
                </div>
            )}

            <div className="bg-white p-4 rounded-lg ring-1 ring-gray-200">
                <div className="flex flex-col md:flex-row gap-2 mb-4">
                    <input
                        type="email"
                        value={newAdmin.email}
                        onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                        placeholder="Email de l'utilisateur"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                    />
                    <select
                        value={newAdmin.role}
                        onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value })}
                        className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                    >
                        <option value="">Sélectionner un rôle</option>
                        {adminRoles
                            // Filtrer les rôles que l'utilisateur courant peut attribuer
                            .filter(role => isSuperAdmin || role.nom_role !== "super-administrateur")
                            .map(role => (
                                <option key={role._id} value={role.nom_role}>
                                    {role.nom_role}
                                </option>
                            ))
                        }
                    </select>
                    <button
                        onClick={handleAddAdmin}
                        disabled={loading || !newAdmin.email || !newAdmin.role}
                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary focus:outline-none disabled:opacity-50"
                    >
                        {loading ? 'Chargement...' : 'Ajouter'}
                    </button>
                </div>

                <div className="overflow-hidden">
                    {loading ? (
                        <p className="text-center py-4">Chargement des administrateurs...</p>
                    ) : (
                        <>
                            {/* Version desktop : tableau */}
                            <div className="hidden md:block">
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
                                        {adminUsers.length > 0 ? (
                                            adminUsers.map((admin: AdminUser) => {
                                                const userRole = admin.role_info?.nom_role || "";
                                                const isCurrentUser = admin._id === currentUser?.id;
                                                const canManage = canManageUser(userRole) && !isCurrentUser;
                                                
                                                return (
                                                    <tr key={admin._id}>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {admin.prenom} {admin.nom}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-500">{admin.mail}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-500">
                                                                {admin.role_info?.nom_role || "Rôle inconnu"}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {canManage ? (
                                                                <button
                                                                    onClick={() => handleDeleteAdmin(admin._id, userRole)}
                                                                    className="text-red-600 hover:text-red-800"
                                                                    disabled={loading}
                                                                >
                                                                    Rétrograder
                                                                </button>
                                                            ) : (
                                                                <span className="text-gray-400">
                                                                    {isCurrentUser ? "Vous-même" : "Non modifiable"}
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                                                    Aucun administrateur trouvé
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            
                            {/* Version mobile : cartes */}
                            <div className="md:hidden">
                                {adminUsers.length === 0 ? (
                                    <div className="px-4 py-6 text-center text-sm text-gray-500">
                                        Aucun administrateur trouvé
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-200">
                                        {adminUsers.map((admin: AdminUser) => {
                                            const userRole = admin.role_info?.nom_role || "";
                                            const isCurrentUser = admin._id === currentUser?.id;
                                            const canManage = canManageUser(userRole) && !isCurrentUser;
                                            
                                            return (
                                                <div key={admin._id} className="p-4 space-y-3">
                                                    <div>
                                                        <h3 className="text-base font-medium text-gray-900">
                                                            {admin.prenom} {admin.nom}
                                                        </h3>
                                                        <p className="text-sm text-gray-500 mt-1">
                                                            {admin.mail}
                                                        </p>
                                                    </div>
                                                    
                                                    <div className="flex justify-between items-center">
                                                        <div className="bg-blue-50 text-blue-700 px-2 py-1 text-xs rounded-full">
                                                            {admin.role_info?.nom_role || "Rôle inconnu"}
                                                        </div>
                                                        
                                                        {canManage ? (
                                                            <button
                                                                onClick={() => handleDeleteAdmin(admin._id, userRole)}
                                                                className="px-3 py-1 bg-red-50 text-red-700 rounded hover:bg-red-100 text-xs"
                                                                disabled={loading}
                                                            >
                                                                Rétrograder
                                                            </button>
                                                        ) : (
                                                            <span className="text-xs text-gray-400 italic">
                                                                {isCurrentUser ? "Vous-même" : "Non modifiable"}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminsPanel;