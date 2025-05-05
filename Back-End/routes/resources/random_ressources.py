import random
from flask import jsonify
from bson import ObjectId
from config.database import get_db
from . import resources_bp
from datetime import datetime


@resources_bp.route('/randomressource', methods=['GET'])
def get_random_resource():
    """
    Route pour récupérer une ressource aléatoire
    """
    print("🎲 Début de la route get_random_resource")

    db = get_db()
    if db is None:
        print("❌ Erreur: Base de données non connectée")
        return jsonify({"error": "Erreur de connexion à la base de données"}), 500

    try:
        # Compter le nombre total de documents
        count = db.ressource.count_documents({})

        if count == 0:
            print("⚠️ Aucune ressource disponible")
            return jsonify({"error": "Aucune ressource disponible"}), 404

        # Prendre un index aléatoire
        random_index = random.randint(0, count - 1)

        # Aller chercher la ressource avec skip
        resource = db.ressource.find().skip(random_index).limit(1)[0]

        # Sanitize les données
        def sanitize(document):
            for key, value in document.items():
                if isinstance(value, ObjectId):
                    document[key] = str(value)
                elif isinstance(value, datetime):
                    document[key] = value.isoformat()
            return document

        sanitized_resource = sanitize(resource)

        print(f"✅ Ressource aléatoire trouvée: {sanitized_resource.get('titre', '[sans titre]')}")
        return jsonify(sanitized_resource), 200

    except Exception as e:
        print(f"❌ Erreur lors de la récupération de la ressource aléatoire: {str(e)}")
        import traceback
        print(f"Stack trace: {traceback.format_exc()}")
        return jsonify({"error": f"Erreur lors de la récupération de la ressource aléatoire: {str(e)}"}), 500
