from flask import jsonify
from bson import ObjectId
from config.database import get_db
from . import users_bp
from flask_cors import cross_origin


@users_bp.route('/public_info/<user_id>', methods=['GET'])
@cross_origin(supports_credentials=True, origins=["http://localhost:3000"])
def get_user_public_info(user_id):
    """
    Route pour récupérer les informations publiques d'un utilisateur par son ID
    Accessible à tous les utilisateurs (pas besoin d'authentification)
    """
    print(f"🔄 Début de la route get_user_public_info pour l'ID: {user_id}")

    db = get_db()
    if db is None:
        print("❌ Erreur: Base de données non connectée")
        return jsonify({"error": "Erreur de connexion à la base de données"}), 500

    try:
        # Récupérer l'utilisateur
        user = db.users.find_one({"_id": ObjectId(user_id)})

        if not user:
            print(f"❌ Utilisateur non trouvé pour l'ID: {user_id}")
            return jsonify({"error": "Utilisateur non trouvé"}), 404

        # Retourner seulement les informations publiques
        public_info = {
            "_id": str(user["_id"]),
            "nom": user.get("nom", ""),
            "prenom": user.get("prenom", "")
        }

        print(f"✅ Informations publiques récupérées pour l'utilisateur: {public_info['prenom']} {public_info['nom']}")
        return jsonify(public_info), 200

    except Exception as e:
        print(f"❌ Erreur lors de la récupération des informations de l'utilisateur: {str(e)}")
        import traceback
        print(f"Stack trace: {traceback.format_exc()}")
        return jsonify({"error": f"Erreur lors de la récupération des informations de l'utilisateur: {str(e)}"}), 500
