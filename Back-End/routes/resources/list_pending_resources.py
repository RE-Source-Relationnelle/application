from flask import request, jsonify
from datetime import datetime
from bson import ObjectId
from config.database import get_db
from . import resources_bp
from utils.auth import get_user_id_from_token

@resources_bp.route('/pending', methods=['GET'])
def list_pending_resources():
    """
    Route pour lister toutes les ressources en attente d'approbation
    Seuls les modérateurs peuvent accéder à cette route
    """
    print("🔄 Début de la route list_pending_resources")

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
    print(user_id)

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

        # Récupérer toutes les ressources en attente
        pending_resources = list(db.ressources_en_attente.find())

        def sanitize(document):
            """
            Fonction pour convertir tous les ObjectId et datetime en string
            """
            for key, value in document.items():
                if isinstance(value, ObjectId):
                    document[key] = str(value)
                elif isinstance(value, datetime):
                    document[key] = value.isoformat()
            return document

        # Nettoyage des documents
        sanitized_resources = [sanitize(resource) for resource in pending_resources]

        print(f"✅ {len(sanitized_resources)} ressources en attente trouvées")
        return jsonify(sanitized_resources), 200

    except Exception as e:
        print(f"❌ Erreur lors de la récupération des ressources en attente: {str(e)}")
        import traceback
        print(f"Stack trace: {traceback.format_exc()}")
        return jsonify({"error": f"Erreur lors de la récupération des ressources en attente: {str(e)}"}), 500 