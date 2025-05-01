import os
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

# Configuration Flask
SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'your-secret-key') 