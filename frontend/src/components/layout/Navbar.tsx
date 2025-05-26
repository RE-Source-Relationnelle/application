import { Link, useNavigate } from 'react-router-dom'
import { Search, User, PlusCircle, Settings, ChevronDown, LogOut, ShieldAlert } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import useAuthStore from '../../store/authStore';
import ResourceModal from '../features/ressources/ResourceModal';
import useResourcesStore from '../../store/resourcesStore';
import { useToast } from '../../contexts/ToastContext';
import useSearchStore from '../../store/searchStore';
import useCategoryStore from '../../store/categoryStore';
import PWAInstallButton from '../ui/PWAInstallButton';

const Navbar = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const { logout, isAuthenticated, user } = useAuthStore();
  const { createResource } = useResourcesStore();
  const { showToast } = useToast();
  const { query, setQuery } = useSearchStore();
  const { categories, fetchCategories } = useCategoryStore();
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const categoryMenuRef = useRef<HTMLDivElement>(null);

  const isAdmin = user?.role?.nom_role === "administrateur" || user?.role?.nom_role === "super-administrateur";
  const isModerator = user?.role?.nom_role === "modérateur" || user?.role?.nom_role === "Modérateur";

  // Charger les catégories au montage du composant
  useEffect(() => {
    if (isAuthenticated) {
      fetchCategories();
    }
  }, [isAuthenticated, fetchCategories]);

  // Fermer le menu des catégories quand on clique en dehors ou appuie sur Escape
  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(event.target as Node)) {
        setIsCategoryMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsCategoryMenuOpen(false);
      }
    };

    if (isCategoryMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isCategoryMenuOpen]);

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
      if (!isMobile && inputRef.current) {
        inputRef.current.focus();
      }
    }, [isMobile]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(e.target.value);
      if (isMobile && searchInputRef.current) {
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 0);
      }
    };
    
    return (
      <div className={`${isMobile ? 'w-full' : 'max-w-sm w-full'}`}>
        <form onSubmit={handleSearch} className="relative flex">
          <input
            ref={isMobile ? searchInputRef : inputRef}
            type="text"
            placeholder="Rechercher"
            value={query}
            onChange={handleInputChange}
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

            {/* Mobile Moderator Icon (if moderator) */}
            {isAuthenticated && isModerator && (
              <Link to="/moderator" className="md:hidden p-2 text-gray-600 hover:text-primary" title="Modération">
                <ShieldAlert className="h-5 w-5" />
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
                <div className="relative" ref={categoryMenuRef}>
                  <button 
                    onClick={toggleCategoryMenu}
                    className="relative px-3 py-2 text-gray-600 hover:text-primary hover:bg-primary/5 rounded-lg flex items-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    aria-expanded={isCategoryMenuOpen}
                    aria-haspopup="true"
                  >
                    <span className="mr-2 font-medium">Catégories</span>
                    <ChevronDown className={`h-4 w-4 transition-all duration-200 ${isCategoryMenuOpen ? 'rotate-180 text-primary' : ''}`} />
                  </button>
                  
                  {/* Dropdown Menu */}
                  {isCategoryMenuOpen && (
                    <div className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 backdrop-blur-sm">
                      {/* Triangle pointer */}
                      <div className="absolute -top-2 right-4 w-4 h-4 bg-white border-l border-t border-gray-100 rotate-45"></div>
                      
                      {/* Categories list */}
                      <div className="py-1 max-h-80 overflow-y-auto">
                        {categories.length > 0 ? (
                          categories.map((category) => (
                            <Link 
                              key={category._id} 
                              to={`/categories/${category._id}`} 
                              className="group flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-primary/5 hover:text-primary transition-all duration-200"
                              onClick={() => setIsCategoryMenuOpen(false)}
                            >
                              <div className="flex-1">
                                <div className="font-medium group-hover:text-primary transition-colors">
                                  {category.nom}
                                </div>
                                {category.description && (
                                  <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                                    {category.description.slice(0, 50)}{category.description.length > 50 ? '...' : ''}
                                  </div>
                                )}
                              </div>
                            </Link>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-sm text-gray-500 italic">
                            Aucune catégorie disponible
                          </div>
                        )}
                      </div>
                      
                      {/* Footer */}
                      {categories.length > 0 && (
                        <>
                          <div className="border-t border-gray-100 my-1"></div>
                          <Link 
                            to="/categories" 
                            className="flex items-center justify-center px-4 py-3 text-sm font-medium text-primary hover:bg-primary/5 transition-all duration-200"
                            onClick={() => setIsCategoryMenuOpen(false)}
                          >
                            <span>Voir toutes les catégories</span>
                            <ChevronDown className="h-4 w-4 ml-1 -rotate-90" />
                          </Link>
                        </>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Admin Link */}
                {isAdmin && (
                  <Link to="/admin" className="p-2 text-gray-600 hover:text-primary" title="Administration">
                    <Settings className="h-5 w-5" />
                  </Link>
                )}
                
                {/* Moderator Link */}
                {isModerator && (
                  <Link to="/moderator" className="p-2 text-gray-600 hover:text-primary" title="Modération">
                    <ShieldAlert className="h-5 w-5" />
                  </Link>
                )}
                
                {/* PWA Install Button */}
                <PWAInstallButton />
                
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