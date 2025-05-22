from flask import request, jsonify
from datetime import datetime
from bson import ObjectId
from config.database import get_db
from . import resources_bp
from utils.auth import get_user_id_from_token

@resources_bp.route('/comments/<resource_id>', methods=['GET'])
def get_comments(resource_id):
    """
    Route pour récupérer les commentaires d'une ressource spécifique
    """
    print("🔄 Début de la route get_comments")
    
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

        # Récupérer les commentaires de la ressource
        comments = list(db.commentaire.find({"id_ressource": ObjectId(resource_id)}).sort("date_publication", -1))
        
        # Fonction pour convertir les ObjectId et datetime
        def sanitize(document):
            for key, value in document.items():
                if isinstance(value, ObjectId):
                    document[key] = str(value)
                elif isinstance(value, datetime):
                    document[key] = value.isoformat()
            return document

        # Convertir les ObjectId et datetime en string
        comments = [sanitize(comment) for comment in comments]

        print(f"✅ {len(comments)} commentaires récupérés pour la ressource {resource_id}")
        return jsonify(comments), 200

    except Exception as e:
        print(f"❌ Erreur lors de la récupération des commentaires: {str(e)}")
        import traceback
        print(f"Stack trace: {traceback.format_exc()}")
        return jsonify({"error": f"Erreur lors de la récupération des commentaires: {str(e)}"}), 500 