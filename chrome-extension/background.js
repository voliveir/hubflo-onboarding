// Background service worker for Chrome extension
// Handles API calls and other background tasks

chrome.runtime.onInstalled.addListener(() => {
  console.log('Hubflo Implementation Manager extension installed');
  
  // Set default settings
  chrome.storage.sync.set({
    apiUrl: 'https://implementhubflo.com'
  });
});

// Open side panel when extension icon is clicked
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ windowId: tab.windowId });
});

// Handle messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getApiUrl') {
    chrome.storage.sync.get(['apiUrl'], (result) => {
      sendResponse({ apiUrl: result.apiUrl || 'https://implementhubflo.com' });
    });
    return true; // Keep channel open for async response
  }
  
  if (request.action === 'injectAuth') {
    // Inject authentication script into the page
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].url && (tabs[0].url.includes('implementhubflo.com') || tabs[0].url.includes('localhost:3000'))) {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: () => {
            const SESSION_KEY = 'hubflo_admin_authenticated';
            sessionStorage.setItem(SESSION_KEY, 'true');
            window.dispatchEvent(new CustomEvent('hubfloExtensionAuth', { detail: { authenticated: true } }));
            // Reload if on admin page
            if (window.location.pathname.startsWith('/admin')) {
              window.location.reload();
            }
          }
        });
      }
    });
    sendResponse({ success: true });
    return true;
  }
});

// Auto-inject auth when tabs are updated (for implementhubflo.com)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && 
      (tab.url.includes('implementhubflo.com') || tab.url.includes('localhost:3000'))) {
    // Content script should handle this, but we can also inject here as backup
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: () => {
        const SESSION_KEY = 'hubflo_admin_authenticated';
        if (!sessionStorage.getItem(SESSION_KEY)) {
          sessionStorage.setItem(SESSION_KEY, 'true');
          window.dispatchEvent(new CustomEvent('hubfloExtensionAuth', { detail: { authenticated: true } }));
        }
      }
    }).catch(() => {
      // Ignore errors (e.g., chrome-extension:// pages)
    });
  }
});

