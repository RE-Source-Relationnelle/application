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

export default UsersPanel;