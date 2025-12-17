# Installation Guide

## Quick Start

1. **Create Extension Icons**
   - Go to `chrome-extension/icons/` folder
   - Create three PNG files: `icon16.png`, `icon48.png`, `icon128.png`
   - You can use the Hubflo logo from `../public/hubflo-logo.png` and resize it
   - Or use any image editor/online tool to create icons

2. **Load Extension in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right corner)
   - Click "Load unpacked"
   - Navigate to and select the `chrome-extension` folder
   - The extension should now appear in your extensions list

3. **Configure Settings**
   - Click the extension icon in your toolbar
   - Click the settings (⚙️) button
   - Enter your API URL (default: `https://implementhubflo.com`)
   - Click "Test Connection" to verify it works
   - Click "Save Settings"

4. **Start Using**
   - Click the extension icon anytime
   - Track time or browse clients without opening the full dashboard!

## Troubleshooting

**Extension won't load:**
- Make sure all files are in the `chrome-extension` folder
- Check that `manifest.json` is valid JSON
- Look for errors in `chrome://extensions/` (click "Errors" if shown)

**Icons not showing:**
- Make sure all three icon files exist in `icons/` folder
- Check file names match exactly: `icon16.png`, `icon48.png`, `icon128.png`
- Verify files are valid PNG images

**Can't connect to API:**
- Verify your API URL is correct in settings
- Make sure you're logged into implementhubflo.com in Chrome
- Check browser console for CORS or network errors
- Try testing the API URL directly in your browser

**Time entries not saving:**
- Check browser console (right-click extension icon → Inspect popup)
- Verify all required fields are filled
- Ensure API URL is correct and accessible

## Development Mode

When developing, Chrome will automatically reload the extension when you make changes. Just refresh the popup or reload the extension from `chrome://extensions/`.

## Next Steps

- Customize the UI colors/styles if needed
- Add more features (edit time entries, client quick edits, etc.)
- Consider publishing to Chrome Web Store for team use

