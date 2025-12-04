// Configuration
const DEFAULT_API_URL = 'https://implementhubflo.com';

// State
let clients = [];
let currentClient = null;
let currentTab = 'time';
let recentTimeEntries = [];
let editingEntryId = null;
let timeSummary = null;
let filteredEntries = [];
let timeTemplates = [];
let tasks = [];
let editingTaskId = null;
let activeFilters = {
  dateRange: 'all',
  dateFrom: '',
  dateTo: '',
  activityType: 'all',
  client: 'all'
};

// ROI Constants
const HOURLY_RATE = 85; // Fully loaded cost of implementation hourly rate

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  loadTheme();
  setupTabs();
  setupEventListeners();
  setupSearchableDropdown();
  setupModalListeners();
  setupKeyboardShortcuts();
  await loadClients();
  setTodayDate();
  loadRecentClients();
  loadTemplates();
  loadTasks();
  
  // Initially hide white label tab (will show when client with white_label is selected)
  updateWhiteLabelTabVisibility();
  
  // Load today's summary on init
  loadTodaySummary();
});

// Load settings from storage
async function loadSettings() {
  const result = await chrome.storage.sync.get(['apiUrl']);
  window.API_URL = result.apiUrl || DEFAULT_API_URL;
}

// Setup tab switching
function setupTabs() {
  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.dataset.tab;
      
      // Update active tab
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Update active content
      tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === `${targetTab}Tab`) {
          content.classList.add('active');
        }
      });
      
      currentTab = targetTab;
      
      // Load activity timeline when switching to activity tab
      if (targetTab === 'activity' && currentClient) {
        loadActivityTimeline();
      }
      
      // Refresh tasks when switching to tasks tab
      if (targetTab === 'tasks') {
        displayTasks();
        updateTaskStats();
        updateTaskClientFilter();
      }
    });
  });
}

// Setup event listeners
function setupEventListeners() {
  // Settings button
  document.getElementById('settingsBtn').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });


  // Client selector is now handled by setupSearchableDropdown()
  // The hidden input will be updated when a client is selected from the dropdown

  // Save buttons
  document.getElementById('saveTimeBtn').addEventListener('click', saveTimeEntry);
  document.getElementById('saveClientBtn').addEventListener('click', saveClient);
  document.getElementById('saveTrackingBtn').addEventListener('click', saveTracking);
  document.getElementById('saveWhiteLabelBtn').addEventListener('click', saveWhiteLabel);

  // Tracking increment buttons - use event delegation since buttons are in tab content
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-increment')) {
      const field = e.target.dataset.field;
      const delta = parseInt(e.target.dataset.delta);
      incrementTracking(field, delta);
    }
  });

  // Quick status update
  const quickStatusSelect = document.getElementById('quickStatusSelect');
  if (quickStatusSelect) {
    quickStatusSelect.addEventListener('change', async (e) => {
      const newStatus = e.target.value;
      if (newStatus && currentClient) {
        await updateClientStatus(newStatus);
        e.target.value = '';
      }
    });
  }

  // Client notes toggle
  const toggleNotesBtn = document.getElementById('toggleNotesBtn');
  if (toggleNotesBtn) {
    toggleNotesBtn.addEventListener('click', toggleNotesView);
  }

  // Refresh entries button
  const refreshEntriesBtn = document.getElementById('refreshEntriesBtn');
  if (refreshEntriesBtn) {
    refreshEntriesBtn.addEventListener('click', () => {
      if (currentClient) {
        loadRecentEntries(currentClient.id);
        loadTodaySummary();
      }
    });
  }

  // Theme toggle
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleTheme);
  }

  // Client filters
  const clientFiltersBtn = document.getElementById('clientFiltersBtn');
  if (clientFiltersBtn) {
    clientFiltersBtn.addEventListener('click', () => {
      const panel = document.getElementById('clientFiltersPanel');
      panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    });
  }

  const clearFiltersBtn = document.getElementById('clearFiltersBtn');
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', clearClientFilters);
  }

  // Time filters
  const toggleFiltersBtn = document.getElementById('toggleFiltersBtn');
  if (toggleFiltersBtn) {
    toggleFiltersBtn.addEventListener('click', () => {
      const panel = document.getElementById('timeFiltersPanel');
      panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
      toggleFiltersBtn.textContent = panel.style.display === 'none' ? '▼' : '▲';
    });
  }

  const filterDateRange = document.getElementById('filterDateRange');
  if (filterDateRange) {
    filterDateRange.addEventListener('change', (e) => {
      const customRange = document.getElementById('customDateRange');
      const customRangeTo = document.getElementById('customDateRangeTo');
      if (e.target.value === 'custom') {
        customRange.style.display = 'flex';
        customRangeTo.style.display = 'flex';
      } else {
        customRange.style.display = 'none';
        customRangeTo.style.display = 'none';
      }
    });
  }

  const applyFiltersBtn = document.getElementById('applyFiltersBtn');
  if (applyFiltersBtn) {
    applyFiltersBtn.addEventListener('click', applyTimeFilters);
  }

  const clearTimeFiltersBtn = document.getElementById('clearTimeFiltersBtn');
  if (clearTimeFiltersBtn) {
    clearTimeFiltersBtn.addEventListener('click', clearTimeFilters);
  }

  // Templates
  const addTemplateBtn = document.getElementById('addTemplateBtn');
  if (addTemplateBtn) {
    addTemplateBtn.addEventListener('click', openSaveTemplateModal);
  }

  const saveTemplateBtn = document.getElementById('saveTemplateBtn');
  if (saveTemplateBtn) {
    saveTemplateBtn.addEventListener('click', saveTemplate);
  }

  const closeTemplateModalBtn = document.getElementById('closeTemplateModalBtn');
  if (closeTemplateModalBtn) {
    closeTemplateModalBtn.addEventListener('click', closeSaveTemplateModal);
  }

  const cancelTemplateBtn = document.getElementById('cancelTemplateBtn');
  if (cancelTemplateBtn) {
    cancelTemplateBtn.addEventListener('click', closeSaveTemplateModal);
  }

  // Tasks
  const addTaskBtn = document.getElementById('addTaskBtn');
  if (addTaskBtn) {
    addTaskBtn.addEventListener('click', () => openTaskModal());
  }

  const saveTaskBtn = document.getElementById('saveTaskBtn');
  if (saveTaskBtn) {
    saveTaskBtn.addEventListener('click', saveTask);
  }

  const closeTaskModalBtn = document.getElementById('closeTaskModalBtn');
  if (closeTaskModalBtn) {
    closeTaskModalBtn.addEventListener('click', closeTaskModal);
  }

  const cancelTaskBtn = document.getElementById('cancelTaskBtn');
  if (cancelTaskBtn) {
    cancelTaskBtn.addEventListener('click', closeTaskModal);
  }

  const deleteTaskBtn = document.getElementById('deleteTaskBtn');
  if (deleteTaskBtn) {
    deleteTaskBtn.addEventListener('click', deleteTask);
  }

  const taskFilter = document.getElementById('taskFilter');
  if (taskFilter) {
    taskFilter.addEventListener('change', displayTasks);
  }

  const taskClientFilter = document.getElementById('taskClientFilter');
  if (taskClientFilter) {
    taskClientFilter.addEventListener('change', () => {
      displayTasks();
      updateTaskStats();
    });
  }
}

// Setup modal listeners
function setupModalListeners() {
  const modal = document.getElementById('editEntryModal');
  const closeBtn = document.getElementById('closeModalBtn');
  const saveEditBtn = document.getElementById('saveEditEntryBtn');
  const deleteBtn = document.getElementById('deleteEntryBtn');

  if (closeBtn) {
    closeBtn.addEventListener('click', closeEditModal);
  }

  if (saveEditBtn) {
    saveEditBtn.addEventListener('click', saveEditedEntry);
  }

  if (deleteBtn) {
    deleteBtn.addEventListener('click', deleteTimeEntry);
  }

  // Close modal when clicking outside
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeEditModal();
      }
    });
  }

  // Close task modal when clicking outside
  const taskModal = document.getElementById('taskModal');
  if (taskModal) {
    taskModal.addEventListener('click', (e) => {
      if (e.target === taskModal) {
        closeTaskModal();
      }
    });
  }
}

// Set today's date as default
function setTodayDate() {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('date').value = today;
}

// Load clients list
async function loadClients() {
  const dropdown = document.getElementById('clientDropdown');
  const searchInput = document.getElementById('clientSearchInput');
  
  try {
    dropdown.innerHTML = '<div class="dropdown-loading">Loading clients...</div>';
    dropdown.style.display = 'block';

    const response = await fetch(`${window.API_URL}/api/clients-list`);
    
    if (!response.ok) {
      throw new Error('Failed to load clients');
    }

    const allClients = await response.json();
    
    // Filter to only Vanessa's clients (exclude Vishal and others)
    // Include clients with null/undefined implementation_manager (defaults to Vanessa)
    clients = allClients.filter(client => {
      const manager = client.implementation_manager?.toLowerCase();
      // Include if null/undefined (defaults to Vanessa) or explicitly 'vanessa'
      // Exclude if explicitly 'vishal' or any other value
      return !manager || manager === 'vanessa';
    });
    
    // Render dropdown list
    renderClientDropdown(clients);
    
    // Update task client dropdown if modal is open
    if (document.getElementById('taskModal').style.display === 'flex') {
      const taskClientSearch = document.getElementById('taskClientSearch');
      const taskClientDropdown = document.getElementById('taskClientDropdown');
      if (taskClientSearch && taskClientDropdown && clients.length > 0) {
        // Re-render dropdown if it's visible
        if (taskClientDropdown.style.display === 'block') {
          const searchTerm = taskClientSearch.value;
          // Re-render will be handled by setupTaskClientDropdown when user interacts
        }
      }
    }
    
  } catch (error) {
    console.error('Error loading clients:', error);
    dropdown.innerHTML = '<div class="dropdown-empty">Error loading clients</div>';
  }
}

// Render client dropdown list
function renderClientDropdown(clientsToRender, searchTerm = '') {
  const dropdown = document.getElementById('clientDropdown');
  const searchInput = document.getElementById('clientSearchInput');
  
  if (!clientsToRender || clientsToRender.length === 0) {
    dropdown.innerHTML = '<div class="dropdown-empty">No clients found</div>';
    dropdown.style.display = 'block';
    return;
  }

  // Filter clients based on search term
  const filtered = searchTerm 
    ? clientsToRender.filter(client => 
        client.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : clientsToRender;

  if (filtered.length === 0) {
    dropdown.innerHTML = '<div class="dropdown-empty">No clients match your search</div>';
    dropdown.style.display = 'block';
    return;
  }

  dropdown.innerHTML = filtered.map(client => `
    <div class="dropdown-item" data-client-id="${client.id}" data-client-name="${escapeHtml(client.name)}">
      <div class="dropdown-item-name">${escapeHtml(client.name)}</div>
      <div class="dropdown-item-meta">ACV: $${formatNumber(client.revenue_amount || 0)}</div>
    </div>
  `).join('');

  // Add click handlers
  document.querySelectorAll('.dropdown-item').forEach(item => {
    item.addEventListener('click', () => {
      const clientId = item.dataset.clientId;
      const clientName = item.dataset.clientName;
      
      // Update hidden input and search input
      document.getElementById('clientSelectMain').value = clientId;
      searchInput.value = clientName;
      searchInput.dataset.clientId = clientId;
      dropdown.style.display = 'none';
      
      // Show loading state
      const loadingIndicator = document.getElementById('clientLoading');
      loadingIndicator.style.display = 'block';
      
      // Clear previous client data (but preserve client selection)
      currentClient = null;
      clearForms();
      // Restore client selection after clearing (it was cleared by clearForms)
      document.getElementById('clientSelectMain').value = clientId;
      searchInput.value = clientName;
      searchInput.dataset.clientId = clientId;
      updateWhiteLabelTabVisibility();
      
      // Load client data (async)
      loadClientData(clientId).finally(() => {
        loadingIndicator.style.display = 'none';
      });
    });
  });

  dropdown.style.display = 'block';
}

// Setup searchable dropdown
function setupSearchableDropdown() {
  const searchInput = document.getElementById('clientSearchInput');
  const dropdown = document.getElementById('clientDropdown');
  
  // Show dropdown on focus
  searchInput.addEventListener('focus', () => {
    if (clients.length > 0) {
      filterClients();
    } else {
      loadClients();
    }
  });

  // Filter on input
  searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value;
    if (clients.length > 0) {
      filterClients();
    }
  });

  // Hide dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.searchable-dropdown')) {
      dropdown.style.display = 'none';
    }
  });

  // Handle keyboard navigation
  searchInput.addEventListener('keydown', (e) => {
    const items = dropdown.querySelectorAll('.dropdown-item');
    const selected = dropdown.querySelector('.dropdown-item.selected');
    let currentIndex = selected ? Array.from(items).indexOf(selected) : -1;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      currentIndex = Math.min(currentIndex + 1, items.length - 1);
      items.forEach(item => item.classList.remove('selected'));
      if (items[currentIndex]) {
        items[currentIndex].classList.add('selected');
        items[currentIndex].scrollIntoView({ block: 'nearest' });
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      currentIndex = Math.max(currentIndex - 1, -1);
      items.forEach(item => item.classList.remove('selected'));
      if (currentIndex >= 0 && items[currentIndex]) {
        items[currentIndex].classList.add('selected');
        items[currentIndex].scrollIntoView({ block: 'nearest' });
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selectedItem = dropdown.querySelector('.dropdown-item.selected');
      if (selectedItem) {
        selectedItem.click();
      } else if (items.length === 1) {
        items[0].click();
      }
    } else if (e.key === 'Escape') {
      dropdown.style.display = 'none';
      searchInput.blur();
    }
  });
}

// Load full client data
async function loadClientData(clientId) {
  if (!clientId) {
    console.error('No client ID provided');
    return;
  }

  const loadingIndicator = document.getElementById('clientLoading');
  
  try {
    loadingIndicator.style.display = 'block';
    
    // Try the new route first, fallback to clients-list with id parameter
    let url = `${window.API_URL}/api/client/${clientId}`;
    let fallbackUrl = `${window.API_URL}/api/clients-list?id=${clientId}`;
    
    console.log('Loading client data from:', url);
    console.log('Fallback URL:', fallbackUrl);
    console.log('API URL base:', window.API_URL);
    console.log('Client ID:', clientId);
    
    let response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Response status:', response.status);
    console.log('Response statusText:', response.statusText);
    
    // If 404, try fallback endpoint (clients-list with id parameter)
    if (response.status === 404) {
      console.log('Primary route not found, trying fallback endpoint...');
      response = await fetch(fallbackUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Fallback response status:', response.status);
    }
    
    if (!response.ok) {
      let errorData;
      let responseText = '';
      try {
        responseText = await response.text();
        console.error('API Error Response (raw text):', responseText);
        
        if (responseText) {
          try {
            errorData = JSON.parse(responseText);
            console.error('API Error Response (parsed JSON):', errorData);
          } catch (parseError) {
            console.error('Failed to parse error response as JSON:', parseError);
            errorData = { error: responseText || `HTTP ${response.status}: ${response.statusText}` };
          }
        } else {
          errorData = { error: `HTTP ${response.status}: ${response.statusText || 'No response body'}` };
        }
      } catch (e) {
        console.error('Error reading error response:', e);
        errorData = { error: `HTTP ${response.status}: ${response.statusText || 'Unknown error'}` };
      }
      
      // If still 404, provide helpful message
      if (response.status === 404) {
        const helpfulMsg = `API route not found (404).\n\nTried:\n- ${url}\n- ${fallbackUrl}\n\nPossible solutions:\n1. Deploy the new route /api/client/[id] to production\n2. Or use the updated /api/clients-list?id= endpoint\n3. Verify the client ID is correct: ${clientId}`;
        console.error(helpfulMsg);
        throw new Error(helpfulMsg);
      }
      
      const errorMessage = errorData.error || errorData.message || `Failed to load client data (${response.status})`;
      throw new Error(errorMessage);
    }

    const responseData = await response.json();
    console.log('Raw response data:', responseData);
    console.log('Response data type:', typeof responseData);
    console.log('Is array:', Array.isArray(responseData));
    
    // Handle different response formats
    currentClient = null;
    
    // If response is an array (clients-list returned all clients instead of one)
    if (Array.isArray(responseData)) {
      console.log('Response is an array, searching for client with ID:', clientId);
      currentClient = responseData.find(c => c.id === clientId);
      
      if (!currentClient) {
        console.error('Client not found in array. Available IDs:', responseData.map(c => c.id));
        throw new Error(`Client ${clientId} not found in the list. The API endpoint may not support the ?id= parameter yet.`);
      }
      
      // If we only got partial data (id, name, revenue_amount), we need to fetch full data
      if (!currentClient.success_package && !currentClient.status) {
        console.warn('Got partial client data, attempting to fetch full data...');
        
        // Helper function to find client data in Next.js page data
        const findClientInNextData = (nextData, searchId) => {
          if (!nextData || !nextData.props) return null;
          
          // Check pageProps
          if (nextData.props.pageProps && nextData.props.pageProps.client) {
            if (nextData.props.pageProps.client.id === searchId) {
              return nextData.props.pageProps.client;
            }
          }
          
          // Recursively search for client object
          const checkObject = (obj) => {
            if (!obj || typeof obj !== 'object') return null;
            if (Array.isArray(obj)) {
              for (let item of obj) {
                const found = checkObject(item);
                if (found) return found;
              }
              return null;
            }
            if (obj.id === searchId && obj.name) {
              return obj;
            }
            if (obj.client && obj.client.id === searchId) {
              return obj.client;
            }
            for (let key in obj) {
              const found = checkObject(obj[key]);
              if (found) return found;
            }
            return null;
          };
          
          return checkObject(nextData.props);
        };
        
        // Try to fetch full data by making a request to the admin client page
        // This is a workaround until the updated endpoint is deployed
        try {
          const fullDataUrl = `${window.API_URL}/admin/clients/${clientId}`;
          console.log('Attempting to fetch full data from:', fullDataUrl);
          
          // Try fetching the page and extracting JSON data
          const pageResponse = await fetch(fullDataUrl);
          if (pageResponse.ok) {
            const pageText = await pageResponse.text();
            
            // Look for JSON data in the page (Next.js often embeds data in script tags)
            const jsonMatch = pageText.match(/<script[^>]*id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/s);
            if (jsonMatch) {
              try {
                const nextData = JSON.parse(jsonMatch[1]);
                // Try to find client data in the page props
                const clientData = findClientInNextData(nextData, clientId);
                if (clientData && clientData.id && clientData.success_package) {
                  console.log('Found full client data in page:', clientData);
                  currentClient = clientData;
                } else {
                  console.warn('Found client data but missing required fields');
                }
              } catch (e) {
                console.warn('Could not parse Next.js data:', e);
              }
            } else {
              console.warn('Could not find __NEXT_DATA__ script tag in page');
            }
          } else {
            console.warn('Could not fetch admin page:', pageResponse.status);
          }
        } catch (e) {
          console.warn('Could not fetch full data from admin page:', e);
        }
        
        // If still only partial data, show helpful error with option to open full page
        if (!currentClient.success_package && !currentClient.status) {
          const openFullPage = confirm(
            `Only partial client data is available (name, revenue only).\n\n` +
            `The updated API endpoint hasn't been deployed to production yet.\n\n` +
            `Would you like to open the full client page in a new tab?\n\n` +
            `(You can also deploy the updated /api/clients-list route to fix this)`
          );
          
          if (openFullPage) {
            chrome.tabs.create({ url: `${window.API_URL}/admin/clients/${clientId}` });
          }
          
          throw new Error(
            `Partial data only. Deploy the updated /api/clients-list endpoint or open the client page for full data.`
          );
        }
      }
    }
    // If response has a 'client' property (from check-client-data endpoint), unwrap it
    else if (responseData && responseData.client) {
      currentClient = responseData.client;
      console.log('Unwrapped client from response.client:', currentClient);
    }
    // If response has a 'data' property, unwrap it
    else if (responseData && responseData.data) {
      currentClient = responseData.data;
      console.log('Unwrapped client from response.data:', currentClient);
    }
    // Otherwise, assume responseData is the client object itself
    else {
      currentClient = responseData;
    }
    
    console.log('Final client data:', currentClient);
    console.log('Client ID:', currentClient?.id);
    console.log('Client name:', currentClient?.name);
    
    if (!currentClient || !currentClient.id) {
      console.error('Invalid client data structure:', {
        hasClient: !!currentClient,
        hasId: !!currentClient?.id,
        clientKeys: currentClient ? Object.keys(currentClient) : null,
        fullResponse: responseData,
        responseIsArray: Array.isArray(responseData)
      });
      throw new Error(`Invalid client data returned from server. Expected object with 'id' property, got: ${Array.isArray(responseData) ? 'array' : typeof responseData}`);
    }
    
    // Final validation - ensure we have full client data
    if (!currentClient.success_package && !currentClient.status) {
      // This should have been caught above, but just in case
      throw new Error(
        `Incomplete client data. Please deploy the updated /api/clients-list endpoint ` +
        `that supports the ?id= parameter, or use the full /api/client/[id] endpoint.`
      );
    }
    
    populateClientForms();
    
    // Update UI with new features
    updateQuickStatusDropdown();
    updateNotesQuickView();
    updateHealthIndicators();
    updateQuickLinks();
    loadRecentEntries(currentClient.id);
    loadTimeSummary(currentClient.id);
    
    // Load activity timeline if on activity tab
    if (currentTab === 'activity') {
      loadActivityTimeline();
    }
    
    // Save to recent clients
    saveToRecentClients(currentClient);
    
    // Update time filter client dropdown
    updateTimeFilterClientDropdown();
    
    // Clear any error status
    hideStatus('editStatus');
    hideStatus('trackingStatus');
    hideStatus('whitelabelStatus');
    
  } catch (error) {
    console.error('Error loading client data:', error);
    const errorMessage = error.message || 'Failed to load client data. Check console for details.';
    showStatus('error', errorMessage, 'editStatus');
    showStatus('error', errorMessage, 'trackingStatus');
    showStatus('error', errorMessage, 'whitelabelStatus');
    
    // Also show error in a more visible way
    alert(`Error loading client: ${errorMessage}\n\nCheck the browser console (F12) for more details.`);
  } finally {
    loadingIndicator.style.display = 'none';
  }
}

// Clear all forms
function clearForms() {
  // Clear client selector
  const searchInput = document.getElementById('clientSearchInput');
  if (searchInput) {
    searchInput.value = '';
    searchInput.dataset.clientId = '';
  }
  document.getElementById('clientSelectMain').value = '';
  
  // Hide quick status and notes
  const quickStatusSelect = document.getElementById('quickStatusSelect');
  if (quickStatusSelect) {
    quickStatusSelect.style.display = 'none';
  }
  
  const notesView = document.getElementById('clientNotesQuickView');
  if (notesView) {
    notesView.style.display = 'none';
  }
  
  // Clear recent entries section
  const recentEntriesSection = document.getElementById('recentEntriesSection');
  if (recentEntriesSection) {
    recentEntriesSection.style.display = 'none';
  }
  
  // Hide ROI metrics
  hideROIMetrics();
  
  // Edit Client form
  document.getElementById('clientName').value = '';
  document.getElementById('clientEmail').value = '';
  document.getElementById('successPackage').value = 'premium';
  document.getElementById('clientStatus').value = 'active';
  document.getElementById('planType').value = 'pro';
  document.getElementById('billingType').value = 'monthly';
  document.getElementById('revenueAmount').value = 0;
  document.getElementById('clientNotes').value = '';

  // Project Tracking form
  document.getElementById('formsSetupValue').textContent = '0';
  document.getElementById('smartdocsSetupValue').textContent = '0';
  document.getElementById('zapierIntegrationsValue').textContent = '0';
  document.getElementById('migrationCompleted').checked = false;
  document.getElementById('slackAccessGranted').checked = false;

  // Call dates
  document.getElementById('lightCallDate').value = '';
  document.getElementById('premiumFirstCall').value = '';
  document.getElementById('premiumSecondCall').value = '';
  document.getElementById('goldFirstCall').value = '';
  document.getElementById('goldSecondCall').value = '';
  document.getElementById('goldThirdCall').value = '';

  // White Label form
  document.getElementById('whiteLabelStatus').value = 'not_started';
  document.getElementById('whiteLabelAppName').value = '';
  document.getElementById('whiteLabelAppDescription').value = '';
  document.getElementById('whiteLabelAndroidUrl').value = '';
  document.getElementById('whiteLabelIosUrl').value = '';

  // White Label checklist
  document.getElementById('checklist_create_assets').checked = false;
  document.getElementById('checklist_create_native_app').checked = false;
  document.getElementById('checklist_create_test_user').checked = false;
  document.getElementById('checklist_test_login').checked = false;
  document.getElementById('checklist_download_ios').checked = false;
  document.getElementById('checklist_submit').checked = false;
}

// Show/hide white label tab based on client's custom_app setting
function updateWhiteLabelTabVisibility() {
  const whiteLabelTab = document.querySelector('.tab[data-tab="whitelabel"]');
  
  if (!currentClient) {
    // Hide if no client selected
    if (whiteLabelTab) {
      whiteLabelTab.style.display = 'none';
    }
    return;
  }
  
  // Show white label tab only if client has white_label custom_app
  const hasWhiteLabel = currentClient.custom_app === 'white_label';
  console.log('White label visibility check:', {
    custom_app: currentClient.custom_app,
    hasWhiteLabel: hasWhiteLabel
  });
  
  if (whiteLabelTab) {
    if (hasWhiteLabel) {
      whiteLabelTab.style.display = 'flex';
    } else {
      whiteLabelTab.style.display = 'none';
      
      // If white label tab is currently active, switch to time tab
      if (currentTab === 'whitelabel') {
        const timeTab = document.querySelector('.tab[data-tab="time"]');
        if (timeTab) {
          timeTab.click();
        }
      }
    }
  }
}

// Update quick status dropdown
function updateQuickStatusDropdown() {
  const quickStatusSelect = document.getElementById('quickStatusSelect');
  if (!quickStatusSelect) return;

  if (currentClient) {
    quickStatusSelect.style.display = 'block';
    quickStatusSelect.value = currentClient.status || '';
  } else {
    quickStatusSelect.style.display = 'none';
  }
}

// Populate all forms with client data
function populateClientForms() {
  if (!currentClient) {
    console.warn('No client data to populate');
    return;
  }
  
  console.log('Populating forms with client data:', currentClient.name);
  
  // Update white label tab visibility based on client's custom_app
  updateWhiteLabelTabVisibility();

  // Edit Client form
  document.getElementById('clientName').value = currentClient.name || '';
  document.getElementById('clientEmail').value = currentClient.email || '';
  document.getElementById('successPackage').value = currentClient.success_package || 'premium';
  document.getElementById('clientStatus').value = currentClient.status || 'active';
  document.getElementById('planType').value = currentClient.plan_type || 'pro';
  // Handle billing_type - database uses 'monthly', 'quarterly', 'annually'
  // Map 'yearly' to 'annually' for compatibility
  let billingType = (currentClient.billing_type || 'monthly').toLowerCase();
  if (billingType === 'yearly') {
    billingType = 'annually';
  }
  // Ensure it's one of the valid values
  if (!['monthly', 'quarterly', 'annually'].includes(billingType)) {
    billingType = 'monthly';
  }
  document.getElementById('billingType').value = billingType;
  document.getElementById('revenueAmount').value = currentClient.revenue_amount || 0;
  document.getElementById('clientNotes').value = currentClient.notes || null || '';

  // Project Tracking form
  document.getElementById('formsSetupValue').textContent = currentClient.forms_setup || 0;
  document.getElementById('smartdocsSetupValue').textContent = currentClient.smartdocs_setup || 0;
  document.getElementById('zapierIntegrationsValue').textContent = currentClient.zapier_integrations_setup || 0;
  document.getElementById('migrationCompleted').checked = currentClient.migration_completed || false;
  document.getElementById('slackAccessGranted').checked = currentClient.slack_access_granted || false;

  // Call dates - format dates properly (YYYY-MM-DD for input fields)
  const formatDateForInput = (dateStr) => {
    if (!dateStr) return '';
    // If it's already in YYYY-MM-DD format, return as is
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) return dateStr;
    // Otherwise, try to parse and format
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  document.getElementById('lightCallDate').value = formatDateForInput(currentClient.light_onboarding_call_date);
  document.getElementById('premiumFirstCall').value = formatDateForInput(currentClient.premium_first_call_date);
  document.getElementById('premiumSecondCall').value = formatDateForInput(currentClient.premium_second_call_date);
  document.getElementById('goldFirstCall').value = formatDateForInput(currentClient.gold_first_call_date);
  document.getElementById('goldSecondCall').value = formatDateForInput(currentClient.gold_second_call_date);
  document.getElementById('goldThirdCall').value = formatDateForInput(currentClient.gold_third_call_date);

  // White Label form
  document.getElementById('whiteLabelStatus').value = currentClient.white_label_status || 'not_started';
  document.getElementById('whiteLabelAppName').value = currentClient.white_label_app_name || '';
  document.getElementById('whiteLabelAppDescription').value = currentClient.white_label_app_description || '';
  document.getElementById('whiteLabelAndroidUrl').value = currentClient.white_label_android_url || '';
  document.getElementById('whiteLabelIosUrl').value = currentClient.white_label_ios_url || '';

  // White Label checklist
  const checklist = currentClient.white_label_checklist || {};
  document.getElementById('checklist_create_assets').checked = checklist.create_assets?.completed || false;
  document.getElementById('checklist_create_native_app').checked = checklist.create_natively_app?.completed || false;
  document.getElementById('checklist_create_test_user').checked = checklist.create_test_user?.completed || false;
  document.getElementById('checklist_test_login').checked = checklist.test_login?.completed || false;
  document.getElementById('checklist_download_ios').checked = checklist.download_and_create_ios_app?.completed || false;
  document.getElementById('checklist_submit').checked = checklist.submit?.completed || false;
  
  // Update quick status dropdown and notes view
  updateQuickStatusDropdown();
  updateNotesQuickView();
}

// Save time entry
async function saveTimeEntry() {
  // Try multiple sources for client ID (in order of reliability)
  const clientId = currentClient?.id || 
                   document.getElementById('clientSelectMain').value || 
                   document.getElementById('clientSearchInput').dataset.clientId;
  const entryType = document.getElementById('entryType').value;
  const date = document.getElementById('date').value;
  const duration = parseInt(document.getElementById('duration').value);
  const description = document.getElementById('description').value;
  const notes = document.getElementById('notes').value;

  // Validation
  if (!clientId) {
    showStatus('error', 'Please select a client', 'timeStatus');
    return;
  }

  if (!date) {
    showStatus('error', 'Please select a date', 'timeStatus');
    return;
  }

  if (!duration || duration <= 0) {
    showStatus('error', 'Please enter a valid duration', 'timeStatus');
    return;
  }

  const saveBtn = document.getElementById('saveTimeBtn');
  saveBtn.disabled = true;
  saveBtn.innerHTML = '<span>💾</span> Saving...';

  try {
    const response = await fetch(`${window.API_URL}/api/time-entries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        entry_type: entryType,
        date: date,
        duration_minutes: duration,
        description: description || null,
        notes: notes || null,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to save time entry');
    }

    // Reset form
    document.getElementById('description').value = '';
    document.getElementById('notes').value = '';
    document.getElementById('duration').value = '30';
    
    // Reload entries and summary
    if (currentClient) {
      await loadRecentEntries(currentClient.id);
      await loadTimeSummary(currentClient.id);
      updateHealthIndicators();
      if (currentTab === 'activity') {
        loadActivityTimeline();
      }
    } else {
      await loadRecentEntries();
    }
    await loadTodaySummary();
    
    showStatus('success', `Time entry saved! (${duration} min)`, 'timeStatus');
    
    setTimeout(() => hideStatus('timeStatus'), 3000);

  } catch (error) {
    console.error('Error saving time entry:', error);
    showStatus('error', error.message || 'Failed to save time entry', 'timeStatus');
  } finally {
    saveBtn.disabled = false;
    saveBtn.innerHTML = '<span>💾</span> Save Time Entry';
  }
}

// Save client
async function saveClient() {
  if (!currentClient) {
    showStatus('error', 'Please select a client', 'editStatus');
    return;
  }

  const saveBtn = document.getElementById('saveClientBtn');
  saveBtn.disabled = true;
  saveBtn.innerHTML = '<span>💾</span> Saving...';

  try {
    // Get billing type and ensure it matches database constraint
    let billingType = document.getElementById('billingType').value;
    // Map 'yearly' to 'annually' if needed (for backward compatibility)
    if (billingType === 'yearly') {
      billingType = 'annually';
    }
    // Ensure it's one of the valid database values
    if (!['monthly', 'quarterly', 'annually'].includes(billingType)) {
      billingType = 'monthly';
    }

    const updates = {
      name: document.getElementById('clientName').value,
      email: document.getElementById('clientEmail').value,
      success_package: document.getElementById('successPackage').value,
      status: document.getElementById('clientStatus').value,
      plan_type: document.getElementById('planType').value,
      billing_type: billingType,
      revenue_amount: parseFloat(document.getElementById('revenueAmount').value) || 0,
      notes: document.getElementById('clientNotes').value,
    };

    const response = await fetch(`${window.API_URL}/api/update-client-full`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clientId: currentClient.id,
        updates: updates,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to save client');
    }

    // Reload client data
    await loadClientData(currentClient.id);
    
    showStatus('success', 'Client updated successfully!', 'editStatus');
    setTimeout(() => hideStatus('editStatus'), 3000);

  } catch (error) {
    console.error('Error saving client:', error);
    showStatus('error', error.message || 'Failed to save client', 'editStatus');
  } finally {
    saveBtn.disabled = false;
    saveBtn.innerHTML = '<span>💾</span> Save Client';
  }
}

// Increment tracking value
function incrementTracking(field, delta) {
  if (!currentClient) {
    showStatus('error', 'Please select a client first', 'trackingStatus');
    return;
  }

  // Map field names to element IDs (convert snake_case to camelCase)
  const fieldIdMap = {
    'forms_setup': 'formsSetupValue',
    'smartdocs_setup': 'smartdocsSetupValue',
    'zapier_integrations_setup': 'zapierIntegrationsValue'
  };

  const elementId = fieldIdMap[field];
  if (!elementId) {
    console.error(`Unknown field: ${field}`);
    return;
  }

  const valueEl = document.getElementById(elementId);
  if (!valueEl) {
    console.error(`Element not found: ${elementId} for field ${field}`);
    return;
  }

  const currentValue = parseInt(valueEl.textContent) || 0;
  const newValue = Math.max(0, currentValue + delta);
  valueEl.textContent = newValue;
  
  console.log(`Incremented ${field}: ${currentValue} → ${newValue} (delta: ${delta})`);
}

// Save tracking
async function saveTracking() {
  if (!currentClient) {
    showStatus('error', 'Please select a client', 'trackingStatus');
    return;
  }

  const saveBtn = document.getElementById('saveTrackingBtn');
  saveBtn.disabled = true;
  saveBtn.innerHTML = '<span>💾</span> Saving...';

  try {
    const updates = {
      forms_setup: parseInt(document.getElementById('formsSetupValue').textContent) || 0,
      smartdocs_setup: parseInt(document.getElementById('smartdocsSetupValue').textContent) || 0,
      zapier_integrations_setup: parseInt(document.getElementById('zapierIntegrationsValue').textContent) || 0,
      migration_completed: document.getElementById('migrationCompleted').checked,
      slack_access_granted: document.getElementById('slackAccessGranted').checked,
      light_onboarding_call_date: document.getElementById('lightCallDate').value || null,
      premium_first_call_date: document.getElementById('premiumFirstCall').value || null,
      premium_second_call_date: document.getElementById('premiumSecondCall').value || null,
      gold_first_call_date: document.getElementById('goldFirstCall').value || null,
      gold_second_call_date: document.getElementById('goldSecondCall').value || null,
      gold_third_call_date: document.getElementById('goldThirdCall').value || null,
    };

    const response = await fetch(`${window.API_URL}/api/update-client-full`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clientId: currentClient.id,
        updates: updates,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to save tracking');
    }

    // Reload client data
    await loadClientData(currentClient.id);
    
    showStatus('success', 'Tracking updated successfully!', 'trackingStatus');
    setTimeout(() => hideStatus('trackingStatus'), 3000);

  } catch (error) {
    console.error('Error saving tracking:', error);
    showStatus('error', error.message || 'Failed to save tracking', 'trackingStatus');
  } finally {
    saveBtn.disabled = false;
    saveBtn.innerHTML = '<span>💾</span> Save Tracking';
  }
}

// Save white label
async function saveWhiteLabel() {
  if (!currentClient) {
    showStatus('error', 'Please select a client', 'whitelabelStatus');
    return;
  }

  const saveBtn = document.getElementById('saveWhiteLabelBtn');
  saveBtn.disabled = true;
  saveBtn.innerHTML = '<span>💾</span> Saving...';

  try {
    const checklist = {
      create_assets: {
        completed: document.getElementById('checklist_create_assets').checked,
        completed_at: document.getElementById('checklist_create_assets').checked ? new Date().toISOString() : undefined
      },
      create_natively_app: {
        completed: document.getElementById('checklist_create_native_app').checked,
        completed_at: document.getElementById('checklist_create_native_app').checked ? new Date().toISOString() : undefined
      },
      create_test_user: {
        completed: document.getElementById('checklist_create_test_user').checked,
        completed_at: document.getElementById('checklist_create_test_user').checked ? new Date().toISOString() : undefined
      },
      test_login: {
        completed: document.getElementById('checklist_test_login').checked,
        completed_at: document.getElementById('checklist_test_login').checked ? new Date().toISOString() : undefined
      },
      download_and_create_ios_app: {
        completed: document.getElementById('checklist_download_ios').checked,
        completed_at: document.getElementById('checklist_download_ios').checked ? new Date().toISOString() : undefined
      },
      submit: {
        completed: document.getElementById('checklist_submit').checked,
        completed_at: document.getElementById('checklist_submit').checked ? new Date().toISOString() : undefined
      }
    };

    const updates = {
      white_label_status: document.getElementById('whiteLabelStatus').value,
      white_label_checklist: checklist,
      white_label_app_name: document.getElementById('whiteLabelAppName').value || null,
      white_label_app_description: document.getElementById('whiteLabelAppDescription').value || null,
      white_label_android_url: document.getElementById('whiteLabelAndroidUrl').value || null,
      white_label_ios_url: document.getElementById('whiteLabelIosUrl').value || null,
    };

    const response = await fetch(`${window.API_URL}/api/update-client-full`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clientId: currentClient.id,
        updates: updates,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to save white label');
    }

    // Reload client data
    await loadClientData(currentClient.id);
    
    showStatus('success', 'White label updated successfully!', 'whitelabelStatus');
    setTimeout(() => hideStatus('whitelabelStatus'), 3000);

  } catch (error) {
    console.error('Error saving white label:', error);
    showStatus('error', error.message || 'Failed to save white label', 'whitelabelStatus');
  } finally {
    saveBtn.disabled = false;
    saveBtn.innerHTML = '<span>💾</span> Save White Label';
  }
}

// Show status message
function showStatus(type, message, statusId = 'timeStatus') {
  const statusEl = document.getElementById(statusId);
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.className = `status-message ${type}`;
}

// Hide status message
function hideStatus(statusId = 'timeStatus') {
  const statusEl = document.getElementById(statusId);
  if (!statusEl) return;
  statusEl.className = 'status-message';
}

// Load today's time summary
async function loadTodaySummary() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const response = await fetch(`${window.API_URL}/api/time-entries?start_date=${today}&end_date=${today}`);
    
    if (!response.ok) {
      throw new Error('Failed to load summary');
    }

    const entries = await response.json();
    const totalMinutes = entries.reduce((sum, entry) => sum + (entry.duration_minutes || 0), 0);
    
    const summaryCard = document.getElementById('timeSummary');
    const summaryTotalTime = document.getElementById('summaryTotalTime');
    const summaryEntriesCount = document.getElementById('summaryEntriesCount');
    const summaryDate = document.getElementById('summaryDate');

    if (summaryCard && summaryTotalTime && summaryEntriesCount && summaryDate) {
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      const timeDisplay = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
      
      summaryTotalTime.textContent = timeDisplay;
      summaryEntriesCount.textContent = entries.length;
      summaryDate.textContent = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      summaryCard.style.display = 'block';
    }
  } catch (error) {
    console.error('Error loading today summary:', error);
  }
}

// Load recent time entries
async function loadRecentEntries(clientId = null) {
  try {
    let url = `${window.API_URL}/api/time-entries?`;
    const params = new URLSearchParams();
    
    if (clientId) {
      params.append('client_id', clientId);
    }
    
    url += params.toString();
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to load entries');
    }

    const allEntries = await response.json();
    // Limit to 50 most recent entries for filtering
    recentTimeEntries = allEntries.slice(0, 50);
    filteredEntries = recentTimeEntries;
    
    // Show filters section if we have entries
    if (recentTimeEntries.length > 0) {
      document.getElementById('timeFiltersSection').style.display = 'block';
    }
    
    displayRecentEntries();
    updateTimeFilterClientDropdown();
  } catch (error) {
    console.error('Error loading recent entries:', error);
  }
}

// Update time filter client dropdown
function updateTimeFilterClientDropdown() {
  const dropdown = document.getElementById('filterClient');
  if (!dropdown) return;

  dropdown.innerHTML = '<option value="all">All Clients</option>';
  
  // Get unique client IDs from entries (only Vanessa's clients)
  const vanessaClientIds = new Set(clients.map(c => c.id));
  const clientIds = [...new Set(recentTimeEntries.filter(e => vanessaClientIds.has(e.client_id)).map(e => e.client_id))];
  const clientNamesMap = {};
  clients.forEach(c => {
    clientNamesMap[c.id] = c.name;
  });

  clientIds.forEach(clientId => {
    const option = document.createElement('option');
    option.value = clientId;
    option.textContent = clientNamesMap[clientId] || 'Unknown Client';
    dropdown.appendChild(option);
  });
}

// Display recent time entries
function displayRecentEntries() {
  const section = document.getElementById('recentEntriesSection');
  const list = document.getElementById('recentEntriesList');
  
  if (!section || !list) return;

  const entriesToShow = filteredEntries.length > 0 ? filteredEntries : recentTimeEntries;

  if (!entriesToShow || entriesToShow.length === 0) {
    section.style.display = 'none';
    return;
  }

  section.style.display = 'block';
  
  // Get client names map
  const clientNamesMap = {};
  clients.forEach(c => {
    clientNamesMap[c.id] = c.name;
  });

  list.innerHTML = entriesToShow.map(entry => {
    const clientName = clientNamesMap[entry.client_id] || 'Unknown Client';
    const date = new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const activityType = entry.entry_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    return `
      <div class="time-entry-card" data-entry-id="${entry.id}">
        <div class="entry-header">
          <div class="entry-client">${escapeHtml(clientName)}</div>
          <div class="entry-actions">
            <button class="entry-action-btn duplicate-entry-btn" data-entry-id="${entry.id}" title="Duplicate">📋</button>
            <button class="entry-action-btn edit-entry-btn" data-entry-id="${entry.id}" title="Edit">✏️</button>
            <button class="entry-action-btn delete-entry-btn" data-entry-id="${entry.id}" title="Delete">🗑️</button>
          </div>
        </div>
        <div class="entry-details">
          <span class="entry-detail-item">📅 ${date}</span>
          <span class="entry-detail-item">⏱️ ${entry.duration_minutes} min</span>
          <span class="entry-detail-item">📋 ${activityType}</span>
        </div>
        ${entry.description ? `<div class="entry-description">${escapeHtml(entry.description)}</div>` : ''}
      </div>
    `;
  }).join('');

  // Add event listeners for buttons
  list.querySelectorAll('.duplicate-entry-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const entryId = btn.dataset.entryId;
      duplicateEntry(entryId);
    });
  });

  list.querySelectorAll('.edit-entry-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const entryId = btn.dataset.entryId;
      openEditModal(entryId);
    });
  });

  list.querySelectorAll('.delete-entry-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const entryId = btn.dataset.entryId;
      if (confirm('Are you sure you want to delete this time entry?')) {
        deleteTimeEntry(entryId);
      }
    });
  });
}

// Open edit modal
function openEditModal(entryId) {
  const entry = recentTimeEntries.find(e => e.id === entryId);
  if (!entry) return;

  editingEntryId = entryId;
  const modal = document.getElementById('editEntryModal');
  
  document.getElementById('editEntryType').value = entry.entry_type;
  document.getElementById('editEntryDate').value = entry.date;
  document.getElementById('editEntryDuration').value = entry.duration_minutes;
  document.getElementById('editEntryDescription').value = entry.description || '';
  document.getElementById('editEntryNotes').value = entry.notes || '';
  
  modal.style.display = 'flex';
}

// Close edit modal
function closeEditModal() {
  const modal = document.getElementById('editEntryModal');
  modal.style.display = 'none';
  editingEntryId = null;
}

// Save edited entry
async function saveEditedEntry() {
  if (!editingEntryId) return;

  const saveBtn = document.getElementById('saveEditEntryBtn');
  saveBtn.disabled = true;
  saveBtn.innerHTML = '<span>💾</span> Saving...';

  try {
    const updates = {
      entry_type: document.getElementById('editEntryType').value,
      date: document.getElementById('editEntryDate').value,
      duration_minutes: parseInt(document.getElementById('editEntryDuration').value),
      description: document.getElementById('editEntryDescription').value || null,
      notes: document.getElementById('editEntryNotes').value || null,
    };

    const response = await fetch(`${window.API_URL}/api/time-entries/${editingEntryId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update entry');
    }

    closeEditModal();
    
    // Reload entries
    if (currentClient) {
      await loadRecentEntries(currentClient.id);
      await loadTimeSummary(currentClient.id);
      updateHealthIndicators();
      if (currentTab === 'activity') {
        loadActivityTimeline();
      }
    } else {
      await loadRecentEntries();
    }
    await loadTodaySummary();
    
    showStatus('success', 'Time entry updated successfully!', 'timeStatus');
    setTimeout(() => hideStatus('timeStatus'), 3000);

  } catch (error) {
    console.error('Error updating entry:', error);
    alert(`Error: ${error.message}`);
  } finally {
    saveBtn.disabled = false;
    saveBtn.innerHTML = 'Save Changes';
  }
}

// Delete time entry
async function deleteTimeEntry(entryId = null) {
  const entryIdToDelete = entryId || editingEntryId;
  if (!entryIdToDelete) return;

  const deleteBtn = document.getElementById('deleteEntryBtn');
  if (deleteBtn) {
    deleteBtn.disabled = true;
    deleteBtn.innerHTML = 'Deleting...';
  }

  try {
    const response = await fetch(`${window.API_URL}/api/time-entries/${entryIdToDelete}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete entry');
    }

    closeEditModal();
    
    // Reload entries
    if (currentClient) {
      await loadRecentEntries(currentClient.id);
      await loadTimeSummary(currentClient.id);
      updateHealthIndicators();
      if (currentTab === 'activity') {
        loadActivityTimeline();
      }
    } else {
      await loadRecentEntries();
    }
    await loadTodaySummary();
    
    showStatus('success', 'Time entry deleted successfully!', 'timeStatus');
    setTimeout(() => hideStatus('timeStatus'), 3000);

  } catch (error) {
    console.error('Error deleting entry:', error);
    alert(`Error: ${error.message}`);
  } finally {
    if (deleteBtn) {
      deleteBtn.disabled = false;
      deleteBtn.innerHTML = 'Delete';
    }
  }
}

// Load recent clients from storage
function loadRecentClients() {
  chrome.storage.local.get(['recentClients'], (result) => {
    const recent = result.recentClients || [];
    displayRecentClients(recent);
  });
}

// Display recent clients
function displayRecentClients(recentClients) {
  const section = document.getElementById('recentClientsSection');
  const list = document.getElementById('recentClientsList');
  
  if (!section || !list) return;

  // Filter to only Vanessa's clients
  const vanessaClientIds = new Set(clients.map(c => c.id));
  const filteredRecent = recentClients.filter(client => vanessaClientIds.has(client.id));

  if (!filteredRecent || filteredRecent.length === 0) {
    section.style.display = 'none';
    return;
  }

  section.style.display = 'block';
  
  list.innerHTML = filteredRecent.slice(0, 5).map(client => {
    return `
      <div class="recent-client-chip" data-client-id="${client.id}">
        ${escapeHtml(client.name)}
      </div>
    `;
  }).join('');

  // Add click handlers
  list.querySelectorAll('.recent-client-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const clientId = chip.dataset.clientId;
      const client = clients.find(c => c.id === clientId);
      if (client) {
        // Simulate selecting the client
        document.getElementById('clientSelectMain').value = clientId;
        document.getElementById('clientSearchInput').value = client.name;
        document.getElementById('clientSearchInput').dataset.clientId = clientId;
        loadClientData(clientId);
      }
    });
  });
}

// Save client to recent clients (only if it's Vanessa's client)
function saveToRecentClients(client) {
  // Only save if it's Vanessa's client
  if (client.implementation_manager !== 'vanessa' && 
      client.implementation_manager !== 'Vanessa' && 
      client.implementation_manager) {
    return;
  }

  chrome.storage.local.get(['recentClients'], (result) => {
    let recent = result.recentClients || [];
    
    // Remove if already exists
    recent = recent.filter(c => c.id !== client.id);
    
    // Add to beginning
    recent.unshift({
      id: client.id,
      name: client.name
    });
    
    // Keep only last 5
    recent = recent.slice(0, 5);
    
    chrome.storage.local.set({ recentClients: recent }, () => {
      displayRecentClients(recent);
    });
  });
}

// Update client status quickly
async function updateClientStatus(newStatus) {
  if (!currentClient) return;

  try {
    const response = await fetch(`${window.API_URL}/api/update-client-full`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clientId: currentClient.id,
        updates: { status: newStatus },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update status');
    }

    // Reload client data
    await loadClientData(currentClient.id);
    updateHealthIndicators();
    
    showStatus('success', `Status updated to ${newStatus}!`, 'editStatus');
    setTimeout(() => hideStatus('editStatus'), 2000);

  } catch (error) {
    console.error('Error updating status:', error);
    showStatus('error', error.message || 'Failed to update status', 'editStatus');
  }
}

// Toggle notes view
function toggleNotesView() {
  const content = document.getElementById('notesContent');
  const btn = document.getElementById('toggleNotesBtn');
  
  if (content.style.display === 'none') {
    content.style.display = 'block';
    btn.classList.add('expanded');
  } else {
    content.style.display = 'none';
    btn.classList.remove('expanded');
  }
}

// Update client notes quick view
function updateNotesQuickView() {
  const notesView = document.getElementById('clientNotesQuickView');
  const notesContent = document.getElementById('notesContent');
  
  if (!notesView || !notesContent) return;

  if (currentClient && currentClient.notes) {
    notesView.style.display = 'block';
    notesContent.textContent = currentClient.notes;
    notesContent.classList.remove('empty');
  } else {
    notesView.style.display = 'block';
    notesContent.textContent = 'No notes available';
    notesContent.classList.add('empty');
  }
}

// Load time summary for ROI calculations
async function loadTimeSummary(clientId) {
  if (!clientId) {
    hideROIMetrics();
    return;
  }

  try {
    const response = await fetch(`${window.API_URL}/api/time-entries/summary?client_id=${clientId}`);
    
    if (!response.ok) {
      throw new Error('Failed to load time summary');
    }

    const data = await response.json();
    // API returns array, get first item (or find by client_id)
    timeSummary = Array.isArray(data) ? data.find(s => s.client_id === clientId) || data[0] : data;
    
    if (timeSummary) {
      displayROIMetrics();
    } else {
      hideROIMetrics();
    }
  } catch (error) {
    console.error('Error loading time summary:', error);
    hideROIMetrics();
  }
}

// Display ROI metrics
function displayROIMetrics() {
  if (!currentClient || !timeSummary) {
    hideROIMetrics();
    return;
  }

  const roiCard = document.getElementById('roiMetricsCard');
  if (!roiCard) return;

  const totalHours = timeSummary.total_hours || 0;
  const totalMinutes = timeSummary.total_minutes || 0;
  const acv = currentClient.revenue_amount || 0;
  const packageType = currentClient.success_package || '';

  // Format total time
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const timeDisplay = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  // Update total time
  document.getElementById('roiTotalTime').textContent = timeDisplay;
  document.getElementById('roiTotalHours').textContent = `${totalHours.toFixed(1)} hours`;

  // Calculate implementation cost
  const implementationCost = totalHours * HOURLY_RATE;
  document.getElementById('roiImplementationCost').textContent = `$${implementationCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Calculate efficiency (hours per $1k ACV)
  if (acv > 0) {
    const efficiency = (totalHours / acv) * 1000;
    const efficiencyEl = document.getElementById('roiEfficiency');
    const efficiencyValueEl = document.getElementById('roiEfficiencyValue');
    if (efficiencyEl && efficiencyValueEl) {
      efficiencyEl.style.display = 'flex';
      efficiencyValueEl.textContent = `${efficiency.toFixed(2)} hrs per $1k ACV`;
    }

    // Calculate breakeven
    if (totalHours > 0) {
      const breakeven = (implementationCost / acv) * 12;
      const breakevenEl = document.getElementById('roiBreakeven');
      const breakevenValueEl = document.getElementById('roiBreakevenValue');
      if (breakevenEl && breakevenValueEl) {
        breakevenEl.style.display = 'flex';
        breakevenValueEl.textContent = `${breakeven.toFixed(1)} months`;
      }

      // Calculate ROI score
      const roiScore = acv / implementationCost;
      const roiScoreEl = document.getElementById('roiScore');
      const roiScoreValueEl = document.getElementById('roiScoreValue');
      if (roiScoreEl && roiScoreValueEl) {
        roiScoreEl.style.display = 'flex';
        roiScoreValueEl.textContent = `${roiScore.toFixed(2)}x`;
        
        // Color code based on score
        if (roiScore >= 10) {
          roiScoreValueEl.className = 'roi-value-green';
        } else if (roiScore >= 5) {
          roiScoreValueEl.className = 'roi-value-yellow';
        } else {
          roiScoreValueEl.className = 'roi-value-red';
        }
      }
    }
  } else {
    // Hide ACV-based metrics if no ACV
    document.getElementById('roiEfficiency').style.display = 'none';
    document.getElementById('roiBreakeven').style.display = 'none';
    document.getElementById('roiScore').style.display = 'none';
  }

  // Package cost calculations
  const packageCost = getPackageCost(packageType);
  if (packageCost > 0) {
    const packageSection = document.getElementById('roiPackageSection');
    if (packageSection) {
      packageSection.style.display = 'flex';
    }

    document.getElementById('roiPackageCost').textContent = `$${packageCost.toLocaleString()}`;

    // Cost vs Package
    const costVsPackage = implementationCost - packageCost;
    const costVsPackageEl = document.getElementById('roiCostVsPackage');
    const costVsPackageValueEl = document.getElementById('roiCostVsPackageValue');
    if (costVsPackageEl && costVsPackageValueEl) {
      costVsPackageEl.style.display = 'flex';
      if (costVsPackage < 0) {
        costVsPackageValueEl.textContent = `$${Math.abs(costVsPackage).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} under`;
        costVsPackageValueEl.className = 'roi-value-green';
      } else {
        costVsPackageValueEl.textContent = `$${costVsPackage.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} over`;
        costVsPackageValueEl.className = 'roi-value-red';
      }
    }

    // Cost ratio
    if (totalHours > 0) {
      const costRatio = implementationCost / packageCost;
      const costRatioEl = document.getElementById('roiCostRatio');
      const costRatioValueEl = document.getElementById('roiCostRatioValue');
      if (costRatioEl && costRatioValueEl) {
        costRatioEl.style.display = 'flex';
        const isUnderBudget = costRatio <= 1;
        costRatioValueEl.textContent = `${costRatio.toFixed(2)}x (${isUnderBudget ? 'under budget' : 'over budget'})`;
        costRatioValueEl.className = isUnderBudget ? 'roi-value-green' : 'roi-value-red';
      }
    }
  } else {
    document.getElementById('roiPackageSection').style.display = 'none';
  }

  roiCard.style.display = 'block';
}

// Hide ROI metrics
function hideROIMetrics() {
  const roiCard = document.getElementById('roiMetricsCard');
  if (roiCard) {
    roiCard.style.display = 'none';
  }
}

// Get package cost
function getPackageCost(packageType) {
  const packageCosts = {
    light: 0,
    premium: 599,
    gold: 990,
    elite: 1600,
    starter: 0,
    professional: 599,
    enterprise: 1600,
  };
  return packageCosts[packageType?.toLowerCase()] || 0;
}

// Theme Functions
function loadTheme() {
  chrome.storage.local.get(['theme'], (result) => {
    const theme = result.theme || 'dark';
    applyTheme(theme);
  });
}

function toggleTheme() {
  chrome.storage.local.get(['theme'], (result) => {
    const currentTheme = result.theme || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    chrome.storage.local.set({ theme: newTheme }, () => {
      applyTheme(newTheme);
    });
  });
}

function applyTheme(theme) {
  if (theme === 'light') {
    document.body.classList.add('light-theme');
  } else {
    document.body.classList.remove('light-theme');
  }
}

// Client Filter Functions
function clearClientFilters() {
  document.getElementById('filterStatus').value = '';
  document.getElementById('filterPackage').value = '';
  filterClients();
}

function filterClients() {
  const statusFilter = document.getElementById('filterStatus')?.value || '';
  const packageFilter = document.getElementById('filterPackage')?.value || '';
  const searchTerm = document.getElementById('clientSearchInput').value.toLowerCase();

  // Clients are already filtered to only Vanessa's clients in loadClients()
  let filtered = clients.filter(client => {
    if (statusFilter && client.status !== statusFilter) return false;
    if (packageFilter && client.success_package !== packageFilter) return false;
    if (searchTerm && !client.name.toLowerCase().includes(searchTerm)) return false;
    return true;
  });

  renderClientDropdown(filtered, searchTerm);
}

// Health Indicators
function updateHealthIndicators() {
  if (!currentClient) {
    document.getElementById('clientHealthIndicators').style.display = 'none';
    return;
  }

  const indicators = [];
  const now = new Date();
  const created = currentClient.created_at ? new Date(currentClient.created_at) : null;
  
  // Check for at-risk (no call in 10+ days)
  let firstCallDate = null;
  if (currentClient.success_package === 'light') {
    firstCallDate = currentClient.light_onboarding_call_date ? new Date(currentClient.light_onboarding_call_date) : null;
  } else if (currentClient.success_package === 'premium') {
    firstCallDate = currentClient.premium_first_call_date ? new Date(currentClient.premium_first_call_date) : null;
  } else if (currentClient.success_package === 'gold') {
    firstCallDate = currentClient.gold_first_call_date ? new Date(currentClient.gold_first_call_date) : null;
  }

  if (created && !firstCallDate) {
    const daysSinceCreated = Math.floor((now - created) / (1000 * 60 * 60 * 24));
    if (daysSinceCreated > 10) {
      indicators.push({ type: 'warning', text: `⚠️ No call in ${daysSinceCreated} days` });
    }
  }

  // Check ROI score
  if (timeSummary && currentClient.revenue_amount > 0) {
    const totalHours = timeSummary.total_hours || 0;
    const acv = currentClient.revenue_amount;
    if (totalHours > 0) {
      const roiScore = acv / (totalHours * HOURLY_RATE);
      if (roiScore < 5) {
        indicators.push({ type: 'danger', text: `🔴 Low ROI: ${roiScore.toFixed(1)}x` });
      } else if (roiScore >= 10) {
        indicators.push({ type: 'success', text: `✅ Great ROI: ${roiScore.toFixed(1)}x` });
      }
    }
  }

  // Check if pending for too long
  if (currentClient.status === 'pending' && created) {
    const daysPending = Math.floor((now - created) / (1000 * 60 * 60 * 24));
    if (daysPending > 30) {
      indicators.push({ type: 'warning', text: `⏳ Pending for ${daysPending} days` });
    }
  }

  const container = document.getElementById('clientHealthIndicators');
  if (indicators.length > 0) {
    container.innerHTML = indicators.map(ind => 
      `<div class="health-badge ${ind.type}">${ind.text}</div>`
    ).join('');
    container.style.display = 'flex';
  } else {
    container.style.display = 'none';
  }
}

// Quick Links
function updateQuickLinks() {
  if (!currentClient) {
    document.getElementById('quickLinksSection').style.display = 'none';
    return;
  }

  const portalLink = document.getElementById('clientPortalLink');
  const adminLink = document.getElementById('adminClientLink');
  const featuresLink = document.getElementById('clientFeaturesLink');

  // Get client slug from name or use ID
  const slug = currentClient.slug || currentClient.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  
  portalLink.href = `${window.API_URL}/client/${slug}`;
  adminLink.href = `${window.API_URL}/admin/clients/${currentClient.id}`;
  featuresLink.href = `${window.API_URL}/admin/clients/${currentClient.id}/features`;

  document.getElementById('quickLinksSection').style.display = 'block';
}

// Time Filter Functions
function applyTimeFilters() {
  const dateRange = document.getElementById('filterDateRange').value;
  const activityType = document.getElementById('filterActivityType').value;
  const client = document.getElementById('filterClient').value;

  activeFilters.dateRange = dateRange;
  activeFilters.activityType = activityType;
  activeFilters.client = client;

  if (dateRange === 'custom') {
    activeFilters.dateFrom = document.getElementById('filterDateFrom').value;
    activeFilters.dateTo = document.getElementById('filterDateTo').value;
  } else {
    const today = new Date();
    if (dateRange === 'today') {
      activeFilters.dateFrom = today.toISOString().split('T')[0];
      activeFilters.dateTo = today.toISOString().split('T')[0];
    } else if (dateRange === 'week') {
      const weekAgo = new Date(today);
      weekAgo.setDate(today.getDate() - 7);
      activeFilters.dateFrom = weekAgo.toISOString().split('T')[0];
      activeFilters.dateTo = today.toISOString().split('T')[0];
    } else if (dateRange === 'month') {
      const monthAgo = new Date(today);
      monthAgo.setMonth(today.getMonth() - 1);
      activeFilters.dateFrom = monthAgo.toISOString().split('T')[0];
      activeFilters.dateTo = today.toISOString().split('T')[0];
    }
  }

  filterAndDisplayEntries();
}

function clearTimeFilters() {
  document.getElementById('filterDateRange').value = 'all';
  document.getElementById('filterActivityType').value = 'all';
  document.getElementById('filterClient').value = 'all';
  document.getElementById('customDateRange').style.display = 'none';
  document.getElementById('customDateRangeTo').style.display = 'none';
  
  activeFilters = {
    dateRange: 'all',
    dateFrom: '',
    dateTo: '',
    activityType: 'all',
    client: 'all'
  };

  filterAndDisplayEntries();
}

function filterAndDisplayEntries() {
  filteredEntries = recentTimeEntries.filter(entry => {
    if (activeFilters.activityType !== 'all' && entry.entry_type !== activeFilters.activityType) {
      return false;
    }
    if (activeFilters.client !== 'all' && entry.client_id !== activeFilters.client) {
      return false;
    }
    if (activeFilters.dateRange !== 'all') {
      const entryDate = entry.date;
      if (activeFilters.dateFrom && entryDate < activeFilters.dateFrom) return false;
      if (activeFilters.dateTo && entryDate > activeFilters.dateTo) return false;
    }
    return true;
  });

  displayRecentEntries();
}

// Template Functions
function loadTemplates() {
  chrome.storage.local.get(['timeTemplates'], (result) => {
    timeTemplates = result.timeTemplates || [];
    displayTemplates();
  });
}

function displayTemplates() {
  const list = document.getElementById('templatesList');
  const section = document.getElementById('timeTemplatesSection');
  
  if (!list || !section) return;

  if (timeTemplates.length === 0) {
    section.style.display = 'none';
    return;
  }

  section.style.display = 'block';
  list.innerHTML = timeTemplates.map((template, index) => `
    <div class="template-item" data-template-index="${index}">
      <div class="template-info">
        <div class="template-name">${escapeHtml(template.name)}</div>
        <div class="template-details">${template.entry_type.replace(/_/g, ' ')} • ${template.duration_minutes} min</div>
      </div>
      <div class="template-actions">
        <button class="template-action-btn use-template-btn" data-index="${index}" title="Use template">▶️</button>
        <button class="template-action-btn delete-template-btn" data-index="${index}" title="Delete">🗑️</button>
      </div>
    </div>
  `).join('');

  // Add event listeners
  list.querySelectorAll('.use-template-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(btn.dataset.index);
      useTemplate(timeTemplates[index]);
    });
  });

  list.querySelectorAll('.delete-template-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(btn.dataset.index);
      deleteTemplate(index);
    });
  });
}

function openSaveTemplateModal() {
  const modal = document.getElementById('saveTemplateModal');
  const entryType = document.getElementById('entryType').value;
  const duration = document.getElementById('duration').value;
  const description = document.getElementById('description').value;
  const notes = document.getElementById('notes').value;

  document.getElementById('templatePreviewType').textContent = entryType.replace(/_/g, ' ');
  document.getElementById('templatePreviewDuration').textContent = duration;
  document.getElementById('templatePreviewDescription').textContent = description || '(none)';
  document.getElementById('templatePreviewNotes').textContent = notes || '(none)';

  modal.style.display = 'flex';
}

function closeSaveTemplateModal() {
  document.getElementById('saveTemplateModal').style.display = 'none';
  document.getElementById('templateName').value = '';
}

function saveTemplate() {
  const name = document.getElementById('templateName').value.trim();
  if (!name) {
    alert('Please enter a template name');
    return;
  }

  const template = {
    name: name,
    entry_type: document.getElementById('entryType').value,
    duration_minutes: parseInt(document.getElementById('duration').value),
    description: document.getElementById('description').value,
    notes: document.getElementById('notes').value
  };

  timeTemplates.push(template);
  chrome.storage.local.set({ timeTemplates: timeTemplates }, () => {
    displayTemplates();
    closeSaveTemplateModal();
  });
}

function useTemplate(template) {
  document.getElementById('entryType').value = template.entry_type;
  document.getElementById('duration').value = template.duration_minutes;
  document.getElementById('description').value = template.description || '';
  document.getElementById('notes').value = template.notes || '';
  
  // Switch to time tab if not already there
  if (currentTab !== 'time') {
    document.querySelector('.tab[data-tab="time"]').click();
  }
}

function deleteTemplate(index) {
  if (confirm('Delete this template?')) {
    timeTemplates.splice(index, 1);
    chrome.storage.local.set({ timeTemplates: timeTemplates }, () => {
      displayTemplates();
    });
  }
}

// Activity Timeline
async function loadActivityTimeline() {
  if (!currentClient) {
    document.getElementById('activityTimeline').innerHTML = '<div class="empty-state">Select a client to view activity timeline</div>';
    return;
  }

  try {
    // Load time entries
    const entriesResponse = await fetch(`${window.API_URL}/api/time-entries?client_id=${currentClient.id}`);
    const entries = await entriesResponse.ok ? await entriesResponse.json() : [];

    const timeline = [];
    
    // Add time entries
    entries.slice(0, 20).forEach(entry => {
      timeline.push({
        type: 'time_entry',
        date: entry.date,
        content: `${entry.entry_type.replace(/_/g, ' ')} - ${entry.duration_minutes} min${entry.description ? ': ' + entry.description : ''}`,
        timestamp: entry.created_at
      });
    });

    // Sort by date (newest first)
    timeline.sort((a, b) => new Date(b.timestamp || b.date) - new Date(a.timestamp || a.date));

    displayActivityTimeline(timeline);
  } catch (error) {
    console.error('Error loading activity timeline:', error);
    document.getElementById('activityTimeline').innerHTML = '<div class="empty-state">Error loading timeline</div>';
  }
}

function displayActivityTimeline(items) {
  const container = document.getElementById('activityTimeline');
  
  if (items.length === 0) {
    container.innerHTML = '<div class="empty-state">No activity found</div>';
    return;
  }

  container.innerHTML = items.map(item => {
    const date = new Date(item.timestamp || item.date);
    return `
      <div class="timeline-item">
        <div class="timeline-header">
          <span class="timeline-type">${item.type === 'time_entry' ? '⏱️ Time Entry' : '📝 Update'}</span>
          <span class="timeline-date">${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
        <div class="timeline-content">${escapeHtml(item.content)}</div>
      </div>
    `;
  }).join('');
}

// Duplicate Entry
function duplicateEntry(entryId) {
  const entry = recentTimeEntries.find(e => e.id === entryId);
  if (!entry) return;

  document.getElementById('entryType').value = entry.entry_type;
  document.getElementById('date').value = entry.date;
  document.getElementById('duration').value = entry.duration_minutes;
  document.getElementById('description').value = entry.description || '';
  document.getElementById('notes').value = entry.notes || '';

  // Switch to time tab
  if (currentTab !== 'time') {
    document.querySelector('.tab[data-tab="time"]').click();
  }
}

// Keyboard Shortcuts
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Don't trigger shortcuts when typing in inputs
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
      return;
    }

    // Cmd/Ctrl + S to save current form
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault();
      if (currentTab === 'time') {
        document.getElementById('saveTimeBtn').click();
      } else if (currentTab === 'edit') {
        document.getElementById('saveClientBtn').click();
      } else if (currentTab === 'tracking') {
        document.getElementById('saveTrackingBtn').click();
      } else if (currentTab === 'whitelabel') {
        document.getElementById('saveWhiteLabelBtn').click();
      }
    }

    // Cmd/Ctrl + K to focus client search
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      document.getElementById('clientSearchInput').focus();
    }

    // Number keys to switch tabs (1-6)
    if (e.key >= '1' && e.key <= '6' && !e.metaKey && !e.ctrlKey) {
      const tabs = ['time', 'activity', 'tasks', 'edit', 'tracking', 'whitelabel'];
      const tabIndex = parseInt(e.key) - 1;
      if (tabs[tabIndex]) {
        const tab = document.querySelector(`.tab[data-tab="${tabs[tabIndex]}"]`);
        if (tab && tab.style.display !== 'none') {
          tab.click();
        }
      }
    }
  });
}

// Task Functions
function loadTasks() {
  chrome.storage.local.get(['tasks'], (result) => {
    tasks = result.tasks || [];
    displayTasks();
    updateTaskStats();
  });
}

function saveTasks() {
  chrome.storage.local.set({ tasks: tasks }, () => {
    displayTasks();
    updateTaskStats();
  });
}

function displayTasks() {
  const list = document.getElementById('tasksList');
  const emptyState = document.getElementById('tasksEmptyState');
  const filter = document.getElementById('taskFilter')?.value || 'all';
  const clientFilter = document.getElementById('taskClientFilter')?.value || 'all';

  if (!list || !emptyState) return;

  // Update client filter dropdown
  updateTaskClientFilter();

  let filteredTasks = [...tasks];

  // Apply client filter
  if (clientFilter !== 'all') {
    filteredTasks = filteredTasks.filter(t => t.client_id === clientFilter);
  }

  // Apply filter
  if (filter === 'pending') {
    filteredTasks = filteredTasks.filter(t => !t.completed);
  } else if (filter === 'completed') {
    filteredTasks = filteredTasks.filter(t => t.completed);
  } else if (filter === 'overdue') {
    const today = new Date().toISOString().split('T')[0];
    filteredTasks = filteredTasks.filter(t => !t.completed && t.due_date && t.due_date < today);
  } else if (filter === 'today') {
    const today = new Date().toISOString().split('T')[0];
    filteredTasks = filteredTasks.filter(t => !t.completed && t.due_date === today);
  } else if (filter === 'week') {
    const today = new Date();
    const weekFromNow = new Date(today);
    weekFromNow.setDate(today.getDate() + 7);
    const todayStr = today.toISOString().split('T')[0];
    const weekStr = weekFromNow.toISOString().split('T')[0];
    filteredTasks = filteredTasks.filter(t => 
      !t.completed && 
      t.due_date && 
      t.due_date >= todayStr && 
      t.due_date <= weekStr
    );
  }

  // Sort: overdue first, then by due date, then by priority
  filteredTasks.sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    
    const today = new Date().toISOString().split('T')[0];
    const aOverdue = a.due_date && a.due_date < today && !a.completed;
    const bOverdue = b.due_date && b.due_date < today && !b.completed;
    if (aOverdue !== bOverdue) return aOverdue ? -1 : 1;
    
    if (a.due_date && b.due_date) {
      return a.due_date.localeCompare(b.due_date);
    }
    if (a.due_date) return -1;
    if (b.due_date) return 1;
    
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  if (filteredTasks.length === 0) {
    list.innerHTML = '';
    emptyState.style.display = 'block';
    return;
  }

  emptyState.style.display = 'none';

  const clientNamesMap = {};
  clients.forEach(c => {
    clientNamesMap[c.id] = c.name;
  });

  // Group tasks by client for better organization (only Vanessa's clients)
  const vanessaClientIds = new Set(clients.map(c => c.id));
  const groupedByClient = {};
  const noClientTasks = [];

  filteredTasks.forEach(task => {
    if (task.client_id && vanessaClientIds.has(task.client_id)) {
      if (!groupedByClient[task.client_id]) {
        groupedByClient[task.client_id] = [];
      }
      groupedByClient[task.client_id].push(task);
    } else if (!task.client_id) {
      noClientTasks.push(task);
    }
    // Skip tasks for non-Vanessa clients
  });

  // Build HTML
  let html = '';

  // Show grouped tasks by client
  Object.keys(groupedByClient).sort((a, b) => {
    const nameA = clientNamesMap[a] || '';
    const nameB = clientNamesMap[b] || '';
    return nameA.localeCompare(nameB);
  }).forEach(clientId => {
    const clientTasks = groupedByClient[clientId];
    const clientName = clientNamesMap[clientId] || 'Unknown Client';
    
    html += `
      <div class="task-client-group">
        <div class="task-client-group-header">
          <span class="task-client-group-name">${escapeHtml(clientName)}</span>
          <span class="task-client-group-count">${clientTasks.length} task${clientTasks.length !== 1 ? 's' : ''}</span>
        </div>
        <div class="task-client-group-tasks">
          ${clientTasks.map(task => renderTaskItem(task, clientNamesMap)).join('')}
        </div>
      </div>
    `;
  });

  // Show tasks without clients
  if (noClientTasks.length > 0) {
    html += `
      <div class="task-client-group">
        <div class="task-client-group-header">
          <span class="task-client-group-name">No Client</span>
          <span class="task-client-group-count">${noClientTasks.length} task${noClientTasks.length !== 1 ? 's' : ''}</span>
        </div>
        <div class="task-client-group-tasks">
          ${noClientTasks.map(task => renderTaskItem(task, clientNamesMap)).join('')}
        </div>
      </div>
    `;
  }

  list.innerHTML = html;

  // Add event listeners
  attachTaskEventListeners(list);
}

function renderTaskItem(task, clientNamesMap) {
  const today = new Date().toISOString().split('T')[0];
  const isOverdue = task.due_date && task.due_date < today && !task.completed;
  const isDueToday = task.due_date === today && !task.completed;
  const isDueSoon = task.due_date && !task.completed && !isOverdue && !isDueToday;
  
  let dueDateClass = '';
  if (isOverdue) dueDateClass = 'overdue';
  else if (isDueToday) dueDateClass = 'due-today';
  else if (isDueSoon) dueDateClass = 'due-soon';

  const dueDateDisplay = task.due_date 
    ? new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'No due date';

  const clientName = task.client_id ? (clientNamesMap[task.client_id] || 'Unknown') : null;

  return `
    <div class="task-item ${task.completed ? 'completed' : ''} ${dueDateClass}" data-task-id="${task.id}">
      <div class="task-header">
        <div class="task-title-row">
          <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} data-task-id="${task.id}">
          <span class="task-title">${escapeHtml(task.title)}</span>
          <span class="task-priority ${task.priority}">${task.priority}</span>
        </div>
        <div class="task-actions">
          ${!task.completed && task.client_id ? `
            <button class="task-action-btn log-time-btn" data-task-id="${task.id}" title="Log Time">⏱️</button>
          ` : ''}
          <button class="task-action-btn edit-task-btn" data-task-id="${task.id}" title="Edit">✏️</button>
          <button class="task-action-btn delete-task-btn" data-task-id="${task.id}" title="Delete">🗑️</button>
        </div>
      </div>
      ${task.description ? `<div class="task-description">${escapeHtml(task.description)}</div>` : ''}
      <div class="task-meta">
        <div class="task-meta-item">
          <span>📅</span>
          <span class="${isOverdue ? 'overdue' : ''}">${dueDateDisplay}</span>
        </div>
        ${task.duration_minutes ? `
          <div class="task-meta-item">
            <span>⏱️</span>
            <span class="task-duration">${task.duration_minutes} min</span>
          </div>
        ` : ''}
        ${task.time_logged ? `
          <div class="task-meta-item">
            <span class="task-logged">✅ Time logged</span>
          </div>
        ` : ''}
        <div class="task-meta-item">
          <span>🕐</span>
          <span>Created ${new Date(task.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
        </div>
      </div>
    </div>
  `;
}

function attachTaskEventListeners(list) {
  // Add event listeners for buttons
  list.querySelectorAll('.task-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      const taskId = e.target.dataset.taskId;
      toggleTaskComplete(taskId);
    });
  });

  list.querySelectorAll('.edit-task-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const taskId = btn.dataset.taskId;
      openTaskModal(taskId);
    });
  });

  list.querySelectorAll('.delete-task-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const taskId = btn.dataset.taskId;
      if (confirm('Delete this task?')) {
        deleteTaskById(taskId);
      }
    });
  });

  list.querySelectorAll('.log-time-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const taskId = btn.dataset.taskId;
      const task = tasks.find(t => t.id === taskId);
      if (task && task.duration_minutes) {
        logTaskTime(taskId);
      } else {
        // Open edit modal to add duration
        openTaskModal(taskId);
        alert('Please add a duration to this task before logging time.');
      }
    });
  });

  list.querySelectorAll('.task-client-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const clientId = link.dataset.clientId;
      if (clientId) {
        const client = clients.find(c => c.id === clientId);
        if (client) {
          document.getElementById('clientSelectMain').value = clientId;
          document.getElementById('clientSearchInput').value = client.name;
          document.getElementById('clientSearchInput').dataset.clientId = clientId;
          loadClientData(clientId);
          document.querySelector('.tab[data-tab="edit"]').click();
        }
      }
    });
  });
}


function updateTaskStats() {
  const clientFilter = document.getElementById('taskClientFilter')?.value || 'all';
  let tasksToCount = [...tasks];
  
  // Apply client filter to stats
  if (clientFilter !== 'all') {
    tasksToCount = tasksToCount.filter(t => t.client_id === clientFilter);
  }
  
  const total = tasksToCount.length;
  const pending = tasksToCount.filter(t => !t.completed).length;
  const today = new Date().toISOString().split('T')[0];
  const overdue = tasksToCount.filter(t => !t.completed && t.due_date && t.due_date < today).length;

  document.getElementById('taskTotalCount').textContent = total;
  document.getElementById('taskPendingCount').textContent = pending;
  document.getElementById('taskOverdueCount').textContent = overdue;
}

function updateTaskClientFilter() {
  const dropdown = document.getElementById('taskClientFilter');
  if (!dropdown) return;

  // Get unique client IDs from tasks (only Vanessa's clients)
  const vanessaClientIds = new Set(clients.map(c => c.id));
  const clientIds = [...new Set(tasks.filter(t => t.client_id && vanessaClientIds.has(t.client_id)).map(t => t.client_id))];
  const currentValue = dropdown.value;

  dropdown.innerHTML = '<option value="all">All Clients</option>';
  
  const clientNamesMap = {};
  clients.forEach(c => {
    clientNamesMap[c.id] = c.name;
  });

  // Sort by client name
  clientIds.sort((a, b) => {
    const nameA = clientNamesMap[a] || '';
    const nameB = clientNamesMap[b] || '';
    return nameA.localeCompare(nameB);
  });

  clientIds.forEach(clientId => {
    const option = document.createElement('option');
    option.value = clientId;
    option.textContent = clientNamesMap[clientId] || 'Unknown Client';
    dropdown.appendChild(option);
  });

  // Restore previous selection if still valid
  if (currentValue && clientIds.includes(currentValue)) {
    dropdown.value = currentValue;
  } else {
    dropdown.value = 'all';
  }
}

function openTaskModal(taskId = null) {
  editingTaskId = taskId;
  const modal = document.getElementById('taskModal');
  const title = document.getElementById('taskModalTitle');
  const deleteBtn = document.getElementById('deleteTaskBtn');
  const taskClientSearch = document.getElementById('taskClientSearch');
  const taskClientHidden = document.getElementById('taskClient');
  const taskClientDropdown = document.getElementById('taskClientDropdown');

  // Setup searchable dropdown for clients
  setupTaskClientDropdown();

  if (taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      title.textContent = 'Edit Task';
      deleteBtn.style.display = 'block';
      document.getElementById('taskTitle').value = task.title;
      document.getElementById('taskDescription').value = task.description || '';
      document.getElementById('taskDueDate').value = task.due_date || '';
      document.getElementById('taskPriority').value = task.priority || 'medium';
      document.getElementById('taskDuration').value = task.duration_minutes || '';
      document.getElementById('taskActivityType').value = task.activity_type || 'implementation';
      
      // Set client search input
      if (task.client_id) {
        const client = clients.find(c => c.id === task.client_id);
        if (client) {
          taskClientSearch.value = client.name;
          taskClientSearch.dataset.clientId = task.client_id;
          taskClientHidden.value = task.client_id;
        } else {
          taskClientSearch.value = '';
          taskClientSearch.dataset.clientId = '';
          taskClientHidden.value = '';
        }
      } else {
        taskClientSearch.value = '';
        taskClientSearch.dataset.clientId = '';
        taskClientHidden.value = '';
      }
    }
  } else {
    title.textContent = 'Add Task';
    deleteBtn.style.display = 'none';
    document.getElementById('taskTitle').value = '';
    document.getElementById('taskDescription').value = '';
    document.getElementById('taskDueDate').value = '';
    document.getElementById('taskPriority').value = 'medium';
    document.getElementById('taskDuration').value = '';
    document.getElementById('taskActivityType').value = 'implementation';
    taskClientSearch.value = '';
    taskClientSearch.dataset.clientId = '';
    taskClientHidden.value = '';
  }

  modal.style.display = 'flex';
}

function setupTaskClientDropdown() {
  const searchInput = document.getElementById('taskClientSearch');
  const dropdown = document.getElementById('taskClientDropdown');
  const hiddenInput = document.getElementById('taskClient');

  if (!searchInput || !dropdown || !hiddenInput) return;

  // Render dropdown list
  function renderTaskClientDropdown(clientsToRender, searchTerm = '') {
    if (!clientsToRender || clientsToRender.length === 0) {
      dropdown.innerHTML = '<div class="dropdown-empty">No clients found</div>';
      dropdown.style.display = 'block';
      return;
    }

    const filtered = searchTerm 
      ? clientsToRender.filter(client => 
          client.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : clientsToRender;

    if (filtered.length === 0) {
      dropdown.innerHTML = '<div class="dropdown-empty">No clients match your search</div>';
      dropdown.style.display = 'block';
      return;
    }

    dropdown.innerHTML = filtered.map(client => `
      <div class="dropdown-item" data-client-id="${client.id}" data-client-name="${escapeHtml(client.name)}">
        <div class="dropdown-item-name">${escapeHtml(client.name)}</div>
        <div class="dropdown-item-meta">ACV: $${formatNumber(client.revenue_amount || 0)}</div>
      </div>
    `).join('');

    // Add click handlers
    dropdown.querySelectorAll('.dropdown-item').forEach(item => {
      item.addEventListener('click', () => {
        const clientId = item.dataset.clientId;
        const clientName = item.dataset.clientName;
        
        hiddenInput.value = clientId;
        searchInput.value = clientName;
        searchInput.dataset.clientId = clientId;
        dropdown.style.display = 'none';
      });
    });

    dropdown.style.display = 'block';
  }

  // Show dropdown on focus
  searchInput.addEventListener('focus', () => {
    if (clients.length > 0) {
      renderTaskClientDropdown(clients, searchInput.value);
    } else {
      dropdown.innerHTML = '<div class="dropdown-loading">Loading clients...</div>';
      dropdown.style.display = 'block';
      loadClients().then(() => {
        renderTaskClientDropdown(clients, searchInput.value);
      });
    }
  });

  // Filter on input
  searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value;
    if (clients.length > 0) {
      renderTaskClientDropdown(clients, searchTerm);
    }
  });

  // Hide dropdown when clicking outside the task client dropdown
  document.addEventListener('click', (e) => {
    const taskModal = document.getElementById('taskModal');
    if (taskModal && taskModal.style.display === 'flex') {
      if (!e.target.closest('#taskClientSearch') && 
          !e.target.closest('#taskClientDropdown') &&
          !e.target.closest('.modal-close-btn')) {
        dropdown.style.display = 'none';
      }
    }
  });

  // Handle keyboard navigation
  searchInput.addEventListener('keydown', (e) => {
    const items = dropdown.querySelectorAll('.dropdown-item');
    const selected = dropdown.querySelector('.dropdown-item.selected');
    let currentIndex = selected ? Array.from(items).indexOf(selected) : -1;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      currentIndex = Math.min(currentIndex + 1, items.length - 1);
      items.forEach(item => item.classList.remove('selected'));
      if (items[currentIndex]) {
        items[currentIndex].classList.add('selected');
        items[currentIndex].scrollIntoView({ block: 'nearest' });
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      currentIndex = Math.max(currentIndex - 1, -1);
      items.forEach(item => item.classList.remove('selected'));
      if (currentIndex >= 0 && items[currentIndex]) {
        items[currentIndex].classList.add('selected');
        items[currentIndex].scrollIntoView({ block: 'nearest' });
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selectedItem = dropdown.querySelector('.dropdown-item.selected');
      if (selectedItem) {
        selectedItem.click();
      } else if (items.length === 1) {
        items[0].click();
      }
    } else if (e.key === 'Escape') {
      dropdown.style.display = 'none';
      searchInput.blur();
    }
  });
}

function closeTaskModal() {
  const modal = document.getElementById('taskModal');
  modal.style.display = 'none';
  editingTaskId = null;
  
  // Clear and hide dropdown
  const dropdown = document.getElementById('taskClientDropdown');
  const searchInput = document.getElementById('taskClientSearch');
  if (dropdown) dropdown.style.display = 'none';
  if (searchInput) {
    searchInput.value = '';
    searchInput.dataset.clientId = '';
  }
}

function saveTask() {
  const title = document.getElementById('taskTitle').value.trim();
  if (!title) {
    alert('Please enter a task title');
    return;
  }

  const duration = parseInt(document.getElementById('taskDuration').value);
  const durationMinutes = duration && duration > 0 ? duration : null;

  // Get client ID from hidden input or search input dataset
  const taskClientHidden = document.getElementById('taskClient');
  const taskClientSearch = document.getElementById('taskClientSearch');
  const clientId = taskClientHidden.value || taskClientSearch.dataset.clientId || null;

  const task = {
    id: editingTaskId || Date.now().toString(),
    title: title,
    description: document.getElementById('taskDescription').value.trim(),
    due_date: document.getElementById('taskDueDate').value || null,
    priority: document.getElementById('taskPriority').value,
    client_id: clientId,
    duration_minutes: durationMinutes,
    activity_type: document.getElementById('taskActivityType').value,
    time_logged: editingTaskId ? tasks.find(t => t.id === editingTaskId)?.time_logged || false : false,
    completed: editingTaskId ? tasks.find(t => t.id === editingTaskId)?.completed || false : false,
    created_at: editingTaskId 
      ? tasks.find(t => t.id === editingTaskId)?.created_at || new Date().toISOString()
      : new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  if (editingTaskId) {
    const index = tasks.findIndex(t => t.id === editingTaskId);
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...task };
    }
  } else {
    tasks.push(task);
  }

  saveTasks();
  closeTaskModal();
  updateTaskClientFilter();
}

function deleteTask() {
  if (editingTaskId) {
    deleteTaskById(editingTaskId);
    closeTaskModal();
  }
}

function deleteTaskById(taskId) {
  tasks = tasks.filter(t => t.id !== taskId);
  saveTasks();
  updateTaskClientFilter();
}

function toggleTaskComplete(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    const wasCompleted = task.completed;
    task.completed = !task.completed;
    task.updated_at = new Date().toISOString();
    
    // If marking as completed and has duration + client, offer to log time
    if (!wasCompleted && task.completed && task.duration_minutes && task.client_id && !task.time_logged) {
      if (confirm(`Log ${task.duration_minutes} minutes to time tracking for this task?`)) {
        logTaskTime(taskId);
      }
    }
    
    saveTasks();
  }
}

async function logTaskTime(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (!task || !task.client_id || !task.duration_minutes) {
    alert('Task must have a client and duration to log time');
    return;
  }

  try {
    const today = new Date().toISOString().split('T')[0];
    
    const response = await fetch(`${window.API_URL}/api/time-entries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: task.client_id,
        entry_type: task.activity_type || 'implementation',
        date: today,
        duration_minutes: task.duration_minutes,
        description: `Task: ${task.title}`,
        notes: task.description || null,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to log time');
    }

    // Mark task as time logged
    task.time_logged = true;
    task.time_logged_at = new Date().toISOString();
    saveTasks();

    // Reload time entries and summary if current client matches
    if (currentClient && currentClient.id === task.client_id) {
      await loadRecentEntries(currentClient.id);
      await loadTimeSummary(currentClient.id);
      await loadTodaySummary();
      updateHealthIndicators();
    }

    // Show success message
    const taskItem = document.querySelector(`[data-task-id="${taskId}"]`);
    if (taskItem) {
      const loggedBadge = document.createElement('div');
      loggedBadge.className = 'task-logged';
      loggedBadge.innerHTML = '✅ Time logged';
      taskItem.querySelector('.task-meta').appendChild(loggedBadge);
      setTimeout(() => loggedBadge.remove(), 3000);
    }

  } catch (error) {
    console.error('Error logging task time:', error);
    alert(`Error logging time: ${error.message}`);
  }
}

// Utility functions
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatNumber(num) {
  return new Intl.NumberFormat('en-US').format(num);
}
