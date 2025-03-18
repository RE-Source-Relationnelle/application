import os
from pymongo import MongoClient
from dotenv import load_dotenv

# Charger les variables d'environnement depuis le fichier .env
load_dotenv()

# Récupérer les infos de connexion depuis .env
MONGO_USER = os.getenv("MONGO_USER")
MONGO_PASSWORD = os.getenv("MONGO_PASSWORD")
MONGO_HOST = os.getenv("MONGO_HOST")
MONGO_PORT = os.getenv("MONGO_PORT")
DATABASE_NAME = os.getenv("DATABASE_NAME")

# Construire l'URI en fonction du type de connexion
if MONGO_HOST and MONGO_PORT:
    MONGO_URI = f"mongodb://{MONGO_USER}:{MONGO_PASSWORD}@{MONGO_HOST}:{MONGO_PORT}/"
else:
    MONGO_URI = f"mongodb+srv://{MONGO_USER}:{MONGO_PASSWORD}@{MONGO_HOST}/?retryWrites=true&w=majority"

def get_database():
    try:
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=3000)  # Timeout de 3s
        client.admin.command("ping")  # Vérification immédiate de la connexion
        print("✅ Connexion à MongoDB réussie !")

        # Vérification de l'existence de la base de données
        db_list = client.list_database_names()
        if DATABASE_NAME not in db_list:
            print(f"❌ La base de données '{DATABASE_NAME}' n'existe pas.")
            return None

        db = client[DATABASE_NAME]
        print(f"📦 Base de données '{DATABASE_NAME}' connectée avec succès !")
        return db

    except Exception as e:
        print(f"❌ Erreur de connexion à MongoDB : {e}")
        return None

# Test de connexion (optionnel)
if __name__ == "__main__":
    db = get_database()
    if db is not None:
        print(f"📂 Base connectée : {db.name}")
    else:
        print("⚠️ La connexion à la base a échoué.")
