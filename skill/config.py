import os
from datetime import timedelta

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'skillcred-dev-secret-key-2025'
    UPLOAD_FOLDER = os.path.join(os.getcwd(), 'static', 'uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    ALLOWED_RESUME_EXTENSIONS = {'pdf', 'docx', 'doc'}
    ALLOWED_JSON_EXTENSIONS = {'json'}
    
    # Database configuration
    DATABASE_URL = os.environ.get('DATABASE_URL') or 'sqlite:///skillcred.db'
    
    # Verification settings
    VERIFICATION_TIMEOUT = 30  # seconds
    DEFAULT_TRUST_THRESHOLD = 70  # percentage
    
    # UI settings
    ITEMS_PER_PAGE = 20
    CHART_COLORS = {
        'verified': '#22C55E',      # Green
        'review': '#F59E0B',        # Yellow
        'fraudulent': '#EF4444'     # Red
    }
