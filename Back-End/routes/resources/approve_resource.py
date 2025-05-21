from flask import request, jsonify
from datetime import datetime
from bson import ObjectId
from config.database import get_db
from . import resources_bp
from utils.auth import get_user_id_from_token
from flask_cors import cross_origin

@resources_bp.route('/approve/<resource_id>', methods=['POST', 'OPTIONS'])
@cross_origin(supports_credentials=True, origins=["http://localhost:3000"], methods=['POST', 'OPTIONS'], allow_headers=['Content-Type', 'Authorization'])
def approve_resource(resource_id):
    """
    Route pour approuver une ressource en attente
    Seuls les modérateurs et les administrateurs peuvent approuver les ressources
    """
    # Gérer les requêtes OPTIONS pour CORS
    if request.method == 'OPTIONS':
        return '', 200
        
    print(f" Début de la route approve_resource pour l'ID: {resource_id}")

    # Vérification du token
    token_cookie = request.cookies.get('access_token')
    if not token_cookie:
        print(" Token manquant ou mal formé")
        return jsonify({"error": "Token manquant ou invalide"}), 401

    user_id = get_user_id_from_token(token_cookie)
    if not user_id:
        return jsonify({"error": "Token invalide"}), 401

    db = get_db()
    if db is None:
        print(" Erreur: Base de données non connectée")
        return jsonify({"error": "Erreur de connexion à la base de données"}), 500

    try:
        # Vérifier si l'utilisateur existe
        user = db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            print(" Utilisateur non trouvé")
            return jsonify({"error": "Utilisateur non trouvé"}), 404

        # Récupérer le rôle de l'utilisateur
        role = db.role.find_one({"_id": user.get("role_id")})
        role_name = role.get("nom_role") if role else None
        is_moderator = role_name == "modérateur"
        is_admin = role_name == "administrateur" or role_name == "super-administrateur"
        
        if not (is_moderator or is_admin):
            print(" Accès refusé : l'utilisateur n'a pas les droits nécessaires")
            return jsonify({"error": "Accès non autorisé"}), 403

        # Récupérer les données de la requête (commentaire optionnel)
        data = request.get_json() or {}
        comment = data.get('comment', '')

        # Récupérer la ressource en attente
        pending_resource = db.ressources_en_attente.find_one({"_id": ObjectId(resource_id)})
        if not pending_resource:
            print(f" Ressource en attente non trouvée pour l'ID: {resource_id}")
            # Ne pas retourner d'erreur ici, car la ressource peut exister uniquement dans la collection principale
        
        # Récupérer la ressource dans la collection principale
        main_resource = db.ressource.find_one({"_id": ObjectId(resource_id)})
        if not main_resource:
            print(f" Ressource principale non trouvée pour l'ID: {resource_id}")
            return jsonify({"error": "Ressource non trouvée"}), 404

        # Mettre à jour la ressource dans la collection principale
        now = datetime.utcnow()
        update_data = {
            "approved": True,
            "date_validation": now,
            "commentaire_validation": comment,
            "id_validateur": ObjectId(user_id)
        }
        
        result = db.ressource.update_one(
            {"_id": ObjectId(resource_id)},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            print(f" Aucune modification effectuée pour la ressource: {resource_id}")
            return jsonify({"error": "Aucune modification effectuée"}), 400

        # Supprimer de la collection des ressources en attente si elle existe
        if pending_resource:
            db.ressources_en_attente.delete_one({"_id": ObjectId(resource_id)})
            print(f" Ressource supprimée de la collection des ressources en attente: {resource_id}")

        # Récupérer la ressource mise à jour
        updated_resource = db.ressource.find_one({"_id": ObjectId(resource_id)})

        # Sanitize la réponse
        def sanitize(doc):
            doc_copy = doc.copy()
            for key, value in doc_copy.items():
                if isinstance(value, ObjectId):
                    doc_copy[key] = str(value)
                elif isinstance(value, datetime):
                    doc_copy[key] = value.isoformat()
            return doc_copy

        sanitized_resource = sanitize(updated_resource)
        print(f" Ressource approuvée avec l'ID: {sanitized_resource['_id']}")
        return jsonify(sanitized_resource), 200

    except Exception as e:
        print(f" Erreur lors de l'approbation de la ressource: {str(e)}")
        import traceback
        print(f"Stack trace: {traceback.format_exc()}")
        return jsonify({"error": f"Erreur lors de l'approbation de la ressource: {str(e)}"}), 500