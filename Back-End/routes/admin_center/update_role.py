from flask import request, jsonify
from bson import ObjectId
from datetime import datetime
from . import admin_bp
from .utils import check_admin_permissions

@admin_bp.route('/update_role/<role_id>', methods=['PUT'])
def update_role(role_id):
    """
    Route pour mettre à jour un rôle existant
    Accessible uniquement aux administrateurs et super-administrateurs
    """
    print(f"🔄 Début de la route update_role pour l'ID: {role_id}")

    # Vérification des permissions
    user_id, db, error_response, status_code = check_admin_permissions(request.cookies.get('token'))
    if error_response:
        return error_response, status_code

    try:
        # Vérifier si le rôle existe
        role = db.role.find_one({"_id": ObjectId(role_id)})
        if not role:
            print(f"❌ Rôle non trouvé pour l'ID: {role_id}")
            return jsonify({"error": "Rôle non trouvé"}), 404

        # Récupérer les données de mise à jour
        data = request.get_json()
        if not data:
            print("❌ Aucune donnée de mise à jour fournie")
            return jsonify({"error": "Aucune donnée de mise à jour fournie"}), 400

        # Vérifier si le nouveau nom de rôle n'existe pas déjà
        if 'nom_role' in data and data['nom_role'] != role['nom_role']:
            existing_role = db.role.find_one({"nom_role": data['nom_role']})
            if existing_role:
                print(f"❌ Le rôle '{data['nom_role']}' existe déjà")
                return jsonify({"error": "Ce nom de rôle est déjà utilisé"}), 400

        # Préparer les champs à mettre à jour
        update_fields = {}
        if 'nom_role' in data:
            update_fields['nom_role'] = data['nom_role']
        if 'description' in data:
            update_fields['description'] = data['description']
        if 'permissions' in data:
            update_fields['permissions'] = data['permissions']

        if not update_fields:
            print("❌ Aucun champ valide à mettre à jour")
            return jsonify({"error": "Aucun champ valide à mettre à jour"}), 400

        # Ajouter les métadonnées de mise à jour
        update_fields['updated_at'] = datetime.utcnow()
        update_fields['updated_by'] = ObjectId(user_id)

        # Mettre à jour le rôle
        result = db.role.update_one(
            {"_id": ObjectId(role_id)},
            {"$set": update_fields}
        )

        if result.modified_count == 0:
            print("❌ Aucune modification effectuée")
            return jsonify({"error": "Aucune modification effectuée"}), 400

        # Récupérer le rôle mis à jour
        updated_role = db.role.find_one({"_id": ObjectId(role_id)})
        
        # Sanitize la réponse
        def sanitize(doc):
            for key, value in doc.items():
                if isinstance(value, ObjectId):
                    doc[key] = str(value)
                elif isinstance(value, datetime):
                    doc[key] = value.isoformat()
            return doc

        sanitized_role = sanitize(updated_role)
        print(f"✅ Rôle mis à jour avec succès: {sanitized_role['nom_role']}")
        return jsonify(sanitized_role), 200

    except Exception as e:
        print(f"❌ Erreur lors de la mise à jour du rôle: {str(e)}")
        import traceback
        print(f"Stack trace: {traceback.format_exc()}")
        return jsonify({"error": f"Erreur lors de la mise à jour du rôle: {str(e)}"}), 500 