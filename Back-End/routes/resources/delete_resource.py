from flask import request, jsonify
from bson import ObjectId
from config.database import get_db
from . import resources_bp
from utils.auth import get_user_id_from_token

@resources_bp.route('/delete/<resource_id>', methods=['DELETE'])
def delete_resource(resource_id):
    """
    Route pour supprimer une ressource
    Seuls le propriétaire de la ressource ou un modérateur peuvent la supprimer
    """
    print(f"🔄 Début de la route delete_resource pour l'ID: {resource_id}")

    # Vérification du token
    token_cookie = request.cookies.get('token')
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
        # Vérifier si l'utilisateur existe
        user = db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            print("❌ Utilisateur non trouvé")
            return jsonify({"error": "Utilisateur non trouvé"}), 404

        # Vérifier si l'utilisateur est modérateur
        role = db.role.find_one({"_id": user.get("role_id")})
        is_moderator = role and role.get("nom_role") == "modérateur"

        # Récupérer la ressource
        resource = db.ressource.find_one({"_id": ObjectId(resource_id)})
        if not resource:
            print(f"❌ Ressource non trouvée pour l'ID: {resource_id}")
            return jsonify({"error": "Ressource non trouvée"}), 404

        # Vérifier les permissions
        is_owner = str(resource.get("id_publieur")) == str(user_id)
        if not (is_owner or is_moderator):
            print("❌ Accès refusé : l'utilisateur n'est ni le propriétaire ni un modérateur")
            return jsonify({"error": "Accès non autorisé"}), 403

        # Supprimer les commentaires associés
        db.commentaire.delete_many({"resource_id": ObjectId(resource_id)})
        print(f"✅ Commentaires associés supprimés pour la ressource: {resource_id}")

        # Supprimer les sous-commentaires associés
        db.sous_commentaire.delete_many({"resource_id": ObjectId(resource_id)})
        print(f"✅ Sous-commentaires associés supprimés pour la ressource: {resource_id}")

        # Supprimer les favoris associés
        db.favoris.delete_many({"resource_id": ObjectId(resource_id)})
        print(f"✅ Favoris associés supprimés pour la ressource: {resource_id}")

        # Supprimer l'historique associé
        db.historique.delete_many({"resource_id": ObjectId(resource_id)})
        print(f"✅ Historique associé supprimé pour la ressource: {resource_id}")

        # Supprimer la ressource
        result = db.ressource.delete_one({"_id": ObjectId(resource_id)})
        
        if result.deleted_count == 0:
            print("❌ Erreur lors de la suppression de la ressource")
            return jsonify({"error": "Erreur lors de la suppression de la ressource"}), 500

        print(f"✅ Ressource supprimée avec succès: {resource_id}")
        return jsonify({"message": "Ressource supprimée avec succès"}), 200

    except Exception as e:
        print(f"❌ Erreur lors de la suppression de la ressource: {str(e)}")
        import traceback
        print(f"Stack trace: {traceback.format_exc()}")
        return jsonify({"error": f"Erreur lors de la suppression de la ressource: {str(e)}"}), 500 