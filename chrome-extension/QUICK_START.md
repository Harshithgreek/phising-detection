# 🚀 QUICK START - Install Chrome Extension

## Step 1: Open Chrome Extensions
Type in address bar:
```
chrome://extensions/
```

## Step 2: Enable Developer Mode
Toggle "Developer mode" ON (top-right corner)

## Step 3: Load Extension
1. Click "Load unpacked"
2. Navigate to:
   ```
   C:\Users\LENOVO\Downloads\Phishing-Detection-Advanced (2)\phising-detection\chrome-extension
   ```
3. Select the `chrome-extension` folder
4. Click "Select Folder"

## Step 4: Verify
✅ Extension should appear with icon
✅ Name: "Email & URL Phishing Detector"

---

## ✅ Make Sure Flask is Running!

Before testing, run in terminal:
```powershell
cd "c:\Users\LENOVO\Downloads\Phishing-Detection-Advanced (2)\phising-detection"
python app.py
```

Check it's working:
```
http://localhost:5000/health
```

Should return: `{"model_loaded": true, "status": "healthy"}`

---

## 🧪 Test It

1. Open **Gmail** in Chrome
2. Open any email
3. **If spam**: 🚨 BIG ALERT POPUP appears!
4. **If safe**: ✅ Green indicator, no popup

---

## 🎯 What You'll See

### When Spam is Detected:
```
┌─────────────────────────────┐
│          🚨                 │
│  SPAM EMAIL DETECTED!       │
│                             │
│  Confidence: XX%            │
│  Risk Level: HIGH/MEDIUM    │
│  Reasons: [list]            │
│                             │
│  ⚠️ Warning: Don't click!   │
│                             │
│  [I Understand - Close]     │
└─────────────────────────────┘
```

### When Email is Safe:
```
✅ Legitimate Email
```

---

## 📞 Troubleshooting

**No alerts?**
- Reload extension: chrome://extensions/ → click 🔄
- Refresh Gmail page
- Check Flask is running

**Extension error?**
- Click "Errors" button in chrome://extensions/
- Fix any issues shown
- Click reload

---

**That's it! You're protected! 🛡️**
