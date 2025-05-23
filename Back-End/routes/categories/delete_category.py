from flask import request, jsonify
from bson import ObjectId
from datetime import datetime
from . import categories_bp
from .utils import check_category_permissions

@categories_bp.route('/delete_category/<category_id>', methods=['DELETE'])
def delete_category(category_id):
    """
    Route pour supprimer une catégorie
    Accessible uniquement aux administrateurs et super-administrateurs
    """
    print(f"🔄 Début de la route delete_category pour l'ID: {category_id}")

    # Vérification des permissions
    user_id, db, error_response, status_code = check_category_permissions(request.cookies.get('access_token'))
    if error_response:
        return error_response, status_code

    try:
        # Vérifier si la catégorie existe
        category = db.categories.find_one({"_id": ObjectId(category_id)})
        if not category:
            print(f"❌ Catégorie non trouvée pour l'ID: {category_id}")
            return jsonify({"error": "Catégorie non trouvée"}), 404

        # Vérifier si la catégorie a des sous-catégories
        subcategories_count = db.categories.count_documents({"parent_id": ObjectId(category_id)})
        if subcategories_count > 0:
            print(f"❌ La catégorie a {subcategories_count} sous-catégories")
            return jsonify({
                "error": "Impossible de supprimer cette catégorie car elle a des sous-catégories",
                "subcategories_count": subcategories_count
            }), 400

        # Vérifier si la catégorie est utilisée par des ressources
        resources_count = db.resources.count_documents({"category_id": ObjectId(category_id)})
        if resources_count > 0:
            print(f"❌ La catégorie est utilisée par {resources_count} ressources")
            return jsonify({
                "error": "Impossible de supprimer cette catégorie car elle est utilisée par des ressources",
                "resources_count": resources_count
            }), 400

        # Supprimer la catégorie
        result = db.categories.delete_one({"_id": ObjectId(category_id)})
        
        if result.deleted_count == 0:
            print("❌ Erreur lors de la suppression de la catégorie")
            return jsonify({"error": "Erreur lors de la suppression de la catégorie"}), 500

        print(f"✅ Catégorie supprimée avec succès: {category.get('nom_categorie')}")
        return jsonify({
            "message": "Catégorie supprimée avec succès",
            "category_name": category.get("nom_categorie")
        }), 200

    except Exception as e:
        print(f"❌ Erreur lors de la suppression de la catégorie: {str(e)}")
        import traceback
        print(f"Stack trace: {traceback.format_exc()}")
        return jsonify({"error": f"Erreur lors de la suppression de la catégorie: {str(e)}"}), 500 