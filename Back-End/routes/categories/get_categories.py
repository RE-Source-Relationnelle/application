from flask import jsonify
from config.database import get_db
from bson import json_util
import json
from . import categories_bp
from flask_cors import cross_origin

@categories_bp.route('/all_categories', methods=['GET'])
@cross_origin(supports_credentials=True, origins=["http://localhost:3000"])
def get_categories():
    """
    Récupère toutes les catégories de ressources
    """
    print(" Début de la route get_categories")
    
    db = get_db()
    if db is None:
        print(" Erreur: Base de données non connectée")
        return jsonify({"error": "Erreur de connexion à la base de données"}), 500
        
    try:
        categories = list(db.categories.find())
        print(f" Nombre de catégories trouvées dans la base de données: {len(categories)}")
        
        # Convertir ObjectId en string pour la sérialisation JSON
        categories_json = json.loads(json_util.dumps(categories))
        
        # Transformer les données pour qu'elles correspondent au format attendu par le frontend
        transformed_categories = []
        for category in categories_json:
            transformed_category = {
                "_id": category["_id"]["$oid"],
                "nom": category.get("nom_categorie", ""),
                "description": category.get("description_categorie", "")
            }
            transformed_categories.append(transformed_category)
        
        print(f" Catégories récupérées et transformées : {len(transformed_categories)}")
        print(f" Première catégorie (exemple) : {transformed_categories[0] if transformed_categories else 'Aucune catégorie'}")
        
        return jsonify(transformed_categories), 200
    except Exception as e:
        print(f" Erreur lors de la récupération des catégories: {str(e)}")
        import traceback
        print(f" Stack trace: {traceback.format_exc()}")
        return jsonify({"error": f"Erreur lors de la récupération des catégories: {str(e)}"}), 500