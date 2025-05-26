import { mockUser, mockAdminUser, mockResources, mockCategories } from './apiMock';

// Mock pour Axios
const mockAxios = {
  create: jest.fn(() => mockAxios),
  defaults: { headers: { common: {} } },
  interceptors: {
    request: { use: jest.fn(), eject: jest.fn() },
    response: { use: jest.fn(), eject: jest.fn() }
  },
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  isAxiosError: jest.fn(error => error && error.response && error.response.status !== undefined)
};

// Réinitialiser les mocks entre les tests
const resetMocks = () => {
  mockAxios.get.mockReset();
  mockAxios.post.mockReset();
  mockAxios.put.mockReset();
  mockAxios.delete.mockReset();
};

// Configuration des réponses par défaut pour les routes courantes
const setupDefaultMocks = () => {
  // Auth routes
  mockAxios.post.mockImplementation((url, data) => {
    if (url === '/auth/auth_from_password') {
      if (data.mail === 'test@example.com' && data.password === 'password123') {
        return Promise.resolve({ data: mockUser });
      } else if (data.mail === 'admin@example.com' && data.password === 'admin123') {
        return Promise.resolve({ data: mockAdminUser });
      } else {
        return Promise.reject({
          response: { 
            status: 401, 
            data: { error: 'Identifiants invalides' } 
          }
        });
      }
    }
    
    if (url === '/auth/register') {
      if (data.mail && data.password && data.nom && data.prenom && data.username) {
        return Promise.resolve({ data: { message: 'Inscription réussie' } });
      } else {
        return Promise.reject({
          response: { 
            status: 400, 
            data: { error: 'Données d\'inscription incomplètes' } 
          }
        });
      }
    }
    
    if (url === '/auth/logout') {
      return Promise.resolve({ data: { message: 'Déconnexion réussie' } });
    }
    
    if (url === '/auth/refresh_token') {
      return Promise.resolve({ data: { message: 'Token rafraîchi avec succès' } });
    }
    
    // Resources routes
    if (url.startsWith('/resources/')) {
      if (url.includes('approve')) {
        const resourceId = url.split('/').pop();
        const resource = mockResources.find(r => r._id === resourceId);
        if (resource) {
          return Promise.resolve({ 
            data: { 
              ...resource, 
              approved: true, 
              date_validation: new Date().toISOString(),
              commentaire_validation: data.comment || null
            } 
          });
        }
      }
      
      if (url === '/resources/') {
        const resource = {
          _id: 'new-resource-id',
          titre: data.title,
          contenu: data.content,
          id_publieur: mockUser.id,
          id_categorie: data.categorie || null,
          createdAt: new Date().toISOString(),
          approved: false
        };
        return Promise.resolve({ data: resource });
      }
    }
    
    return Promise.reject({ 
      response: { 
        status: 404, 
        data: { error: 'Route non trouvée' } 
      } 
    });
  });
  
  // GET requests
  mockAxios.get.mockImplementation((url) => {
    if (url === '/auth/me') {
      return Promise.resolve({ data: mockUser });
    }
    
    if (url === '/resources/') {
      return Promise.resolve({ data: mockResources });
    }
    
    if (url === '/categories/all_categories' || url === '/categories') {
      return Promise.resolve({ data: mockCategories });
    }
    
    if (url.startsWith('/resources/') && url.includes('/')) {
      const resourceId = url.split('/').pop();
      const resource = mockResources.find(r => r._id === resourceId);
      
      if (resource) {
        return Promise.resolve({ data: resource });
      }
    }
    
    return Promise.reject({ 
      response: { 
        status: 404, 
        data: { error: 'Route non trouvée' } 
      } 
    });
  });
  
  // PUT requests
  mockAxios.put.mockImplementation((url, data) => {
    if (url.startsWith('/resources/update/')) {
      const resourceId = url.split('/').pop();
      const resource = mockResources.find(r => r._id === resourceId);
      
      if (resource) {
        return Promise.resolve({ 
          data: { 
            ...resource, 
            ...data 
          } 
        });
      }
    }
    
    if (url.startsWith('/categories/update_category/')) {
      const categoryId = url.split('/').pop();
      const category = mockCategories.find(c => c._id === categoryId);
      
      if (category) {
        return Promise.resolve({ 
          data: { 
            ...category, 
            nom: data.nom || category.nom,
            description: data.description || category.description
          } 
        });
      }
    }
    
    return Promise.reject({ 
      response: { 
        status: 404, 
        data: { error: 'Route non trouvée' } 
      } 
    });
  });
  
  // DELETE requests
  mockAxios.delete.mockImplementation((url) => {
    if (url.startsWith('/resources/delete/')) {
      const resourceId = url.split('/').pop();
      const resourceIndex = mockResources.findIndex(r => r._id === resourceId);
      
      if (resourceIndex !== -1) {
        return Promise.resolve({ data: { message: 'Ressource supprimée avec succès' } });
      }
    }
    
    if (url.startsWith('/categories/delete_category/')) {
      const categoryId = url.split('/').pop();
      const categoryIndex = mockCategories.findIndex(c => c._id === categoryId);
      
      if (categoryIndex !== -1) {
        return Promise.resolve({ data: { message: 'Catégorie supprimée avec succès' } });
      }
    }
    
    return Promise.reject({ 
      response: { 
        status: 404, 
        data: { error: 'Route non trouvée' } 
      } 
    });
  });
};

export { mockAxios, resetMocks, setupDefaultMocks };
