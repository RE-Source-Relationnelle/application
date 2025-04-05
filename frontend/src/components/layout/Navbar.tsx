import { Link } from 'react-router-dom'
import { Search } from 'lucide-react';


const Navbar = () => {
  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 justify-between h-16">
          <div className="flex items-center">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <img src="/img/logo-ressources-relationnelles.svg" alt="Logo" className="h-8 w-auto" />
            </Link>
          </div>

          <div className="flex items-center justify-end flex-1 ml-8">
            {/* Search Bar */}
            <div className="max-w-lg w-full">
              <div className="relative flex">
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="w-full px-4 py-2 rounded-l-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
                  aria-label="Champ de recherche"
                />
                <button 
                  type="button" 
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-r-lg flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Rechercher"
                >
                 <Search className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar