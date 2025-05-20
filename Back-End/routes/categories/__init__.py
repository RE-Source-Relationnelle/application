# Dans routes/categories/__init__.py
from flask import Blueprint

categories_bp = Blueprint('categories', __name__)

# Import routes after blueprint definition to avoid circular imports
from . import get_categories, create_category, update_category, delete_category
