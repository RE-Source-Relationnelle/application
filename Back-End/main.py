# -*- coding: utf-8 -*-
# Import Flask et CORS
from flask import Flask
from flask_cors import CORS

# Import DB et routes
from config.database import get_db
from routes.auth import auth_bp
from routes.resources import resources_bp
from routes.users import users_bp
from routes.categories import categories_bp
from routes.admin_center import admin_bp

# Création de l'app Flask
app = Flask(__name__)


FRONT_HTTP  = "https://guillaume-lechevallier.freeboxos.fr"

ALLOWED = [FRONT_HTTP]

# Activation CORS officielle
CORS(app, resources={r"/*": {
    "origins": ALLOWED,
    "supports_credentials": True,
    "allow_headers": ["Content-Type", "Authorization", "X-Requested-With"],
    "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    "expose_headers": ["Content-Length", "Content-Type"]
}})

# (Optionnel) si tu veux forcer des headers supplémentaires sur toutes les réponses :
# @app.after_request
# def add_cors_headers(resp):
#     # Flask-CORS les met déjà, ceci est purement défensif/diagnostic
#     return resp

# ---- Connexion DB ----
print("Initializing database connection...")
db = get_db()
print("Database connection initialized")

# ---- Blueprints ----
app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(users_bp, url_prefix='/users')
app.register_blueprint(resources_bp, url_prefix='/resources')
# Tu montes la même blueprint sur /api/resources : OK car tu as donné un "name" différent
app.register_blueprint(resources_bp, url_prefix='/api/resources', name='api_resources')
app.register_blueprint(categories_bp, url_prefix='/categories')
app.register_blueprint(admin_bp, url_prefix='/admin')

# (Optionnel) endpoint de healthcheck pour supervision / watchtower
@app.get("/health")
def health():
    return {"status": "ok"}, 200
@app.after_request
def add_cors_headers(resp):
    origin = resp.headers.get("Access-Control-Allow-Origin")
    if not origin:
        # on met l’origin HTTP par défaut ; si ton site passe en HTTPS, switch automatique
        allowed = FRONT_HTTP
        resp.headers["Access-Control-Allow-Origin"] = allowed
    resp.headers["Vary"] = "Origin"
    resp.headers["Access-Control-Allow-Credentials"] = "true"
    resp.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
    resp.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    return resp

# Catch-all pour le preflight OPTIONS (utile si un blueprint ne répond pas)
@app.route('/', defaults={'path': ''}, methods=['OPTIONS'])
@app.route('/<path:path>', methods=['OPTIONS'])
def cors_preflight(path):
    return ('', 204)
    
# ---- Lancement ----
# Assure-toi que le port correspond à celui mappé dans docker-compose (5001 -> 8000)
if __name__ == '__main__':
    # debug=True en dev, désactive-le en prod (ou utilise gunicorn)
    app.run(debug=True, host='0.0.0.0', port=5001)

