from flask import Blueprint
from . import get_own_profile, update_profile

users_bp = Blueprint('users', __name__)