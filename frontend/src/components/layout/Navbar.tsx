import { Link } from 'react-router-dom'

const Navbar = () => {
  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-3 justify-between h-16">
          <div className="flex items-center">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <img src="/img/logo-ressources-relationnelles.svg" alt="Logo" className="h-8 w-auto" />
            </Link>
          </div>

          <div className="flex items-center justify-between flex-1 ml-8">
            {/* Search Bar */}
            <div className="max-w-lg w-full">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="w-full px-4 py-2 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end">
            {/* Navigation */}
            <div className="flex items-center space-x-4">
              <Link to="/notifications">
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  🔔
                </button>
              </Link>
              <Link to="/messages">
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  💬
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar