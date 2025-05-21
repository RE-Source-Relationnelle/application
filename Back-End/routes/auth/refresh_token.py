from flask import request, jsonify, make_response
from datetime import datetime, timedelta, timezone
import jwt
import os
from config.database import get_db
from . import auth_bp
from flask_cors import cross_origin
from bson import ObjectId

# Clé secrète pour JWT
JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', '')


def parse_date(date_value):
    """
    Fonction pour parser proprement une date venant de MongoDB.
    """
    if isinstance(date_value, datetime):
        return date_value
    if isinstance(date_value, dict) and 'date' in date_value:
        return datetime.fromisoformat(date_value['date'].replace('Z', '+00:00'))
    if isinstance(date_value, str):
        try:
            return datetime.fromisoformat(date_value.replace('Z', '+00:00'))
        except Exception:
            return datetime.strptime(date_value, '%Y-%m-%d %H:%M:%S')
    raise ValueError("Format de date non reconnu")


@auth_bp.route('/refresh_token', methods=['POST'])
@cross_origin(supports_credentials=True, origins=["http://localhost:3000"])
def refresh_token():
    print("\n\n========== DÉBUT REFRESH TOKEN ==========")
    print(f"Méthode de la requête: {request.method}")
    print(f"En-têtes de la requête: {dict(request.headers)}")
    print(f"Cookies reçus: {request.cookies}")
    
    db = get_db()
    if db is None:
        print("❌ ERREUR: Base de données non connectée")
        return jsonify({"error": "Erreur de connexion à la base de données"}), 500

    # Récupérer le refresh token des cookies
    refresh_token = request.cookies.get('refresh_token')
    print(f"Refresh token trouvé dans les cookies: {'Oui - ' + refresh_token[:10] + '...' if refresh_token else 'Non'}")
    
    if not refresh_token:
        print("❌ ERREUR: Refresh token manquant dans la requête")
        return jsonify({"error": "Refresh token manquant"}), 401

    try:
        # 1. Vérifier si le refresh token existe dans la base de données
        token_doc = db.token.find_one({"refresh_token": refresh_token})
        
        if not token_doc:
            print("❌ ERREUR: Token non trouvé dans la base de données")
            return jsonify({"error": "Refresh token invalide"}), 401

        # 2. Vérifier si le refresh token n'est pas expiré
        try:
            # Décoder le token pour vérifier la signature et l'expiration
            decoded_token = jwt.decode(refresh_token, JWT_SECRET_KEY, algorithms=['HS256'])
            user_id = decoded_token.get('user_id')
            
            # Vérifier que l'ID utilisateur correspond
            if str(token_doc['id_user']) != user_id:
                print("❌ ERREUR: ID utilisateur ne correspond pas")
                return jsonify({"error": "Refresh token invalide"}), 401
                
            # Vérifier l'expiration dans la base de données également
            expiration_refresh = parse_date(token_doc['expiration_refresh_token'])
            
            # Ajouter un fuseau horaire si la date est naive
            if expiration_refresh.tzinfo is None:
                expiration_refresh = expiration_refresh.replace(tzinfo=timezone.utc)
            
            if expiration_refresh < datetime.now(timezone.utc):
                print("❌ ERREUR: Refresh token expiré")
                # Supprimer le token expiré de la base de données
                db.token.delete_one({"_id": token_doc['_id']})
                return jsonify({"error": "Refresh token expiré"}), 401
                
        except jwt.ExpiredSignatureError:
            print("❌ ERREUR: Refresh token JWT expiré")
            # Supprimer le token expiré de la base de données
            db.token.delete_one({"_id": token_doc['_id']})
            return jsonify({"error": "Refresh token expiré"}), 401
        except jwt.InvalidTokenError:
            print("❌ ERREUR: Refresh token JWT invalide")
            return jsonify({"error": "Refresh token invalide"}), 401
        except Exception as e:
            print(f"❌ ERREUR lors de la vérification du token: {str(e)}")
            return jsonify({"error": "Erreur de validation du token"}), 500

        # 3. Générer de nouveaux tokens (rotation complète)
        user_id = token_doc['id_user']
        current_time = datetime.now(timezone.utc)
        expiration_access = current_time + timedelta(minutes=15)
        expiration_refresh = current_time + timedelta(days=7)

        print(f"👤 ID utilisateur: {user_id}")
        print(f"⏰ Nouvelle expiration access token: {expiration_access}")
        print(f"⏰ Nouvelle expiration refresh token: {expiration_refresh}")

        # Générer un nouveau access token
        new_access_token = jwt.encode(
            {
                'user_id': str(user_id),
                'exp': int(expiration_access.timestamp())
            },
            JWT_SECRET_KEY,
            algorithm='HS256'
        )

        # Générer un nouveau refresh token (rotation)
        new_refresh_token = jwt.encode(
            {
                'user_id': str(user_id),
                'exp': int(expiration_refresh.timestamp()),
                'jti': str(ObjectId())  # Identifiant unique pour ce token
            },
            JWT_SECRET_KEY,
            algorithm='HS256'
        )

        # 4. Invalider l'ancien refresh token et stocker les nouveaux
        # Supprimer l'ancien token
        db.token.delete_one({"_id": token_doc['_id']})
        
        # Créer un nouveau document token
        new_token_data = {
            'id_user': user_id,
            'access_token': new_access_token,
            'expiration_access_token': expiration_access,
            'refresh_token': new_refresh_token,
            'expiration_refresh_token': expiration_refresh,
            'created_at': current_time,
            'user_agent': request.headers.get('User-Agent', 'Unknown'),
            'ip_address': request.remote_addr
        }
        
        # Insérer le nouveau token
        insert_result = db.token.insert_one(new_token_data)
        print(f"✅ Nouveau token inséré avec ID: {insert_result.inserted_id}")

        # 5. Préparer la réponse avec les nouveaux cookies
        response = make_response(jsonify({
            "message": "Token rafraîchi avec succès"
        }))
        
        # Définir les cookies
        response.set_cookie(
            'access_token', 
            new_access_token, 
            max_age=900,  # 15 minutes
            path='/',
            httponly=False,  # Accessible par JavaScript pour les en-têtes
            secure=False,    # À mettre à True en production avec HTTPS
            samesite='Lax'
        )
        
        response.set_cookie(
            'refresh_token', 
            new_refresh_token, 
            max_age=604800,  # 7 jours
            path='/',
            httponly=True,   # Non accessible par JavaScript
            secure=False,    # À mettre à True en production avec HTTPS
            samesite='Lax'
        )
        
        print("========== FIN REFRESH TOKEN (SUCCÈS) ==========\n\n")
        return response, 200
        
    except Exception as e:
        print(f"❌ ERREUR CRITIQUE lors du refresh token: {str(e)}")
        import traceback
        traceback_str = traceback.format_exc()
        print(f"Stack trace détaillée:\n{traceback_str}")
        print("========== FIN REFRESH TOKEN (ERREUR) ==========\n\n")
        return jsonify({"error": f"Erreur lors du renouvellement du token: {str(e)}"}), 500
