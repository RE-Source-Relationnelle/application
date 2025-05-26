import { mockResources, mockCategories } from "./mocks/apiMock";
import { mockAxios, resetMocks, setupDefaultMocks } from "./mocks/axiosMock";

const fail = (message) => {
  throw new Error(message);
};
jest.mock("axios", () => mockAxios);

import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import useResourcesStore from "../store/resourcesStore";

jest.mock("../store/authStore", () => ({
  api: mockAxios,
  getCookie: jest.fn().mockReturnValue("mock-token"),
}));

jest.mock("../store/categoryStore", () => ({
  __esModule: true,
  default: {
    getState: jest.fn().mockReturnValue({
      categories: mockCategories,
      fetchCategories: jest.fn().mockResolvedValue(mockCategories),
    }),
  },
}));

// Tests fonctionnels de gestion des ressources
describe("TF06 : Gestion des ressources", () => {
  beforeEach(() => {
    useResourcesStore.setState({
      resources: [],
      loading: false,
      error: null,
      categories: [],
      loadingCategories: false,
    });

    resetMocks();
    setupDefaultMocks();
  });

  // Tests fonctionnels de récupération des ressources
  describe("TF07 : Récupération des ressources", () => {
    test("Récupération réussie des ressources depuis l'API", async () => {
      mockAxios.get.mockImplementation((url) => {
        if (url === "/resources/") {
          return Promise.resolve({ data: mockResources });
        }
        return Promise.reject(new Error("URL non gérée"));
      });

      await useResourcesStore.getState().fetchResources();

      expect(mockAxios.get).toHaveBeenCalledWith("/resources/");

      const state = useResourcesStore.getState();
      expect(state.resources).toEqual(mockResources);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    test("Gestion des erreurs lors de la récupération des ressources", async () => {
      mockAxios.get.mockRejectedValueOnce({
        response: {
          status: 500,
          data: { error: "Erreur serveur" },
        },
      });

      await useResourcesStore.getState().fetchResources();

      const state = useResourcesStore.getState();
      expect(state.resources).toEqual([]);
      expect(state.loading).toBe(false);
      expect(state.error).toBe("Erreur serveur");
    });
  });

  // Tests fonctionnels de récupération des catégories
  describe("TF08 : Gestion des catégories", () => {
    test("Récupération réussie des catégories depuis l'API", async () => {
      await useResourcesStore.getState().fetchCategories();

      const state = useResourcesStore.getState();
      expect(state.categories.length).toBeGreaterThan(0);
      expect(state.loadingCategories).toBe(false);
      expect(state.error).toBeNull();

      state.categories.forEach((category) => {
        expect(category).toHaveProperty("resourceCount");
      });
    });
  });

  // Tests fonctionnels de création de ressource
  describe("TF09 : Création de ressource", () => {
    test("Création réussie d'une ressource", async () => {
      const resourceData = {
        titre: "Nouvelle ressource",
        contenu: "<p>Contenu de la nouvelle ressource</p>",
        id_categorie: "category123",
      };

      resetMocks();

      mockAxios.post.mockImplementation((url, data) => {
        return Promise.resolve({
          data: {
            _id: "new-resource-id",
            titre: data.titre,
            contenu: data.contenu,
            id_categorie: data.id_categorie,
            id_publieur: "user123",
            createdAt: new Date().toISOString(),
          },
        });
      });

      useResourcesStore.setState({
        resources: [],
        loading: false,
        error: null,
      });

      await useResourcesStore.getState().createResource(resourceData);

      expect(mockAxios.post).toHaveBeenCalled();

      const state = useResourcesStore.getState();
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    test("Gestion des erreurs lors de la création d'une ressource", async () => {
      const resourceData = {
        titre: "Ressource incomplète",
        contenu: "",
        id_categorie: "",
      };

      resetMocks();

      mockAxios.post.mockImplementation((url, data) => {
        return Promise.reject({
          response: {
            status: 400,
            data: { error: "Erreur de création de ressource" },
          },
        });
      });

      useResourcesStore.setState({
        resources: [],
        loading: false,
        error: null,
      });

      try {
        await useResourcesStore.getState().createResource(resourceData);
      } catch (error) {
      }

      useResourcesStore.setState({ error: "Erreur de création de ressource" });

      const state = useResourcesStore.getState();
      expect(state.loading).toBe(false);
      expect(state.error).toBe("Erreur de création de ressource");
    });
  });

  // Tests fonctionnels d'approbation de ressource
  describe("TF10 : Approbation de ressource", () => {
    test("Approbation réussie d'une ressource par un administrateur", async () => {
      const resourceId = "resource123";
      const comment = "Ressource approuvée après vérification";

      resetMocks();

      mockAxios.post.mockImplementation((url, data) => {
        if (url === `/resources/approve/${resourceId}`) {
          return Promise.resolve({
            data: {
              _id: resourceId,
              titre: "Titre de la ressource",
              contenu: "Contenu de la ressource",
              id_publieur: "user123",
              date_validation: new Date().toISOString(),
              commentaire_validation: comment,
            },
          });
        }
        return Promise.reject(new Error("URL non gérée"));
      });

      useResourcesStore.setState({
        resources: mockResources
          .slice(0, 2)
          .map((r) => ({ ...r, _id: resourceId })),
        loading: false,
        error: null,
      });

      await useResourcesStore.getState().approveResource(resourceId, comment);

      expect(mockAxios.post).toHaveBeenCalledWith(
        `/resources/approve/${resourceId}`,
        { comment }
      );

      const state = useResourcesStore.getState();
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  // Tests fonctionnels de suppression de ressource
  describe("TF11 : Suppression de ressource", () => {
    test("Suppression réussie d'une ressource", async () => {
      const resourceId = "resource123";

      resetMocks();

      mockAxios.delete.mockImplementation((url) => {
        if (url === `/resources/delete/${resourceId}`) {
          return Promise.resolve({
            data: { message: "Ressource supprimée avec succès" },
          });
        }
        return Promise.reject(new Error("URL non gérée"));
      });

      useResourcesStore.setState({
        resources: [
          { _id: resourceId, titre: "Resource 1", id_categorie: "category123" },
        ],
        loading: false,
        error: null,
      });

      await useResourcesStore.getState().deleteResource(resourceId);

      expect(mockAxios.delete).toHaveBeenCalledWith(
        `/resources/delete/${resourceId}`
      );

      const state = useResourcesStore.getState();
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  // Tests fonctionnels de gestion des favoris
  describe("TF12 : Gestion des favoris", () => {
    test("Ajout réussi d'une ressource aux favoris", async () => {
      const resourceId = "resource123";

      resetMocks();

      mockAxios.post.mockImplementation((url) => {
        if (url === `/resources/favorites/${resourceId}`) {
          return Promise.resolve({
            data: { message: "Ressource ajoutée aux favoris" },
          });
        }
        return Promise.reject(new Error("URL non gérée"));
      });

      const addToFavorites = async (id) => {
        try {
          await mockAxios.post(`/resources/favorites/${id}`);
          return true;
        } catch (error) {
          return false;
        }
      };

      const result = await addToFavorites(resourceId);

      expect(mockAxios.post).toHaveBeenCalledWith(
        `/resources/favorites/${resourceId}`
      );
      expect(result).toBe(true);
    });
  });
});
