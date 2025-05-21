import random
from flask import jsonify, request
from bson import ObjectId
from config.database import get_db
from . import resources_bp
from datetime import datetime
from utils.auth import get_user_id_from_token
from flask_cors import cross_origin


@resources_bp.route('/randomressource', methods=['GET'])
@cross_origin(supports_credentials=True, origins=["http://localhost:3000"])
def get_random_resource():
    """
    Route pour récupérer une ressource aléatoire non consultée
    """
    print("🎲 Début de la route get_random_resource")

    token_cookie = request.cookies.get('access_token')
    user_id = get_user_id_from_token(token_cookie) if token_cookie else None

    db = get_db()
    if db is None:
        print("❌ Erreur: Base de données non connectée")
        return jsonify({"error": "Erreur de connexion à la base de données"}), 500

    try:
        ressources_consultees = []
        if user_id:
            historique = list(db.historique.find({"user_id": ObjectId(user_id)}))
            ressources_consultees = [str(h["resource_id"]) for h in historique]
            print(f"📚 Ressources déjà consultées: {ressources_consultees}")
        else:
            print("⚠️ Pas d'utilisateur connecté, envoi d'une ressource totalement aléatoire")

        # Vérifier s'il y a des ressources validées
        pipeline = []
        
        # Ne montrer que les ressources validées (date_validation non nulle)
        pipeline.append({"$match": {"date_validation": {"$ne": None}}})
        
        # Exclure les ressources déjà consultées si l'utilisateur est connecté
        if ressources_consultees:
            pipeline.append({"$match": {"_id": {"$nin": [ObjectId(id) for id in ressources_consultees]}}})
        
        # Sélectionner une ressource aléatoire
        pipeline.append({"$sample": {"size": 1}})

        resource = list(db.ressource.aggregate(pipeline))
        if not resource:
            print("ℹ️ Plus de nouvelles ressources disponibles")
            return jsonify({"message": "plus de ressources"}), 200

        resource = resource[0]

        # Ajouter à l'historique si l'utilisateur est connecté
        if user_id:
            historique_entry = {
                "user_id": ObjectId(user_id),
                "resource_id": resource["_id"],
                "date_consultation": datetime.utcnow()
            }
            db.historique.insert_one(historique_entry)
            print(f"📝 Ressource {resource['_id']} ajoutée à l'historique de l'utilisateur {user_id}")

        def sanitize(document):
            """
            Fonction pour convertir tous les ObjectId et datetime en string
            """
            result = document.copy()  # Créer une copie pour éviter de modifier l'original
            for key, value in result.items():
                if isinstance(value, ObjectId):
                    result[key] = str(value)
                elif isinstance(value, datetime):
                    result[key] = value.isoformat()
            return result

        sanitized_resource = sanitize(resource)
        print(f"✅ Ressource aléatoire trouvée: {sanitized_resource.get('titre', '[sans titre]')}")
        return jsonify(sanitized_resource), 200

    except Exception as e:
        print(f"❌ Erreur lors de la récupération de la ressource aléatoire: {str(e)}")
        import traceback
        print(f"Stack trace: {traceback.format_exc()}")
        return jsonify({"error": f"Erreur lors de la récupération de la ressource aléatoire: {str(e)}"}), 500
