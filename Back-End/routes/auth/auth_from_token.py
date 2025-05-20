from flask import request, jsonify
from datetime import datetime, timedelta
import jwt
from config.database import get_db
from config.config import SECRET_KEY
from . import auth_bp

@auth_bp.route('/auth_from_token', methods=['POST'])
def auth_from_password():
    print("Received auth_from_token request")
    try:
        db = get_db()
        if db is None:
            print("Database connection failed")
            return jsonify({'error': 'Database connection failed'}), 500

        data = request.get_json()
        print(f"Received data: {data}")

        # Vérification des données requises
        if not all(k in data for k in ('mail', 'password')):
            print("Missing required fields")
            return jsonify({'error': 'mail et mot de passe requis'}), 400

        # Recherche de l'utilisateur
        user = db.token.find_one({'access_token': data['access_token']})

        # Génération des timestamps
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

        # Mise à jour ou insertion du token dans la base de données
        print("Token data to be inserted:", token_data)
        result = db.Token.insert_one(token_data)
        print("Token inserted with ID:", result.inserted_id)

        # Préparation de la réponse
        response_data = {
            'access_token': access_token,
            'expiration_access_token': access_token_expiration.isoformat(),
            'refresh_token': refresh_token,
            'expiration_refresh_token': refresh_token_expiration.isoformat()
        }

        print("Authentication successful")
        return jsonify(response_data), 201

    except Exception as e:
        print(f"Error in auth_from_password: {str(e)}")
        return jsonify({'error': str(e)}), 500
