from flask import request, jsonify
from bson import ObjectId
from datetime import datetime
from . import admin_bp
from .utils import check_admin_permissions

@admin_bp.route('/delete_user/<user_id>', methods=['DELETE'])
def delete_user(user_id):
    """
    Route pour supprimer un utilisateur
    Accessible uniquement aux administrateurs et super-administrateurs
    """
    print(f"🔄 Début de la route delete_user pour l'ID: {user_id}")

    # Vérification des permissions
    admin_id, db, error_response, status_code = check_admin_permissions(request.headers.get('token'))
    if error_response:
        return error_response, status_code

    try:
        # Vérifier si l'utilisateur existe
        user = db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            print(f"❌ Utilisateur non trouvé pour l'ID: {user_id}")
            return jsonify({"error": "Utilisateur non trouvé"}), 404

        # Vérifier si on essaie de supprimer un super-admin
        if user.get('role_id'):
            role = db.role.find_one({"_id": user['role_id']})
            if role and role.get('nom_role') == 'super-administrateur':
                # Seul un super-admin peut supprimer un autre super-admin
                admin_role = db.role.find_one({"_id": db.users.find_one({"_id": ObjectId(admin_id)})['role_id']})
                if admin_role.get('nom_role') != 'super-administrateur':
                    print("❌ Tentative de suppression d'un super-administrateur par un non super-admin")
                    return jsonify({"error": "Vous n'avez pas les permissions pour supprimer un super-administrateur"}), 403

        # Vérifier si l'utilisateur a des ressources associées
        resources_count = db.resources.count_documents({"created_by": ObjectId(user_id)})
        if resources_count > 0:
            print(f"❌ L'utilisateur a {resources_count} ressources associées")
            return jsonify({
                "error": "Impossible de supprimer cet utilisateur car il a des ressources associées",
                "resources_count": resources_count
            }), 400

        # Vérifier si l'utilisateur a des commentaires associés
        comments_count = db.comments.count_documents({"created_by": ObjectId(user_id)})
        if comments_count > 0:
            print(f"❌ L'utilisateur a {comments_count} commentaires associés")
            return jsonify({
                "error": "Impossible de supprimer cet utilisateur car il a des commentaires associés",
                "comments_count": comments_count
            }), 400

        # Supprimer l'utilisateur
        result = db.users.delete_one({"_id": ObjectId(user_id)})
        
        if result.deleted_count == 0:
            print("❌ Erreur lors de la suppression de l'utilisateur")
            return jsonify({"error": "Erreur lors de la suppression de l'utilisateur"}), 500

        print(f"✅ Utilisateur supprimé avec succès: {user.get('email')}")
        return jsonify({
            "message": "Utilisateur supprimé avec succès",
            "email": user.get('email')
        }), 200

    except Exception as e:
        print(f"❌ Erreur lors de la suppression de l'utilisateur: {str(e)}")
        import traceback
        print(f"Stack trace: {traceback.format_exc()}")
        return jsonify({"error": f"Erreur lors de la suppression de l'utilisateur: {str(e)}"}), 500 