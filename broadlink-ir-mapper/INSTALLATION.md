# Installation Guide - BroadLink IR Remote Mapper

## What This Is

The BroadLink IR Remote Mapper is a **Home Assistant custom integration** (not an App/Add-on). It's a backend component that creates light entities from IR remote commands.

## Prerequisites

Before installing, make sure you have:

1. ✅ Home Assistant installed and running
2. ✅ BroadLink integration already set up
3. ✅ BroadLink remote entity working (e.g., `remote.broadlink_rm4_remote`)
4. ✅ Access to your Home Assistant configuration files

## Installation Methods

### Method 1: Manual Installation (Recommended)

#### Step 1: Copy Files

1. **Access your Home Assistant configuration directory**
   - If using Home Assistant OS: Use File Editor or Samba add-on
   - If using Docker: Access the container or mounted volume
   - If using Core: Navigate to your config directory

2. **Create the custom_components directory** (if it doesn't exist)
   ```
   config/
   └── custom_components/  (create this folder)
   ```

3. **Copy the broadlink-ir-mapper folder**
   ```
   config/
   └── custom_components/
       └── broadlink_ir_mapper/  (copy this entire folder here)
           ├── __init__.py
           ├── light.py
           ├── manifest.json
           └── README.md
   ```

#### Step 2: Learn IR Codes

Before configuring, you need to learn IR codes from your physical remote:

1. **Open Developer Tools → Services**

2. **Learn power on command:**
   ```yaml
   service: remote.learn_command
   data:
     entity_id: remote.broadlink_rm4_remote
     device: led_strip
     command: power_on
   ```
   - Press the power button on your physical remote when prompted
   - Wait for confirmation

3. **Repeat for all buttons you want to map:**
   - Power off
   - Each color button
   - Each effect button
   - Brightness up/down (if available)

4. **Find the learned codes** in:
   - Home Assistant → Configuration → Integrations → BroadLink
   - Or in `.storage/` folder (advanced)

#### Step 3: Configure in configuration.yaml

1. **Edit your `configuration.yaml`** file

2. **Add your lights:**
   ```yaml
   light:
     - platform: broadlink_ir_mapper
       name: "Bedroom LED Strip"
       broadlink_remote: remote.broadlink_rm4_remote
       ir_codes:
         power_on: "JgBQAAABJZIU..."  # Paste your learned code
         power_off: "JgBQAAABJpIU..."  # Paste your learned code
       colors:
         - name: "Red"
           rgb: [255, 0, 0]
           ir_code: "JgBQAAABJZIU..."  # Paste learned code
         - name: "Green"
           rgb: [0, 255, 0]
           ir_code: "JgBQAAABJZMU..."  # Paste learned code
         # Add more colors...
       effects:
         - name: "Flash"
           ir_code: "JgBQAAABJpIU..."  # Paste learned code
         # Add more effects...
   ```

3. **Save the file**

#### Step 4: Restart Home Assistant

1. Go to **Configuration → Server Controls**
2. Click **Restart**
3. Wait for Home Assistant to restart

#### Step 5: Verify

1. Check **Configuration → Entities**
2. Look for your new light entity (e.g., `light.bedroom_led_strip`)
3. Test turning it on/off
4. Test setting colors

### Method 2: HACS Installation (When Available)

**Note:** This integration needs to be submitted to HACS first. For now, use manual installation.

Once available in HACS:

1. **Open HACS** in Home Assistant
2. Go to **Integrations**
3. Click **+ Explore & Download Repositories**
4. Search for "BroadLink IR Remote Mapper"
5. Click **Download**
6. **Restart** Home Assistant
7. **Configure** in configuration.yaml (see Method 1, Step 3)

## Quick Start Example

Here's a minimal working example to get you started:

```yaml
# configuration.yaml
light:
  - platform: broadlink_ir_mapper
    name: "Test LED Strip"
    broadlink_remote: remote.broadlink_rm4_remote
    ir_codes:
      power_on: "JgBQAAABJZIUEhQ6FBIUEhQSFBIUEhQ6FDoUOhQ6FDoUEhQSFBIUOhQSFBIUEhQSFBIUEhQSFBIUOhQ6FDoUOhQ6FDoUOhQSFAAFGgABJ0kUAA0FAAAAAAAAAAA="
      power_off: "JgBQAAABJpIUEhQ6FBIUEhQSFBIUEhQ6FDoUOhQ6FDoUEhQSFDoUEhQSFBIUEhQSFBIUEhQSFDoUOhQ6FDoUOhQ6FBIUOhQABRoAAScADQU="
    colors:
      - name: "Red"
        rgb: [255, 0, 0]
        ir_code: "JgBQAAABJZIUEhQ6FBIUEhQSFBIUEhQ6FDoUOhQ6FDoUOhQSFBIUEhQSFBIUEhQSFBIUEhQSFBIUOhQ6FDoUOhQ6FDoUOhQABRoAAScADQU="
      - name: "Blue"
        rgb: [0, 0, 255]
        ir_code: "JgBQAAABJpITEhQ6FBIUEhQSFBIUEhQ6FDoUOhQ6FDoUOhQSFBIUEhQSFBIUEhQSFBIUEhQSFBIUOhQ6FDoUOhQ6FDoUOhQABRkAAScADQU="
```

## Troubleshooting Installation

### Integration not found after restart

**Problem:** Home Assistant says integration is not found

**Solution:**
1. Check folder name is exactly `broadlink_ir_mapper` (with underscore)
2. Verify all files are in the correct location
3. Check file permissions (should be readable by Home Assistant)
4. Look at Home Assistant logs for errors

### Configuration validation failed

**Problem:** YAML configuration is invalid

**Solution:**
1. Check YAML indentation (use spaces, not tabs)
2. Verify all required fields are present
3. Make sure IR codes are valid strings (in quotes)
4. Use YAML validator online to check syntax

### IR codes don't work

**Problem:** Commands send but light doesn't respond

**Solution:**
1. Test IR codes directly using `remote.send_command` service
2. Verify BroadLink remote has clear line of sight to device
3. Make sure batteries in BroadLink remote are good
4. Re-learn codes if they don't work

### Light entity doesn't appear

**Problem:** No light entity created

**Solution:**
1. Check Home Assistant logs for errors
2. Verify platform name is exactly `broadlink_ir_mapper`
3. Make sure `name` field is unique
4. Check that `broadlink_remote` entity exists and is correct

## Where Files Go

```
homeassistant/
├── configuration.yaml              # Add light configuration here
└── custom_components/              # Create if doesn't exist
    └── broadlink_ir_mapper/        # Copy entire folder here
        ├── __init__.py             # Integration setup
        ├── light.py                # Light platform implementation
        ├── manifest.json           # Integration metadata
        ├── README.md               # Documentation
        ├── example-configuration.yaml
        └── INSTALLATION.md
```

## Post-Installation

### Test Your Setup

1. **Test power on/off:**
   - Go to your light entity
   - Click to turn on/off
   - Verify LED responds

2. **Test colors:**
   - Use light controls to set a color
   - Verify LED changes to that color

3. **Test effects:**
   - Select an effect from the dropdown
   - Verify LED effect activates

### Add to Dashboard

Use with RGB Light Button Card for best experience:

```yaml
type: custom:rgb-light-button-card
entity: light.bedroom_led_strip
title: Bedroom LEDs
```

### Create Automations

Example automation:

```yaml
automation:
  - alias: "Evening LED lights"
    trigger:
      - platform: sun
        event: sunset
    action:
      - service: light.turn_on
        target:
          entity_id: light.bedroom_led_strip
        data:
          rgb_color: [255, 230, 180]  # Warm white
```

## Next Steps

1. ✅ Learn remaining IR codes for all your buttons
2. ✅ Configure all your colors and effects
3. ✅ Test each color and effect
4. ✅ Add to dashboards
5. ✅ Create automations
6. ✅ Integrate with voice assistants

## Getting Help

If you encounter issues:

1. Check Home Assistant logs: **Configuration → Logs**
2. Verify BroadLink integration is working
3. Test IR codes directly with `remote.send_command`
4. Review example configurations
5. Open an issue on GitHub with logs and configuration

## Advanced Configuration

### Multiple Remotes

If you have multiple BroadLink remotes:

```yaml
light:
  - platform: broadlink_ir_mapper
    name: "Living Room LED"
    broadlink_remote: remote.living_room_broadlink
    # ... rest of config

  - platform: broadlink_ir_mapper
    name: "Bedroom LED"
    broadlink_remote: remote.bedroom_broadlink
    # ... rest of config
```

### Unique IDs

Add unique IDs for entity management:

```yaml
light:
  - platform: broadlink_ir_mapper
    name: "Bedroom LED"
    unique_id: bedroom_led_strip_ir_001
    # ... rest of config
```

### Custom Colors

Match exact colors from your remote:

```yaml
colors:
  - name: "Sunset Orange"
    rgb: [255, 140, 0]
    ir_code: "JgBQAAABJZMT..."
  - name: "Ocean Blue"
    rgb: [0, 119, 190]
    ir_code: "JgBQAAABJpIT..."
```

## Support

For questions or issues:
- GitHub Issues: https://github.com/zvikarp/ha-plus-addons/issues
- Home Assistant Community: https://community.home-assistant.io/
