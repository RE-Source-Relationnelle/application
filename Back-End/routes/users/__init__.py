from flask import Blueprint

users_bp = Blueprint('users', __name__)

# Import des routes après la définition du Blueprint
from . import get_own_profile, update_profile