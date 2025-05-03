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
            print(f"Email: {u.get('mail')} | Password: {u.get('password')}")
        print("============================================\n")

        # Vérification des données requises
        if not all(k in data for k in ('mail', 'password')):
            print("Missing required fields")
            return jsonify({'error': 'Email et mot de passe requis'}), 400

        # Recherche de l'utilisateur
        user = db.users.find_one({'mail': data['mail']})
        print(f"Utilisateur trouvé: {user}")
        
        # Vérification simple du mot de passe
        if not user:
            print(f"Aucun utilisateur trouvé avec l'email: {data['mail']}")
            return jsonify({'error': 'Email ou mot de passe incorrect'}), 401
            
        if user['password'] != data['password']:
            print(f"Mot de passe incorrect. Reçu: {data['password']}, Attendu: {user['password']}")
            return jsonify({'error': 'Email ou mot de passe incorrect'}), 401

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

        print("Authentication successful")
        return response

    except Exception as e:
        print(f"Error in auth_from_password: {str(e)}")
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/me', methods=['GET'])
def get_user_info():
    print("Received /me request")
    try:
        # Récupérer le token depuis les cookies
        token = request.cookies.get('access_token')
        print(f"Token from cookies: {token}")
        
        if not token:
            # Si pas de token dans les cookies, vérifier les en-têtes
            auth_header = request.headers.get('Authorization')
            print(f"Auth header: {auth_header}")
            if auth_header and auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
                print(f"Token from header: {token}")
            else:
                print("No token found")
                return jsonify({'error': 'Non authentifié'}), 401
        
        # Vérifier et décoder le token
        try:
            print(f"Decoding token: {token}")
            payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            user_id = payload['user_id']
            print(f"User ID from token: {user_id}")
        except jwt.ExpiredSignatureError:
            print("Token expired")
            return jsonify({'error': 'Token expiré'}), 401
        except jwt.InvalidTokenError as e:
            print(f"Invalid token: {str(e)}")
            return jsonify({'error': 'Token invalide'}), 401
        
        # Récupérer les informations de l'utilisateur depuis la base de données
        db = get_db()
        from bson import ObjectId
        try:
            user_id_obj = ObjectId(user_id)
            print(f"Looking for user with ID: {user_id_obj}")
            user = db.users.find_one({'_id': user_id_obj})
            print(f"User found: {user}")
        except Exception as e:
            print(f"Error finding user: {str(e)}")
            return jsonify({'error': f'Erreur lors de la recherche de l\'utilisateur: {str(e)}'}), 500
        
        if not user:
            print("User not found")
            return jsonify({'error': 'Utilisateur non trouvé'}), 404
        
        # Retourner les informations de l'utilisateur (sans le mot de passe)
        user_data = {
            'id': str(user['_id']),
            'username': user.get('username', ''),
            'mail': user.get('mail', ''),
            'nom': user.get('nom', ''),
            'prenom': user.get('prenom', ''),
            'genre': user.get('genre', '')
        }
        
        print(f"Returning user data: {user_data}")
        return jsonify(user_data), 200
    
    except Exception as e:
        print(f"Error in get_user_info: {str(e)}")
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/update_profile', methods=['PUT'])
def update_profile():
    print("Received update_profile request")
    try:
        # Récupérer le token depuis les cookies
        token = request.cookies.get('access_token')
        print(f"Token from cookies: {token}")
        
        if not token:
            # Si pas de token dans les cookies, vérifier les en-têtes
            auth_header = request.headers.get('Authorization')
            print(f"Auth header: {auth_header}")
            if auth_header and auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
                print(f"Token from header: {token}")
            else:
                print("No token found")
                return jsonify({'error': 'Non authentifié'}), 401
        
        # Vérifier et décoder le token
        try:
            print(f"Decoding token: {token}")
            payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            user_id = payload['user_id']
            print(f"User ID from token: {user_id}")
        except jwt.ExpiredSignatureError:
            print("Token expired")
            return jsonify({'error': 'Token expiré'}), 401
        except jwt.InvalidTokenError as e:
            print(f"Invalid token: {str(e)}")
            return jsonify({'error': 'Token invalide'}), 401
        
        # Récupérer les données du formulaire
        data = request.get_json()
        print(f"Received data for profile update: {data}")
        print(f"Data type: {type(data)}")
        print(f"Data keys: {data.keys() if data else 'No data'}")
        
        # Vérifier les données reçues
        if not data:
            print("No data received")
            return jsonify({'error': 'Aucune donnée reçue'}), 400
        
        # Préparer les champs à mettre à jour
        update_fields = {}
        
        # Vérifier chaque champ possible et l'ajouter s'il est présent
        if 'prenom' in data and data['prenom']:
            update_fields['prenom'] = data['prenom']
        
        if 'nom' in data and data['nom']:
            update_fields['nom'] = data['nom']
        
        if 'username' in data and data['username']:
            update_fields['username'] = data['username']
        
        if 'email' in data and data['email']:
            update_fields['mail'] = data['email']  # Notez que le champ dans la BD est 'mail'
        
        if 'genre' in data and data['genre']:
            update_fields['genre'] = data['genre']
        
        # Si aucun champ à mettre à jour, retourner une erreur
        if not update_fields:
            print("No fields to update")
            return jsonify({'error': 'Aucun champ à mettre à jour'}), 400
        
        # Mettre à jour l'utilisateur dans la base de données
        db = get_db()
        from bson import ObjectId
        try:
            user_id_obj = ObjectId(user_id)
            print(f"Updating user with ID: {user_id_obj}")
            print(f"Update fields: {update_fields}")
            
            result = db.users.update_one(
                {'_id': user_id_obj},
                {'$set': update_fields}
            )
            
            if result.modified_count == 0:
                print("No document was updated")
                return jsonify({'error': 'Aucune modification effectuée'}), 400
            
            print(f"User updated successfully: {result.modified_count} document(s) modified")
            
            # Récupérer les informations mises à jour de l'utilisateur
            updated_user = db.users.find_one({'_id': user_id_obj})
            
            # Retourner les informations mises à jour
            user_data = {
                'id': str(updated_user['_id']),
                'username': updated_user.get('username', ''),
                'mail': updated_user.get('mail', ''),
                'nom': updated_user.get('nom', ''),
                'prenom': updated_user.get('prenom', ''),
                'genre': updated_user.get('genre', '')
            }
            
            return jsonify({'message': 'Profil mis à jour avec succès', 'user': user_data}), 200
            
        except Exception as e:
            print(f"Error updating user: {str(e)}")
            return jsonify({'error': f'Erreur lors de la mise à jour de l\'utilisateur: {str(e)}'}), 500
    
    except Exception as e:
        print(f"Error in update_profile: {str(e)}")
        return jsonify({'error': str(e)}), 500
