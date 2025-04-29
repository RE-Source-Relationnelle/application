from pymongo import MongoClient
from datetime import datetime
import os
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

# Configuration de la connexion MongoDB depuis les variables d'environnement
MONGO_URI = os.getenv('MONGO_URI')
DB_NAME = os.getenv('DB_NAME', 'ressource_relationnelle')

print(f"Connecting to MongoDB with URI: {MONGO_URI}")
print(f"Using database name: {DB_NAME}")

def get_db():
    try:
        print("Creating new MongoDB connection...")
        client = MongoClient(MONGO_URI)
        # Test de la connexion
        print("Testing connection with ping...")
        client.admin.command('ping')
        print("Connection successful!")
        
        # Vérification de la base de données
        dbs = client.list_database_names()
        print(f"Available databases: {dbs}")
        
        if DB_NAME not in dbs:
            print(f"Database {DB_NAME} does not exist, it will be created on first use")
        else:
            print(f"Database {DB_NAME} exists")
        
        db = client[DB_NAME]
        print(f"Using database: {db.name}")
        return db
    except Exception as e:
        print(f"Erreur de connexion à MongoDB: {e}")
        return None 