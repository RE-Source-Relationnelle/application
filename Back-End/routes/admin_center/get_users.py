from flask import request, jsonify
from bson import ObjectId
from datetime import datetime
from . import admin_bp
from .utils import check_admin_permissions

@admin_bp.route('/get_users', methods=['GET'])
def get_users():
    """
    Route pour lister tous les utilisateurs avec leurs rôles
    Accessible uniquement aux administrateurs et super-administrateurs
    """
    print("🔄 Début de la route get_users")

    # Vérification des permissions
    user_id, db, error_response, status_code = check_admin_permissions(request.headers.get('token'))
    if error_response:
        return error_response, status_code

    try:
        # Récupérer tous les utilisateurs avec leurs rôles
        pipeline = [
            {
                "$lookup": {
                    "from": "role",
                    "localField": "role_id",
                    "foreignField": "_id",
                    "as": "role_info"
                }
            },
            {
                "$unwind": {
                    "path": "$role_info",
                    "preserveNullAndEmptyArrays": True
                }
            },
            {
                "$project": {
                    "password": 0,  # Exclure le mot de passe
                    "role_info._id": 0  # Exclure l'ID du rôle car déjà dans role_id
                }
            }
        ]

        users = list(db.users.aggregate(pipeline))

        # Sanitize la réponse
        def sanitize(doc):
            for key, value in doc.items():
                if isinstance(value, ObjectId):
                    doc[key] = str(value)
                elif isinstance(value, datetime):
                    doc[key] = value.isoformat()
            return doc

        # Nettoyage des documents
        sanitized_users = [sanitize(user) for user in users]

        print(f"✅ {len(sanitized_users)} utilisateurs récupérés avec succès")
        return jsonify(sanitized_users), 200

    except Exception as e:
        print(f"❌ Erreur lors de la récupération des utilisateurs: {str(e)}")
        import traceback
        print(f"Stack trace: {traceback.format_exc()}")
        return jsonify({"error": f"Erreur lors de la récupération des utilisateurs: {str(e)}"}), 500 