// Content script to auto-authenticate when extension is installed
// This runs on implementhubflo.com pages

(function() {
  'use strict';
  
  // Check if auto-auth is enabled
  chrome.storage.sync.get(['autoAuth'], (result) => {
    // Default to true if not set
    if (result.autoAuth !== false) {
      // Inject script into page context (not isolated content script context)
      // This allows us to access sessionStorage
      function injectAuthScript() {
        const script = document.createElement('script');
        script.textContent = `
          (function() {
            const SESSION_KEY = 'hubflo_admin_authenticated';
            // Set authentication in sessionStorage
            sessionStorage.setItem(SESSION_KEY, 'true');
            
            // Dispatch event to notify that auth was set
            window.dispatchEvent(new CustomEvent('hubfloExtensionAuth', { detail: { authenticated: true } }));
          })();
        `;
        (document.head || document.documentElement).appendChild(script);
        script.remove();
      }

      // Run immediately if DOM is ready, otherwise wait
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectAuthScript);
      } else {
        injectAuthScript();
      }

      // Also listen for navigation events (SPA routing)
      let lastUrl = location.href;
      new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
          lastUrl = url;
          setTimeout(injectAuthScript, 100);
        }
      }).observe(document, { subtree: true, childList: true });
    }
  });
})();
