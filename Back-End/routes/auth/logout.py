from flask import request, jsonify, make_response
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

        # Récupérer le token depuis les cookies
        token = request.cookies.get('access_token')
        
        if not token:
            # Si pas de token dans les cookies, vérifier les en-têtes
            auth_cookie = request.cookies.get('Authorization')
            if auth_cookie and auth_cookie.startswith('Bearer '):
                token = auth_cookie.split(' ')[1]
            else:
                print("Missing token")
                return jsonify({'error': 'Token manquant'}), 401

        # Suppression du document contenant le bon access_token
        result = db.Token.delete_one({'access_token': token})
        print(f"Nombre de documents supprimés: {result.deleted_count}")

        # Même si aucun token n'a été trouvé dans la base, on supprime les cookies
        response = make_response(jsonify({'message': 'Déconnexion réussie'}), 200)
        
        # Suppression des cookies en les expirant
        response.set_cookie('access_token', '', expires=0)
        response.set_cookie('refresh_token', '', expires=0)
        
        return response

    except Exception as e:
        print(f"Erreur dans logout: {str(e)}")
        return jsonify({'error': str(e)}), 500
