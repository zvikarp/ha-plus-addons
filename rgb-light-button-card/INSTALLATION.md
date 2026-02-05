# Installation Guide for RGB Light Button Card

## Overview
The RGB Light Button Card is a **custom Lovelace card** for Home Assistant. It is NOT a Home Assistant Add-on/App. Custom cards are frontend components that extend the Home Assistant dashboard interface.

## What's the Difference?

### Home Assistant Apps (formerly Add-ons)
- Server-side applications that run in containers
- Installed through the Add-on Store in Home Assistant OS/Supervised
- Examples: Matter Hub, ESPHome, Node-RED
- Located in: Supervisor → Add-ons

### Custom Lovelace Cards (like this one)
- Frontend UI components that run in your browser
- Add new card types to your dashboards
- Installed manually or through HACS
- Examples: Button Card, Mushroom Cards, Mini Graph Card
- Used in: Lovelace dashboards

## Installation Options

### Option 1: Manual Installation (Recommended for first-time users)

1. **Download the file**
   - Download `rgb-light-button-card.js` from this repository

2. **Create www folder if needed**
   ```bash
   # SSH or Terminal add-on
   cd /config
   mkdir -p www
   ```

3. **Copy the file**
   - Place `rgb-light-button-card.js` in `/config/www/`

4. **Add resource to Lovelace**
   
   **Method A: Via UI (Easier)**
   - Go to Settings → Dashboards
   - Click the three dots menu (top right)
   - Select "Resources"
   - Click "+ Add Resource"
   - URL: `/local/rgb-light-button-card.js`
   - Resource type: "JavaScript Module"
   - Click "Create"

   **Method B: Via configuration.yaml**
   ```yaml
   lovelace:
     mode: yaml
     resources:
       - url: /local/rgb-light-button-card.js
         type: module
   ```

5. **Restart Home Assistant**
   - Settings → System → Restart

6. **Clear browser cache**
   - Press Ctrl+F5 (Windows/Linux) or Cmd+Shift+R (Mac)

7. **Add the card to your dashboard**
   - Edit your dashboard
   - Click "Add Card"
   - Search for "RGB Light Button Card" or use manual card:
   ```yaml
   type: custom:rgb-light-button-card
   entity: light.your_light_entity
   ```

### Option 2: HACS Installation (When Available)

**Note:** To use HACS, this card needs to be in its own repository. You mentioned you might copy it to a separate repo - this is recommended for HACS distribution.

1. **Install HACS first** (if not already installed)
   - Follow instructions at https://hacs.xyz/

2. **Add custom repository** (if not in default HACS)
   - HACS → Frontend
   - Click three dots menu → Custom repositories
   - Repository: `https://github.com/yourusername/rgb-light-button-card`
   - Category: Lovelace
   - Click "Add"

3. **Install the card**
   - HACS → Frontend
   - Click "+ Explore & Download Repositories"
   - Search for "RGB Light Button Card"
   - Click "Download"

4. **Restart Home Assistant**

5. **Clear browser cache**

### Option 3: Copying to Separate Repository (Recommended for Distribution)

For wider distribution and easier HACS integration:

1. **Create new repository**
   ```bash
   # On your local machine or GitHub
   mkdir rgb-light-button-card
   cd rgb-light-button-card
   git init
   ```

2. **Copy these files from this folder:**
   - `rgb-light-button-card.js` (the card itself)
   - `README.md` (documentation)
   - `hacs.json` (HACS configuration)
   - `package.json` (npm package info)
   - `example-config.yaml` (examples)
   - `info.md` (if you want a short description)

3. **Add to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/rgb-light-button-card.git
   git push -u origin main
   ```

4. **Submit to HACS**
   - Go to https://github.com/hacs/default
   - Fork the repository
   - Add your repository to `plugins.json`
   - Create a pull request

## Verification

To verify the card is installed correctly:

1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Look for: `RGB-LIGHT-BUTTON-CARD 1.0.0` in green

## Troubleshooting

### Card doesn't appear in card picker
- Clear browser cache completely
- Restart Home Assistant
- Check browser console for JavaScript errors

### "Custom element doesn't exist: rgb-light-button-card"
- Resource not loaded correctly
- Check the URL in resources (must be `/local/...` not `/www/...`)
- Verify file is in correct location

### Colors don't work
- Check entity supports RGB colors
- Test with Developer Tools → Services
- Service: `light.turn_on`
- Data: 
  ```yaml
  entity_id: light.your_light
  rgb_color: [255, 0, 0]
  ```

### Effects don't work  
- Not all lights support effects
- Check available effects in Developer Tools → States → your light entity
- Look at `effect_list` attribute

## Where Files Go

```
homeassistant/
├── configuration.yaml         # Add resource here (if using yaml mode)
└── www/                       # Your custom files
    └── rgb-light-button-card.js  # Place the card here
```

## Next Steps

1. Install the card using one of the methods above
2. Add it to a dashboard
3. Configure colors and effects for your lights
4. See `example-config.yaml` for configuration examples
5. Check `README.md` for detailed configuration options

## Support

For issues or questions:
- GitHub Issues: https://github.com/zvikarp/ha-plus-addons/issues
- Home Assistant Community: https://community.home-assistant.io/
