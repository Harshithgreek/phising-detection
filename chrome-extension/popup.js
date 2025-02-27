// Update statistics in the popup
function updateStats() {
  chrome.storage.local.get(['emailsScanned', 'urlsAnalyzed', 'threatsDetected'], (result) => {
    document.getElementById('emailsScanned').textContent = result.emailsScanned || 0;
    document.getElementById('urlsAnalyzed').textContent = result.urlsAnalyzed || 0;
    document.getElementById('threatsDetected').textContent = result.threatsDetected || 0;
  });
}

// Function to validate URL
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

// Function to display analysis result
function displayResult(result) {
  const resultDiv = document.getElementById('result');
  const resultText = document.getElementById('resultText');
  const reasonsDiv = document.getElementById('reasons');
  
  resultDiv.className = 'result ' + (result.isPhishing ? 'danger' : 'safe');
  
  if (result.error) {
    resultText.textContent = `Error: ${result.error}`;
    reasonsDiv.innerHTML = '';
    return;
  }
  
  // Update result text
  if (result.isPhishing) {
    resultText.innerHTML = `⚠️ Warning: Potential Phishing URL<br>Risk Level: ${result.riskLevel.toUpperCase()}<br>Confidence: ${Math.round(result.confidence)}%`;
  } else {
    resultText.innerHTML = '✅ URL appears to be safe';
  }
  
  // Update reasons
  if (result.reasons && result.reasons.length > 0) {
    reasonsDiv.innerHTML = '<div class="reason-title">Reasons:</div>' +
      result.reasons.map(reason => `<div class="reason-item">• ${reason}</div>`).join('');
  } else {
    reasonsDiv.innerHTML = '';
  }
  
  resultDiv.style.display = 'block';
}

// Function to analyze URL with timeout and retry
async function analyzeUrlWithRetry(url, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Request timed out'));
        }, 10000); // 10 second timeout

        chrome.runtime.sendMessage({ action: 'analyzeUrl', url: url }, response => {
          clearTimeout(timeoutId);
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else if (response && response.error) {
            reject(new Error(response.error));
          } else {
            resolve(response);
          }
        });
      });
      
      return result; // Success, return the result
    } catch (error) {
      console.warn(`Attempt ${attempt} failed:`, error);
      if (attempt === maxRetries) {
        throw error; // Rethrow if this was the last attempt
      }
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
}

// Function to analyze URL
async function analyzeUrl(url) {
  const analyzeBtn = document.getElementById('analyzeBtn');
  analyzeBtn.disabled = true;
  analyzeBtn.textContent = 'Analyzing...';
  
  try {
    const result = await analyzeUrlWithRetry(url);
    displayResult(result);
    
    // Update statistics
    chrome.storage.local.get(['urlsAnalyzed', 'threatsDetected'], (stats) => {
      const newStats = {
        urlsAnalyzed: (stats.urlsAnalyzed || 0) + 1,
        threatsDetected: (stats.threatsDetected || 0) + (result.isPhishing ? 1 : 0)
      };
      chrome.storage.local.set(newStats, updateStats);
    });
    
  } catch (error) {
    console.error('Analysis error:', error);
    displayResult({
      error: error.message || 'Failed to analyze URL',
      isPhishing: false,
      confidence: 0,
      reasons: [],
      riskLevel: 'unknown'
    });
  } finally {
    analyzeBtn.disabled = false;
    analyzeBtn.textContent = 'Analyze URL';
  }
}

// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
  // Initialize stats
  updateStats();
  
  // Set up URL analysis
  const urlInput = document.getElementById('urlInput');
  const analyzeBtn = document.getElementById('analyzeBtn');
  
  // Enable/disable analyze button based on input
  urlInput.addEventListener('input', () => {
    const url = urlInput.value.trim();
    analyzeBtn.disabled = !url || !isValidUrl(url);
  });
  
  // Handle analyze button click
  analyzeBtn.addEventListener('click', () => {
    const url = urlInput.value.trim();
    if (url && isValidUrl(url)) {
      analyzeUrl(url);
    }
  });
  
  // Handle Enter key in URL input
  urlInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      const url = urlInput.value.trim();
      if (url && isValidUrl(url)) {
        analyzeUrl(url);
      }
    }
  });
  
  // Keep popup active and update stats
  let isActive = true;
  const statsInterval = setInterval(() => {
    if (isActive) updateStats();
  }, 5000);
  
  // Clean up when popup closes
  window.addEventListener('unload', () => {
    isActive = false;
    clearInterval(statsInterval);
  });
});
