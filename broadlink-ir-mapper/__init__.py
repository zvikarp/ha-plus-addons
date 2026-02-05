"""
BroadLink IR Remote Mapper Integration
Maps IR remote commands from BroadLink devices to Home Assistant light entities
"""

import logging
import voluptuous as vol

from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.typing import ConfigType

_LOGGER = logging.getLogger(__name__)

DOMAIN = "broadlink_ir_mapper"
PLATFORMS = [Platform.LIGHT]

CONFIG_SCHEMA = vol.Schema(
    {
        DOMAIN: vol.Schema({
            vol.Optional("config_flow"): cv.boolean,
        })
    },
    extra=vol.ALLOW_EXTRA,
)


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Set up the BroadLink IR Mapper integration."""
    _LOGGER.info("Setting up BroadLink IR Mapper")
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigType) -> bool:
    """Set up BroadLink IR Mapper from a config entry."""
    _LOGGER.info("Setting up BroadLink IR Mapper from config entry")
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigType) -> bool:
    """Unload a config entry."""
    return await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
