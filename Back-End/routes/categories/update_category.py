from flask import request, jsonify
from bson import ObjectId
from datetime import datetime
from . import categories_bp
from .utils import check_category_permissions

@categories_bp.route('/update_category/<category_id>', methods=['PUT'])
def update_category(category_id):
    """
    Route pour mettre à jour une catégorie existante
    Accessible uniquement aux administrateurs et super-administrateurs
    """
    print(f"🔄 Début de la route update_category pour l'ID: {category_id}")

    # Vérification des permissions
    user_id, db, error_response, status_code = check_category_permissions(request.cookies.get('token'))
    if error_response:
        return error_response, status_code

    try:
        # Vérifier si la catégorie existe
        category = db.categories.find_one({"_id": ObjectId(category_id)})
        if not category:
            print(f"❌ Catégorie non trouvée pour l'ID: {category_id}")
            return jsonify({"error": "Catégorie non trouvée"}), 404

        # Récupérer les données de mise à jour
        data = request.get_json()
        if not data:
            print("❌ Aucune donnée de mise à jour fournie")
            return jsonify({"error": "Aucune donnée de mise à jour fournie"}), 400

        # Vérifier si le nouveau nom de catégorie n'existe pas déjà
        if 'nom_categorie' in data and data['nom_categorie'] != category['nom_categorie']:
            existing_category = db.categories.find_one({"nom_categorie": data['nom_categorie']})
            if existing_category:
                print(f"❌ La catégorie '{data['nom_categorie']}' existe déjà")
                return jsonify({"error": "Ce nom de catégorie est déjà utilisé"}), 400

        # Vérifier si la catégorie parente existe si elle est spécifiée
        if 'parent_id' in data and data['parent_id']:
            parent_category = db.categories.find_one({"_id": ObjectId(data['parent_id'])})
            if not parent_category:
                print(f"❌ Catégorie parente non trouvée pour l'ID: {data['parent_id']}")
                return jsonify({"error": "Catégorie parente non trouvée"}), 404

            # Vérifier qu'on ne crée pas de cycle (une catégorie ne peut pas être son propre parent)
            if str(parent_category['_id']) == category_id:
                print("❌ Une catégorie ne peut pas être sa propre parente")
                return jsonify({"error": "Une catégorie ne peut pas être sa propre parente"}), 400

        # Préparer les champs à mettre à jour
        update_fields = {}
        allowed_fields = ['nom_categorie', 'description', 'parent_id', 'is_active']
        for field in allowed_fields:
            if field in data:
                if field == 'parent_id' and data[field]:
                    update_fields[field] = ObjectId(data[field])
                else:
                    update_fields[field] = data[field]

        if not update_fields:
            print("❌ Aucun champ valide à mettre à jour")
            return jsonify({"error": "Aucun champ valide à mettre à jour"}), 400

        # Ajouter les métadonnées de mise à jour
        update_fields['updated_at'] = datetime.utcnow()
        update_fields['updated_by'] = ObjectId(user_id)

        # Mettre à jour la catégorie
        result = db.categories.update_one(
            {"_id": ObjectId(category_id)},
            {"$set": update_fields}
        )

        if result.modified_count == 0:
            print("❌ Aucune modification effectuée")
            return jsonify({"error": "Aucune modification effectuée"}), 400

        # Récupérer la catégorie mise à jour
        updated_category = db.categories.find_one({"_id": ObjectId(category_id)})
        
        # Sanitize la réponse
        def sanitize(doc):
            for key, value in doc.items():
                if isinstance(value, ObjectId):
                    doc[key] = str(value)
                elif isinstance(value, datetime):
                    doc[key] = value.isoformat()
            return doc

        sanitized_category = sanitize(updated_category)
        print(f"✅ Catégorie mise à jour avec succès: {sanitized_category['nom_categorie']}")
        return jsonify(sanitized_category), 200

    except Exception as e:
        print(f"❌ Erreur lors de la mise à jour de la catégorie: {str(e)}")
        import traceback
        print(f"Stack trace: {traceback.format_exc()}")
        return jsonify({"error": f"Erreur lors de la mise à jour de la catégorie: {str(e)}"}), 500 