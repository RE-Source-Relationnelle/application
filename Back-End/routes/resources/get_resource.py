from flask import jsonify
from bson import ObjectId
from config.database import get_db
from . import resources_bp
from datetime import datetime


@resources_bp.route('/ressource=<id>', methods=['GET'])
def get_resource(id):
    """
    Route pour récupérer une ressource par son ID
    """
    print(f"🔄 Début de la route get_resource pour l'ID: {id}")

    db = get_db()
    if db is None:
        print("❌ Erreur: Base de données non connectée")
        return jsonify({"error": "Erreur de connexion à la base de données"}), 500

    try:
        # Récupérer la ressource
        resource = db.ressource.find_one({"_id": ObjectId(id)})

        if not resource:
            print(f"❌ Ressource non trouvée pour l'ID: {id}")
            return jsonify({"error": "Ressource non trouvée"}), 404

        # Fonction pour convertir les ObjectId et datetime
        def sanitize(document):
            for key, value in document.items():
                if isinstance(value, ObjectId):
                    document[key] = str(value)
                elif isinstance(value, datetime):
                    document[key] = value.isoformat()
            return document

        sanitized_resource = sanitize(resource)

        print(f"✅ Ressource trouvée: {sanitized_resource.get('titre', '[sans titre]')}")
        return jsonify(sanitized_resource), 200

    except Exception as e:
        print(f"❌ Erreur lors de la récupération de la ressource: {str(e)}")
        import traceback
        print(f"Stack trace: {traceback.format_exc()}")
        return jsonify({"error": f"Erreur lors de la récupération de la ressource: {str(e)}"}), 500
