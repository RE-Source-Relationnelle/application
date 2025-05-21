from flask import jsonify, request
from config.database import get_db
from bson import json_util, ObjectId
import json
from . import resources_bp
from flask_cors import cross_origin

@resources_bp.route('/categories', methods=['GET'])
@cross_origin(supports_credentials=True, origins=["http://localhost:3000"])
def get_categories_for_resources():
    """
    Récupère toutes les catégories avec le nombre de ressources associées
    """
    db = get_db()
    
    # Récupérer toutes les catégories
    categories = list(db.category.find())
    categories_json = json.loads(json_util.dumps(categories))
    
    # Transformer les données pour qu'elles correspondent au format attendu par le frontend
    transformed_categories = []
    for category in categories_json:
        category_id = category["_id"]["$oid"]
        
        # Compter le nombre de ressources pour cette catégorie
        resource_count = db.ressource.count_documents({"id_categorie": ObjectId(category_id)})
        
        transformed_category = {
            "_id": category_id,
            "nom": category.get("nom_categorie", ""),
            "description": category.get("description_categorie", ""),
            "resourceCount": resource_count
        }
        transformed_categories.append(transformed_category)
    
    print(f" Catégories avec nombre de ressources récupérées : {len(transformed_categories)}")
    
    return jsonify(transformed_categories), 200

@resources_bp.route('/<resource_id>/category', methods=['GET'])
def get_category_for_resource(resource_id):
    """
    Récupère la catégorie associée à une ressource spécifique
    """
    db = get_db()
    
    try:
        # Vérifier que l'ID de ressource est valide
        if not ObjectId.is_valid(resource_id):
            return jsonify({"error": "ID de ressource invalide"}), 400
        
        # Récupérer la ressource
        resource = db.ressource.find_one({"_id": ObjectId(resource_id)})
        if not resource:
            return jsonify({"error": "Ressource non trouvée"}), 404
        
        # Si la ressource n'a pas de catégorie
        if not resource.get("id_categorie"):
            return jsonify(None), 200
        
        # Récupérer la catégorie
        category = db.category.find_one({"_id": resource["id_categorie"]})
        if not category:
            return jsonify(None), 200
        
        # Convertir en JSON
        category_json = json.loads(json_util.dumps(category))
        
        # Transformer les données
        transformed_category = {
            "_id": category_json["_id"]["$oid"],
            "nom": category_json.get("nom_categorie", ""),
            "description": category_json.get("description_categorie", "")
        }
        
        return jsonify(transformed_category), 200
        
    except Exception as e:
        print(f" Erreur lors de la récupération de la catégorie: {str(e)}")
        return jsonify({"error": str(e)}), 500
