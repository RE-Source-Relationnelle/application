from flask import request, jsonify
from datetime import datetime, timedelta, timezone
import jwt
import os
from config.database import get_db
from . import auth_bp

# Clé secrète pour JWT
JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'your-secret-key')


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
def refresh_token():
    print(" Début de la route refresh_token")

    db = get_db()
    if db is None:
        print(" Erreur: Base de données non connectée")
        return jsonify({"error": "Erreur de connexion à la base de données"}), 500

    # Récupérer le refresh token du body ou des cookies
    data = request.get_json()
    print(f" Données reçues: {data}")
    
    refresh_token = None
    
    # Vérifier d'abord dans le body
    if data and 'refresh_token' in data:
        refresh_token = data['refresh_token']
    # Sinon, vérifier dans les cookies
    else:
        refresh_token = request.cookies.get('refresh_token')
    
    if not refresh_token:
        print(" Erreur: Refresh token manquant dans la requête")
        return jsonify({"error": "Refresh token manquant"}), 400

    print(f" Recherche du token: {refresh_token}")

    try:
        # Vérifier le refresh token dans la base de données
        token_doc = db.token.find_one({"refresh_token": refresh_token})
        print(f" Document trouvé: {token_doc}")

        if not token_doc:
            print(" Erreur: Token non trouvé dans la base de données")
            return jsonify({"error": "Refresh token invalide"}), 401

        # Vérifier si le refresh token n'est pas expiré
        try:
            expiration_refresh = parse_date(token_doc['expiration_refresh_token'])
            print(f" Date d'expiration du refresh token: {expiration_refresh}")
        except Exception as e:
            print(f" Erreur lors du parsing de la date: {str(e)}")
            return jsonify({"error": "Format de date invalide"}), 500

        if expiration_refresh < datetime.now(timezone.utc):
            print(" Erreur: Refresh token expiré")
            return jsonify({"error": "Refresh token expiré"}), 401

        # Générer un nouveau access token UNIQUEMENT
        user_id = token_doc['id_user']
        expiration_access = datetime.now(timezone.utc) + timedelta(minutes=15)

        print(f"👤 ID utilisateur: {user_id}")
        print(f"⏰ Nouvelle expiration access token: {expiration_access}")

        new_access_token = jwt.encode(
            {
                'user_id': str(user_id),
                'exp': expiration_access
            },
            JWT_SECRET_KEY,
            algorithm='HS256'
        )

        # Mettre à jour SEULEMENT l'access_token et son expiration
        update_result = db.token.update_one(
            {"_id": token_doc['_id']},
            {
                "$set": {
                    "access_token": new_access_token,
                    "expiration_access_token": expiration_access
                }
            }
        )
        print(f" Résultat de la mise à jour: {update_result.modified_count} document(s) modifié(s)")

        # Préparer la réponse
        response_data = {
            "access_token": new_access_token,
            "expiration_access_token": expiration_access.isoformat() + "Z",
            "refresh_token": refresh_token,
            "expiration_refresh_token": expiration_refresh.isoformat() + "Z"
        }
        print(f"✅ Réponse envoyée: {response_data}")

        # Créer une réponse avec les cookies
        response = jsonify(response_data)
        
        # Définir les cookies
        response.set_cookie(
            'access_token', 
            new_access_token, 
            max_age=900,  # 15 minutes
            path='/',
            httponly=True,
            samesite='Lax'
        )
        
        # Ne pas redéfinir le refresh_token car il est toujours valide
        
        return response, 200
    except Exception as e:
        print(f"❌ Erreur lors du refresh token: {str(e)}")
        import traceback
        print(f"Stack trace: {traceback.format_exc()}")
        return jsonify({"error": f"Erreur lors du renouvellement du token: {str(e)}"}), 500
