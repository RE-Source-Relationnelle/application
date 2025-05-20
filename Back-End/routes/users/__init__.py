from flask import Blueprint

users_bp = Blueprint('users', __name__)

from . import get_own_profile, update_profile, get_user_role
