from flask import request, jsonify
from datetime import datetime
from bson import ObjectId
from config.database import get_db
from . import auth_bp

@auth_bp.route('/register', methods=['POST'])
def register():
    print("Received registration request")
    try:
        db = get_db()
        if db is None:
            print("Database connection failed")
            return jsonify({'error': 'Database connection failed'}), 500

        data = request.get_json()
        print(f"Received data: {data}")

        # Vérification des données requises
        required_fields = ['nom', 'prenom', 'mail', 'password', 'username', 'genre']
        if not all(k in data for k in required_fields):
            missing_fields = [field for field in required_fields if field not in data]
            print(f"Missing required fields: {missing_fields}")
            return jsonify({'error': 'Tous les champs sont requis', 'missing_fields': missing_fields}), 400

        # Vérification si l'email existe déjà
        if db.users.find_one({'mail': data['mail']}):
            print("Email already exists")
            return jsonify({'error': 'Email déjà utilisé'}), 400

        # Création de l'utilisateur
        user = {
            '_id': ObjectId(),
            'nom': data['nom'],
            'prenom': data['prenom'],
            'mail': data['mail'],
            'password': data['password'],
            'username': data['username'],
            'genre': data['genre'],
            'created_at': datetime.utcnow()
        }

        # Insertion dans la base de données
        result = db.users.insert_one(user)
        print(f"User created with id: {result.inserted_id}")

        return jsonify({
            'message': 'Utilisateur créé avec succès',
            'user_id': str(result.inserted_id)
        }), 201

    except Exception as e:
        print(f"Error in registration: {str(e)}")
        return jsonify({'error': str(e)}), 500
