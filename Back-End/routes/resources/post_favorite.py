from flask import request, jsonify
from datetime import datetime
from bson import ObjectId
from config.database import get_db
from . import resources_bp
from utils.auth import get_user_id_from_token

@resources_bp.route('/favorite/<resource_id>', methods=['POST'])
def add_favorite(resource_id):
    """
    Route pour ajouter une ressource aux favoris
    """
    print("🔄 Début de la route add_favorite")
    
    # Vérification du token
    token_cookie = request.cookies.get('access_token')
    if not token_cookie:
        print("❌ Token manquant ou mal formé")
        return jsonify({"error": "Token manquant ou invalide"}), 401

    user_id = get_user_id_from_token(token_cookie)
    if not user_id:
        return jsonify({"error": "Token invalide"}), 401
    
    db = get_db()
    if db is None:
        print("❌ Erreur: Base de données non connectée")
        return jsonify({"error": "Erreur de connexion à la base de données"}), 500

    try:
        # Vérifier si la ressource existe
        resource = db.ressource.find_one({"_id": ObjectId(resource_id)})
        if not resource:
            print(f"❌ Ressource non trouvée pour l'ID: {resource_id}")
            return jsonify({"error": "Ressource non trouvée"}), 404

        # Vérifier si le favori existe déjà
        existing_favorite = db.favoris.find_one({
            "user_id": user_id,
            "resource_id": ObjectId(resource_id)
        })
        
        if existing_favorite:
            print(f"⚠️ Favori déjà existant pour l'utilisateur {user_id} et la ressource {resource_id}")
            return jsonify({"error": "Cette ressource est déjà dans vos favoris"}), 400

        # Créer le favori
        favorite = {
            "user_id": user_id,
            "resource_id": ObjectId(resource_id),
            "created_at": datetime.utcnow()
        }

        # Insérer dans la base de données
        result = db.favoris.insert_one(favorite)
        
        # Préparer la réponse
        favorite['_id'] = str(result.inserted_id)
        favorite['user_id'] = str(favorite['user_id'])
        favorite['resource_id'] = str(favorite['resource_id'])

        print(f"✅ Favori créé avec l'ID: {favorite['_id']}")
        return jsonify(favorite), 201

    except Exception as e:
        print(f"❌ Erreur lors de l'ajout aux favoris: {str(e)}")
        import traceback
        print(f"Stack trace: {traceback.format_exc()}")
        return jsonify({"error": f"Erreur lors de l'ajout aux favoris: {str(e)}"}), 500
