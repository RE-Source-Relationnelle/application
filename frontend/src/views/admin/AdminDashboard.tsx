import { useState, useEffect } from 'react';
import { BarChart3, Users, FileText, Tag, Shield, UserCog } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import RolesPanel from './Panels/RolesPanel';
import StatisticsPanel from './Panels/StatisticsPanel';
import UsersPanel from './Panels/UsersPanel';
import PostsPanel from './Panels/PostsPanel';
import CategoriesPanel from './Panels/CategoriesPanel';
import AdminsPanel from './Panels/AdminsPanel';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('statistics');
    const { user } = useAuthStore();

    // Déterminer si l'utilisateur est super admin en utilisant le rôle
    const isSuperAdmin = user?.role?.nom_role === "super-administrateur";
    
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
                                    <>
                                        <button
                                            onClick={() => setActiveTab('roles')}
                                            className={`flex items-center w-full px-4 py-2 rounded-md text-left ${activeTab === 'roles' ? 'bg-primary text-white' : 'hover:bg-gray-100'}`}
                                        >
                                            <UserCog className="h-5 w-5 mr-2" />
                                            <span>Rôles</span>
                                        </button>
                                        
                                        <button
                                            onClick={() => setActiveTab('admins')}
                                            className={`flex items-center w-full px-4 py-2 rounded-md text-left ${activeTab === 'admins' ? 'bg-primary text-white' : 'hover:bg-gray-100'}`}
                                        >
                                            <Shield className="h-5 w-5 mr-2" />
                                            <span>Administrateurs</span>
                                        </button>
                                    </>
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
                            {activeTab === 'roles' && isSuperAdmin && <RolesPanel />}
                            {activeTab === 'admins' && isSuperAdmin && <AdminsPanel />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;