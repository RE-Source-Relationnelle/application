from flask import request, jsonify
from datetime import datetime
from bson import ObjectId
from config.database import get_db
from . import resources_bp
import jwt
import os

@resources_bp.route('/resources', methods=['POST'])
def create_resource():
    """
    Route pour créer une nouvelle ressource
    """
    print("🔄 Début de la route create_resource")
    
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

    data = request.get_json()
    print(f"📝 Données reçues: {data}")

    if not data or 'title' not in data or 'content' not in data:
        print("❌ Erreur: Titre ou contenu manquant")
        return jsonify({"error": "Titre et contenu requis"}), 400

    try:
        # Créer la ressource
        resource = {
            "title": data['title'],
            "content": data['content'],
            "user_id": ObjectId(user_id),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }

        # Insérer dans la base de données
        result = db.Ressource.insert_one(resource)
        resource['_id'] = str(result.inserted_id)
        resource['user_id'] = str(resource['user_id'])
        
        print(f"✅ Ressource créée avec l'ID: {resource['_id']}")
        return jsonify(resource), 201

    except Exception as e:
        print(f"❌ Erreur lors de la création de la ressource: {str(e)}")
        import traceback
        print(f"Stack trace: {traceback.format_exc()}")
        return jsonify({"error": f"Erreur lors de la création de la ressource: {str(e)}"}), 500 