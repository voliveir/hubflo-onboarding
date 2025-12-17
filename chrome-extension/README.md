# Hubflo Implementation Manager - Chrome Extension

A Chrome extension for quick access to client management and time tracking on implementhubflo.com.

## Features

- ⏱️ **Quick Time Tracking** - Log time entries without opening the full dashboard
- 👥 **Client Management** - Browse and search clients quickly
- 🔗 **Quick Access** - Direct links to client pages and dashboard
- 🎨 **Modern UI** - Beautiful interface matching Hubflo brand colors

## Installation

### From Source

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `chrome-extension` folder
5. The extension icon should appear in your toolbar

## Configuration

1. Click the extension icon
2. Click the settings (⚙️) button
3. Enter your API base URL (default: `https://implementhubflo.com`)
4. Click "Test Connection" to verify
5. Click "Save Settings"

## Usage

### Time Tracking

1. Click the extension icon
2. Select a client from the dropdown
3. Choose activity type (meeting, email, implementation, etc.)
4. Set date and duration
5. Add description and notes (optional)
6. Click "Save Time Entry"

### Client Management

1. Click the extension icon
2. Switch to the "Clients" tab
3. Search for clients by name
4. Click any client card to open their page in a new tab
5. Click "Open Dashboard" to access the full admin panel

## Development

### File Structure

```
chrome-extension/
├── manifest.json       # Extension manifest
├── popup.html          # Main popup UI
├── popup.css           # Popup styles
├── popup.js            # Popup functionality
├── background.js       # Service worker
├── options.html        # Settings page
├── options.css         # Settings styles
├── options.js          # Settings functionality
└── icons/              # Extension icons (create these)
```

### Creating Icons

You'll need to create icon files:
- `icons/icon16.png` (16x16px)
- `icons/icon48.png` (48x48px)
- `icons/icon128.png` (128x128px)

You can use the Hubflo logo or create custom icons matching the brand.

## API Endpoints Used

- `GET /api/clients-list` - Fetch list of clients
- `POST /api/time-entries` - Create time entry
- `GET /api/time-entries` - Fetch time entries (future use)

## Permissions

- `storage` - Store user settings
- `activeTab` - Access current tab (for future features)
- `host_permissions` - Access implementhubflo.com APIs

## Troubleshooting

**Extension not loading clients:**
- Check your API URL in settings
- Verify the URL is accessible
- Check browser console for errors (right-click extension icon → Inspect popup)

**Time entries not saving:**
- Verify API URL is correct
- Check that you're logged into implementhubflo.com in the same browser
- Check browser console for API errors

## Future Enhancements

- View recent time entries
- Edit/delete time entries
- Quick client status updates
- Notifications for important updates
- Offline support

