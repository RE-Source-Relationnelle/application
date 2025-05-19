// src/components/features/auth/AuthStatus.tsx
import React from 'react';
import useAuthStore from '../../../store/authStore';

const AuthStatus: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();

  return (
    <div className="bg-gray-100 p-4 rounded-md mb-4">
      <h3 className="font-bold mb-2">État d'authentification</h3>
      <p>Authentifié : <span className={isAuthenticated ? "text-green-600" : "text-red-600"}>
        {isAuthenticated ? "Oui" : "Non"}
      </span></p>
      {user && (
        <div className="mt-2">
          <p>Utilisateur : {user.email}</p>
          <p>ID : {user.id}</p>
        </div>
      )}
    </div>
  );
};

export default AuthStatus;