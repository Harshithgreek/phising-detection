# Advanced Phishing URL Detector

A modern web application that uses machine learning to detect potential phishing URLs. This project provides a user-friendly interface and robust backend for analyzing URLs for potential phishing attempts.

## Features

- Real-time URL analysis
- Machine learning-based detection
- Modern, responsive UI
- Detailed analysis results
- API endpoint for integration
- Comprehensive logging
- Health check endpoint

## Tech Stack
Frontend

HTML5 – Structure of the web interface

CSS3 – Styling and responsive design

JavaScript (ES6) – Client-side interactivity and API communication

Backend

Python 3.8+ – Core programming language

Flask – Lightweight web framework for API and server-side logic

Flask-Dotenv / python-dotenv – Environment variable management

Machine Learning

Scikit-learn – Machine learning model training and inference

Joblib – Model serialization and loading

NumPy – Numerical computations

Pandas – Data processing and feature handling

Model & Feature Engineering

Custom Feature Extraction Module – URL-based feature engineering

Supervised ML Model – Phishing vs Legitimate URL classification

Development & Tooling

pip – Dependency management

Virtualenv – Isolated Python environment

Logging (Python logging module) – Application and prediction logs

Deployment & Security

REST API – JSON-based API endpoints

Environment Variables (.env) – Secure configuration

Health Check Endpoint – Service and model monitoring
## Prerequisites

- Python 3.8+
- pip (Python package manager)
- Virtual environment (recommended)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Phishing-Detection-Advanced
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file in the project root:
```
FLASK_ENV=development
SECRET_KEY=your-secret-key-here
```

5. Create the models directory and add your trained model:
```bash
mkdir models
# Add your trained model file as 'phishing_detector.joblib' in the models directory
```

## Usage

1. Start the application:
```bash
python app.py
```

2. Open your browser and navigate to:
```
http://localhost:5000
```

## API Endpoints

### Analyze URL
- **POST** `/analyze`
- Request body: `{"url": "https://example.com"}`
- Returns analysis results including prediction and confidence score

### Health Check
- **GET** `/health`
- Returns service health status and model availability

## Project Structure

```
Phishing-Detection-Advanced/
├── app.py                 # Main application file
├── feature_extractor.py   # Feature extraction module
├── requirements.txt       # Project dependencies
├── .env                  # Environment variables
├── models/               # Directory for ML models
├── static/               # Static files (CSS, JS)
│   ├── style.css
│   └── script.js
└── templates/            # HTML templates
    └── index.html
```

## Security Notes

- The application includes input validation and sanitization
- Rate limiting is recommended for production deployment
- SSL/TLS should be enabled in production
- API keys should be properly secured
- Regular updates of dependencies are recommended

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
