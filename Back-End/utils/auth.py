from config.database import get_db

def get_user_id_from_token(token: str):
    print("token = ",token)
    if not token:
        return "None"

    db = get_db()

    # Chercher le token en base
    token_data = db.token.find_one({'access_token': token})
    if token_data:
        return token_data.get('id_user')

    return None
