from flask import request, jsonify
from datetime import datetime
from bson import ObjectId
from config.database import get_db
from . import resources_bp
from utils.auth import get_user_id_from_token

@resources_bp.route('/favorites', methods=['GET'])
def get_favorites():
    """
    Route pour récupérer tous les favoris de l'utilisateur connecté
    """
    print("🔄 Début de la route get_favorites")

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
        # Récupérer tous les favoris de l'utilisateur
        favorites = list(db.favoris.find({"user_id": ObjectId(user_id)}))

        if not favorites:
            print(f"ℹ️ Aucun favori trouvé pour l'utilisateur {user_id}")
            return jsonify([]), 200

        # Pour chaque favori, récupérer les détails de la ressource
        favorites_with_details = []
        for favorite in favorites:
            # Récupérer la ressource associée
            resource = db.ressource.find_one({"_id": favorite["resource_id"]})
            if resource:
                # Préparer les données du favori avec les détails de la ressource
                favorite_data = {
                    "favorite_id": str(favorite["_id"]),
                    "created_at": favorite["created_at"].isoformat(),
                    "resource": {
                        "id": str(resource["_id"]),
                        "titre": resource.get("titre", ""),
                        "contenu": resource.get("contenu", ""),
                        "categorie": resource.get("categorie", ""),
                        "date_publication": resource.get("date_publication", {}).get("date", ""),
                        "id_publieur": str(resource.get("id_publieur", ""))
                    }
                }
                favorites_with_details.append(favorite_data)

        print(f"✅ {len(favorites_with_details)} favoris trouvés pour l'utilisateur {user_id}")
        return jsonify(favorites_with_details), 200

    except Exception as e:
        print(f"❌ Erreur lors de la récupération des favoris: {str(e)}")
        import traceback
        print(f"Stack trace: {traceback.format_exc()}")
        return jsonify({"error": f"Erreur lors de la récupération des favoris: {str(e)}"}), 500