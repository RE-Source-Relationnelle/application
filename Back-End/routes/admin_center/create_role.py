from flask import request, jsonify
from bson import ObjectId
from datetime import datetime
from . import admin_bp
from .utils import check_admin_permissions

@admin_bp.route('/create_role', methods=['POST'])
def create_role():
    """
    Route pour créer un nouveau rôle
    Accessible uniquement aux administrateurs et super-administrateurs
    """
    print("🔄 Début de la route create_role")

    # Vérification des permissions
    user_id, db, error_response, status_code = check_admin_permissions(request.headers.get('token'))
    if error_response:
        return error_response, status_code

    try:
        # Récupérer les données du rôle
        data = request.get_json()
        if not data or 'nom_role' not in data:
            print("❌ Données de rôle manquantes")
            return jsonify({"error": "Le nom du rôle est requis"}), 400

        # Vérifier si le rôle existe déjà
        existing_role = db.role.find_one({"nom_role": data['nom_role']})
        if existing_role:
            print(f"❌ Le rôle '{data['nom_role']}' existe déjà")
            return jsonify({"error": "Ce rôle existe déjà"}), 400

        # Créer le nouveau rôle
        new_role = {
            "_id": ObjectId(),
            "nom_role": data['nom_role'],
            "description": data.get('description', ''),
            "permissions": data.get('permissions', []),
            "created_at": datetime.utcnow(),
            "created_by": ObjectId(user_id)
        }

        # Insérer le rôle
        result = db.role.insert_one(new_role)
        new_role['_id'] = str(new_role['_id'])
        new_role['created_by'] = str(new_role['created_by'])
        new_role['created_at'] = new_role['created_at'].isoformat()

        print(f"✅ Rôle créé avec succès: {new_role['nom_role']}")
        return jsonify(new_role), 201

    except Exception as e:
        print(f"❌ Erreur lors de la création du rôle: {str(e)}")
        import traceback
        print(f"Stack trace: {traceback.format_exc()}")
        return jsonify({"error": f"Erreur lors de la création du rôle: {str(e)}"}), 500 