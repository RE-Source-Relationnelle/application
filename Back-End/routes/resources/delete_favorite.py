from flask import request, jsonify
from bson import ObjectId
from config.database import get_db
from . import resources_bp
from utils.auth import get_user_id_from_token

@resources_bp.route('/favorite/<resource_id>', methods=['DELETE'])
def remove_favorite(resource_id):
    """
    Route pour supprimer une ressource des favoris
    """
    print("🔄 Début de la route remove_favorite")
    
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
        # Vérifier si le favori existe
        existing_favorite = db.favoris.find_one({
            "user_id": user_id,
            "resource_id": ObjectId(resource_id)
        })
        
        if not existing_favorite:
            print(f"⚠️ Aucun favori trouvé pour l'utilisateur {user_id} et la ressource {resource_id}")
            return jsonify({"error": "Cette ressource n'est pas dans vos favoris"}), 404

        # Supprimer le favori
        result = db.favoris.delete_one({
            "user_id": user_id,
            "resource_id": ObjectId(resource_id)
        })
        
        if result.deleted_count == 0:
            print(f"❌ Erreur lors de la suppression du favori")
            return jsonify({"error": "Erreur lors de la suppression du favori"}), 500

        print(f"✅ Favori supprimé avec succès pour l'utilisateur {user_id} et la ressource {resource_id}")
        return jsonify({"message": "Favori supprimé avec succès"}), 200

    except Exception as e:
        print(f"❌ Erreur lors de la suppression du favori: {str(e)}")
        import traceback
        print(f"Stack trace: {traceback.format_exc()}")
        return jsonify({"error": f"Erreur lors de la suppression du favori: {str(e)}"}), 500 