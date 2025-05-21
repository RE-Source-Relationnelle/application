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
    db = get_db()
    categories = list(db.categories.find())
    
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
    
    print(f" Catégories récupérées : {len(transformed_categories)}")
    
    return jsonify(transformed_categories), 200