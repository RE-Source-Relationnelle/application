from flask import request, jsonify, make_response
from datetime import datetime, timedelta
import jwt
from config.database import get_db
from config.config import SECRET_KEY
from routes.users import users_bp

@users_bp.route('/update_profile', methods=['PUT'])
def update_profile():
    print("Received update_profile request")
    try:
        # Récupérer le token depuis les cookies
        token = request.cookies.get('access_token')
        print(f"Token from cookies: {token}")
        
        if not token:
            # Si pas de token dans les cookies, vérifier les en-têtes
            auth_cookie = request.cookies.get('Authorization')
            print(f"Auth cookie: {auth_cookie}")
            if auth_cookie and auth_cookie.startswith('Bearer '):
                token = auth_cookie.split(' ')[1]
                print(f"Token from cookie: {token}")
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
        
        if 'mail' in data and data['mail']:
            update_fields['mail'] = data['mail']  # Notez que le champ dans la BD est 'mail'
        
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