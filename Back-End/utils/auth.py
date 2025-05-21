from functools import wraps
from flask import request, jsonify
import jwt
import os
from config.database import get_db
from bson import ObjectId

# Clé secrète pour JWT
JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', '')

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        print("\n=== DÉBUT VÉRIFICATION TOKEN ===")
        print(f"Route appelée: {request.path} [{request.method}]")
        print(f"Cookies reçus: {request.cookies}")
        print(f"En-têtes: {dict(request.headers)}")
        
        token = None
        
        # Vérifier dans les cookies (priorité)
        if 'access_token' in request.cookies:
            token = request.cookies.get('access_token')
            print(f"Token trouvé dans les cookies: {token[:10]}...")
        
        # Vérifier dans l'en-tête Authorization
        if not token and 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
                print(f"Token trouvé dans l'en-tête Authorization: {token[:10]}...")
        
        # Vérifier dans l'en-tête token (fallback)
        if not token and 'token' in request.headers:
            token = request.headers['token']
            print(f"Token trouvé dans l'en-tête token: {token[:10]}...")
        
        if not token:
            print("❌ Aucun token trouvé")
            print("=== FIN VÉRIFICATION TOKEN (ÉCHEC) ===\n")
            return jsonify({'error': 'Token manquant'}), 401
        
        try:
            # Vérifier la signature et l'expiration du token
            decoded = jwt.decode(token, JWT_SECRET_KEY, algorithms=['HS256'])
            user_id = decoded['user_id']
            print(f"✅ Token décodé avec succès: user_id={user_id}")
            
            # Vérifier que le token existe dans la base de données
            db = get_db()
            token_doc = db.token.find_one({"access_token": token})
            
            if not token_doc:
                print("❌ Token non trouvé dans la base de données")
                print("=== FIN VÉRIFICATION TOKEN (ÉCHEC) ===\n")
                return jsonify({'error': 'Token invalide'}), 401
            
            # Vérifier que l'ID utilisateur correspond
            if str(token_doc['id_user']) != user_id:
                print(f"❌ ID utilisateur ne correspond pas: {token_doc['id_user']} != {user_id}")
                print("=== FIN VÉRIFICATION TOKEN (ÉCHEC) ===\n")
                return jsonify({'error': 'Token invalide'}), 401
            
            # Récupérer l'utilisateur
            user = db.users.find_one({"_id": ObjectId(user_id)})
            if not user:
                print(f"❌ Utilisateur avec ID {user_id} non trouvé")
                print("=== FIN VÉRIFICATION TOKEN (ÉCHEC) ===\n")
                return jsonify({'error': 'Utilisateur non trouvé'}), 404
            
            print(f"✅ Utilisateur trouvé: {user.get('mail')}")
            print("=== FIN VÉRIFICATION TOKEN (SUCCÈS) ===\n")
            
            # Passer l'utilisateur à la fonction décorée
            return f(user, *args, **kwargs)
            
        except jwt.ExpiredSignatureError:
            print("❌ Token expiré")
            print("=== FIN VÉRIFICATION TOKEN (ÉCHEC) ===\n")
            return jsonify({'error': 'Token expiré'}), 401
        except jwt.InvalidTokenError:
            print("❌ Token invalide")
            print("=== FIN VÉRIFICATION TOKEN (ÉCHEC) ===\n")
            return jsonify({'error': 'Token invalide'}), 401
        except Exception as e:
            print(f"❌ Erreur lors de la vérification du token: {str(e)}")
            print("=== FIN VÉRIFICATION TOKEN (ÉCHEC) ===\n")
            return jsonify({'error': str(e)}), 500
    
    return decorated

def get_user_id_from_token(token: str):
    print("token = ",token)
    if not token:
        return "None"

    db = get_db()

    # Chercher le token en base
    token_data = db.token.find_one({'access_token': token})
    if token_data:
        return token_data.get('id_user')

    return None
