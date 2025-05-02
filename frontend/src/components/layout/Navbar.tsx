import { Link, useNavigate } from 'react-router-dom'
import { Search, User, PlusCircle, Settings, LogOut, ChevronDown, Menu, X } from 'lucide-react';
import { useState } from 'react';
import useAuthStore from '../../store/authStore';


const Navbar = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const { logout, isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  // Simulation de la vérification du rôle admin
  // À remplacer par une vérification réelle basée sur les données de l'utilisateur
  const isAdmin = user?.email === "emma.lefevre@example.com"; // Exemple temporaire

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  const toggleCategoryMenu = () => {
    setIsCategoryMenuOpen(!isCategoryMenuOpen);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/connexion');
  };

  // Composant réutilisable pour la barre de recherche
  const SearchBar = ({ isMobile = false }) => (
    <div className={`${isMobile ? 'w-full' : 'max-w-sm w-full'}`}>
      <div className="relative flex">
        <input
          type="text"
          placeholder="Rechercher"
          className={`w-full ${isMobile ? 'px-3 py-1 text-sm' : 'px-4 py-2 sm:text-sm'} border-b-2 border-primary rounded-tl-[4px] bg-gray-100 focus:outline-none focus:ring-0 focus:ring-transparent`}
          aria-label="Champ de recherche"
        />
        <button
          type="button"
          className={`bg-primary hover:bg-secondary text-white ${isMobile ? 'px-2 py-1' : 'px-3 py-2'} rounded-tr-[4px] flex items-center justify-center focus:outline-none focus:ring-0 focus:ring-transparent`}
          aria-label="Rechercher"
        >
          <Search className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
        </button>
      </div>
    </div>
  );

  return (
    <nav className="bg-white shadow relative z-10 sticky top-0">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/feed" className="flex-shrink-0">
              {/* Logo Desktop */}
              <img src="/img/logo-ressources-relationnelles.svg" alt="Logo" className="h-8 w-auto hidden md:block" />
              {/* Logo Mobile (favicon) */}
              <img src="/img/favicon-ressources-relationnelles.svg" alt="Logo" className="h-8 w-auto md:hidden" />
            </Link>
          </div>

          {/* Espace vide en mobile pour pousser les éléments vers la droite */}
          <div className="flex-grow md:hidden"></div>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex items-center justify-center flex-1 mx-8">
            <SearchBar />
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4 justify-end">
            {/* Mobile Admin Icon (if admin) */}
            {isAuthenticated && isAdmin && (
              <Link to="/admin" className="md:hidden p-2 text-gray-600 hover:text-primary" title="Administration">
                <Settings className="h-5 w-5" />
              </Link>
            )}

            {/* Mobile Search Icon */}
            <button
              onClick={toggleSearch}
              className="md:hidden p-2 text-gray-600 hover:text-primary"
              aria-label="Ouvrir la recherche"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Desktop Actions */}
            {isAuthenticated ? (
              <div className="hidden md:flex items-center space-x-4">
                {/* Créer un post */}
                <Link to="/create-post" className="p-2 text-gray-600 hover:text-primary" title="Créer un post">
                  <PlusCircle className="h-5 w-5" />
                </Link>
                
                {/* Menu des catégories */}
                <div className="relative">
                  <button 
                    onClick={toggleCategoryMenu}
                    className="p-2 text-gray-600 hover:text-primary flex items-center"
                    title="Catégories"
                  >
                    <Menu className="h-5 w-5" />
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </button>
                  
                  {/* Menu déroulant des catégories */}
                  {isCategoryMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
                      <Link to="/category/famille" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Famille
                      </Link>
                      <Link to="/category/sante" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Santé
                      </Link>
                      <Link to="/category/education" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Éducation
                      </Link>
                      <Link to="/category/environnement" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Environnement
                      </Link>
                    </div>
                  )}
                </div>
                
                {/* Accès backoffice (si admin) */}
                {isAdmin && (
                  <Link to="/admin" className="p-2 text-gray-600 hover:text-primary" title="Administration">
                    <Settings className="h-5 w-5" />
                  </Link>
                )}
                
                {/* Mon compte */}
                <Link to="/profile" className="p-2 text-gray-600 hover:text-primary" title="Mon compte">
                  <User className="h-5 w-5" />
                </Link>
                
                {/* Se déconnecter */}
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-600 hover:text-primary"
                  title="Se déconnecter"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="hidden md:block">
                <Link to="/connexion" className="py-2 px-6 text-sm text-white bg-primary hover:bg-secondary">
                  Se connecter →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Modal */}
      {isSearchOpen && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-20 flex items-start justify-center pt-20">
          <div className="bg-white w-11/12 p-4 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Rechercher</h3>
              <button onClick={toggleSearch} aria-label="Fermer la recherche">
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            <SearchBar isMobile={true} />
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar