from flask import request, jsonify
from datetime import datetime
from bson import ObjectId
from config.database import get_db
from . import resources_bp
from utils.auth import get_user_id_from_token

@resources_bp.route('/comments/<resource_id>', methods=['POST'])
def post_comment(resource_id):
    """
    Route pour ajouter un commentaire à une ressource
    """
    print("🔄 Début de la route post_comment")
    
    # Vérification du token
    token_cookie = request.cookies.get('access_token')
    print(f"🔑 Token reçu: {token_cookie}")
    if not token_cookie:
        print("❌ Token manquant ou mal formé")
        return jsonify({"error": "Token manquant ou invalide"}), 401

    user_id = get_user_id_from_token(token_cookie)
    print(f"👤 User ID extrait du token: {user_id}")
    if not user_id:
        print("❌ Token invalide ou expiré")
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

        # Créer le commentaire avec le format exact de MongoDB
        current_time = datetime.utcnow()
        comment = {
            "contenu": data['content'],
            "id_user": ObjectId(user_id),
            "id_ressource": ObjectId(resource_id),
            "format": "texte",
            "date_publication": {"$date": current_time.isoformat()},
            "createdAt": {"$date": current_time.isoformat()}
        }

        # Insérer dans la base de données
        result = db.commentaire.insert_one(comment)
        
        # Fonction pour convertir les ObjectId et datetime
        def sanitize(document):
            for key, value in document.items():
                if isinstance(value, ObjectId):
                    document[key] = str(value)
                elif isinstance(value, dict) and "$date" in value:
                    document[key] = value["$date"]
            return document

        # Préparer la réponse
        comment = sanitize(comment)
        comment['_id'] = str(result.inserted_id)
        
        print(f"✅ Commentaire créé avec l'ID: {comment['_id']}")
        print(f"📅 Date de publication: {comment['date_publication']}")
        return jsonify(comment), 201

    except Exception as e:
        print(f"❌ Erreur lors de la création du commentaire: {str(e)}")
        import traceback
        print(f"Stack trace: {traceback.format_exc()}")
        return jsonify({"error": f"Erreur lors de la création du commentaire: {str(e)}"}), 500 