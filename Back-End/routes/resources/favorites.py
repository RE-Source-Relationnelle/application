from flask import request, jsonify
from datetime import datetime
from bson import ObjectId
from config.database import get_db
from . import resources_bp
import jwt
import os

@resources_bp.route('/<resource_id>/favorite', methods=['POST'])
def add_favorite(resource_id):
    """
    Route pour ajouter une ressource aux favoris
    """
    print("🔄 Début de la route add_favorite")
    
    # Vérification du token
    token = request.headers.get('Authorization')
    if not token or not token.startswith('Bearer '):
        return jsonify({"error": "Token manquant ou invalide"}), 401
    
    try:
        token = token.split(' ')[1]
        payload = jwt.decode(token, os.getenv('JWT_SECRET_KEY'), algorithms=['HS256'])
        user_id = payload['user_id']
    except Exception as e:
        return jsonify({"error": "Token invalide"}), 401
    
    db = get_db()
    if db is None:
        print("❌ Erreur: Base de données non connectée")
        return jsonify({"error": "Erreur de connexion à la base de données"}), 500

    try:
        # Vérifier si la ressource existe
        resource = db.Ressource.find_one({"_id": ObjectId(resource_id)})
        if not resource:
            return jsonify({"error": "Ressource non trouvée"}), 404

        # Vérifier si le favori existe déjà
        existing_favorite = db.Favoris.find_one({
            "user_id": ObjectId(user_id),
            "resource_id": ObjectId(resource_id)
        })
        
        if existing_favorite:
            return jsonify({"error": "Cette ressource est déjà dans vos favoris"}), 400

        # Créer le favori
        favorite = {
            "user_id": ObjectId(user_id),
            "resource_id": ObjectId(resource_id),
            "created_at": datetime.utcnow()
        }

        # Insérer dans la base de données
        result = db.Favoris.insert_one(favorite)
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