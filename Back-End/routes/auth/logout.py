from flask import request, jsonify
from config.database import get_db
from . import auth_bp


@auth_bp.route('/logout', methods=['POST'])
def logout():
    print("Received logout request")
    try:
        db = get_db()
        if db is None:
            print("Database connection failed")
            return jsonify({'error': 'Database connection failed'}), 500

        token = request.headers.get('Authorization')
        print(f"Token reçu: {token}")

        if not token:
            print("Missing token")
            return jsonify({'error': 'Token manquant'}), 401

        # Si jamais tu veux supporter les envois du style "Bearer <token>"
        if token.startswith('Bearer '):
            token = token.split(' ')[1]
            print(f"Token nettoyé: {token}")

        # Suppression du document contenant le bon access_token
        result = db.token.delete_one({'access_token': token})
        print(f"Nombre de documents supprimés: {result.deleted_count}")

        if result.deleted_count == 0:
            print("Aucun token trouvé à supprimer")
            return jsonify({'error': 'Token invalide ou déjà déconnecté'}), 401

        return jsonify({'message': 'Déconnexion réussie'}), 200

    except Exception as e:
        print(f"Erreur dans logout: {str(e)}")
        return jsonify({'error': str(e)}), 500
