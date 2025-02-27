from flask import Flask, request, jsonify
from flask_cors import CORS
import re
import urllib.parse

app = Flask(__name__)
CORS(app)

def analyze_url(url):
    """Analyze URL for phishing indicators"""
    score = 0
    reasons = []
    
    try:
        parsed_url = urllib.parse.urlparse(url)
        
        # Check for IP address in domain
        ip_pattern = r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}'
        if re.match(ip_pattern, parsed_url.netloc):
            score += 0.4
            reasons.append('IP Address Used Instead of Domain')
        
        # Check for suspicious TLD
        suspicious_tlds = ['.xyz', '.top', '.work', '.click', '.loan']
        if any(tld in parsed_url.netloc.lower() for tld in suspicious_tlds):
            score += 0.3
            reasons.append('Suspicious Top-Level Domain')
        
        # Check for long domain name
        if len(parsed_url.netloc) > 30:
            score += 0.2
            reasons.append('Unusually Long Domain Name')
        
        # Check for multiple subdomains
        if len(parsed_url.netloc.split('.')) > 3:
            score += 0.2
            reasons.append('Multiple Subdomains')
        
        # Check for suspicious keywords in URL
        suspicious_keywords = ['secure', 'account', 'banking', 'login', 'verify']
        if any(keyword in url.lower() for keyword in suspicious_keywords):
            score += 0.2
            reasons.append('Suspicious Keywords in URL')
            
        return score, reasons
        
    except Exception as e:
        reasons.append(f'URL Analysis Error: {str(e)}')
        return 0.5, reasons

def analyze_email_content(email_data):
    """Analyze email for phishing indicators"""
    score = 0
    reasons = []
    
    # Check sender
    sender = email_data.get('sender', '').lower()
    suspicious_domains = ['free', 'temp', 'disposable']
    if any(domain in sender for domain in suspicious_domains):
        score += 0.3
        reasons.append('Suspicious Sender Domain')
    
    # Check subject
    subject = email_data.get('subject', '').lower()
    urgent_words = ['urgent', 'immediate', 'action required', 'account suspended', 'verify']
    if any(word in subject for word in urgent_words):
        score += 0.3
        reasons.append('Urgent or Suspicious Subject Line')
    
    # Check content
    content = email_data.get('content', '').lower()
    
    # Check for URLs in content
    url_pattern = r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+'
    urls = re.findall(url_pattern, content)
    
    # Analyze each URL found in the email
    for url in urls:
        url_score, url_reasons = analyze_url(url)
        if url_score > 0.5:
            score += 0.2
            reasons.extend([f'Suspicious URL: {reason}' for reason in url_reasons])
    
    # Check for sensitive words
    sensitive_words = ['password', 'credit card', 'ssn', 'social security', 'bank account']
    if any(word in content for word in sensitive_words):
        score += 0.2
        reasons.append('Contains Sensitive Words')
    
    # Check for poor grammar/spelling (simple check)
    grammar_indicators = ['kindly', 'dear sir', 'dear madam', 'valued customer']
    if any(indicator in content.lower() for indicator in grammar_indicators):
        score += 0.1
        reasons.append('Suspicious Language Patterns')
    
    return score, reasons

@app.route('/analyze-url', methods=['POST'])
def analyze_url_endpoint():
    try:
        data = request.get_json()
        if not data or 'url' not in data:
            return jsonify({
                'error': 'No URL provided',
                'isPhishing': False,
                'confidence': 0,
                'reasons': [],
                'riskLevel': 'unknown'
            }), 400
        
        url = data['url']
        score, reasons = analyze_url(url)
        
        # Convert score to confidence percentage
        confidence = min(score * 100, 100)
        
        # Determine risk level
        if confidence >= 70:
            risk_level = 'high'
        elif confidence >= 40:
            risk_level = 'medium'
        else:
            risk_level = 'low'
            
        return jsonify({
            'isPhishing': confidence >= 50,
            'confidence': confidence,
            'reasons': reasons,
            'riskLevel': risk_level,
            'url': url
        })
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'isPhishing': False,
            'confidence': 0,
            'reasons': [],
            'riskLevel': 'unknown'
        }), 500

@app.route('/analyze-email', methods=['POST'])
def analyze_email():
    try:
        email_data = request.get_json()
        if not email_data:
            return jsonify({
                'error': 'No email data provided',
                'isPhishing': False,
                'confidence': 0,
                'reasons': [],
                'riskLevel': 'unknown'
            }), 400
        
        # Validate required fields
        required_fields = ['subject', 'sender', 'content']
        for field in required_fields:
            if not email_data.get(field):
                return jsonify({
                    'error': f'Missing required field: {field}',
                    'isPhishing': False,
                    'confidence': 0,
                    'reasons': [],
                    'riskLevel': 'unknown'
                }), 400

        # Analyze the email
        score, reasons = analyze_email_content(email_data)
        
        # Convert score to confidence percentage
        confidence = min(score * 100, 100)
        
        # Determine risk level
        if confidence >= 70:
            risk_level = 'high'
        elif confidence >= 40:
            risk_level = 'medium'
        else:
            risk_level = 'low'

        return jsonify({
            'isPhishing': confidence >= 50,
            'confidence': confidence,
            'reasons': reasons,
            'riskLevel': risk_level
        })

    except Exception as e:
        print(f"Error processing request: {str(e)}")
        return jsonify({
            'error': str(e),
            'isPhishing': False,
            'confidence': 0,
            'reasons': [],
            'riskLevel': 'unknown'
        }), 500

if __name__ == "__main__":
    print("Starting server on http://localhost:5000")
    app.run(host='0.0.0.0', port=5000, debug=True)
