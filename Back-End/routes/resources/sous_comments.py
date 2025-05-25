from flask import request, jsonify
from datetime import datetime
from bson import ObjectId
from config.database import get_db
from . import resources_bp
from utils.auth import get_user_id_from_token


@resources_bp.route('/sous_comments/<resource_id>/replies/<comment_id>', methods=['OPTIONS'])
def options_sous_comments(resource_id, comment_id):
    """
    Handle CORS preflight requests for sous_comments
    """
    return '', 200


@resources_bp.route('/sous_comments/<resource_id>/replies/<comment_id>', methods=['GET'])
def get_sous_comments(resource_id, comment_id):
    """
    Route pour récupérer les sous-commentaires d'un commentaire spécifique
    """
    print("🔄 Début de la route get_sous_comments")
    print(f"🔄 Ressource ID: {resource_id}")
    print(f"🔄 Comment ID: {comment_id}")
    
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

        # Vérifier si le commentaire parent existe
        comment = db.commentaire.find_one({"_id": ObjectId(comment_id)})
        if not comment:
            print(f"❌ Commentaire non trouvé pour l'ID: {comment_id}")
            return jsonify({"error": "Commentaire non trouvé"}), 404

        # Récupérer tous les sous-commentaires pour ce commentaire
        sous_comments = list(db.sous_commentaire.find({
            "resource_id": resource_id,
            "comment_id": comment_id
        }).sort("created_at", 1))  # Tri par date croissante

        # Fonction pour convertir les ObjectId et datetime
        def sanitize(document):
            for key, value in document.items():
                if isinstance(value, ObjectId):
                    document[key] = str(value)
                elif isinstance(value, datetime):
                    document[key] = value.isoformat()
                elif isinstance(value, dict) and "$date" in value:
                    document[key] = value["$date"]
            return document

        # Convertir et enrichir avec les informations utilisateur
        enriched_sous_comments = []
        for sous_comment in sous_comments:
            sous_comment = sanitize(sous_comment)
            
            # Récupérer les informations utilisateur
            user_id = sous_comment.get('user_id')
            if user_id:
                try:
                    user = db.utilisateur.find_one({"_id": ObjectId(user_id)})
                    if user:
                        sous_comment['nom_utilisateur'] = user.get('nom', '')
                        sous_comment['prenom_utilisateur'] = user.get('prenom', '')
                    else:
                        sous_comment['nom_utilisateur'] = 'Utilisateur'
                        sous_comment['prenom_utilisateur'] = ''
                except Exception as e:
                    print(f"⚠️ Impossible de récupérer l'utilisateur {user_id}: {e}")
                    sous_comment['nom_utilisateur'] = 'Utilisateur'
                    sous_comment['prenom_utilisateur'] = ''
            
            enriched_sous_comments.append(sous_comment)

        print(f"✅ {len(enriched_sous_comments)} sous-commentaires récupérés pour le commentaire {comment_id}")
        return jsonify(enriched_sous_comments), 200

    except Exception as e:
        print(f"❌ Erreur lors de la récupération des sous-commentaires: {str(e)}")
        import traceback
        print(f"Stack trace: {traceback.format_exc()}")
        return jsonify({"error": f"Erreur lors de la récupération des sous-commentaires: {str(e)}"}), 500


@resources_bp.route('/sous_comments/<resource_id>/replies/<comment_id>', methods=['POST'])
def add_sous_comment(resource_id, comment_id):
    """
    Route pour ajouter un sous-commentaire à un commentaire
    """
    print("🔄 Début de la route add_sous_comment")
    print(f"🔄 Ressource ID: {resource_id}")
    print(f"🔄 Comment ID: {comment_id}")
    
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

    data = request.get_json()
    print(f"📝 Données reçues: {data}")

    if not data or 'content' not in data:
        print("❌ Erreur: Contenu manquant")
        return jsonify({"error": "Contenu requis"}), 400

    try:
        # Vérifier si la ressource existe
        resource = db.ressource.find_one({"_id": ObjectId(resource_id)})
        if not resource:
            print(f"❌ Ressource non trouvée pour l'ID: {resource_id}")
            return jsonify({"error": "Ressource non trouvée"}), 404

        # Vérifier si le commentaire parent existe
        comment = db.commentaire.find_one({"_id": ObjectId(comment_id)})
        if not comment:
            print(f"❌ Commentaire non trouvé pour l'ID: {comment_id}")
            return jsonify({"error": "Commentaire non trouvé"}), 404

        # Créer le sous-commentaire selon la structure de votre collection
        sous_comment = {
            "content": data['content'],
            "user_id": ObjectId(user_id),
            "resource_id": resource_id,  # String comme dans votre exemple
            "comment_id": comment_id,    # String comme dans votre exemple
            "created_at": {"$date": datetime.utcnow().isoformat()}
        }

        # Insérer dans la base de données
        result = db.sous_commentaire.insert_one(sous_comment)
        
        # Récupérer les informations utilisateur pour la réponse
        user = db.utilisateur.find_one({"_id": ObjectId(user_id)})
        nom_utilisateur = user.get('nom', '') if user else 'Utilisateur'
        prenom_utilisateur = user.get('prenom', '') if user else ''
        
        # Préparer la réponse en convertissant les ObjectId
        response_comment = {
            "_id": str(result.inserted_id),
            "content": sous_comment['content'],
            "user_id": str(sous_comment['user_id']),
            "resource_id": sous_comment['resource_id'],
            "comment_id": sous_comment['comment_id'],
            "created_at": sous_comment['created_at'],
            "nom_utilisateur": nom_utilisateur,
            "prenom_utilisateur": prenom_utilisateur
        }
        
        print(f"✅ Sous-commentaire créé avec l'ID: {response_comment['_id']}")
        return jsonify(response_comment), 201

    except Exception as e:
        print(f"❌ Erreur lors de la création du sous-commentaire: {str(e)}")
        import traceback
        print(f"Stack trace: {traceback.format_exc()}")
        return jsonify({"error": f"Erreur lors de la création du sous-commentaire: {str(e)}"}), 500 