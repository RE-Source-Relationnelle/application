from flask import request, jsonify
from bson import ObjectId
from datetime import datetime
from . import admin_bp
from .utils import check_admin_permissions

@admin_bp.route('/update_user/<user_id>', methods=['PUT'])
def update_user(user_id):
    """
    Route pour mettre à jour un utilisateur
    Accessible uniquement aux administrateurs et super-administrateurs
    """
    print(f"🔄 Début de la route update_user pour l'ID: {user_id}")

    # Vérification des permissions
    admin_id, db, error_response, status_code = check_admin_permissions(request.cookies.get('token'))
    if error_response:
        return error_response, status_code

    try:
        # Vérifier si l'utilisateur existe
        user = db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            print(f"❌ Utilisateur non trouvé pour l'ID: {user_id}")
            return jsonify({"error": "Utilisateur non trouvé"}), 404

        # Récupérer les données de mise à jour
        data = request.get_json()
        if not data:
            print("❌ Aucune donnée de mise à jour fournie")
            return jsonify({"error": "Aucune donnée de mise à jour fournie"}), 400
        print(data['role_id'])
        print(data['mail'])
        print(data['is_active'])
        print(data['nom'])
        print(data['prenom'])

        # Vérifier si l'mail est déjà utilisé par un autre utilisateur
        if 'mail' in data and data['mail'] != user.get('mail'):
            existing_user = db.users.find_one({"mail": data['mail']})
            if existing_user:
                print(f"❌ L'mail '{data['mail']}' est déjà utilisé")
                return jsonify({"error": "Cet mail est déjà utilisé"}), 400

        # Vérifier si le rôle existe si on le modifie
        if 'role_id' in data:
            role = db.role.find_one({"_id": ObjectId(data['role_id'])})
            
            if not role:
                print(f"❌ Rôle non trouvé pour l'ID: {data['role_id']}")
                return jsonify({"error": "Rôle non trouvé"}), 404

            # Vérifier si on essaie de modifier un super-admin
            if user.get('role_id'):
                current_role = db.role.find_one({"_id": user['role_id']})
                if current_role and current_role.get('nom_role') == 'super-administrateur':
                    # Seul un super-admin peut modifier un autre super-admin
                    admin_role = db.role.find_one({"_id": db.users.find_one({"_id": ObjectId(admin_id)})['role_id']})
                    if admin_role.get('nom_role') != 'super-administrateur':
                        print("❌ Tentative de modification d'un super-administrateur par un non super-admin")
                        return jsonify({"error": "Vous n'avez pas les permissions pour modifier un super-administrateur"}), 403

        # Préparer les champs à mettre à jour
        update_fields = {}
        allowed_fields = ['nom', 'prenom', 'mail', 'role_id', 'is_active']
        for field in allowed_fields:
            if field in data:
                update_fields[field] = data[field]

        if not update_fields:
            print("❌ Aucun champ valide à mettre à jour")
            return jsonify({"error": "Aucun champ valide à mettre à jour"}), 400

        # Ajouter les métadonnées de mise à jour
        update_fields['updated_at'] = datetime.utcnow()
        update_fields['updated_by'] = ObjectId(admin_id)

        # Mettre à jour l'utilisateur
        result = db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_fields}
        )

        if result.modified_count == 0:
            print("❌ Aucune modification effectuée")
            return jsonify({"error": "Aucune modification effectuée"}), 400

        # Récupérer l'utilisateur mis à jour avec son rôle
        updated_users = list(db.users.aggregate([
            {"$match": {"_id": ObjectId(user_id)}},
            {
                "$lookup": {
                    "from": "role",
                    "localField": "role_id",
                    "foreignField": "_id",
                    "as": "role_info"
                }
            },
            {"$unwind": "$role_info"},
            {"$project": {"password": 0, "role_info._id": 0}}
        ]))

        if not updated_users:
            print("❌ Erreur lors de la récupération de l'utilisateur mis à jour")
            return jsonify({"error": "Erreur lors de la récupération de l'utilisateur mis à jour"}), 500

        updated_user = updated_users[0]

        # Sanitize la réponse
        def sanitize(doc):
            for key, value in doc.items():
                if isinstance(value, ObjectId):
                    doc[key] = str(value)
                elif isinstance(value, datetime):
                    doc[key] = value.isoformat()
            return doc

        sanitized_user = sanitize(updated_user)
        print(f"✅ Utilisateur mis à jour avec succès: {sanitized_user.get('mail')}")
        return jsonify(sanitized_user), 200

    except Exception as e:
        print(f"❌ Erreur lors de la mise à jour de l'utilisateur: {str(e)}")
        import traceback
        print(f"Stack trace: {traceback.format_exc()}")
        return jsonify({"error": f"Erreur lors de la mise à jour de l'utilisateur: {str(e)}"}), 500 