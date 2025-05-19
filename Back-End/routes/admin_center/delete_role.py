from flask import request, jsonify
from bson import ObjectId
from . import admin_bp
from .utils import check_admin_permissions

@admin_bp.route('/delete_role/<role_id>', methods=['DELETE'])
def delete_role(role_id):
    """
    Route pour supprimer un rôle
    Accessible uniquement aux administrateurs et super-administrateurs
    """
    print(f"🔄 Début de la route delete_role pour l'ID: {role_id}")

    # Vérification des permissions
    user_id, db, error_response, status_code = check_admin_permissions(request.headers.get('token'))
    if error_response:
        return error_response, status_code

    try:
        # Vérifier si le rôle existe
        role = db.role.find_one({"_id": ObjectId(role_id)})
        if not role:
            print(f"❌ Rôle non trouvé pour l'ID: {role_id}")
            return jsonify({"error": "Rôle non trouvé"}), 404

        # Vérifier si le rôle est utilisé par des utilisateurs
        users_with_role = db.users.count_documents({"role_id": ObjectId(role_id)})
        if users_with_role > 0:
            print(f"❌ Le rôle est utilisé par {users_with_role} utilisateurs")
            return jsonify({
                "error": "Impossible de supprimer ce rôle car il est utilisé par des utilisateurs",
                "users_count": users_with_role
            }), 400

        # Vérifier si c'est un rôle système (administrateur ou super-administrateur)
        if role.get("nom_role") in ["administrateur", "super-administrateur"]:
            print("❌ Tentative de suppression d'un rôle système")
            return jsonify({"error": "Impossible de supprimer un rôle système"}), 400

        # Supprimer le rôle
        result = db.role.delete_one({"_id": ObjectId(role_id)})
        
        if result.deleted_count == 0:
            print("❌ Erreur lors de la suppression du rôle")
            return jsonify({"error": "Erreur lors de la suppression du rôle"}), 500

        print(f"✅ Rôle supprimé avec succès: {role.get('nom_role')}")
        return jsonify({
            "message": "Rôle supprimé avec succès",
            "role_name": role.get("nom_role")
        }), 200

    except Exception as e:
        print(f"❌ Erreur lors de la suppression du rôle: {str(e)}")
        import traceback
        print(f"Stack trace: {traceback.format_exc()}")
        return jsonify({"error": f"Erreur lors de la suppression du rôle: {str(e)}"}), 500 