import logging
import os
from pathlib import Path
from datetime import datetime
from flask import Flask, request, render_template, jsonify
import numpy as np
import joblib
from urllib.parse import urlparse
import validators
from feature_extractor import FeatureExtractor
from dotenv import load_dotenv
from flask_cors import CORS
import re

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
app.config['MAX_CONTENT_LENGTH'] = 1 * 1024 * 1024  # Limit payload to 1MB
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'default-secret-key')

# Initialize feature extractor
feature_extractor = FeatureExtractor()

def load_model():
    """Load the trained model."""
    try:
        model_path = Path("models") / "phishing_detector.joblib"
        if not model_path.exists():
            logger.error(f"Model file not found at {model_path}")
            return None
        return joblib.load(model_path)
    except Exception as e:
        logger.error(f"Error loading model: {str(e)}")
        return None

# Load the model
model = load_model()

def is_valid_url(url):
    """Validate URL format."""
    return validators.url(url)

def get_prediction(url):
    """Get prediction for a URL."""
    try:
        # Extract features
        features = feature_extractor.extract_features(url)
        
        # Make prediction
        prediction = model.predict(features)[0]
        probability = model.predict_proba(features)[0]
        
        # Get the confidence score
        confidence = float(max(probability))
        
        # Apply confidence threshold - if confidence is less than 75% for phishing prediction,
        # we'll consider it legitimate to reduce false positives
        CONFIDENCE_THRESHOLD = 0.75
        is_phishing = bool(prediction and confidence >= CONFIDENCE_THRESHOLD)
        
        return {
            'is_phishing': is_phishing,
            'confidence': confidence,
            'threshold_applied': CONFIDENCE_THRESHOLD,
            'timestamp': datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error making prediction: {str(e)}")
        return None

def extract_email_features(email_data):
    """Extract features from email data for spam detection."""
    features = {
        'has_suspicious_sender': 0,
        'has_urgent_subject': 0,
        'has_suspicious_links': 0,
        'has_attachments': 0,
        'contains_sensitive_words': 0
    }
    
    # Check sender domain
    sender = email_data.get('sender', '').lower()
    suspicious_domains = ['free', 'temp', 'disposable']
    features['has_suspicious_sender'] = any(domain in sender for domain in suspicious_domains)
    
    # Check subject for urgent words
    subject = email_data.get('subject', '').lower()
    urgent_words = ['urgent', 'immediate', 'action required', 'account suspended']
    features['has_urgent_subject'] = any(word in subject for word in urgent_words)
    
    # Check content for suspicious links
    content = email_data.get('content', '').lower()
    url_pattern = r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+'
    urls = re.findall(url_pattern, content)
    features['has_suspicious_links'] = len(urls) > 0
    
    # Check for sensitive words
    sensitive_words = ['password', 'credit card', 'ssn', 'social security', 'bank account']
    features['contains_sensitive_words'] = any(word in content for word in sensitive_words)
    
    return np.array(list(features.values()))

@app.route("/", methods=["GET"])
def index():
    """Render the main page."""
    return render_template('index.html')

@app.route("/analyze", methods=["POST"])
def analyze():
    """Analyze a URL for phishing."""
    try:
        # Get URL from request
        data = request.get_json()
        url = data.get('url', '').strip()
        
        # Validate URL
        if not url:
            return jsonify({'error': 'Please provide a URL'}), 400
        
        if not is_valid_url(url):
            return jsonify({'error': 'Invalid URL format'}), 400
            
        # Get prediction
        result = get_prediction(url)
        if result is None:
            return jsonify({'error': 'Error processing URL'}), 500
            
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error in analyze endpoint: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/analyze-email', methods=['POST'])
def analyze_email():
    """Analyze an email for potential spam/phishing."""
    try:
        email_data = request.get_json()
        if not email_data:
            return jsonify({'error': 'No email data provided'}), 400
        
        # Extract features from email
        features = extract_email_features(email_data)
        
        # Make prediction
        # For demonstration, using a simple threshold-based approach
        # In production, you should use a proper ML model trained on email data
        spam_score = np.mean(features)  # Simple average of feature values
        
        is_spam = spam_score > 0.3  # Threshold for spam classification
        confidence = spam_score * 100
        
        reasons = []
        feature_names = ['Suspicious Sender', 'Urgent Subject', 'Suspicious Links', 'Attachments', 'Sensitive Words']
        for i, (feature, value) in enumerate(zip(feature_names, features)):
            if value > 0:
                reasons.append(feature)
        
        return jsonify({
            'isSpam': bool(is_spam),
            'confidence': float(confidence),
            'reasons': reasons,
            'riskLevel': 'high' if confidence > 70 else 'medium' if confidence > 40 else 'low'
        })
    
    except Exception as e:
        logger.error(f"Error analyzing email: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None
    })

@app.errorhandler(413)
def request_entity_too_large(error):
    """Handle payload too large error."""
    return jsonify({'error': 'Request too large'}), 413

@app.errorhandler(500)
def internal_error(error):
    """Handle internal server error."""
    logger.error(f"Internal error: {str(error)}")
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == "__main__":
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug)
