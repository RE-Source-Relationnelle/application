from flask import jsonify
from config.database import get_db
from . import resources_bp

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
        resources = list(db.resources.find())
        
        # Convertir les ObjectId en string
        for resource in resources:
            resource['_id'] = str(resource['_id'])
            if 'user_id' in resource:
                resource['user_id'] = str(resource['user_id'])
        
        print(f"✅ {len(resources)} ressources trouvées")
        return jsonify(resources), 200

    except Exception as e:
        print(f"❌ Erreur lors de la récupération des ressources: {str(e)}")
        import traceback
        print(f"Stack trace: {traceback.format_exc()}")
        return jsonify({"error": f"Erreur lors de la récupération des ressources: {str(e)}"}), 500 