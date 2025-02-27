// Debug logging function
function debugLog(message, data = null) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage, data || '');
}

// Configuration for the API endpoints
const API_ENDPOINTS = {
  email: 'http://localhost:5000/analyze-email',
  url: 'http://localhost:5000/analyze-url'
};

// Keep service worker alive
let keepAliveInterval;
function keepAlive() {
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
  }
  keepAliveInterval = setInterval(() => {
    debugLog('Service worker ping');
  }, 20000);
}

// Function to show popup notification
function showNotification(result, type) {
  const title = result.isPhishing ? 'Warning: Potential Phishing Detected!' : 'Security Check Passed';
  const iconPath = result.isPhishing ? 'icons/warning.png' : 'icons/safe.png';
  
  let message = '';
  if (result.isPhishing) {
    message = `Risk Level: ${result.riskLevel.toUpperCase()}\n`;
    message += `Confidence: ${Math.round(result.confidence)}%\n`;
    message += 'Reasons:\n' + result.reasons.join('\n');
  } else {
    message = 'No phishing threats detected.';
  }

  chrome.notifications.create({
    type: 'basic',
    iconUrl: iconPath,
    title: title,
    message: message,
    priority: result.isPhishing ? 2 : 0,
    requireInteraction: result.isPhishing
  });
}

// Function to handle API errors gracefully and retry if needed
async function fetchWithRetry(url, options, retries = 3, delay = 2000) {
  let lastError;
  
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      lastError = error;
      debugLog(`API request attempt ${i + 1} failed:`, error);
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

// Function to analyze a URL
async function analyzeUrl(url) {
  try {
    debugLog('Starting URL analysis for:', url);
    
    if (!url) {
      throw new Error('No URL provided');
    }
    
    const response = await fetchWithRetry(API_ENDPOINTS.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url })
    });
    
    debugLog('Raw API response:', response);
    return {
      isPhishing: Boolean(response.isPhishing),
      confidence: Number(response.confidence) || 0,
      reasons: Array.isArray(response.reasons) ? response.reasons : [],
      riskLevel: response.riskLevel || 'unknown',
      url: response.url
    };
  } catch (error) {
    debugLog('Error in analyzeUrl:', error);
    throw error;
  }
}

// Function to analyze an email
async function analyzeEmail(emailData) {
  try {
    debugLog('Starting email analysis for:', emailData);
    
    if (!emailData || !emailData.subject || !emailData.sender || !emailData.content) {
      throw new Error('Invalid email data: Missing required fields');
    }
    
    const response = await fetchWithRetry(API_ENDPOINTS.email, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subject: emailData.subject,
        sender: emailData.sender,
        content: emailData.content,
        headers: emailData.headers || {}
      })
    });
    
    debugLog('Raw API response:', response);
    return {
      isPhishing: Boolean(response.isPhishing),
      confidence: Number(response.confidence) || 0,
      reasons: Array.isArray(response.reasons) ? response.reasons : [],
      riskLevel: response.riskLevel || 'unknown'
    };
  } catch (error) {
    debugLog('Error in analyzeEmail:', error);
    throw error;
  }
}

// Initialize message listeners with async wrapper
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  debugLog('Received message:', request);
  
  // Keep service worker alive
  keepAlive();
  
  const handleRequest = async () => {
    try {
      let result;
      
      if (request.action === 'analyzeUrl') {
        result = await analyzeUrl(request.url);
        if (result.isPhishing) {
          showNotification(result, 'url');
        }
      } else if (request.action === 'analyzeEmail') {
        result = await analyzeEmail(request.emailData);
        if (result.isPhishing) {
          showNotification(result, 'email');
        }
      } else {
        throw new Error('Unknown action');
      }
      
      return result;
    } catch (error) {
      debugLog('Error handling request:', error);
      return {
        error: error.message || 'Analysis failed',
        isPhishing: false,
        confidence: 0,
        reasons: [],
        riskLevel: 'unknown'
      };
    }
  };
  
  // Handle the request and keep the message channel open
  handleRequest().then(sendResponse);
  return true; // Will respond asynchronously
});

// Initialize service worker
debugLog('Background service worker initializing');
keepAlive();

// Handle installation and updates
chrome.runtime.onInstalled.addListener(() => {
  debugLog('Extension installed/updated');
  keepAlive();
});

// Handle startup
chrome.runtime.onStartup.addListener(() => {
  debugLog('Extension started');
  keepAlive();
});