from flask import request, jsonify
from datetime import datetime
from bson import ObjectId
from config.database import get_db
from . import resources_bp
from utils.auth import get_user_id_from_token

@resources_bp.route('/update/<resource_id>', methods=['PUT'])
def update_resource(resource_id):
    """
    Route pour mettre à jour une ressource existante
    Seuls le propriétaire de la ressource ou un modérateur peuvent la modifier
    """
    print(f"🔄 Début de la route update_resource pour l'ID: {resource_id}")

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

        # Récupérer les données de mise à jour
        data = request.get_json()
        if not data:
            print("❌ Aucune donnée de mise à jour fournie")
            return jsonify({"error": "Aucune donnée de mise à jour fournie"}), 400

        # Préparer les champs à mettre à jour
        update_fields = {}
        if "title" in data:
            update_fields["titre"] = data["title"]
        if "content" in data:
            update_fields["contenu"] = data["content"]
        if "categories" in data:
            # Vérifier si la catégorie existe
            categories = db.categories.find_one({"_id": ObjectId(data["categories"])})
            if not categories:
                print(f"❌ Catégorie non trouvée pour l'ID: {data['categories']}")
                return jsonify({"error": "Catégorie non trouvée"}), 404
            update_fields["id_categorie"] = ObjectId(data["categories"])

        if not update_fields:
            print("❌ Aucun champ valide à mettre à jour")
            return jsonify({"error": "Aucun champ valide à mettre à jour"}), 400

        # Ajouter la date de modification
        update_fields["date_modification"] = datetime.utcnow()

        # Mettre à jour la ressource
        result = db.ressource.update_one(
            {"_id": ObjectId(resource_id)},
            {"$set": update_fields}
        )

        if result.modified_count == 0:
            print("❌ Aucune modification effectuée")
            return jsonify({"error": "Aucune modification effectuée"}), 400

        # Récupérer la ressource mise à jour
        updated_resource = db.ressource.find_one({"_id": ObjectId(resource_id)})

        # Sanitize la réponse
        def sanitize(doc):
            for key, value in doc.items():
                if isinstance(value, ObjectId):
                    doc[key] = str(value)
                elif isinstance(value, datetime):
                    doc[key] = value.isoformat()
            return doc

        sanitized_resource = sanitize(updated_resource)
        print(f"✅ Ressource mise à jour avec succès: {sanitized_resource['_id']}")
        return jsonify(sanitized_resource), 200

    except Exception as e:
        print(f"❌ Erreur lors de la mise à jour de la ressource: {str(e)}")
        import traceback
        print(f"Stack trace: {traceback.format_exc()}")
        return jsonify({"error": f"Erreur lors de la mise à jour de la ressource: {str(e)}"}), 500 