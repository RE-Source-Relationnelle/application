from flask import request, jsonify
from bson import ObjectId
from config.database import get_db
from . import users_bp
from utils.auth import get_user_id_from_token

@users_bp.route('/role', methods=['GET'])
def get_user_role():
    """
    Route pour récupérer le rôle de l'utilisateur connecté
    Accessible à tous les utilisateurs authentifiés
    """
    print("🔄 Début de la route get_user_role")

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

        # Récupérer le rôle de l'utilisateur
        role_info = None
        if 'role_id' in user:
            role = db.role.find_one({"_id": user.get("role_id")})
            if role:
                role_info = {
                    'role_id': str(role['_id']),
                    'nom_role': role.get('nom_role', 'utilisateur')
                }
        
        # Si aucun rôle n'est trouvé, on utilise un rôle par défaut
        if not role_info:
            role_info = {
                'role_id': None,
                'nom_role': 'utilisateur'
            }
        
        print(f"✅ Rôle récupéré avec succès: {role_info}")
        return jsonify(role_info), 200

    except Exception as e:
        print(f"❌ Erreur lors de la récupération du rôle: {str(e)}")
        import traceback
        print(f"Stack trace: {traceback.format_exc()}")
        return jsonify({"error": f"Erreur lors de la récupération du rôle: {str(e)}"}), 500
