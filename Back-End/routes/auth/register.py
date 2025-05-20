from flask import request, jsonify, make_response
from datetime import datetime, timedelta
import jwt
from bson import ObjectId
from config.database import get_db
from config.config import SECRET_KEY
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

        # Vérification si l'mail existe déjà
        if db.users.find_one({'mail': data['mail']}):
            print("mail already exists")
            return jsonify({'error': 'mail déjà utilisé'}), 400

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
        
        # Génération des timestamps pour les tokens
        current_time = datetime.utcnow()
        access_token_expiration = current_time + timedelta(hours=1)
        refresh_token_expiration = current_time + timedelta(days=7)

        # Génération des tokens
        access_token = jwt.encode({
            'user_id': str(user['_id']),
            'exp': access_token_expiration
        }, SECRET_KEY, algorithm='HS256')

        refresh_token = jwt.encode({
            'user_id': str(user['_id']),
            'exp': refresh_token_expiration
        }, SECRET_KEY, algorithm='HS256')

        # Création du document token
        token_data = {
            'id_user': user['_id'],
            'access_token': access_token,
            'expiration_access_token': access_token_expiration,
            'refresh_token': refresh_token,
            'expiration_refresh_token': refresh_token_expiration
        }

        # Insertion du token dans la base de données
        db.Token.insert_one(token_data)

        # Préparation de la réponse
        response_data = {
            'message': 'Utilisateur créé avec succès',
            'user_id': str(user['_id']),
            'username': user['username'],
            'mail': user['mail'],
            'nom': user['nom'],
            'prenom': user['prenom']
        }

        # Création de la réponse avec cookies
        response = make_response(jsonify(response_data), 201)
        
        # Définition des cookies sécurisés
        response.set_cookie(
            'access_token', 
            access_token, 
            httponly=True, 
            secure=False,  # Mettre à True en production avec HTTPS
            samesite='Lax',
            max_age=3600  # 1 heure
        )
        
        response.set_cookie(
            'refresh_token', 
            refresh_token, 
            httponly=True, 
            secure=False,  # Mettre à True en production avec HTTPS
            samesite='Lax',
            max_age=604800  # 7 jours
        )

        return response

    except Exception as e:
        print(f"Error in register: {str(e)}")
        return jsonify({'error': str(e)}), 500
