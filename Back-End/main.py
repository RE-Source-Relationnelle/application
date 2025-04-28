from flask import Flask
from flask_cors import CORS
from config.database import get_db

from routes.auth import auth_bp
from routes.resources import resources_bp

app = Flask(__name__)
CORS(app)

print("Initializing database connection...")
db = get_db()
print("Database connection initialized")

app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(resources_bp, url_prefix='/api/resources')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
