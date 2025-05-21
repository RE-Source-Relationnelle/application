from flask import request, jsonify, make_response
from datetime import datetime, timedelta
import jwt
from config.database import get_db
from config.config import SECRET_KEY
from . import auth_bp

@auth_bp.route('/auth_from_password', methods=['POST'])
def auth_from_password():
    print("Received auth_from_password request")
    try:
        db = get_db()
        if db is None:
            print("Database connection failed")
            return jsonify({'error': 'Database connection failed'}), 500

        data = request.get_json()
        print(f"Received data: {data}")

        # Afficher tous les utilisateurs et leurs mots de passe
        print("\n=== Liste des utilisateurs en base de données ===")
        for u in db.users.find():
            print(f"mail: {u.get('mail')} | Password: {u.get('password')}")
        print("============================================\n")

        # Vérification des données requises
        if not all(k in data for k in ('mail', 'password')):
            print("Missing required fields")
            return jsonify({'error': 'mail et mot de passe requis'}), 400

        # Recherche de l'utilisateur
        user = db.users.find_one({'mail': data['mail']})
        print(f"Utilisateur trouvé: {user}")
        
        # Vérification simple du mot de passe
        if not user:
            print(f"Aucun utilisateur trouvé avec l'mail: {data['mail']}")
            return jsonify({'error': 'mail ou mot de passe incorrect'}), 401
            
        if user['password'] != data['password']:
            print(f"Mot de passe incorrect. Reçu: {data['password']}, Attendu: {user['password']}")
            return jsonify({'error': 'mail ou mot de passe incorrect'}), 401

        # Génération des timestamps
        current_time = datetime.utcnow()
        access_token_expiration = current_time + timedelta(minutes=1)
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
        result = db.token.insert_one(token_data)
        print("Token inserted with ID:", result.inserted_id)

        # Préparation de la réponse
        response_data = {
            'user_id': str(user['_id']),
            'username': user.get('username', ''),
            'mail': user.get('mail', ''),
            'nom': user.get('nom', ''),
            'prenom': user.get('prenom', '')
        }

        # Création de la réponse avec cookies
        response = make_response(jsonify(response_data), 200)
        
        # Définition des cookies sécurisés
        response.set_cookie(
            'access_token', 
            access_token, 
            httponly=False, 
            secure=False,  
            samesite='Lax',
            max_age=60,
            path='/'
        )
        
        response.set_cookie(
            'refresh_token', 
            refresh_token, 
            httponly=True, 
            secure=False, 
            samesite='Lax',
            max_age=604800,
            path='/'
        )

        print("Authentication successful")
        return response

    except Exception as e:
        print(f"Error in auth_from_password: {str(e)}")
        return jsonify({'error': str(e)}), 500
