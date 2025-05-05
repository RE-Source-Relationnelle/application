from flask import jsonify
from config.database import get_db
from . import resources_bp
from bson import ObjectId
from datetime import datetime


@resources_bp.route('/', methods=['GET'])
def list_resources():
    """
    Route pour lister toutes les ressources
    """
    print("🔄 Début de la route list_resources")

    db = get_db()
    if db is None:
        print("❌ Erreur: Base de données non connectée")
        return jsonify({"error": "Erreur de connexion à la base de données"}), 500

    try:
        # Récupérer toutes les ressources
        resources = list(db.ressource.find())

        def sanitize(document):
            """
            Fonction pour convertir tous les ObjectId et datetime en string
            """
            for key, value in document.items():
                if isinstance(value, ObjectId):
                    document[key] = str(value)
                elif isinstance(value, datetime):
                    document[key] = value.isoformat()
            return document

        # Nettoyage des documents
        sanitized_resources = [sanitize(resource) for resource in resources]

        print(f"✅ {len(sanitized_resources)} ressources trouvées")
        return jsonify(sanitized_resources), 200

    except Exception as e:
        print(f"❌ Erreur lors de la récupération des ressources: {str(e)}")
        import traceback
        print(f"Stack trace: {traceback.format_exc()}")
        return jsonify({"error": f"Erreur lors de la récupération des ressources: {str(e)}"}), 500
