from flask import request, jsonify
from datetime import datetime
from bson import ObjectId
from config.database import get_db
from . import resources_bp
import jwt
import os
from utils.auth import get_user_id_from_token


@resources_bp.route('/sous_comments/replies/<comment_id>', methods=['POST'])
def add_sous_comment(comment_id):
    """
    Route pour ajouter un sous-commentaire à un commentaire
    """
    print("🔄 Début de la route add_sous_comment")
    resource_id = request.headers.get('ressource')
    print(f"🔄 Ressource ID: {resource_id}")
    # Vérification du token
    token_header = request.headers.get('token')
    if not token_header:
        print("❌ Token manquant ou mal formé")
        return jsonify({"error": "Token manquant ou invalide"}), 401

    user_id = get_user_id_from_token(token_header)
    if not user_id:
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
        resource = db.ressource.find_one({"_id": ObjectId(resource_id)})
        if not resource:
            return jsonify({"error": "Ressource non trouvée"}), 404

        # Vérifier si le commentaire parent existe
        comment = db.commentaire.find_one({"_id": ObjectId(comment_id)})
        if not comment:
            return jsonify({"error": "Commentaire non trouvé"}), 404

        # Créer le sous-commentaire
        sous_comment = {
            "content": data['content'],
            "user_id": user_id,
            "resource_id": resource_id,
            "comment_id": comment_id,
            "created_at": datetime.utcnow()
        }

        # Insérer dans la base de données
        result = db.sous_commentaire.insert_one(sous_comment)
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