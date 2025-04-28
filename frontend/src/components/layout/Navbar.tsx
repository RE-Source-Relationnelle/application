import { Link } from 'react-router-dom'
import { Search, User, X } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  return (
    <nav className="bg-white shadow relative z-10 sticky top-0">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/feed" className="flex-shrink-0">
              <img src="/img/logo-ressources-relationnelles.svg" alt="Logo" className="h-8 w-auto" />
            </Link>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex items-center justify-center flex-1 mx-8">
            <div className="max-w-sm w-full">
              <div className="relative flex">
                <input
                  type="text"
                  placeholder="Rechercher"
                  className="w-full px-4 py-2 border-b-2 border-primary rounded-tl-[4px] bg-gray-100 focus:outline-none focus:ring-0 focus:ring-transparent sm:text-sm"
                  aria-label="Champ de recherche"
                />
                <button 
                  type="button" 
                  className="bg-primary hover:bg-secondary text-white px-3 py-2 rounded-tr-[4px] flex items-center justify-center focus:outline-none focus:ring-0 focus:ring-transparent"
                  aria-label="Rechercher"
                >
                 <Search className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {/* Mobile Search Icon */}
            <button 
              onClick={toggleSearch}
              className="md:hidden p-2"
              aria-label="Ouvrir la recherche"
            >
              <Search className="h-5 w-5 text-gray-600" />
            </button>
            
            {/* User Icon/Login Button */}
            <div className="flex items-center">
              <Link to="/connexion" className="hidden md:block py-2 px-6 text-sm text-white bg-primary hover:bg-secondary">
                Se connecter →
              </Link>
              <Link to="/connexion" className="md:hidden p-2">
                <User className="h-5 w-5 text-gray-600" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search Popup */}
      {isSearchOpen && (
        <>
          <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-20 flex items-start justify-center pt-20">
            <div className="bg-white w-11/12 p-4 rounded-lg shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Rechercher</h3>
                <button onClick={() => setIsSearchOpen(false)} aria-label="Fermer la recherche">
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>
              <div className="relative flex">
                <input
                  type="text"
                  placeholder="Rechercher"
                  className="w-full px-4 py-2 border-b-2 border-primary rounded-tl-[4px] bg-gray-100 focus:outline-none focus:ring-0 focus:ring-transparent text-sm"
                  aria-label="Champ de recherche"
                  autoFocus
                />
                <button 
                  type="button" 
                  className="bg-primary hover:bg-secondary text-white px-3 py-2 rounded-tr-[4px] flex items-center justify-center focus:outline-none focus:ring-0 focus:ring-transparent"
                  aria-label="Rechercher"
                >
                 <Search className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </nav>
  )
}

export default Navbar