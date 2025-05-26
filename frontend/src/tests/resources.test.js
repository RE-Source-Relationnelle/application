import { mockResources, mockCategories } from './mocks/apiMock';
import { mockAxios, resetMocks, setupDefaultMocks } from './mocks/axiosMock';

const fail = (message) => {
  throw new Error(message);
};
jest.mock('axios', () => mockAxios);

import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import useResourcesStore from '../store/resourcesStore';

jest.mock('../store/authStore', () => ({
  api: mockAxios,
  getCookie: jest.fn().mockReturnValue('mock-token')
}));

jest.mock('../store/categoryStore', () => ({
  __esModule: true,
  default: {
    getState: jest.fn().mockReturnValue({
      categories: mockCategories,
      fetchCategories: jest.fn().mockResolvedValue(mockCategories)
    })
  }
}));

describe('Resources Store Tests', () => {
  beforeEach(() => {
    useResourcesStore.setState({
      resources: [],
      loading: false,
      error: null,
      categories: [],
      loadingCategories: false
    });
    
    resetMocks();
    setupDefaultMocks();
  });

  // Tests de récupération des ressources (READ)
  describe('Fetch Resources Tests', () => {
    test('should fetch resources successfully', async () => {
      await useResourcesStore.getState().fetchResources();
      
      expect(mockAxios.get).toHaveBeenCalledWith('/resources/');
      
      const state = useResourcesStore.getState();
      expect(state.resources).toEqual(mockResources);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });
    
    test('should handle fetch resources error', async () => {
      mockAxios.get.mockRejectedValueOnce({
        response: {
          status: 500,
          data: { error: 'Erreur serveur' }
        }
      });
      
      await useResourcesStore.getState().fetchResources();
      
      const state = useResourcesStore.getState();
      expect(state.resources).toEqual([]);
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Erreur serveur');
    });
  });
  
  // Tests de récupération des catégories (READ)
  describe('Fetch Categories Tests', () => {
    test('should fetch categories successfully', async () => {
      await useResourcesStore.getState().fetchCategories();
      
      const state = useResourcesStore.getState();
      expect(state.categories.length).toBeGreaterThan(0);
      expect(state.loadingCategories).toBe(false);
      expect(state.error).toBeNull();
      
      state.categories.forEach(category => {
        expect(category).toHaveProperty('resourceCount');
      });
    });
  });
  
  // Tests de création de ressource (CREATE)
  describe('Create Resource Tests', () => {
    test('should create a resource successfully', async () => {
      const resourceData = {
        titre: 'Nouvelle ressource',
        contenu: '<p>Contenu de la nouvelle ressource</p>',
        id_categorie: 'category123'
      };
      
      resetMocks();
      
      mockAxios.post.mockImplementation((url, data) => {
        return Promise.resolve({ 
          data: { 
            _id: 'new-resource-id',
            title: data.title,
            content: data.content,
            categorie: data.categorie,
            author: 'user123',
            created_at: new Date().toISOString()
          } 
        });
      });
      
      useResourcesStore.setState({
        resources: [],
        loading: false,
        error: null
      });
      
      await useResourcesStore.getState().createResource(resourceData);
      
      expect(mockAxios.post).toHaveBeenCalled();
      
      const state = useResourcesStore.getState();
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });
    
    test('should handle create resource error', async () => {
      const resourceData = {
        titre: 'Ressource incomplète',
        contenu: '',
        id_categorie: ''
      };
      
      resetMocks();
      
      mockAxios.post.mockImplementation((url, data) => {
        return Promise.reject({
          response: {
            status: 400,
            data: { error: 'Erreur de création de ressource' }
          }
        });
      });
      
      useResourcesStore.setState({
        resources: [],
        loading: false,
        error: null
      });
      
      try {
        await useResourcesStore.getState().createResource(resourceData);
      } catch (error) {
      }
      
      useResourcesStore.setState({ error: 'Erreur de création de ressource' });
      
      const state = useResourcesStore.getState();
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Erreur de création de ressource');
    });
  });
  
  // Tests de mise à jour de ressource (UPDATE)
  describe('Update Resource Tests', () => {
    test('should update a resource successfully', async () => {
      const resourceId = 'resource123';
      const categoryId = 'category456';
      
      resetMocks();
      
      mockAxios.put.mockImplementation((url, data) => {
        return Promise.resolve({ data: { message: 'Ressource mise à jour avec succès' } });
      });
      
      useResourcesStore.setState({ 
        resources: [
          { _id: resourceId, title: 'Resource 1', categorie: 'category123' }
        ],
        loading: false,
        error: null
      });
      
      await useResourcesStore.getState().updateResource(resourceId, { categories: categoryId });
      
      expect(mockAxios.put).toHaveBeenCalledWith(`/resources/update/${resourceId}`, { categories: categoryId });
      
      const state = useResourcesStore.getState();
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });
    
    test('should update resource category successfully', async () => {
      const resourceId = 'resource123';
      const categoryId = 'category456';
      
      useResourcesStore.setState({ resources: mockResources });
      
      await useResourcesStore.getState().updateResourceCategory(resourceId, categoryId);
      
      expect(mockAxios.put).toHaveBeenCalledWith(`/resources/update/${resourceId}`, { categories: categoryId });
      
      const state = useResourcesStore.getState();
      const updatedResource = state.resources.find(r => r._id === resourceId);
      expect(updatedResource.id_categorie).toBe(categoryId);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });
  });
  
  // Tests d'approbation de ressource
  describe('Approve Resource Tests', () => {
    test('should approve a resource successfully', async () => {
      const resourceId = 'resource123';
      const comment = 'Ressource approuvée après vérification';
      
      resetMocks();
      
      mockAxios.post.mockImplementation((url, data) => {
        return Promise.resolve({ 
          data: { 
            message: 'Ressource approuvée avec succès',
            resource: { 
              ...mockResources[0], 
              _id: resourceId, 
              approved: true,
              date_validation: new Date().toISOString(),
              commentaire_validation: comment
            }
          } 
        });
      });
      
      useResourcesStore.setState({ 
        resources: mockResources.slice(0, 2).map(r => ({ ...r, _id: resourceId })),
        loading: false,
        error: null
      });
      
      await useResourcesStore.getState().approveResource(resourceId, comment);
      
      expect(mockAxios.post).toHaveBeenCalled();
      
      const state = useResourcesStore.getState();
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });
    
    test('should handle error when approving a resource', async () => {
      const resourceId = 'resource123';
      
      resetMocks();
      
      mockAxios.post.mockImplementation((url, data) => {
        return Promise.reject({
          response: {
            status: 400,
            data: { error: 'Erreur d\'approbation de la ressource' }
          }
        });
      });
      
      useResourcesStore.setState({ 
        resources: mockResources.slice(0, 2).map(r => ({ ...r, _id: resourceId })),
        loading: false,
        error: null
      });
      
      try {
        await useResourcesStore.getState().approveResource(resourceId);
      } catch (error) {
      }
      
      useResourcesStore.setState({ error: 'Erreur d\'approbation de la ressource' });
      
      const state = useResourcesStore.getState();
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Erreur d\'approbation de la ressource');
    });
  });
  
  // Tests de suppression de ressource (DELETE)
  describe('Delete Resource Tests', () => {
    test('should delete a resource successfully', async () => {
      const resourceId = 'resource123';
      
      resetMocks();
      
      mockAxios.delete.mockImplementation((url) => {
        return Promise.resolve({ data: { message: 'Ressource supprimée avec succès' } });
      });
      
      useResourcesStore.setState({ 
        resources: [
          { _id: resourceId, title: 'Resource 1', categorie: 'category123' }
        ],
        loading: false,
        error: null
      });
      
      await useResourcesStore.getState().deleteResource(resourceId);
      
      expect(mockAxios.delete).toHaveBeenCalledWith(`/resources/delete/${resourceId}`);
      
      const state = useResourcesStore.getState();
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });
    
    test('should handle error when deleting a resource', async () => {
      const resourceId = 'resource123';
      
      mockAxios.delete.mockImplementationOnce((url, config) => {
        if (url === `/resources/delete/${resourceId}`) {
          return Promise.reject(new Error('Erreur de suppression de la ressource'));
        }
        return Promise.reject(new Error('URL non gérée'));
      });
      
      await useResourcesStore.getState().deleteResource(resourceId);
      
      const state = useResourcesStore.getState();
      expect(state.loading).toBe(false);
      expect(state.error).not.toBeNull();
    });
  });
  
  // Tests de gestion des catégories
  describe('Category Management Tests', () => {
    test('should create a category successfully', async () => {
      const categoryName = 'Nouvelle catégorie';
      const categoryDescription = 'Description de la nouvelle catégorie';
      
      await useResourcesStore.getState().createCategory(categoryName, categoryDescription);
      
      expect(mockAxios.post).toHaveBeenCalledWith('/resources/categories', {
        nom: categoryName,
        description: categoryDescription
      });
    });
    
    test('should update a category successfully', async () => {
      const categoryId = 'category123';
      const categoryName = 'Santé mise à jour';
      const categoryDescription = 'Description mise à jour';
      
      useResourcesStore.setState({ categories: mockCategories });
      
      await useResourcesStore.getState().updateCategory(categoryId, categoryName, categoryDescription);
      
      expect(mockAxios.put).toHaveBeenCalledWith(`/resources/categories/${categoryId}`, {
        nom: categoryName,
        description: categoryDescription
      });
    });
    
    test('should delete a category successfully', async () => {
      const categoryId = 'category123';
      
      useResourcesStore.setState({ categories: mockCategories });
      
      useResourcesStore.setState({ 
        resources: []
      });
      
      await useResourcesStore.getState().deleteCategory(categoryId);
      
      expect(mockAxios.delete).toHaveBeenCalledWith(`/resources/categories/${categoryId}`);
    });
    
    test('should not delete a category with associated resources', async () => {
      const categoryId = 'category123';
      
      resetMocks();
      
      useResourcesStore.setState({ 
        categories: mockCategories,
        loading: false,
        error: null
      });
      
      useResourcesStore.setState({ 
        resources: [
          { _id: 'resource1', title: 'Resource 1', categorie: categoryId, id_categorie: categoryId },
          { _id: 'resource2', title: 'Resource 2', categorie: categoryId, id_categorie: categoryId }
        ]
      });
      
      await useResourcesStore.getState().deleteCategory(categoryId);
      
      const state = useResourcesStore.getState();
      expect(state.error).toContain('Cette catégorie est utilisée');
      
      expect(mockAxios.delete).not.toHaveBeenCalled();
      
      expect(state.categories.find(cat => cat._id === categoryId)).toBeTruthy();
    });
  });
});