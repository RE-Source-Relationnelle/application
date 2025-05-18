from flask import request, jsonify
from datetime import datetime
from bson import ObjectId
from config.database import get_db
from . import resources_bp
from utils.auth import get_user_id_from_token

@resources_bp.route('/create_resources', methods=['POST'])
def create_resource():
    """
    Route pour créer une nouvelle ressource
    """
    print("🔄 Début de la route create_resource")

    db = get_db()
    if db is None:
        print("❌ Erreur: Base de données non connectée")
        return jsonify({"error": "Erreur de connexion à la base de données"}), 500

    # Vérification du token
    token_header = request.headers.get('token')
    if not token_header:
        print("❌ Token manquant ou mal formé")
        return jsonify({"error": "Token manquant ou invalide"}), 401
    print(token_header)
    print(get_user_id_from_token(token_header))


    access_token = token_header

    # Recherche du token dans la base
    token_data = db.token.find_one({'access_token': access_token})
    if not token_data:
        print("❌ Token non trouvé en base")
        return jsonify({"error": "Token invalide"}), 401

    user_id = token_data['id_user']
    print(f"🔐 Utilisateur authentifié avec l'ID: {user_id}")

    # Données du body
    data = request.get_json()
    print(f"📝 Données reçues: {data}")

    if not data or not all(k in data for k in ('title', 'content', 'categorie')):
        print("❌ Erreur: Champs manquants")
        return jsonify({"error": "Champs requis : title, content, categorie"}), 400

    try:
        now = datetime.utcnow()

        # Ressource à insérer
        resource = {
            "titre": data['title'],
            "contenu": data['content'],
            "categorie": data['categorie'],
            "id_publieur": ObjectId(user_id) if isinstance(user_id, str) else user_id,
            "date_publication": {
                "date": now.isoformat() + "Z"
            }
        }

        result = db.ressources_en_attente.insert_one(resource)
        resource['_id'] = result.inserted_id

        # Sanitize
        def sanitize(doc):
            for key, value in doc.items():
                if isinstance(value, ObjectId):
                    doc[key] = str(value)
                elif isinstance(value, datetime):
                    doc[key] = value.isoformat()
            return doc

        sanitized = sanitize(resource)
        print(f"✅ Ressource créée avec ID: {sanitized['_id']}")
        return jsonify(sanitized), 201

    except Exception as e:
        print(f"❌ Erreur lors de la création: {str(e)}")
        import traceback
        print(traceback.format_exc())
        return jsonify({"error": f"Erreur serveur: {str(e)}"}), 500
