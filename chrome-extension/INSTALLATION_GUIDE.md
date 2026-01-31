# Chrome Extension Installation Guide
## Email & URL Phishing/Spam Detector

This Chrome extension automatically detects spam and phishing emails when you open them in Gmail, Outlook, or other webmail services. It shows an **immediate alert popup** when spam is detected!

---

## ✨ Features

- 🚨 **Instant Alert Popups** - Large, eye-catching alerts when spam emails are detected
- 📧 **Automatic Email Scanning** - Scans emails as you open them in Gmail/Outlook
- 🔗 **URL Analysis** - Detects phishing URLs on any webpage
- 🔔 **Browser Notifications** - System notifications for high-risk emails
- 🎯 **Risk Level Assessment** - Low, Medium, High risk classification
- 📊 **Detailed Reasons** - Shows why an email was flagged as spam

---

## 📋 Prerequisites

1. **Flask Application Running**
   - Make sure your Flask app is running on `http://localhost:5000`
   - Run: `python app.py` in your project directory
   - Verify it's working: `http://localhost:5000/health`

2. **Google Chrome Browser**
   - Version 88 or higher

---

## 🚀 Installation Steps

### Step 1: Navigate to Chrome Extensions

1. Open Google Chrome
2. Click the menu button (⋮) in the top-right corner
3. Go to **More Tools** → **Extensions**
   
   OR simply type in the address bar:
   ```
   chrome://extensions/
   ```

### Step 2: Enable Developer Mode

1. In the Extensions page, toggle **Developer mode** ON (top-right corner)
2. You should now see additional buttons: "Load unpacked", "Pack extension", etc.

### Step 3: Load the Extension

1. Click **"Load unpacked"** button
2. Navigate to your project directory:
   ```
   C:\Users\LENOVO\Downloads\Phishing-Detection-Advanced (2)\phising-detection\chrome-extension
   ```
3. Select the `chrome-extension` folder and click **"Select Folder"**

### Step 4: Verify Installation

You should see the extension appear with:
- ✅ Name: "Email & URL Phishing Detector"
- ✅ Version: 1.0
- ✅ Icon displayed in the extensions bar

---

## 🎯 How to Use

### Automatic Email Detection

1. **Open Gmail or Outlook** in Chrome
2. **Click on any email** to open it
3. **If spam is detected**, you'll see:
   - ⚠️ A **large popup alert** overlaying the screen with:
     - Warning icon (🚨 for high risk, ⚠️ for medium)
     - Confidence percentage
     - Risk level (HIGH/MEDIUM/LOW)
     - Specific reasons why it's flagged
     - Safety warning message
   - 📊 A **colored banner** at the top of the email showing the analysis
   - 🔔 A **browser notification** (if enabled)

4. **For legitimate emails**:
   - ✅ Green indicator showing "Legitimate Email"
   - No popup alert
   - No notifications

### Manual URL Checking

1. Click the extension icon in your toolbar
2. Enter a URL to check
3. View the analysis results

---

## 🔧 Troubleshooting

### Extension Not Working?

**Problem**: No alerts showing
- ✅ **Solution**: Make sure Flask app is running on `http://localhost:5000`
- Check: Open `http://localhost:5000/health` - should return `{"status": "healthy"}`

**Problem**: "Extension error" message
- ✅ **Solution**: 
  1. Go to `chrome://extensions/`
  2. Find your extension
  3. Click "Errors" button to see details
  4. Click "Reload" button (🔄) to refresh the extension

**Problem**: Alerts not appearing on Gmail
- ✅ **Solution**: 
  1. Reload the Gmail page (F5)
  2. Make sure you're opening individual emails (not in list view)
  3. Check browser console (F12) for any errors

**Problem**: "Could not establish connection" error
- ✅ **Solution**: The extension lost connection to background script
  1. Go to `chrome://extensions/`
  2. Click the reload button on the extension
  3. Refresh your email page

### Enable Browser Notifications

If you want to receive system notifications:

1. Go to `chrome://settings/content/notifications`
2. Make sure notifications are allowed
3. Add `https://mail.google.com` to allowed sites

---

## 🧪 Test the Extension

### Test with Spam Email

1. Open Gmail
2. Find or create a test email with:
   - Subject: "URGENT: Account Suspended - Action Required!"
   - Content containing: "verify your password and credit card"
   - Links to suspicious domains

**Expected Result**: 
- 🚨 Large alert popup appears immediately
- Red/orange warning banner in email
- Browser notification

### Test with Legitimate Email

1. Open any normal email (newsletter, work email, etc.)
2. **Expected Result**: 
   - ✅ Green "Legitimate Email" indicator
   - No popup alert

---

## 🎨 What the Alerts Look Like

### High-Risk Spam Alert
```
┌─────────────────────────────────────┐
│              🚨                     │
│     SPAM EMAIL DETECTED!            │
│                                     │
│  Confidence: 80%                    │
│  Risk Level: HIGH                   │
│  Reasons:                           │
│    • Suspicious Sender              │
│    • Urgent Subject                 │
│    • Sensitive Words                │
│                                     │
│  ⚠️ Warning: This email may be a   │
│  phishing attempt. Do not click     │
│  links or provide information.      │
│                                     │
│  [I Understand - Close Alert]       │
└─────────────────────────────────────┘
```

---

## 📚 Supported Email Providers

- ✅ **Gmail** (mail.google.com)
- ✅ **Outlook** (outlook.live.com)
- ⚠️ Other providers may work but are not fully tested

---

## 🔐 Privacy & Security

- ✅ **All analysis happens locally** on your machine (localhost:5000)
- ✅ **No data sent to external servers**
- ✅ Extension only accesses email content when you open it
- ✅ No email content is stored or logged

---

## ⚙️ Configuration

### Change API Endpoint

If your Flask app runs on a different port:

1. Open `chrome-extension/background.js`
2. Find line 9-12:
   ```javascript
   const API_ENDPOINTS = {
     email: 'http://localhost:5000/analyze-email',
     url: 'http://localhost:5000/analyze-url'
   };
   ```
3. Change `5000` to your port number
4. Reload the extension in Chrome

---

## 🐛 Debugging

### View Extension Logs

1. Go to `chrome://extensions/`
2. Click **"Inspect views: background page"** under your extension
3. This opens DevTools showing all background script logs

### View Content Script Logs

1. Open Gmail/Outlook
2. Press **F12** to open DevTools
3. Go to **Console** tab
4. Look for messages starting with `[timestamp]`

---

## 🔄 Updating the Extension

After making changes to the code:

1. Go to `chrome://extensions/`
2. Find your extension
3. Click the **reload button** (🔄)
4. Refresh any open email pages

---

## ❌ Uninstalling

1. Go to `chrome://extensions/`
2. Find "Email & URL Phishing Detector"
3. Click **Remove**
4. Confirm removal

---

## 📝 Notes

- Extension works best with **Flask app running**
- Alerts only appear when **spam is actually detected**
- The extension learns from the ML model's accuracy
- For best results, keep your Flask app updated with the latest model

---

## 🚀 Quick Start Checklist

- [ ] Flask app is running (`python app.py`)
- [ ] Extension is installed in Chrome
- [ ] Developer mode is enabled
- [ ] Tested on Gmail/Outlook
- [ ] Notifications are working

---

## 💡 Tips

1. **Keep Flask Running**: The extension needs the Flask API to be active
2. **Test Safely**: Use test emails or spam folder emails to test
3. **Check Confidence**: Higher confidence = more likely to be spam
4. **Read Reasons**: The reasons explain why it was flagged
5. **Stay Safe**: When unsure, trust the alert and don't click links!

---

## 📞 Support

If you encounter issues:
1. Check the Flask app logs (`app.log`)
2. Check browser console for errors (F12)
3. Verify API is responding: `curl http://localhost:5000/health`
4. Reload both extension and email page

---

**Enjoy safer email browsing! 🛡️**
