import { useState } from 'react';

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

export default AdminsPanel;