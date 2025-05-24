import { Link } from 'react-router-dom';
import { Home, Menu, PlusCircle, User, ChevronDown } from 'lucide-react';
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
            <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20 backdrop-blur-sm">
              {/* Triangle pointer */}
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-r border-b border-gray-100 rotate-45"></div>
              
              {/* Header */}
              <div className="px-4 py-2 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-800 text-center">Explorer par catégorie</h3>
              </div>
              
              {/* Categories list */}
              <div className="py-1 max-h-64 overflow-y-auto">
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
                            {category.description.slice(0, 40)}{category.description.length > 40 ? '...' : ''}
                          </div>
                        )}
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-500 italic text-center">
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