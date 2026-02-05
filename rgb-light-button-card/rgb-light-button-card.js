/**
 * RGB Light Button Card
 * A custom Lovelace card for controlling RGB lights with preset color buttons
 * Perfect for cheap AliExpress RGB LED strips with limited color options
 * 
 * @version 1.0.0
 */

class RgbLightButtonCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    // Default colors based on typical cheap LED remote controls
    this.defaultColors = [
      { name: 'Red', rgb: [255, 0, 0] },
      { name: 'Green', rgb: [0, 255, 0] },
      { name: 'Blue', rgb: [0, 0, 255] },
      { name: 'White', rgb: [255, 255, 255] },
      { name: 'Orange', rgb: [255, 165, 0] },
      { name: 'Cyan', rgb: [0, 255, 255] },
      { name: 'Purple', rgb: [128, 0, 128] },
      { name: 'Yellow', rgb: [255, 255, 0] },
      { name: 'Pink', rgb: [255, 192, 203] },
      { name: 'Lime', rgb: [50, 205, 50] },
      { name: 'Magenta', rgb: [255, 0, 255] },
      { name: 'Warm White', rgb: [255, 230, 180] }
    ];
    
    // Default flash modes
    this.defaultEffects = [
      { name: 'Flash', effect: 'flash' },
      { name: 'Strobe', effect: 'strobe' },
      { name: 'Fade', effect: 'fade' },
      { name: 'Smooth', effect: 'smooth' }
    ];
  }
  
  set hass(hass) {
    this._hass = hass;
    if (!this._config) {
      return;
    }
    
    const entityId = this._config.entity;
    const state = hass.states[entityId];
    
    if (!state) {
      this.shadowRoot.innerHTML = `
        <ha-card>
          <div class="card-content">
            <p>Entity not found: ${entityId}</p>
          </div>
        </ha-card>
      `;
      return;
    }
    
    this.render(state);
  }
  
  setConfig(config) {
    if (!config.entity) {
      throw new Error('You need to define an entity');
    }
    
    this._config = {
      ...config,
      colors: config.colors || this.defaultColors,
      effects: config.effects || this.defaultEffects,
      show_brightness: config.show_brightness !== false,
      show_effects: config.show_effects !== false,
      columns: config.columns || 4,
      title: config.title || '',
    };
  }
  
  render(state) {
    const isOn = state.state === 'on';
    const brightness = state.attributes.brightness || 0;
    const brightnessPercent = Math.round((brightness / 255) * 100);
    
    this.shadowRoot.innerHTML = `
      <style>
        ha-card {
          padding: 0;
          overflow: hidden;
        }
        .card-header {
          padding: 20px 16px 16px;
          font-size: 20px;
          font-weight: 400;
          color: var(--primary-text-color);
          line-height: 1.2;
        }
        .card-content {
          padding: 0 16px 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .power-section {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding-bottom: 8px;
        }
        .entity-name {
          font-size: 14px;
          color: var(--secondary-text-color);
          font-weight: 400;
        }
        .power-button {
          min-width: 80px;
          height: 36px;
          padding: 0 16px;
          border: none;
          border-radius: 18px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .power-button.on {
          background: var(--primary-color);
          color: var(--text-primary-color, white);
        }
        .power-button.off {
          background: var(--disabled-color, #bdbdbd);
          color: var(--text-primary-color, white);
        }
        .power-button:hover {
          box-shadow: 0 4px 8px rgba(0,0,0,0.15);
          transform: translateY(-1px);
        }
        .power-button:active {
          transform: translateY(0);
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .brightness-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .brightness-label {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
          color: var(--secondary-text-color);
          font-weight: 400;
        }
        .brightness-slider {
          width: 100%;
          height: 48px;
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
          outline: none;
          cursor: pointer;
        }
        .brightness-slider::-webkit-slider-track {
          width: 100%;
          height: 4px;
          background: var(--divider-color, #e0e0e0);
          border-radius: 2px;
        }
        .brightness-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 24px;
          height: 24px;
          background: var(--primary-color);
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .brightness-slider::-webkit-slider-thumb:hover {
          box-shadow: 0 3px 6px rgba(0,0,0,0.25);
          transform: scale(1.1);
        }
        .brightness-slider::-moz-range-track {
          width: 100%;
          height: 4px;
          background: var(--divider-color, #e0e0e0);
          border-radius: 2px;
        }
        .brightness-slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          background: var(--primary-color);
          border-radius: 50%;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .brightness-slider::-moz-range-thumb:hover {
          box-shadow: 0 3px 6px rgba(0,0,0,0.25);
          transform: scale(1.1);
        }
        .section-title {
          font-size: 14px;
          font-weight: 500;
          color: var(--secondary-text-color);
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .colors-section {
          display: grid;
          grid-template-columns: repeat(${this._config.columns}, 1fr);
          gap: 8px;
        }
        .color-button {
          aspect-ratio: 1;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 500;
          color: white;
          text-shadow: 0 1px 3px rgba(0,0,0,0.4);
          box-shadow: 0 2px 4px rgba(0,0,0,0.1), inset 0 -2px 4px rgba(0,0,0,0.1);
          position: relative;
          overflow: hidden;
        }
        .color-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,0.1) 100%);
          pointer-events: none;
        }
        .color-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.2), inset 0 -2px 4px rgba(0,0,0,0.1);
        }
        .color-button:active {
          transform: translateY(0);
          box-shadow: 0 1px 2px rgba(0,0,0,0.15), inset 0 -1px 2px rgba(0,0,0,0.1);
        }
        .effects-section {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }
        .effect-button {
          padding: 12px 16px;
          border: 1px solid var(--divider-color, #e0e0e0);
          border-radius: 8px;
          background: var(--card-background-color);
          color: var(--primary-text-color);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .effect-button:hover {
          background: var(--primary-color);
          color: var(--text-primary-color, white);
          border-color: var(--primary-color);
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
          transform: translateY(-1px);
        }
        .effect-button:active {
          transform: translateY(0);
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .disabled {
          opacity: 0.4;
          pointer-events: none;
        }
      </style>
      
      <ha-card>
        ${this._config.title ? `<div class="card-header">${this._config.title}</div>` : ''}
        <div class="card-content">
          <div class="power-section">
            <button class="power-button ${isOn ? 'on' : 'off'}">
              ${isOn ? 'ON' : 'OFF'}
            </button>
            <span class="entity-name">${state.attributes.friendly_name || this._config.entity}</span>
          </div>
          
          ${this._config.show_brightness ? `
            <div class="brightness-section ${!isOn ? 'disabled' : ''}">
              <div class="brightness-label">
                <span>Brightness</span>
                <span>${brightnessPercent}%</span>
              </div>
              <input 
                type="range" 
                class="brightness-slider" 
                min="0" 
                max="255" 
                value="${brightness}"
              >
            </div>
          ` : ''}
          
          <div class="${!isOn ? 'disabled' : ''}">
            <div class="section-title">Colors</div>
            <div class="colors-section">
              ${this._config.colors.map(color => `
                <button 
                  class="color-button" 
                  style="background-color: rgb(${color.rgb.join(',')})"
                  title="${color.name}"
                >
                  ${color.name}
                </button>
              `).join('')}
            </div>
          </div>
          
          ${this._config.show_effects ? `
            <div class="${!isOn ? 'disabled' : ''}">
              <div class="section-title">Effects</div>
              <div class="effects-section">
                ${this._config.effects.map(effect => `
                  <button class="effect-button">
                    ${effect.name}
                  </button>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      </ha-card>
    `;
    
    this.attachEventListeners();
  }
  
  attachEventListeners() {
    const powerButton = this.shadowRoot.querySelector('.power-button');
    if (powerButton) {
      powerButton.addEventListener('click', () => this.togglePower());
    }
    
    const slider = this.shadowRoot.querySelector('.brightness-slider');
    if (slider) {
      slider.addEventListener('input', (e) => this.setBrightness(e.target.value));
    }
    
    const colorButtons = this.shadowRoot.querySelectorAll('.color-button');
    colorButtons.forEach((btn, index) => {
      btn.addEventListener('click', () => this.setColor(this._config.colors[index].rgb));
    });
    
    const effectButtons = this.shadowRoot.querySelectorAll('.effect-button');
    effectButtons.forEach((btn, index) => {
      btn.addEventListener('click', () => this.setEffect(this._config.effects[index].effect));
    });
  }
  
  togglePower() {
    const entityId = this._config.entity;
    const state = this._hass.states[entityId];
    const service = state.state === 'on' ? 'turn_off' : 'turn_on';
    
    this._hass.callService('light', service, {
      entity_id: entityId,
    });
  }
  
  setBrightness(brightness) {
    const entityId = this._config.entity;
    
    this._hass.callService('light', 'turn_on', {
      entity_id: entityId,
      brightness: parseInt(brightness),
    });
  }
  
  setColor(rgb) {
    const entityId = this._config.entity;
    
    this._hass.callService('light', 'turn_on', {
      entity_id: entityId,
      rgb_color: rgb,
    });
  }
  
  setEffect(effect) {
    const entityId = this._config.entity;
    
    this._hass.callService('light', 'turn_on', {
      entity_id: entityId,
      effect: effect,
    });
  }
  
  getCardSize() {
    return 5;
  }
}

customElements.define('rgb-light-button-card', RgbLightButtonCard);

// Register the card with Home Assistant
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'rgb-light-button-card',
  name: 'RGB Light Button Card',
  description: 'A card for controlling RGB lights with preset color buttons',
  preview: false,
  documentationURL: 'https://github.com/zvikarp/ha-plus-addons/tree/main/rgb-light-button-card',
});

console.info(
  '%c RGB-LIGHT-BUTTON-CARD %c 1.0.0 ',
  'color: white; background: #0066cc; font-weight: 700;',
  'color: white; background: #00aa00; font-weight: 700;'
);
