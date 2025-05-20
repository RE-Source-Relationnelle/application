from flask import request, jsonify
from bson import ObjectId
from config.database import get_db
from . import admin_bp
from utils.auth import get_user_id_from_token

@admin_bp.route('/roles', methods=['GET'])
def get_roles():
    """
    Route pour récupérer la collection role entière
    Accessible uniquement aux administrateurs et super-administrateurs
    """
    print("🔄 Début de la route get_roles")

    # Vérification du token
    token_header = request.headers.get('token')
    if not token_header:
        print("❌ Token manquant ou mal formé")
        return jsonify({"error": "Token manquant ou invalide"}), 401

    user_id = get_user_id_from_token(token_header)
    if not user_id:
        return jsonify({"error": "Token invalide"}), 401

    db = get_db()
    if db is None:
        print("❌ Erreur: Base de données non connectée")
        return jsonify({"error": "Erreur de connexion à la base de données"}), 500

    try:
        # Vérifier si l'utilisateur existe
        user = db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            print("❌ Utilisateur non trouvé")
            return jsonify({"error": "Utilisateur non trouvé"}), 404

        # Vérifier le rôle de l'utilisateur
        role = db.role.find_one({"_id": user.get("role_id")})
        if not role:
            print("❌ Rôle non trouvé pour l'utilisateur")
            return jsonify({"error": "Rôle non trouvé"}), 404

        # Vérifier si l'utilisateur est administrateur ou super-administrateur
        user_role = role.get("nom_role")
        if user_role not in ["administrateur", "super-administrateur"]:
            print(f"❌ Accès refusé : l'utilisateur a le rôle '{user_role}'")
            return jsonify({"error": "Accès non autorisé"}), 403

        # Récupérer tous les rôles
        roles = list(db.role.find())

        # Sanitize la réponse
        def sanitize(doc):
            for key, value in doc.items():
                if isinstance(value, ObjectId):
                    doc[key] = str(value)
            return doc

        # Nettoyage des documents
        sanitized_roles = [sanitize(role) for role in roles]

        print(f"✅ {len(sanitized_roles)} rôles récupérés avec succès")
        return jsonify(sanitized_roles), 200

    except Exception as e:
        print(f"❌ Erreur lors de la récupération des rôles: {str(e)}")
        import traceback
        print(f"Stack trace: {traceback.format_exc()}")
        return jsonify({"error": f"Erreur lors de la récupération des rôles: {str(e)}"}), 500 