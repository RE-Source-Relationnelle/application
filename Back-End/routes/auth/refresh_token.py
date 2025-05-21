from flask import request, jsonify
from datetime import datetime, timedelta, timezone
import jwt
import os
from config.database import get_db
from . import auth_bp
from flask_cors import cross_origin

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
@cross_origin(supports_credentials=True, origins=["http://localhost:3000"])
def refresh_token():
    print("\n\n========== DÉBUT REFRESH TOKEN ==========")
    print(f"Méthode de la requête: {request.method}")
    print(f"En-têtes de la requête: {dict(request.headers)}")
    print(f"Cookies reçus: {request.cookies}")
    print(f"Données JSON: {request.get_json(silent=True)}")
    print(f"Données du formulaire: {request.form}")
    
    db = get_db()
    if db is None:
        print("❌ ERREUR: Base de données non connectée")
        return jsonify({"error": "Erreur de connexion à la base de données"}), 500

    # Récupérer le refresh token du body ou des cookies
    data = request.get_json(silent=True)
    print(f"Données JSON décodées: {data}")
    
    refresh_token = None
    
    # Vérifier d'abord dans les cookies (priorité)
    refresh_token = request.cookies.get('refresh_token')
    print(f"Refresh token trouvé dans les cookies: {'Oui - ' + refresh_token[:10] + '...' if refresh_token else 'Non'}")
    
    # Si pas dans les cookies, vérifier dans le body
    if not refresh_token and data and 'refresh_token' in data:
        refresh_token = data['refresh_token']
        print(f"Refresh token trouvé dans le body: {'Oui - ' + refresh_token[:10] + '...' if refresh_token else 'Non'}")
    
    if not refresh_token:
        print("❌ ERREUR: Refresh token manquant dans la requête")
        return jsonify({"error": "Refresh token manquant"}), 400

    print(f"Recherche du token dans la base de données: {refresh_token[:10]}...")

    try:
        # Vérifier le refresh token dans la base de données
        print(f"Collection token existe: {'Oui' if 'token' in db.list_collection_names() else 'Non'}")
        token_doc = db.token.find_one({"refresh_token": refresh_token})
        print(f"Document trouvé: {token_doc is not None}")
        if token_doc:
            print(f"ID du document: {token_doc.get('_id')}")
            print(f"ID utilisateur: {token_doc.get('id_user')}")
            print(f"Expiration refresh: {token_doc.get('expiration_refresh_token')}")
        
        if not token_doc:
            print("❌ ERREUR: Token non trouvé dans la base de données")
            return jsonify({"error": "Refresh token invalide"}), 401

        # Vérifier si le refresh token n'est pas expiré
        try:
            expiration_refresh = parse_date(token_doc['expiration_refresh_token'])
            print(f"Date d'expiration du refresh token: {expiration_refresh}")
            
            # Ajouter un fuseau horaire si la date est naive
            if expiration_refresh.tzinfo is None:
                expiration_refresh = expiration_refresh.replace(tzinfo=timezone.utc)
                print(f"Date d'expiration avec fuseau horaire ajouté: {expiration_refresh}")
        except Exception as e:
            print(f"Erreur lors du parsing de la date: {str(e)}")
            return jsonify({"error": "Format de date invalide"}), 500

        if expiration_refresh < datetime.now(timezone.utc):
            print("❌ ERREUR: Refresh token expiré")
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
        print(f"Résultat de la mise à jour: {update_result.modified_count} document(s) modifié(s)")

        # Préparer la réponse
        response_data = {
            "access_token": new_access_token,
            "expiration_access_token": expiration_access.isoformat(),
            "refresh_token": refresh_token,
            "expiration_refresh_token": expiration_refresh.isoformat()
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
            httponly=False,
            samesite='Lax'
        )
        
        # Ne pas redéfinir le refresh_token car il est toujours valide
        
        print("========== FIN REFRESH TOKEN (SUCCÈS) ==========\n\n")
        return response, 200
    except Exception as e:
        print(f"❌ ERREUR CRITIQUE lors du refresh token: {str(e)}")
        import traceback
        traceback_str = traceback.format_exc()
        print(f"Stack trace détaillée:\n{traceback_str}")
        print("========== FIN REFRESH TOKEN (ERREUR) ==========\n\n")
        return jsonify({"error": f"Erreur lors du renouvellement du token: {str(e)}"}), 500
