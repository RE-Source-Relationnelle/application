from flask import request, jsonify
from datetime import datetime
from bson import ObjectId
from config.database import get_db
from . import resources_bp
import jwt
import os

@resources_bp.route('/<resource_id>/comments/<comment_id>/replies', methods=['POST'])
def add_sous_comment(resource_id, comment_id):
    """
    Route pour ajouter un sous-commentaire à un commentaire
    """
    print("🔄 Début de la route add_sous_comment")
    
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

    if not data or 'content' not in data:
        print("❌ Erreur: Contenu manquant")
        return jsonify({"error": "Contenu requis"}), 400

    try:
        # Vérifier si la ressource existe
        resource = db.Ressource.find_one({"_id": ObjectId(resource_id)})
        if not resource:
            return jsonify({"error": "Ressource non trouvée"}), 404

        # Vérifier si le commentaire parent existe
        comment = db.Commentaire.find_one({"_id": ObjectId(comment_id)})
        if not comment:
            return jsonify({"error": "Commentaire non trouvé"}), 404

        # Créer le sous-commentaire
        sous_comment = {
            "content": data['content'],
            "user_id": ObjectId(user_id),
            "resource_id": ObjectId(resource_id),
            "comment_id": ObjectId(comment_id),
            "created_at": datetime.utcnow()
        }

        # Insérer dans la base de données
        result = db.SousCommentaire.insert_one(sous_comment)
        sous_comment['_id'] = str(result.inserted_id)
        sous_comment['user_id'] = str(sous_comment['user_id'])
        sous_comment['resource_id'] = str(sous_comment['resource_id'])
        sous_comment['comment_id'] = str(sous_comment['comment_id'])
        
        print(f"✅ Sous-commentaire créé avec l'ID: {sous_comment['_id']}")
        return jsonify(sous_comment), 201

    except Exception as e:
        print(f"❌ Erreur lors de la création du sous-commentaire: {str(e)}")
        import traceback
        print(f"Stack trace: {traceback.format_exc()}")
        return jsonify({"error": f"Erreur lors de la création du sous-commentaire: {str(e)}"}), 500 