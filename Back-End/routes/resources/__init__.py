from flask import Blueprint

resources_bp = Blueprint('resources', __name__)

from . import create_resource, get_resource, list_resources, comments, favorites, sous_comments 