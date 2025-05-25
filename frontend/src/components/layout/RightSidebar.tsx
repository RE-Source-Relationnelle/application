import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import useCategoryStore from '../../store/categoryStore';
import useAuthStore from '../../store/authStore';

export default function RightSidebar() {
  const { categories, fetchCategories, loading } = useCategoryStore();
  const { isAuthenticated } = useAuthStore();

  // Charger les catégories au montage du composant
  useEffect(() => {
    if (isAuthenticated) {
      fetchCategories();
    }
  }, [isAuthenticated, fetchCategories]);

  return (
    <div className="bg-white rounded-lg ring-gray-200 ring-1 p-4">
      <h3 className="font-semibold mb-4">Catégories</h3>
      
      {/* Liste des catégories */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-sm text-gray-500">Chargement...</div>
        ) : categories.length > 0 ? (
          categories.slice(0, 5).map((category) => (
            <div key={category._id}>
              <Link 
                to={`/categories/${category._id}`}
                className="hover:text-primary transition-colors"
              >
                <h4 className="font-medium">{category.nom}</h4>
                {category.description && (
                  <p className="text-sm text-gray-500">{category.description.slice(0, 60)}{category.description.length > 60 ? '...' : ''}</p>
                )}
              </Link>
            </div>
          ))
        ) : (
          <div className="text-sm text-gray-500">Aucune catégorie disponible</div>
        )}
        
        {/* Lien vers toutes les catégories */}
        {categories.length > 5 && (
          <div className="pt-2 border-t border-gray-100">
            <Link 
              to="/categories" 
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              Voir toutes les catégories ({categories.length})
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}