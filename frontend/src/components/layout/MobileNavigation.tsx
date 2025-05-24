import { Link } from 'react-router-dom';
import { Home, Menu, PlusCircle, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import useCategoryStore from '../../store/categoryStore';
import useAuthStore from '../../store/authStore';

interface MobileNavigationProps {
  onOpenPostModal: () => void;
}

const MobileNavigation = ({ onOpenPostModal }: MobileNavigationProps) => {
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const { categories, fetchCategories } = useCategoryStore();
  const { isAuthenticated } = useAuthStore();
  
  const toggleCategoryMenu = () => {
    setIsCategoryMenuOpen(!isCategoryMenuOpen);
  };

  // Charger les catégories au montage du composant
  useEffect(() => {
    if (isAuthenticated) {
      fetchCategories();
    }
  }, [isAuthenticated, fetchCategories]);

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
              {categories.map((category) => (
                <Link key={category._id} to={`/categories/${category._id}`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  {category.nom}
                </Link>
              ))}
              {categories.length > 0 && <div className="border-t border-gray-100 my-1"></div>}
              <Link to="/categories" className="block px-4 py-2 text-sm text-primary hover:bg-gray-100">
                Toutes les catégories
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