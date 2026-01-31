# Email Spam Detection Testing Guide

## Overview
Your phishing detection application includes an email spam/phishing analyzer that checks emails for suspicious characteristics.

## How It Works

The `/analyze-email` endpoint analyzes emails based on these features:
- ✅ **Suspicious Sender Domain** - Checks for free/temp/disposable email domains
- ✅ **Urgent Subject Lines** - Looks for urgent, immediate action required keywords
- ✅ **Suspicious Links** - Detects URLs in email content
- ✅ **Sensitive Information Requests** - Flags requests for passwords, credit cards, SSN, etc.

---

## API Endpoint

**POST** `/analyze-email`

### Request Format (JSON):
```json
{
  "sender": "email@domain.com",
  "subject": "Email subject line",
  "content": "Email body content here..."
}
```

### Response Format:
```json
{
  "isSpam": true/false,
  "confidence": 0-100,
  "reasons": ["list", "of", "triggers"],
  "riskLevel": "low/medium/high"
}
```

---

## Testing Examples

### Example 1: Obvious Phishing Email (High Risk)

**PowerShell:**
```powershell
$body = @{
    sender = 'noreply@freeemail.com'
    subject = 'URGENT: Account Suspended - Immediate Action Required'
    content = 'Your bank account will be closed. Please verify your password and credit card details at http://suspicious-link.com immediately.'
} | ConvertTo-Json

(Invoke-WebRequest -Uri http://localhost:5000/analyze-email -Method POST -Body $body -ContentType 'application/json').Content | ConvertFrom-Json | ConvertTo-Json
```

**Expected Result:**
```json
{
  "isSpam": true,
  "confidence": 60-100,
  "reasons": [
    "Suspicious Sender",
    "Urgent Subject",
    "Suspicious Links",
    "Sensitive Words"
  ],
  "riskLevel": "high"
}
```

---

### Example 2: Moderate Risk Spam

**PowerShell:**
```powershell
$body = @{
    sender = 'promo@tempdomain.com'
    subject = 'Limited time offer - Act now!'
    content = 'Click here http://example.com to claim your prize.'
} | ConvertTo-Json

(Invoke-WebRequest -Uri http://localhost:5000/analyze-email -Method POST -Body $body -ContentType 'application/json').Content | ConvertFrom-Json | ConvertTo-Json
```

**Expected Result:**
```json
{
  "isSpam": true,
  "confidence": 40-70,
  "reasons": [
    "Suspicious Sender",
    "Suspicious Links"
  ],
  "riskLevel": "medium"
}
```

---

### Example 3: Legitimate Email (Low Risk)

**PowerShell:**
```powershell
$body = @{
    sender = 'support@mycompany.com'
    subject = 'Weekly Newsletter - January 2026'
    content = 'Hello! Here are this weeks updates and interesting articles from our team.'
} | ConvertTo-Json

(Invoke-WebRequest -Uri http://localhost:5000/analyze-email -Method POST -Body $body -ContentType 'application/json').Content | ConvertFrom-Json | ConvertTo-Json
```

**Expected Result:**
```json
{
  "isSpam": false,
  "confidence": 0,
  "reasons": [],
  "riskLevel": "low"
}
```

---

## Real-World Spam Email Characteristics to Test

### 🚩 Common Spam Triggers:

1. **Suspicious Sender Domains:**
   - `@freedomain.com`
   - `@tempemail.com`
   - `@disposablemail.com`

2. **Urgent Subject Keywords:**
   - "URGENT"
   - "IMMEDIATE ACTION REQUIRED"
   - "ACCOUNT SUSPENDED"
   - "VERIFY NOW"

3. **Sensitive Information Requests:**
   - Password
   - Credit card
   - SSN / Social security
   - Bank account
   - PIN

4. **Suspicious Content Patterns:**
   - Multiple URLs
   - Shortened links
   - Misspelled domains
   - Impersonating known companies

---

## Python Testing Script

Create `test_spam_detection.py`:

```python
import requests
import json

def test_email(sender, subject, content):
    """Test email spam detection"""
    url = "http://localhost:5000/analyze-email"
    
    data = {
        "sender": sender,
        "subject": subject,
        "content": content
    }
    
    response = requests.post(url, json=data)
    result = response.json()
    
    print(f"\n{'='*60}")
    print(f"SENDER: {sender}")
    print(f"SUBJECT: {subject}")
    print(f"{'='*60}")
    print(f"Is Spam: {result['isSpam']}")
    print(f"Confidence: {result['confidence']}%")
    print(f"Risk Level: {result['riskLevel']}")
    print(f"Reasons: {', '.join(result['reasons']) if result['reasons'] else 'None'}")
    print(f"{'='*60}\n")

# Test cases
test_email(
    "urgent@freedomain.com",
    "URGENT: Your account has been suspended!",
    "Dear user, verify your password and credit card at http://phishing.com"
)

test_email(
    "support@company.com",
    "Monthly Newsletter",
    "Here are this month's updates and news."
)
```

Run with: `python test_spam_detection.py`

---

## Getting Real Spam Emails for Testing

### Option 1: Use Public Spam Datasets
- **SpamAssassin Public Corpus**: https://spamassassin.apache.org/old/publiccorpus/
- **Enron Spam Dataset**: Available on Kaggle
- **CEAS Spam Email Dataset**: Research email datasets

### Option 2: Create Synthetic Test Cases
Use the patterns above to create realistic test cases covering:
- Banking phishing attempts
- Prize/lottery scams
- Tech support scams
- Invoice/payment scams
- Package delivery scams

### Option 3: Forward Your Spam
Check your personal email spam folder and use those as test cases (remove any real personal data first!)

---

## Integration Tips

### Using with Chrome Extension
The email analyzer can be integrated with:
- Gmail
- Outlook
- Other webmail clients

### API Integration Example (JavaScript):
```javascript
async function analyzeEmail(emailData) {
    const response = await fetch('http://localhost:5000/analyze-email', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData)
    });
    
    return await response.json();
}

// Usage
const result = await analyzeEmail({
    sender: 'test@example.com',
    subject: 'Test Email',
    content: 'Email content...'
});

console.log(result);
```

---

## Notes

⚠️ **Current Implementation**: The email spam detection uses a threshold-based approach. For production use, consider training a dedicated ML model on email spam datasets.

💡 **Improvement Suggestions**:
- Train with labeled spam email datasets
- Add header analysis (SPF, DKIM, DMARC)
- Include IP reputation checking
- Add attachment scanning
- Implement sender profile analysis
