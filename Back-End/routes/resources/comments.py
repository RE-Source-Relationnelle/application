from flask import request, jsonify
from datetime import datetime
from bson import ObjectId
from config.database import get_db
from . import resources_bp
from utils.auth import get_user_id_from_token

@resources_bp.route('/comments_old/<resource_id>', methods=['POST'])
def add_comment(resource_id):
    """
    Route pour ajouter un commentaire à une ressource (ancienne version)
    """
    print("🔄 Début de la route add_comment (ancienne version)")
    
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

    data = request.get_json()
    print(f"📝 Données reçues: {data}")

    if not data or 'content' not in data:
        print("❌ Erreur: Contenu manquant")
        return jsonify({"error": "Contenu requis"}), 400

    try:
        # Vérifier si la ressource existe
        resource = db.ressource.find_one({"_id": ObjectId(resource_id)})
        if not resource:
            print(f"❌ Ressource non trouvée pour l'ID: {resource_id}")
            return jsonify({"error": "Ressource non trouvée"}), 404

        # Créer le commentaire
        comment = {
            "content": data['content'],
            "user_id": ObjectId(user_id),
            "resource_id": ObjectId(resource_id),
            "created_at": datetime.utcnow()
        }

        # Insérer dans la base de données
        result = db.commentaire.insert_one(comment)
        
        # Préparer la réponse
        comment['_id'] = str(result.inserted_id)
        comment['user_id'] = str(comment['user_id'])
        comment['resource_id'] = str(comment['resource_id'])
        comment['created_at'] = comment['created_at'].isoformat()
        
        print(f"✅ Commentaire créé avec l'ID: {comment['_id']}")
        return jsonify(comment), 201

    except Exception as e:
        print(f"❌ Erreur lors de la création du commentaire: {str(e)}")
        import traceback
        print(f"Stack trace: {traceback.format_exc()}")

        return jsonify({"error": f"Erreur lors de la création du commentaire: {str(e)}"}), 500 
