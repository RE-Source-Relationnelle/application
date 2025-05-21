from flask import request, jsonify
from bson import ObjectId
from datetime import datetime
from . import categories_bp
from .utils import check_category_permissions
from flask_cors import cross_origin

@categories_bp.route('/create_category', methods=['POST'])
@cross_origin(supports_credentials=True, origins=["http://localhost:3000"])
def create_category():
    """
    Route pour créer une nouvelle catégorie
    Accessible uniquement aux administrateurs et super-administrateurs
    """
    print(" Début de la route create_category")

    # Vérification des permissions
    user_id, db, error_response, status_code = check_category_permissions(request.cookies.get('access_token'))
    if error_response:
        return error_response, status_code

    try:
        # Récupérer les données de la catégorie
        data = request.get_json()
        if not data or 'nom_categorie' not in data:
            print(" Données de catégorie manquantes")
            return jsonify({"error": "Le nom de la catégorie est requis"}), 400

        # Vérifier si la catégorie existe déjà
        existing_category = db.categories.find_one({"nom_categorie": data['nom_categorie']})
        if existing_category:
            print(f" La catégorie '{data['nom_categorie']}' existe déjà")
            return jsonify({"error": "Cette catégorie existe déjà"}), 400

        # Créer la nouvelle catégorie
        new_category = {
            "_id": ObjectId(),
            "nom_categorie": data['nom_categorie'],
            "description_categorie": data.get('description_categorie', ''),
            "parent_id": ObjectId(data['parent_id']) if data.get('parent_id') else None,
            "created_at": datetime.utcnow(),
            "created_by": ObjectId(user_id),
            "is_active": True
        }

        # Insérer la catégorie
        result = db.categories.insert_one(new_category)

        # Sanitize la réponse
        new_category['_id'] = str(new_category['_id'])
        new_category['created_by'] = str(new_category['created_by'])
        if new_category['parent_id']:
            new_category['parent_id'] = str(new_category['parent_id'])
        new_category['created_at'] = new_category['created_at'].isoformat()

        print(f" Catégorie créée avec succès: {new_category['nom_categorie']}")
        return jsonify(new_category), 201

    except Exception as e:
        print(f" Erreur lors de la création de la catégorie: {str(e)}")
        import traceback
        print(f"Stack trace: {traceback.format_exc()}")
        return jsonify({"error": f"Erreur lors de la création de la catégorie: {str(e)}"}), 500 