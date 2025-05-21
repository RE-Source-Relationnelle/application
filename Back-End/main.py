from flask import Flask
from flask_cors import CORS
from config.database import get_db

from routes.auth import auth_bp
from routes.resources import resources_bp
from routes.users import users_bp
from routes.categories import categories_bp
from routes.admin_center import admin_bp

app = Flask(__name__)
CORS(app, 
     supports_credentials=True, 
     origins=["http://localhost:3000"]
     )

print("Initializing database connection...")
db = get_db()
print("Database connection initialized")

app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(users_bp, url_prefix='/users')
app.register_blueprint(resources_bp, url_prefix='/resources')
app.register_blueprint(resources_bp, url_prefix='/api/resources', name='api_resources')
app.register_blueprint(categories_bp, url_prefix='/categories')
app.register_blueprint(admin_bp, url_prefix='/admin')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
