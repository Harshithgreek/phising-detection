// Debug logging function
function debugLog(message, data = null) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage, data || '');
}

// Email detection and analysis logic
const EMAIL_PROVIDERS = {
  'gmail': {
    emailSelector: 'div[role="main"] .adn.ads',
    subjectSelector: '.hP',
    senderSelector: '.gD',
    contentSelector: '.a3s.aiL'
  },
  'outlook': {
    emailSelector: '._1_q',
    subjectSelector: '._2oul',
    senderSelector: '._2OCF',
    contentSelector: '._2Qk5'
  }
};

// Function to determine the email provider
function getEmailProvider() {
  const hostname = window.location.hostname;
  debugLog('Checking hostname:', hostname);
  if (hostname.includes('gmail')) return 'gmail';
  if (hostname.includes('outlook')) return 'outlook';
  return null;
}

// Function to create and show warning overlay for URLs
function createUrlWarningOverlay(element, result) {
  const overlay = document.createElement('div');
  overlay.style.position = 'absolute';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.right = '0';
  overlay.style.bottom = '0';
  overlay.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
  overlay.style.zIndex = '1000';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.pointerEvents = 'none';
  
  const warning = document.createElement('div');
  warning.style.backgroundColor = '#ffebee';
  warning.style.color = '#c62828';
  warning.style.padding = '5px 10px';
  warning.style.borderRadius = '4px';
  warning.style.fontSize = '12px';
  warning.style.fontWeight = 'bold';
  warning.textContent = `⚠️ Potential Phishing URL (${Math.round(result.confidence)}% confidence)`;
  
  overlay.appendChild(warning);
  
  const parent = element.parentElement;
  if (parent) {
    parent.style.position = 'relative';
    parent.appendChild(overlay);
  }
}

// Function to analyze URLs on the page
async function analyzePageUrls() {
  const links = document.getElementsByTagName('a');
  debugLog(`Found ${links.length} links on page`);
  
  for (const link of links) {
    if (link.hasAttribute('data-analyzed')) continue;
    
    const url = link.href;
    if (!url || url.startsWith('javascript:')) continue;
    
    link.setAttribute('data-analyzed', 'true');
    
    try {
      const result = await new Promise((resolve) => {
        chrome.runtime.sendMessage({
          action: 'analyzeUrl',
          url: url
        }, (response) => {
          const lastError = chrome.runtime.lastError;
          if (lastError) {
            debugLog('Chrome runtime error:', lastError);
            resolve({
              error: lastError.message,
              isPhishing: false,
              confidence: 0,
              reasons: [],
              riskLevel: 'unknown'
            });
            return;
          }
          resolve(response);
        });
      });
      
      debugLog('URL analysis result:', result);
      
      if (result.isPhishing) {
        createUrlWarningOverlay(link, result);
        
        // Add warning styles to the link
        link.style.color = '#c62828';
        link.style.backgroundColor = '#ffebee';
        link.style.padding = '2px 4px';
        link.style.borderRadius = '2px';
        link.title = `Warning: Potential phishing URL\nConfidence: ${Math.round(result.confidence)}%\nReasons:\n${result.reasons.join('\n')}`;
      }
    } catch (error) {
      debugLog('Error analyzing URL:', error);
    }
  }
}

// Function to extract email data
function extractEmailData(emailElement, provider) {
  try {
    debugLog('Extracting data for provider:', provider);
    const selectors = EMAIL_PROVIDERS[provider];
    debugLog('Using selectors:', selectors);

    const subjectElement = emailElement.querySelector(selectors.subjectSelector);
    const senderElement = emailElement.querySelector(selectors.senderSelector);
    const contentElement = emailElement.querySelector(selectors.contentSelector);

    debugLog('Found elements:', {
      subject: !!subjectElement,
      sender: !!senderElement,
      content: !!contentElement
    });

    const data = {
      subject: subjectElement?.textContent?.trim() || '',
      sender: senderElement?.textContent?.trim() || '',
      content: contentElement?.textContent?.trim() || '',
      headers: {}
    };

    debugLog('Extracted data:', data);
    return data;
  } catch (error) {
    debugLog('Error extracting email data:', error);
    return {
      subject: '',
      sender: '',
      content: '',
      headers: {}
    };
  }
}

// Function to create and insert the status indicator
function createStatusIndicator(emailElement, analysisResult) {
  try {
    debugLog('Creating indicator with result:', analysisResult);

    const result = analysisResult || {
      isPhishing: false,
      confidence: 0,
      reasons: [],
      riskLevel: 'unknown',
      error: 'No analysis result'
    };

    const indicator = document.createElement('div');
    indicator.style.padding = '5px 10px';
    indicator.style.margin = '5px 0';
    indicator.style.borderRadius = '4px';
    indicator.style.fontWeight = 'bold';
    indicator.style.fontSize = '12px';
    indicator.style.fontFamily = 'Arial, sans-serif';

    if (!analysisResult || result.error) {
      indicator.style.backgroundColor = '#fff3e0';
      indicator.style.color = '#e65100';
      indicator.textContent = `⚠️ Analysis Error: ${result.error || 'Unknown error'}`;
    } else if (result.isPhishing) {
      indicator.style.backgroundColor = '#ffebee';
      indicator.style.color = '#c62828';
      indicator.textContent = `⚠️ Potential Phishing (${Math.round(result.confidence)}% confidence)`;
      if (result.reasons && result.reasons.length > 0) {
        const reasonsList = document.createElement('div');
        reasonsList.style.fontSize = '11px';
        reasonsList.style.marginTop = '3px';
        reasonsList.textContent = `Reasons: ${result.reasons.join(', ')}`;
        indicator.appendChild(reasonsList);
      }
    } else {
      indicator.style.backgroundColor = '#e8f5e9';
      indicator.style.color = '#2e7d32';
      indicator.textContent = '✅ Legitimate Email';
    }

    const existingIndicator = emailElement.querySelector('.email-analysis-indicator');
    if (existingIndicator) {
      existingIndicator.remove();
    }

    indicator.className = 'email-analysis-indicator';
    emailElement.insertAdjacentElement('afterbegin', indicator);
    debugLog('Indicator created and inserted');
  } catch (error) {
    debugLog('Error creating indicator:', error);
  }
}

// Function to analyze a single email
async function analyzeSingleEmail(emailElement, provider) {
  try {
    debugLog('Starting single email analysis');
    const emailData = extractEmailData(emailElement, provider);
    
    debugLog('Sending message to background script');
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({
        action: 'analyzeEmail',
        emailData: emailData
      }, (response) => {
        const lastError = chrome.runtime.lastError;
        if (lastError) {
          debugLog('Chrome runtime error:', lastError);
          resolve({
            error: lastError.message,
            isPhishing: false,
            confidence: 0,
            reasons: [],
            riskLevel: 'unknown'
          });
          return;
        }
        debugLog('Received response from background:', response);
        resolve(response || {
          error: 'No response from analyzer',
          isPhishing: false,
          confidence: 0,
          reasons: [],
          riskLevel: 'unknown'
        });
      });
    });
  } catch (error) {
    debugLog('Error in analyzeSingleEmail:', error);
    return {
      error: error.message,
      isPhishing: false,
      confidence: 0,
      reasons: [],
      riskLevel: 'unknown'
    };
  }
}

// Main function to analyze emails
async function analyzeEmails() {
  try {
    debugLog('Starting email analysis');
    
    const provider = getEmailProvider();
    if (!provider) {
      debugLog('No supported email provider detected');
      return;
    }
    
    debugLog('Provider detected:', provider);
    const emails = document.querySelectorAll(EMAIL_PROVIDERS[provider].emailSelector);
    debugLog('Found emails:', emails.length);
    
    for (const emailElement of emails) {
      if (emailElement.hasAttribute('data-analyzed')) {
        debugLog('Email already analyzed, skipping');
        continue;
      }
      
      emailElement.setAttribute('data-analyzed', 'true');
      
      try {
        const result = await analyzeSingleEmail(emailElement, provider);
        debugLog('Analysis result:', result);
        createStatusIndicator(emailElement, result);
      } catch (error) {
        debugLog('Error analyzing email:', error);
        createStatusIndicator(emailElement, {
          error: error.message,
          isPhishing: false,
          confidence: 0,
          reasons: [],
          riskLevel: 'unknown'
        });
      }
    }
  } catch (error) {
    debugLog('Error in analyzeEmails:', error);
  }
}

// Initialize when the page loads
window.addEventListener('load', () => {
  debugLog('Page loaded, starting analysis');
  
  // Analyze emails if we're on an email provider
  const provider = getEmailProvider();
  if (provider) {
    analyzeEmails();
    
    // Set up observer for new emails
    const emailContainer = document.querySelector('div[role="main"]');
    if (emailContainer) {
      debugLog('Setting up observer for new emails');
      const observer = new MutationObserver(() => {
        debugLog('New content detected, checking for emails');
        analyzeEmails();
      });
      
      observer.observe(emailContainer, {
        childList: true,
        subtree: true
      });
    }
  }
  
  // Analyze URLs on the page
  analyzePageUrls();
  
  // Set up observer for dynamic content
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.addedNodes.length > 0) {
        debugLog('New content detected, checking for URLs');
        analyzePageUrls();
      }
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
});

// Content script to extract additional page information if needed
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getPageInfo') {
    const pageInfo = {
      title: document.title,
      forms: document.forms.length,
      links: document.links.length,
      images: document.images.length,
      hasPasswordField: !!document.querySelector('input[type="password"]'),
      hasLoginForm: !!document.querySelector('form'),
    };
    sendResponse(pageInfo);
  }
  return true;
});
