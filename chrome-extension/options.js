// Options page script

document.addEventListener('DOMContentLoaded', async () => {
  // Load saved settings
  const result = await chrome.storage.sync.get(['apiUrl', 'autoAuth']);
  if (result.apiUrl) {
    document.getElementById('apiUrl').value = result.apiUrl;
  }
  if (result.autoAuth !== undefined) {
    document.getElementById('autoAuth').checked = result.autoAuth;
  } else {
    // Default to true
    document.getElementById('autoAuth').checked = true;
  }

  // Save button
  document.getElementById('saveBtn').addEventListener('click', saveSettings);

  // Test button
  document.getElementById('testBtn').addEventListener('click', testConnection);
});

async function saveSettings() {
  const apiUrl = document.getElementById('apiUrl').value.trim();
  const autoAuth = document.getElementById('autoAuth').checked;
  
  if (!apiUrl) {
    showStatus('error', 'Please enter an API URL');
    return;
  }

  // Validate URL format
  try {
    new URL(apiUrl);
  } catch (e) {
    showStatus('error', 'Please enter a valid URL');
    return;
  }

  await chrome.storage.sync.set({ apiUrl, autoAuth });
  showStatus('success', 'Settings saved successfully!');
}

async function testConnection() {
  const apiUrl = document.getElementById('apiUrl').value.trim();
  const testBtn = document.getElementById('testBtn');
  
  if (!apiUrl) {
    showStatus('error', 'Please enter an API URL first');
    return;
  }

  testBtn.disabled = true;
  testBtn.textContent = '🔍 Testing...';
  showStatus('', '');

  try {
    const response = await fetch(`${apiUrl}/api/clients-list`);
    
    if (response.ok) {
      showStatus('success', 'Connection successful! ✓');
    } else {
      showStatus('error', `Connection failed: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    showStatus('error', `Connection error: ${error.message}`);
  } finally {
    testBtn.disabled = false;
    testBtn.textContent = '🔍 Test Connection';
  }
}

function showStatus(type, message) {
  const statusEl = document.getElementById('status');
  statusEl.textContent = message;
  statusEl.className = `status-message ${type}`;
  if (type) {
    statusEl.style.display = 'block';
  } else {
    statusEl.style.display = 'none';
  }
}

