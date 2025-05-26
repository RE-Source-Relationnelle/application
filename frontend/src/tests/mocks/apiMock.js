const mockUser = {
  id: '123456789',
  email: 'test@example.com',
  mail: 'test@example.com',
  nom: 'Doe',
  prenom: 'John',
  username: 'johndoe',
  genre: 'homme',
  role: {
    role_id: 'role123',
    nom_role: 'Citoyen'
  },
  created_at: '2023-01-01T00:00:00.000Z'
};

const mockAdminUser = {
  id: '987654321',
  email: 'admin@example.com',
  mail: 'admin@example.com',
  nom: 'Admin',
  prenom: 'Super',
  username: 'superadmin',
  genre: 'homme',
  role: {
    role_id: 'role456',
    nom_role: 'administrateur'
  },
  created_at: '2023-01-01T00:00:00.000Z'
};

const mockResources = [
  {
    _id: 'resource123',
    titre: 'Première ressource',
    contenu: '<p>Contenu de la première ressource</p>',
    id_publieur: '123456789',
    id_categorie: 'category123',
    createdAt: '2023-01-01T00:00:00.000Z',
    approved: true,
    id_validateur: '987654321',
    date_validation: '2023-01-02T00:00:00.000Z',
    commentaire_validation: 'Ressource approuvée'
  },
  {
    _id: 'resource456',
    titre: 'Deuxième ressource',
    contenu: '<p>Contenu de la deuxième ressource</p>',
    id_publieur: '123456789',
    id_categorie: 'category456',
    createdAt: '2023-01-03T00:00:00.000Z',
    approved: false,
    id_validateur: null,
    date_validation: null,
    commentaire_validation: null
  }
];

const mockCategories = [
  {
    _id: 'category123',
    nom: 'Santé',
    description: 'Ressources liées à la santé',
    resourceCount: 1
  },
  {
    _id: 'category456',
    nom: 'Famille',
    description: 'Ressources liées à la famille',
    resourceCount: 1
  }
];

const mockComments = [
  {
    _id: 'comment123',
    id_user: '123456789',
    id_ressource: 'resource123',
    contenu: 'Premier commentaire',
    date_publication: '2023-01-05T00:00:00.000Z',
    nom_utilisateur: 'Doe',
    prenom_utilisateur: 'John',
    parent_comment_id: null,
    replies_count: 1
  }
];

export {
  mockUser,
  mockAdminUser,
  mockResources,
  mockCategories,
  mockComments
};
