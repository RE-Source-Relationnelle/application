from flask import request, jsonify, make_response
from datetime import datetime, timedelta, timezone
import jwt
import os
from config.database import get_db
from . import auth_bp
from flask_cors import cross_origin
from bson import ObjectId
import bcrypt

# Clé secrète pour JWT
JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'your-secret-key')

@auth_bp.route('/auth_from_password', methods=['POST'])
@cross_origin(supports_credentials=True, origins=["http://localhost:3000"])
def auth_from_password():
    print("\n\n========== DÉBUT AUTH FROM PASSWORD ==========")
    print(f"Méthode de la requête: {request.method}")
    print(f"En-têtes de la requête: {dict(request.headers)}")
    
    try:
        db = get_db()
        if db is None:
            print("❌ ERREUR: Base de données non connectée")
            return jsonify({'error': 'Erreur de connexion à la base de données'}), 500

        data = request.get_json()
        print(f"Données reçues: {data}")

        # Vérification des données requises
        if not all(k in data for k in ('mail', 'password')):
            print("❌ ERREUR: Champs requis manquants")
            return jsonify({'error': 'Email et mot de passe requis'}), 400
    
        bcrypt.checkpw(mot_de_passe_saisi, mot_de_passe_hache)
        # Recherche de l'utilisateur
        user = db.users.find_one({'mail': data['mail']})
        
        if not user:
            print(f"❌ ERREUR: Aucun utilisateur trouvé avec l'email: {data['mail']}")
            return jsonify({'error': 'Email ou mot de passe incorrect'}), 401
            
        if bcrypt.checkpw(data['password'],user['password']):
            print(f"❌ ERREUR: Mot de passe incorrect pour l'utilisateur: {data['mail']}")
            return jsonify({'error': 'Email ou mot de passe incorrect'}), 401

        # 1. Génération des timestamps avec timezone
        current_time = datetime.now(timezone.utc)
        access_token_expiration = current_time + timedelta(minutes=15)
        refresh_token_expiration = current_time + timedelta(days=7)

        # 2. Génération des tokens avec payload amélioré
        access_token = jwt.encode({
            'user_id': str(user['_id']),
            'exp': int(access_token_expiration.timestamp()),
            'iat': int(current_time.timestamp()),
            'type': 'access'
        }, JWT_SECRET_KEY, algorithm='HS256')

        refresh_token = jwt.encode({
            'user_id': str(user['_id']),
            'exp': int(refresh_token_expiration.timestamp()),
            'iat': int(current_time.timestamp()),
            'type': 'refresh',
            'jti': str(ObjectId())  # Identifiant unique pour ce token
        }, JWT_SECRET_KEY, algorithm='HS256')

        # 3. Invalider les anciens tokens de cet utilisateur (optionnel)
        # Vous pouvez choisir de conserver les anciens tokens pour permettre la connexion multi-appareils
        # ou les supprimer pour une sécurité accrue
        # db.token.delete_many({'id_user': user['_id']})

        # 4. Création du document token
        token_data = {
            'id_user': user['_id'],
            'access_token': access_token,
            'expiration_access_token': access_token_expiration,
            'refresh_token': refresh_token,
            'expiration_refresh_token': refresh_token_expiration,
            'created_at': current_time,
            'user_agent': request.headers.get('User-Agent', 'Unknown'),
            'ip_address': request.remote_addr
        }

        # 5. Insertion du token dans la base de données
        result = db.token.insert_one(token_data)
        print(f"✅ Token inséré avec ID: {result.inserted_id}")

        # 6. Préparation des données utilisateur pour la réponse
        # Ne pas inclure de données sensibles comme le mot de passe
        response_data = {
            'user_id': str(user['_id']),
            'username': user.get('username', ''),
            'mail': user.get('mail', ''),
            'nom': user.get('nom', ''),
            'prenom': user.get('prenom', '')
        }

        # 7. Création de la réponse avec cookies
        response = make_response(jsonify(response_data), 200)
        
        # 8. Définition des cookies sécurisés
        # Access token - httponly=False pour permettre l'accès par JavaScript
        response.set_cookie(
            'access_token', 
            access_token, 
            max_age=900,  # 15 minutes
            path='/',
            httponly=False,  # Accessible par JavaScript pour les en-têtes
            secure=False,    # À mettre à True en production avec HTTPS
            samesite='Lax'
        )
        
        # Refresh token - httponly=True pour la sécurité
        response.set_cookie(
            'refresh_token', 
            refresh_token, 
            max_age=604800,  # 7 jours
            path='/',
            httponly=True,   # Non accessible par JavaScript
            secure=False,    # À mettre à True en production avec HTTPS
            samesite='Lax'
        )

        print("✅ Authentification réussie")
        print("========== FIN AUTH FROM PASSWORD (SUCCÈS) ==========\n\n")
        return response

    except Exception as e:
        print(f"❌ ERREUR CRITIQUE lors de l'authentification: {str(e)}")
        import traceback
        traceback_str = traceback.format_exc()
        print(f"Stack trace détaillée:\n{traceback_str}")
        print("========== FIN AUTH FROM PASSWORD (ERREUR) ==========\n\n")
        return jsonify({'error': str(e)}), 500

# Endpoint pour récupérer les informations de l'utilisateur courant
@auth_bp.route('/me', methods=['GET'])
@cross_origin(supports_credentials=True, origins=["http://localhost:3000"])
def get_user_info():
    print("\n\n========== DÉBUT GET USER INFO ==========")
    print(f"Méthode de la requête: {request.method}")
    print(f"En-têtes de la requête: {dict(request.headers)}")
    print(f"Cookies reçus: {request.cookies}")
    
    try:
        # Récupérer le token d'accès
        access_token = request.cookies.get('access_token')
        if not access_token:
            # Vérifier également dans les en-têtes
            auth_header = request.headers.get('Authorization')
            if auth_header and auth_header.startswith('Bearer '):
                access_token = auth_header.split(' ')[1]
            else:
                access_token = request.headers.get('token')
        
        if not access_token:
            print("❌ ERREUR: Token d'accès manquant")
            return jsonify({"error": "Non authentifié"}), 401
            
        # Vérifier le token
        try:
            # Décoder le token pour vérifier la signature et l'expiration
            decoded_token = jwt.decode(access_token, JWT_SECRET_KEY, algorithms=['HS256'])
            user_id = decoded_token.get('user_id')
            
            # Vérifier que le token existe dans la base de données
            db = get_db()
            token_doc = db.token.find_one({"access_token": access_token})
            
            if not token_doc:
                print("❌ ERREUR: Token non trouvé dans la base de données")
                return jsonify({"error": "Token invalide"}), 401
                
            # Récupérer les informations de l'utilisateur
            user = db.users.find_one({"_id": ObjectId(user_id)})
            
            if not user:
                print(f"❌ ERREUR: Utilisateur avec ID {user_id} non trouvé")
                return jsonify({"error": "Utilisateur non trouvé"}), 404
                
            # Préparer la réponse avec les informations de l'utilisateur
            user_data = {
                'user_id': str(user['_id']),
                'username': user.get('username', ''),
                'mail': user.get('mail', ''),
                'nom': user.get('nom', ''),
                'prenom': user.get('prenom', ''),
                'role_id': str(user.get('role_id')) if user.get('role_id') else None
            }
            
            print(f"✅ Informations utilisateur récupérées: {user_data}")
            print("========== FIN GET USER INFO (SUCCÈS) ==========\n\n")
            return jsonify(user_data), 200
            
        except jwt.ExpiredSignatureError:
            print("❌ ERREUR: Token JWT expiré")
            return jsonify({"error": "Token expiré"}), 401
        except jwt.InvalidTokenError:
            print("❌ ERREUR: Token JWT invalide")
            return jsonify({"error": "Token invalide"}), 401
            
    except Exception as e:
        print(f"❌ ERREUR CRITIQUE lors de la récupération des informations utilisateur: {str(e)}")
        import traceback
        traceback_str = traceback.format_exc()
        print(f"Stack trace détaillée:\n{traceback_str}")
        print("========== FIN GET USER INFO (ERREUR) ==========\n\n")
        return jsonify({"error": str(e)}), 500
