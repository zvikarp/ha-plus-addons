"""
BroadLink IR Remote Mapper for Home Assistant
Maps IR remote commands from BroadLink devices to Home Assistant controls
Specifically designed for LED lights and other IR-controlled devices
"""

import logging
from typing import Any, Dict, List, Optional
import voluptuous as vol

from homeassistant.components.light import (
    ATTR_BRIGHTNESS,
    ATTR_RGB_COLOR,
    ATTR_EFFECT,
    SUPPORT_BRIGHTNESS,
    SUPPORT_COLOR,
    SUPPORT_EFFECT,
    LightEntity,
)
from homeassistant.const import CONF_NAME, CONF_UNIQUE_ID, STATE_ON, STATE_OFF
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.typing import ConfigType, DiscoveryInfoType

_LOGGER = logging.getLogger(__name__)

DOMAIN = "broadlink_ir_mapper"

# Configuration constants
CONF_BROADLINK_REMOTE = "broadlink_remote"
CONF_IR_CODES = "ir_codes"
CONF_COLORS = "colors"
CONF_EFFECTS = "effects"

# IR Code types
IR_CODE_POWER_ON = "power_on"
IR_CODE_POWER_OFF = "power_off"
IR_CODE_BRIGHTNESS_UP = "brightness_up"
IR_CODE_BRIGHTNESS_DOWN = "brightness_down"

# Configuration schema
COLOR_SCHEMA = vol.Schema({
    vol.Required(CONF_NAME): cv.string,
    vol.Required("rgb"): vol.All(
        vol.ExactSequence([cv.positive_int, cv.positive_int, cv.positive_int]),
        vol.Range(min=0, max=255)
    ),
    vol.Required("ir_code"): cv.string,
})

EFFECT_SCHEMA = vol.Schema({
    vol.Required(CONF_NAME): cv.string,
    vol.Required("ir_code"): cv.string,
})

PLATFORM_SCHEMA = vol.Schema({
    vol.Required(CONF_NAME): cv.string,
    vol.Required(CONF_BROADLINK_REMOTE): cv.entity_id,
    vol.Required(CONF_IR_CODES): vol.Schema({
        vol.Required(IR_CODE_POWER_ON): cv.string,
        vol.Required(IR_CODE_POWER_OFF): cv.string,
        vol.Optional(IR_CODE_BRIGHTNESS_UP): cv.string,
        vol.Optional(IR_CODE_BRIGHTNESS_DOWN): cv.string,
    }),
    vol.Optional(CONF_COLORS, default=[]): vol.All(cv.ensure_list, [COLOR_SCHEMA]),
    vol.Optional(CONF_EFFECTS, default=[]): vol.All(cv.ensure_list, [EFFECT_SCHEMA]),
    vol.Optional(CONF_UNIQUE_ID): cv.string,
})


async def async_setup_platform(
    hass: HomeAssistant,
    config: ConfigType,
    async_add_entities: AddEntitiesCallback,
    discovery_info: Optional[DiscoveryInfoType] = None,
) -> None:
    """Set up the BroadLink IR Mapper platform."""
    name = config[CONF_NAME]
    broadlink_remote = config[CONF_BROADLINK_REMOTE]
    ir_codes = config[CONF_IR_CODES]
    colors = config.get(CONF_COLORS, [])
    effects = config.get(CONF_EFFECTS, [])
    unique_id = config.get(CONF_UNIQUE_ID)

    entity = BroadLinkIRLight(
        name,
        broadlink_remote,
        ir_codes,
        colors,
        effects,
        unique_id,
    )

    async_add_entities([entity])


class BroadLinkIRLight(LightEntity):
    """Representation of a BroadLink IR-controlled light."""

    def __init__(
        self,
        name: str,
        broadlink_remote: str,
        ir_codes: Dict[str, str],
        colors: List[Dict[str, Any]],
        effects: List[Dict[str, Any]],
        unique_id: Optional[str] = None,
    ) -> None:
        """Initialize the IR light."""
        self._name = name
        self._broadlink_remote = broadlink_remote
        self._ir_codes = ir_codes
        self._colors = colors
        self._effects = effects
        self._unique_id = unique_id
        
        self._state = False
        self._brightness = 255
        self._rgb_color = (255, 255, 255)
        self._effect = None
        
        # Build supported features
        self._supported_features = 0
        if IR_CODE_BRIGHTNESS_UP in ir_codes or IR_CODE_BRIGHTNESS_DOWN in ir_codes:
            self._supported_features |= SUPPORT_BRIGHTNESS
        if colors:
            self._supported_features |= SUPPORT_COLOR
        if effects:
            self._supported_features |= SUPPORT_EFFECT

    @property
    def name(self) -> str:
        """Return the name of the light."""
        return self._name

    @property
    def unique_id(self) -> Optional[str]:
        """Return the unique ID of the light."""
        return self._unique_id

    @property
    def is_on(self) -> bool:
        """Return true if light is on."""
        return self._state

    @property
    def brightness(self) -> int:
        """Return the brightness of the light."""
        return self._brightness

    @property
    def rgb_color(self) -> tuple:
        """Return the RGB color value."""
        return self._rgb_color

    @property
    def effect(self) -> Optional[str]:
        """Return the current effect."""
        return self._effect

    @property
    def effect_list(self) -> List[str]:
        """Return the list of supported effects."""
        return [effect[CONF_NAME] for effect in self._effects]

    @property
    def supported_features(self) -> int:
        """Flag supported features."""
        return self._supported_features

    async def async_turn_on(self, **kwargs: Any) -> None:
        """Turn the light on."""
        # Send power on command if light is off
        if not self._state:
            await self._send_ir_command(self._ir_codes[IR_CODE_POWER_ON])
            self._state = True

        # Handle brightness
        if ATTR_BRIGHTNESS in kwargs:
            new_brightness = kwargs[ATTR_BRIGHTNESS]
            await self._set_brightness(new_brightness)

        # Handle RGB color
        if ATTR_RGB_COLOR in kwargs:
            rgb = kwargs[ATTR_RGB_COLOR]
            await self._set_rgb_color(rgb)

        # Handle effect
        if ATTR_EFFECT in kwargs:
            effect_name = kwargs[ATTR_EFFECT]
            await self._set_effect(effect_name)

        self.async_write_ha_state()

    async def async_turn_off(self, **kwargs: Any) -> None:
        """Turn the light off."""
        await self._send_ir_command(self._ir_codes[IR_CODE_POWER_OFF])
        self._state = False
        self._effect = None
        self.async_write_ha_state()

    async def _set_brightness(self, target_brightness: int) -> None:
        """Set brightness by sending IR commands."""
        if IR_CODE_BRIGHTNESS_UP not in self._ir_codes:
            _LOGGER.warning("Brightness control not configured")
            return

        current = self._brightness
        steps = abs(target_brightness - current) // 25  # Approximate steps

        if target_brightness > current:
            code = self._ir_codes.get(IR_CODE_BRIGHTNESS_UP)
        else:
            code = self._ir_codes.get(IR_CODE_BRIGHTNESS_DOWN)

        if code:
            for _ in range(min(steps, 10)):  # Limit to 10 steps
                await self._send_ir_command(code)

        self._brightness = target_brightness

    async def _set_rgb_color(self, rgb: tuple) -> None:
        """Set RGB color by finding closest match and sending IR code."""
        if not self._colors:
            _LOGGER.warning("No colors configured")
            return

        # Find closest color match
        closest_color = min(
            self._colors,
            key=lambda c: sum((a - b) ** 2 for a, b in zip(rgb, c["rgb"]))
        )

        await self._send_ir_command(closest_color["ir_code"])
        self._rgb_color = tuple(closest_color["rgb"])
        self._effect = None  # Clear effect when setting color

    async def _set_effect(self, effect_name: str) -> None:
        """Set effect by sending IR code."""
        effect = next((e for e in self._effects if e[CONF_NAME] == effect_name), None)
        if not effect:
            _LOGGER.warning(f"Effect {effect_name} not found")
            return

        await self._send_ir_command(effect["ir_code"])
        self._effect = effect_name

    async def _send_ir_command(self, code: str) -> None:
        """Send IR command via BroadLink remote."""
        try:
            await self.hass.services.async_call(
                "remote",
                "send_command",
                {
                    "entity_id": self._broadlink_remote,
                    "command": code,
                },
                blocking=True,
            )
            _LOGGER.debug(f"Sent IR command: {code}")
        except Exception as e:
            _LOGGER.error(f"Failed to send IR command: {e}")
