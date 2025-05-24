import { Link, useNavigate } from 'react-router-dom'
import { Search, User, PlusCircle, Settings, ChevronDown, LogOut } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import useAuthStore from '../../store/authStore';
import ResourceModal from '../features/ressources/ResourceModal';
import useResourcesStore from '../../store/resourcesStore';
import { useToast } from '../../contexts/ToastContext';
import useSearchStore from '../../store/searchStore';

const Navbar = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const { logout, isAuthenticated, user } = useAuthStore();
  const { createResource } = useResourcesStore();
  const { showToast } = useToast();
  const { query, setQuery } = useSearchStore();
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = user?.role?.nom_role === "administrateur" || user?.role?.nom_role === "super-administrateur";

  // Gestion de la barre de recherche
  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    setTimeout(() => {
      if (!isSearchOpen && searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 100);
  };

  // Gestion du menu des catégories
  const toggleCategoryMenu = () => {
    setIsCategoryMenuOpen(!isCategoryMenuOpen);
  };

  // Gestion de la déconnexion
  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Gestion de la création d'une ressource
  const handleCreateResource = async (data: { titre: string, contenu: string, id_categorie?: string }) => {
    console.log('Création d\'une nouvelle ressource avec les données suivantes:', data);
    
    try {
      const result = await createResource(data);
      console.log('Ressource créée avec succès:', result);
      
      showToast(
        'Votre ressource a été créée avec succès et est en attente de validation par un modérateur.',
        'success'
      );
    } catch (error) {
      console.error('Erreur lors de la création de la ressource:', error);
      showToast(
        'Une erreur est survenue lors de la création de la ressource. Veuillez réessayer.',
        'error'
      );
    }
  };

  // Fonction pour gérer la soumission de la recherche
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setIsSearchOpen(false);
    }
  };

  // Composant réutilisable pour la barre de recherche
  const SearchBar = ({ isMobile = false }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    
    useEffect(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, []);
    
    return (
      <div className={`${isMobile ? 'w-full' : 'max-w-sm w-full'}`}>
        <form onSubmit={handleSearch} className="relative flex">
          <input
            ref={isMobile ? searchInputRef : inputRef}
            type="text"
            placeholder="Rechercher"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={`w-full ${isMobile ? 'px-3 py-1 text-sm' : 'px-4 py-2 sm:text-sm'} border-b-2 border-primary rounded-tl-[4px] bg-gray-100 focus:outline-none focus:ring-0 focus:ring-transparent`}
            aria-label="Champ de recherche"
          />
          <button
            type="submit"
            className={`bg-primary hover:bg-secondary text-white ${isMobile ? 'px-2 py-1' : 'px-3 py-2'} rounded-tr-[4px] flex items-center justify-center focus:outline-none focus:ring-0 focus:ring-transparent`}
            aria-label="Rechercher"
          >
            <Search className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
          </button>
        </form>
      </div>
    );
  };

  return (
    <nav className="bg-white ring-gray-200 ring-1 relative z-10 sticky top-0">
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

            {isAuthenticated ? (
              <div className="hidden md:flex items-center space-x-4">
                <button 
                  onClick={() => setIsResourceModalOpen(true)} 
                  className="p-2 text-gray-600 hover:text-primary" 
                  title="Créer une ressource"
                >
                  <PlusCircle className="h-5 w-5" />
                </button>
                
                {/* Menu des catégories */}
                <div className="relative">
                  <button 
                    onClick={toggleCategoryMenu}
                    className="p-2 text-gray-600 hover:text-primary flex items-center"
                    aria-expanded={isCategoryMenuOpen}
                    aria-haspopup="true"
                  >
                    <span className="mr-1">Catégories</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${isCategoryMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {/* Dropdown Menu */}
                  {isCategoryMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-50">
                      <Link to="/categories/1" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Catégorie 1</Link>
                      <Link to="/categories/2" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Catégorie 2</Link>
                      <Link to="/categories/3" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Catégorie 3</Link>
                      <div className="border-t border-gray-100 my-1"></div>
                      <Link to="/categories" className="block px-4 py-2 text-sm text-primary hover:bg-gray-100">Toutes les catégories</Link>
                    </div>
                  )}
                </div>
                
                {/* Admin Link */}
                {isAdmin && (
                  <Link to="/admin" className="p-2 text-gray-600 hover:text-primary" title="Administration">
                    <Settings className="h-5 w-5" />
                  </Link>
                )}
                
                {/* User Menu */}
                <div className="relative ml-3">
                  <Link to="/profile">
                    <button
                      type="button"
                      className="flex text-sm rounded-full focus:outline-none hover:ring-2 hover:ring-primary/20"
                      aria-label="Accéder au profil"
                    >
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                        <User className="h-5 w-5" />
                      </div>
                    </button>
                  </Link>
                </div>
                
                {/* Logout Button */}
                <button 
                  onClick={handleLogout} 
                  className="p-2 text-gray-600 hover:text-primary" 
                  title="Déconnexion"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="hidden md:block">
                <Link
                  to="/"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Connexion
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Bar (conditionally rendered) */}
      {isSearchOpen && (
        <div className="md:hidden border-t border-gray-200 py-3 px-6">
          <SearchBar isMobile={true} />
        </div>
      )}
      
      {/* Modal de création de ressource */}
      <ResourceModal 
        isOpen={isResourceModalOpen}
        onClose={() => setIsResourceModalOpen(false)}
        mode="create"
        onSubmit={handleCreateResource}
        initialData={{ titre: '', contenu: '', id_categorie: '' }}
      />
    </nav>
  )
}

export default Navbar