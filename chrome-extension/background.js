// Background service worker for Chrome extension
// Handles API calls and other background tasks

// --- Automatic browser activity tracking (Activity Timeline / Memory Aid) ---
const MIN_DURATION_SECONDS = 3; // Ignore sessions shorter than this
const TRACKABLE_PROTOCOLS = ['http:', 'https:'];

function isTrackableUrl(url) {
  if (!url) return false;
  try {
    const u = new URL(url);
    return TRACKABLE_PROTOCOLS.includes(u.protocol);
  } catch {
    return false;
  }
}

function getDomain(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

async function saveActivity(apiUrl, activity) {
  if (activity.duration_seconds < MIN_DURATION_SECONDS) return;
  try {
    const res = await fetch(`${apiUrl}/api/browser-activity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(activity)
    });
    if (!res.ok) {
      const errText = await res.text();
      console.warn('Hubflo: Activity save failed', res.status, errText);
    }
  } catch (err) {
    console.warn('Hubflo: Failed to save browser activity', err);
  }
}

async function handleTabSwitch(apiUrl, newTabId, newTabUrl, newTabTitle) {
  const result = await chrome.storage.session.get(['activeTabTracking']);
  const prev = result.activeTabTracking;

  const now = new Date().toISOString();
  if (prev && prev.tabId !== newTabId && isTrackableUrl(prev.url)) {
    const endedAt = new Date(prev.startedAt);
    const duration = Math.floor((Date.now() - endedAt.getTime()) / 1000);
    await saveActivity(apiUrl, {
      url: prev.url,
      domain: getDomain(prev.url),
      page_title: prev.title || null,
      started_at: prev.startedAt,
      ended_at: now,
      duration_seconds: duration
    });
  }

  if (isTrackableUrl(newTabUrl)) {
    await chrome.storage.session.set({
      activeTabTracking: { tabId: newTabId, url: newTabUrl, title: newTabTitle, startedAt: now }
    });
  } else {
    await chrome.storage.session.remove(['activeTabTracking']);
  }
}

async function runTabTracking(callback) {
  const result = await chrome.storage.sync.get(['apiUrl', 'autoTrack']);
  if (!result.autoTrack) return;
  const apiUrl = (result.apiUrl || 'https://implementhubflo.com').replace(/\/$/, '');
  await callback(apiUrl);
}

chrome.runtime.onInstalled.addListener(() => {
  console.log('Hubflo Implementation Manager extension installed');
  chrome.storage.sync.get(['apiUrl', 'autoAuth'], (result) => {
    const defaults = {
      apiUrl: result.apiUrl || 'https://implementhubflo.com',
      autoAuth: result.autoAuth !== false,
      autoTrack: result.autoTrack || false
    };
    chrome.storage.sync.set(defaults);
  });
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  await runTabTracking(async (apiUrl) => {
    try {
      const tab = await chrome.tabs.get(activeInfo.tabId);
      if (tab?.url) await handleTabSwitch(apiUrl, tab.id, tab.url, tab.title);
    } catch (_) { /* tab may have closed */ }
  });
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (!changeInfo.url || !tab?.active) return;
  await runTabTracking(async (apiUrl) => {
    await handleTabSwitch(apiUrl, tabId, tab.url, tab.title || changeInfo.title);
  });
});

chrome.runtime.onStartup.addListener(async () => {
  await runTabTracking(async (apiUrl) => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.url && isTrackableUrl(tab.url)) {
      await chrome.storage.session.set({
        activeTabTracking: {
          tabId: tab.id,
          url: tab.url,
          title: tab.title || null,
          startedAt: new Date().toISOString()
        }
      });
    }
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

