# Extension Icons

Place your extension icons here:

- `icon16.png` - 16x16 pixels (toolbar icon)
- `icon48.png` - 48x48 pixels (extension management page)
- `icon128.png` - 128x128 pixels (Chrome Web Store)

## Creating Icons

You can:
1. Use the Hubflo logo from `/public/hubflo-logo.png` and resize it
2. Create custom icons matching the Hubflo brand (gold/yellow gradient)
3. Use an online tool like https://www.favicon-generator.org/

The icons should be PNG format with transparent backgrounds.

## Quick Icon Creation

If you have ImageMagick installed:
```bash
convert ../public/hubflo-logo.png -resize 16x16 icon16.png
convert ../public/hubflo-logo.png -resize 48x48 icon48.png
convert ../public/hubflo-logo.png -resize 128x128 icon128.png
```

Or use any image editor to resize the logo to these dimensions.

