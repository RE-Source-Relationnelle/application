from flask import jsonify
from config.database import get_db
from . import resources_bp
from bson import ObjectId
from datetime import datetime

@resources_bp.route('/categories', methods=['GET'])
def get_categories():
    """
    Route pour récupérer toutes les catégories disponibles
    """
    print("🔄 Début de la route get_categories")

    db = get_db()
    if db is None:
        print("❌ Erreur: Base de données non connectée")
        return jsonify({"error": "Erreur de connexion à la base de données"}), 500

    try:
        # Récupérer toutes les catégories
        categories = list(db.category.find())

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
        sanitized_categories = [sanitize(category) for category in categories]

        # Si aucune catégorie n'est trouvée, retourner un tableau vide
        if not sanitized_categories:
            print("ℹ️ Aucune catégorie trouvée")
            return jsonify([]), 200

        print(f"✅ {len(sanitized_categories)} catégories trouvées")
        return jsonify(sanitized_categories), 200

    except Exception as e:
        print(f"❌ Erreur lors de la récupération des catégories: {str(e)}")
        import traceback
        print(f"Stack trace: {traceback.format_exc()}")
        return jsonify({"error": f"Erreur lors de la récupération des catégories: {str(e)}"}), 500 