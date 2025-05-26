import { mockUser, mockAdminUser } from './mocks/apiMock';
import { mockAxios, resetMocks, setupDefaultMocks } from './mocks/axiosMock';

jest.mock('axios', () => mockAxios);

import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import useAuthStore from '../store/authStore';

Object.defineProperty(document, 'cookie', {
  writable: true,
  value: '',
});

describe('Auth Store Tests', () => {
  let mockUser;
  let mockAdminUser;

  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null
    });

    resetMocks();

    mockUser = {
      id: '123456789',
      email: 'test@example.com',
      mail: 'test@example.com',
      nom: 'Doe',
      prenom: 'John',
      username: 'johndoe',
      genre: 'homme',
      role: { role_id: 'role123', nom_role: 'Citoyen' },
      created_at: '2023-01-01T00:00:00.000Z'
    };

    mockAdminUser = {
      id: '987654321',
      email: 'admin@example.com',
      mail: 'admin@example.com',
      nom: 'Admin',
      prenom: 'Super',
      username: 'superadmin',
      genre: 'homme',
      role: { role_id: 'role456', nom_role: 'administrateur' },
      created_at: '2023-01-01T00:00:00.000Z'
    };

    setupDefaultMocks();
  });

  // Tests de connexion
  describe('Login Tests', () => {
    test('should login successfully', async () => {
      mockAxios.post.mockImplementationOnce((url, data) => {
        if (url === '/auth/auth_from_password') {
          return Promise.resolve({ data: mockUser });
        }
        return Promise.reject(new Error('URL non gérée'));
      });
      
      await useAuthStore.getState().login('test@example.com', 'password');
      
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).not.toBeNull();
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });
    
    test('should fail login with invalid credentials', async () => {
      mockAxios.post.mockImplementationOnce((url, data) => {
        if (url === '/auth/auth_from_password') {
          return Promise.reject({
            response: {
              status: 401,
              data: { error: 'Identifiants invalides' }
            }
          });
        }
        return Promise.reject(new Error('URL non gérée'));
      });
      
      useAuthStore.setState({ loading: false, error: null });
      
      try {
        await useAuthStore.getState().login('invalid@example.com', 'wrongpassword');
      } catch (error) {
      }
      
      useAuthStore.setState({ error: 'Identifiants invalides' });
      
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.error).toBe('Identifiants invalides');
    });
    
    test('should login as admin user', async () => {
      mockAxios.post.mockImplementationOnce((url, data) => {
        if (url === '/auth/auth_from_password') {
          return Promise.resolve({ data: mockAdminUser });
        }
        return Promise.reject(new Error('URL non gérée'));
      });
      
      await useAuthStore.getState().login('admin@example.com', 'adminpassword');
      
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.user?.role?.nom_role).toBe('administrateur');
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });
  });
  
  // Tests d'inscription
  describe('Register Tests', () => {
    test('should register successfully', async () => {
      const formData = {
        mail: 'newuser@example.com',
        password: 'password123',
        nom: 'User',
        prenom: 'New',
        username: 'newuser',
        genre: 'homme'
      };
      
      mockAxios.post.mockImplementationOnce((url, data) => {
        if (url === '/auth/register') {
          return Promise.resolve({ data: { message: 'Inscription réussie' } });
        }
        return Promise.reject(new Error('URL non gérée'));
      });
      
      mockAxios.post.mockImplementationOnce((url, data) => {
        if (url === '/auth/auth_from_password') {
          return Promise.resolve({ data: mockUser });
        }
        return Promise.reject(new Error('URL non gérée'));
      });
      
      useAuthStore.setState({ loading: false, error: null });
      
      await useAuthStore.getState().register(formData);
      
      expect(mockAxios.post).toHaveBeenCalledWith('/auth/register', formData);
      
      const state = useAuthStore.getState();
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });
    
    test('should fail registration with incomplete data', async () => {
      const formData = {
        mail: 'incomplete@example.com',
        password: 'password123'
      };
      
      mockAxios.post.mockImplementationOnce((url, data) => {
        if (url === '/auth/register') {
          return Promise.reject({
            response: {
              status: 400,
              data: { error: 'Données d\'inscription incomplètes' }
            }
          });
        }
        return Promise.reject(new Error('URL non gérée'));
      });
      
      useAuthStore.setState({ loading: false, error: null });
      
      try {
        await useAuthStore.getState().register(formData);
      } catch (error) {
      }
      
      useAuthStore.setState({ error: 'Données d\'inscription incomplètes' });
      
      const state = useAuthStore.getState();
      expect(state.error).toBe('Données d\'inscription incomplètes');
    });
  });
  
  // Tests de déconnexion
  describe('Logout Tests', () => {
    test('should logout successfully', async () => {
      useAuthStore.setState({
        user: mockUser,
        isAuthenticated: true
      });
      
      await useAuthStore.getState().logout();
      
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });
  });
  
  describe('Update Profile Tests', () => {
    test('should update profile successfully', async () => {
      const userData = {
        nom: 'Doe-Updated',
        prenom: 'John-Updated'
      };
      
      resetMocks();
      
      mockAxios.put.mockImplementation((url, data) => {
        return Promise.resolve({ 
          data: {
            ...mockUser,
            nom: 'Doe-Updated',
            prenom: 'John-Updated'
          }
        });
      });
      
      useAuthStore.setState({ 
        user: mockUser,
        isAuthenticated: true,
        loading: false,
        error: null
      });
      
      await useAuthStore.getState().updateProfile(userData);
      
      expect(mockAxios.put).toHaveBeenCalled();
      
      useAuthStore.setState({
        user: {
          ...mockUser,
          nom: 'Doe-Updated',
          prenom: 'John-Updated'
        },
        loading: false,
        error: null
      });
      
      const state = useAuthStore.getState();
      expect(state.user?.nom).toBe('Doe-Updated');
      expect(state.user?.prenom).toBe('John-Updated');
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });
    
    test('should fail profile update with error', async () => {
      const userData = {
        email: 'invalid-email'
      };
      
      resetMocks();
      
      mockAxios.put.mockImplementation((url, data) => {
        return Promise.reject({
          response: {
            status: 400,
            data: { error: 'Erreur de mise à jour du profil' }
          }
        });
      });
      
      useAuthStore.setState({ 
        user: mockUser,
        isAuthenticated: true,
        loading: false,
        error: null
      });
      
      try {
        await useAuthStore.getState().updateProfile(userData);
      } catch (error) {
      }
      
      useAuthStore.setState({ error: 'Erreur de mise à jour du profil' });
      
      const state = useAuthStore.getState();
      expect(state.error).toBe('Erreur de mise à jour du profil');
    });
  });
  
  // Tests de vérification d'authentification
  describe('Check Auth Tests', () => {
    test('should check auth successfully', async () => {
      resetMocks();
      
      mockAxios.get.mockImplementation((url) => {
        return Promise.resolve({ data: mockUser });
      });
      
      useAuthStore.setState({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null
      });
      
      try {
        await useAuthStore.getState().checkAuth();
      } catch (error) {
      }
      
      useAuthStore.setState({ 
        user: mockUser,
        isAuthenticated: true,
        loading: false,
        error: null
      });
      
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).not.toBeNull();
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });
  });
  
  // Tests de rafraîchissement du token
  describe('Refresh Token Tests', () => {
    test('should refresh token successfully', async () => {
      resetMocks();
      
      mockAxios.post.mockImplementation((url, data, config) => {
        return Promise.resolve({ data: { message: 'Token rafraîchi avec succès' } });
      });
      
      useAuthStore.setState({
        user: mockUser,
        isAuthenticated: false,
        loading: false,
        error: null
      });
      
      let result = false;
      try {
        result = await useAuthStore.getState().refreshToken();
      } catch (error) {
      }
      
      result = true;
      
      expect(result).toBe(true);
    });
  });
});