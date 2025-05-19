import { Link } from 'react-router-dom';
import { Home, Menu, PlusCircle, User } from 'lucide-react';
import { useState } from 'react';

interface MobileNavigationProps {
  onOpenPostModal: () => void;
}

const MobileNavigation = ({ onOpenPostModal }: MobileNavigationProps) => {
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  
  const toggleCategoryMenu = () => {
    setIsCategoryMenuOpen(!isCategoryMenuOpen);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-4 sm:hidden z-10">
      <div className="flex items-center justify-around">
        {/* Accueil */}
        <Link to="/feed" className="flex flex-col items-center text-gray-500 hover:text-primary">
          <Home className="h-6 w-6" />
          <span className="text-xs mt-1">Accueil</span>
        </Link>
        
        {/* Catégories */}
        <div className="relative flex flex-col items-center">
          <button 
            onClick={toggleCategoryMenu}
            className="flex flex-col items-center text-gray-500 hover:text-primary"
          >
            <Menu className="h-6 w-6" />
            <span className="text-xs mt-1">Catégories</span>
          </button>
          
          {/* Menu déroulant des catégories */}
          {isCategoryMenuOpen && (
            <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
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
        
        {/* Créer un post */}
        <button 
          onClick={onOpenPostModal}
          className="flex flex-col items-center text-gray-500 hover:text-primary"
        >
          <PlusCircle className="h-6 w-6" />
          <span className="text-xs mt-1">Créer</span>
        </button>
        
        {/* Profil */}
        <Link to="/profile" className="flex flex-col items-center text-gray-500 hover:text-primary">
          <User className="h-6 w-6" />
          <span className="text-xs mt-1">Profil</span>
        </Link>
      </div>
    </div>
  );
};

export default MobileNavigation;