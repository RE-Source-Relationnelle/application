from flask import request, jsonify
from datetime import datetime
from bson import ObjectId
from config.database import get_db
from . import resources_bp
from utils.auth import get_user_id_from_token
from flask_cors import cross_origin

@resources_bp.route('/add_to_history/<resource_id>', methods=['POST'])
@cross_origin(supports_credentials=True, origins=["http://localhost:3000"])
def add_to_history(resource_id):
    """
    Route pour ajouter une ressource à l'historique de l'utilisateur
    """
    print(f"🔄 Début de la route add_to_history pour l'ID: {resource_id}")

    # Vérification du token
    token_cookie = request.cookies.get('access_token')
    if not token_cookie:
        print("❌ Token manquant ou mal formé")
        return jsonify({"error": "Token manquant ou invalide"}), 401

    user_id = get_user_id_from_token(token_cookie)
    if not user_id:
        return jsonify({"error": "Token invalide"}), 401

    db = get_db()
    if db is None:
        print("❌ Erreur: Base de données non connectée")
        return jsonify({"error": "Erreur de connexion à la base de données"}), 500

    try:
        # Vérifier si la ressource existe
        resource = db.ressource.find_one({"_id": ObjectId(resource_id)})
        if not resource:
            print(f"❌ Ressource non trouvée pour l'ID: {resource_id}")
            return jsonify({"error": "Ressource non trouvée"}), 404

        # Vérifier si l'entrée existe déjà dans l'historique
        existing_entry = db.historique.find_one({
            "user_id": ObjectId(user_id),
            "resource_id": ObjectId(resource_id)
        })

        if not existing_entry:
            # Ajouter la ressource à l'historique
            historique_entry = {
                "user_id": ObjectId(user_id),
                "resource_id": ObjectId(resource_id),
                "date_consultation": datetime.utcnow()
            }
            
            db.historique.insert_one(historique_entry)
            print(f"✅ Ressource {resource_id} ajoutée à l'historique de l'utilisateur {user_id}")
        else:
            print(f"ℹ️ La ressource {resource_id} est déjà dans l'historique de l'utilisateur {user_id}")

        return jsonify({"message": "Ressource ajoutée à l'historique"}), 200

    except Exception as e:
        print(f"❌ Erreur lors de l'ajout à l'historique: {str(e)}")
        import traceback
        print(f"Stack trace: {traceback.format_exc()}")
        return jsonify({"error": f"Erreur lors de l'ajout à l'historique: {str(e)}"}), 500 