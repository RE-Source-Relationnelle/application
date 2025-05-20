import unittest
from unittest.mock import patch, MagicMock
from flask import Flask
from bson import ObjectId
from datetime import datetime
import json
from routes.resources import resources_bp

class TestResourcesRoutes(unittest.TestCase):
    def setUp(self):
        """Configuration initiale pour chaque test"""
        self.app = Flask(__name__)
        self.app.register_blueprint(resources_bp, url_prefix='/resources')
        self.client = self.app.test_client()
        self.app.config['TESTING'] = True

        # Mock token pour les tests
        self.valid_token = "valid_token"
        self.invalid_token = "invalid_token"
        self.moderator_token = "moderator_token"
        self.user_token = "user_token"

        # Mock user IDs
        self.user_id = str(ObjectId())
        self.moderator_id = str(ObjectId())
        self.resource_id = str(ObjectId())
        self.category_id = str(ObjectId())

    def mock_get_user_id_from_token(self, token):
        """Mock pour la fonction get_user_id_from_token"""
        if token == self.valid_token:
            return self.user_id
        elif token == self.moderator_token:
            return self.moderator_id
        return None

    def mock_get_db(self):
        """Mock pour la fonction get_db"""
        db = MagicMock()
        
        # Mock pour les collections
        db.users = MagicMock()
        db.ressource = MagicMock()
        db.ressources_en_attente = MagicMock()
        db.category = MagicMock()
        db.role = MagicMock()
        db.commentaire = MagicMock()
        db.favoris = MagicMock()
        db.historique = MagicMock()
        db.token = MagicMock()
        
        return db

    @patch('routes.resources.create_resource.get_user_id_from_token')
    @patch('routes.resources.create_resource.get_db')
    def test_create_resource(self, mock_get_db, mock_get_user_id):
        """Test de la route create_resource"""
        mock_get_user_id.side_effect = self.mock_get_user_id_from_token
        mock_get_db.return_value = self.mock_get_db()
        db = mock_get_db.return_value
        db.token.find_one.return_value = {"id_user": self.user_id}
        # Mock du retour de insert_one
        mock_insert_result = MagicMock()
        mock_insert_result.inserted_id = ObjectId()
        db.ressources_en_attente.insert_one.return_value = mock_insert_result
        test_data = {
            "title": "New Resource",
            "content": "New Content",
            "categorie": str(ObjectId())
        }
        response = self.client.post(
            '/resources/create_resources',
            json=test_data,
            headers={'token': self.valid_token}
        )
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.data)
        self.assertEqual(data["titre"], "New Resource")

    @patch('routes.resources.list_resources.get_db')
    def test_list_resources(self, mock_get_db):
        """Test de la route list_resources"""
        mock_get_db.return_value = self.mock_get_db()
        db = mock_get_db.return_value
        test_resources = [
            {
                "_id": ObjectId(),
                "titre": "Test Resource 1",
                "contenu": "Content 1",
                "id_categorie": ObjectId(),
                "id_publieur": ObjectId(),
                "date_publication": {"date": datetime.utcnow()}
            },
            {
                "_id": ObjectId(),
                "titre": "Test Resource 2",
                "contenu": "Content 2",
                "id_categorie": ObjectId(),
                "id_publieur": ObjectId(),
                "date_publication": {"date": datetime.utcnow()}
            }
        ]
        db.ressource.find.return_value = test_resources
        response = self.client.get('/resources/')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(len(data), 2)

    @patch('routes.resources.get_resource.get_db')
    def test_get_resource(self, mock_get_db):
        """Test de la route get_resource"""
        mock_get_db.return_value = self.mock_get_db()
        db = mock_get_db.return_value
        test_resource = {
            "_id": ObjectId(self.resource_id),
            "titre": "Test Resource",
            "contenu": "Test Content",
            "id_categorie": ObjectId(self.category_id),
            "id_publieur": ObjectId(self.user_id),
            "date_publication": {"date": datetime.utcnow()}
        }
        db.ressource.find_one.return_value = test_resource
        response = self.client.get(f'/resources/ressource={self.resource_id}')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data["titre"], "Test Resource")

    @patch('routes.resources.update_resource.get_user_id_from_token')
    @patch('routes.resources.update_resource.get_db')
    def test_update_resource(self, mock_get_db, mock_get_user_id):
        """Test de la route update_resource"""
        mock_get_user_id.side_effect = self.mock_get_user_id_from_token
        mock_get_db.return_value = self.mock_get_db()
        db = mock_get_db.return_value
        existing_resource = {
            "_id": ObjectId(self.resource_id),
            "titre": "Original Title",
            "contenu": "Original Content",
            "id_publieur": ObjectId(self.user_id)
        }
        updated_resource = existing_resource.copy()
        updated_resource["titre"] = "Updated Title"
        updated_resource["contenu"] = "Updated Content"
        db.ressource.find_one.side_effect = [existing_resource, updated_resource]
        db.users.find_one.return_value = {"_id": ObjectId(self.user_id)}
        db.role.find_one.return_value = {"nom_role": "utilisateur"}
        db.ressource.update_one.return_value.modified_count = 1
        update_data = {
            "title": "Updated Title",
            "content": "Updated Content"
        }
        response = self.client.put(
            f'/resources/update/{self.resource_id}',
            json=update_data,
            headers={'token': self.valid_token}
        )
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data["titre"], "Updated Title")

    @patch('routes.resources.delete_resource.get_user_id_from_token')
    @patch('routes.resources.delete_resource.get_db')
    def test_delete_resource(self, mock_get_db, mock_get_user_id):
        """Test de la route delete_resource"""
        mock_get_user_id.side_effect = self.mock_get_user_id_from_token
        mock_get_db.return_value = self.mock_get_db()
        db = mock_get_db.return_value
        existing_resource = {
            "_id": ObjectId(self.resource_id),
            "titre": "Resource to Delete",
            "id_publieur": ObjectId(self.user_id)
        }
        db.ressource.find_one.return_value = existing_resource
        db.users.find_one.return_value = {"_id": ObjectId(self.user_id)}
        db.role.find_one.return_value = {"nom_role": "utilisateur"}
        response = self.client.delete(
            f'/resources/delete/{self.resource_id}',
            headers={'token': self.valid_token}
        )
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data["message"], "Ressource supprimée avec succès")

    @patch('routes.resources.comments.get_user_id_from_token')
    @patch('routes.resources.comments.get_db')
    def test_add_comment(self, mock_get_db, mock_get_user_id):
        """Test de la route add_comment"""
        mock_get_user_id.side_effect = self.mock_get_user_id_from_token
        mock_get_db.return_value = self.mock_get_db()
        db = mock_get_db.return_value
        db.ressource.find_one.return_value = {
            "_id": ObjectId(self.resource_id),
            "titre": "Test Resource"
        }
        comment_data = {
            "content": "Test Comment"
        }
        response = self.client.post(
            f'/resources/comments/{self.resource_id}',
            json=comment_data,
            headers={'token': self.valid_token}
        )
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.data)
        self.assertEqual(data["content"], "Test Comment")

    @patch('routes.resources.post_favorite.get_user_id_from_token')
    @patch('routes.resources.post_favorite.get_db')
    def test_add_favorite(self, mock_get_db, mock_get_user_id):
        """Test de la route add_favorite"""
        mock_get_user_id.side_effect = self.mock_get_user_id_from_token
        mock_get_db.return_value = self.mock_get_db()
        db = mock_get_db.return_value
        db.ressource.find_one.return_value = {
            "_id": ObjectId(self.resource_id),
            "titre": "Test Resource"
        }
        db.favoris.find_one.return_value = None
        response = self.client.post(
            f'/resources/favorite/{self.resource_id}',
            headers={'token': self.valid_token}
        )
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.data)
        self.assertEqual(str(data["resource_id"]), self.resource_id)

if __name__ == '__main__':
    unittest.main() 