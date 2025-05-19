import useAuthStore from "../../store/authStore";
import { Link } from "react-router-dom";

export default function LeftSidebar() {
    const { user, isAuthenticated } = useAuthStore();
    
    return (
      <div className="bg-white rounded-lg ring-gray-200 ring-1 p-4">
        {isAuthenticated && user ? (
          // Affichage pour utilisateur connecté
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-primary font-semibold text-lg">
                  {user.prenom?.charAt(0) || user.username?.charAt(0) || "U"}
                </span>
              </div>
              <div>
                <h3 className="font-semibold">{user.prenom} {user.nom}</h3>
                <p className="text-sm text-gray-500">@{user.username}</p>
              </div>
            </div>
            
            <Link to="/profile" className="block w-full text-center py-2 px-4 bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition mb-4">
              Mon compte
            </Link>
          </div>
        ) : (
          // Affichage pour utilisateur non connecté
          <div className="text-center py-4">
            <h3 className="font-semibold text-lg mb-2">Bienvenue !</h3>
            <p className="text-gray-500 mb-4">Connectez-vous pour accéder à toutes les fonctionnalités</p>
            
            <div className="space-y-2">
              <Link to="/" className="block w-full text-center py-2 px-4 bg-primary text-white rounded-md hover:bg-primary/90 transition">
                Connexion
              </Link>
              <Link to="/inscription" className="block w-full text-center py-2 px-4 border border-primary text-primary rounded-md hover:bg-primary/10 transition">
                Inscription
              </Link>
            </div>
          </div>
        )}
      </div>
    );
}