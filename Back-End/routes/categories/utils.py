from flask import jsonify
from bson import ObjectId
from config.database import get_db
from utils.auth import get_user_id_from_token

def check_category_permissions(token_header):
    """
    Vérifie si l'utilisateur a les permissions pour gérer les catégories
    Retourne (user_id, db) si les permissions sont valides, sinon retourne (None, None)
    """
    if not token_header:
        print("❌ Token manquant ou mal formé")
        return None, None, jsonify({"error": "Token manquant ou invalide"}), 401

    user_id = get_user_id_from_token(token_header)
    if not user_id:
        return None, None, jsonify({"error": "Token invalide"}), 401

    db = get_db()
    if db is None:
        print("❌ Erreur: Base de données non connectée")
        return None, None, jsonify({"error": "Erreur de connexion à la base de données"}), 500

    try:
        # Vérifier si l'utilisateur existe
        user = db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            print("❌ Utilisateur non trouvé")
            return None, None, jsonify({"error": "Utilisateur non trouvé"}), 404

        # Vérifier le rôle de l'utilisateur
        role = db.role.find_one({"_id": user.get("role_id")})
        if not role:
            print("❌ Rôle non trouvé pour l'utilisateur")
            return None, None, jsonify({"error": "Rôle non trouvé"}), 404

        # Vérifier si l'utilisateur a les permissions nécessaires
        user_role = role.get("nom_role")
        if user_role not in ["administrateur", "super-administrateur"]:
            print(f"❌ Accès refusé : l'utilisateur a le rôle '{user_role}'")
            return None, None, jsonify({"error": "Accès non autorisé"}), 403

        return user_id, db, None, None

    except Exception as e:
        print(f"❌ Erreur lors de la vérification des permissions: {str(e)}")
        import traceback
        print(f"Stack trace: {traceback.format_exc()}")
        return None, None, jsonify({"error": f"Erreur lors de la vérification des permissions: {str(e)}"}), 500 