from flask import Blueprint

resources_bp = Blueprint('resources', __name__)

from . import create_resource, get_resource, list_resources, sous_comments, random_ressources, get_favorites, post_favorite, delete_favorite, get_categories_resources, update_resource, delete_resource, approve_resource, add_to_history, get_comments, post_comments, list_pending_resources
