from flask import request, jsonify
from datetime import datetime
from bson import ObjectId
from config.database import get_db
from . import resources_bp
from utils.auth import get_user_id_from_token

@resources_bp.route('/approve/<resource_id>', methods=['POST'])
def approve_resource(resource_id):
    """
    Route pour approuver une ressource en attente
    Seuls les modérateurs peuvent approuver les ressources
    """
    print(f"🔄 Début de la route approve_resource pour l'ID: {resource_id}")

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
        # Vérifier si l'utilisateur est modérateur
        user = db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            print("❌ Utilisateur non trouvé")
            return jsonify({"error": "Utilisateur non trouvé"}), 404

        # Récupérer le rôle de l'utilisateur
        role = db.role.find_one({"_id": user.get("role_id")})
        if not role or role.get("nom_role") != "modérateur":
            print("❌ Accès refusé : l'utilisateur n'est pas modérateur")
            return jsonify({"error": "Accès non autorisé"}), 403

        # Récupérer la ressource en attente
        pending_resource = db.ressources_en_attente.find_one({"_id": ObjectId(resource_id)})
        if not pending_resource:
            print(f"❌ Ressource en attente non trouvée pour l'ID: {resource_id}")
            return jsonify({"error": "Ressource en attente non trouvée"}), 404

        # Préparer la ressource pour la collection principale
        approved_resource = {
            "titre": pending_resource["titre"],
            "contenu": pending_resource["contenu"],
            "id_categorie": pending_resource["id_categorie"],
            "id_publieur": pending_resource["id_publieur"],
            "date_publication": {
                "date": datetime.utcnow().isoformat() + "Z"
            }
        }

        # Insérer dans la collection principale
        result = db.ressource.insert_one(approved_resource)
        approved_resource["_id"] = result.inserted_id

        # Supprimer de la collection des ressources en attente
        db.ressources_en_attente.delete_one({"_id": ObjectId(resource_id)})

        # Sanitize la réponse
        def sanitize(doc):
            for key, value in doc.items():
                if isinstance(value, ObjectId):
                    doc[key] = str(value)
                elif isinstance(value, datetime):
                    doc[key] = value.isoformat()
            return doc

        sanitized_resource = sanitize(approved_resource)
        print(f"✅ Ressource approuvée et déplacée avec l'ID: {sanitized_resource['_id']}")
        return jsonify(sanitized_resource), 200

    except Exception as e:
        print(f"❌ Erreur lors de l'approbation de la ressource: {str(e)}")
        import traceback
        print(f"Stack trace: {traceback.format_exc()}")
        return jsonify({"error": f"Erreur lors de l'approbation de la ressource: {str(e)}"}), 500 