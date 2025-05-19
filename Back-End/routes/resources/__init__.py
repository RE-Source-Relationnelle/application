from flask import Blueprint

resources_bp = Blueprint('resources', __name__)

from . import create_resource, get_resource, list_resources, comments, sous_comments, random_ressources, get_favorites, post_favorite, get_categories_resources, update_resource, delete_resource
