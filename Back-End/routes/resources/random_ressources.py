@resources_bp.route('/randomressource', methods=['GET'])
def get_random_resource():
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

        pipeline = []
        if ressources_consultees:
            pipeline.append({"$match": {"_id": {"$nin": [ObjectId(id) for id in ressources_consultees]}}})
        pipeline.append({"$sample": {"size": 1}})

        resource = list(db.ressource.aggregate(pipeline))
        if not resource:
            print("ℹ️ Plus de nouvelles ressources disponibles")
            return jsonify({"message": "plus de ressources"}), 200

        resource = resource[0]

        if user_id:
            historique_entry = {
                "user_id": ObjectId(user_id),
                "resource_id": resource["_id"],
                "date_consultation": datetime.utcnow()
            }
            db.historique.insert_one(historique_entry)
            print(f"📝 Ressource {resource['_id']} ajoutée à l'historique de l'utilisateur {user_id}")

        def sanitize(document):
            for key, value in document.items():
                if isinstance(value, ObjectId):
                    document[key] = str(value)
                elif isinstance(value, datetime):
                    document[key] = value.isoformat()
            return document

        sanitized_resource = sanitize(resource)
        print(f"✅ Ressource aléatoire trouvée: {sanitized_resource.get('titre', '[sans titre]')}")
        return jsonify(sanitized_resource), 200

    except Exception as e:
        print(f"❌ Erreur lors de la récupération de la ressource aléatoire: {str(e)}")
        import traceback
        print(f"Stack trace: {traceback.format_exc()}")
        return jsonify({"error": f"Erreur lors de la récupération de la ressource aléatoire: {str(e)}"}), 500
