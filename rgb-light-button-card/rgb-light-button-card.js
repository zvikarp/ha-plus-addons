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
        :host {
          display: block;
        }
        ha-card {
          height: 100%;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          font-size: 18px;
          font-weight: 500;
          color: var(--primary-text-color);
          border-bottom: 1px solid var(--divider-color);
        }
        .card-content {
          flex: 1;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        /* Control section */
        .control-section {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .entity-info {
          flex: 1;
          min-width: 0;
        }
        .entity-name {
          font-size: 14px;
          font-weight: 500;
          color: var(--primary-text-color);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .entity-state {
          font-size: 12px;
          color: var(--secondary-text-color);
          margin-top: 2px;
        }
        .power-button {
          flex-shrink: 0;
          width: 48px;
          height: 48px;
          border: none;
          border-radius: 24px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }
        .power-button::before {
          content: '';
          position: absolute;
          inset: 0;
          background: currentColor;
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        .power-button:hover::before {
          opacity: 0.08;
        }
        .power-button:active::before {
          opacity: 0.12;
        }
        .power-button.on {
          background: var(--primary-color);
          color: var(--text-primary-color, white);
        }
        .power-button.off {
          background: var(--disabled-color, rgba(0, 0, 0, 0.12));
          color: var(--secondary-text-color);
        }
        .power-icon {
          width: 24px;
          height: 24px;
          position: relative;
          z-index: 1;
        }
        
        /* Brightness section */
        .brightness-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .brightness-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .brightness-label {
          font-size: 12px;
          font-weight: 500;
          color: var(--secondary-text-color);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .brightness-value {
          font-size: 12px;
          font-weight: 500;
          color: var(--primary-text-color);
        }
        .brightness-slider-wrapper {
          position: relative;
          padding: 8px 0;
        }
        .brightness-slider {
          width: 100%;
          height: 6px;
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
          outline: none;
          cursor: pointer;
        }
        .brightness-slider::-webkit-slider-track {
          width: 100%;
          height: 6px;
          background: var(--disabled-color, rgba(0, 0, 0, 0.12));
          border-radius: 3px;
        }
        .brightness-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          background: var(--primary-color);
          border-radius: 50%;
          cursor: pointer;
          border: 2px solid var(--card-background-color);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          transition: transform 0.1s ease;
        }
        .brightness-slider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
        }
        .brightness-slider::-moz-range-track {
          width: 100%;
          height: 6px;
          background: var(--disabled-color, rgba(0, 0, 0, 0.12));
          border-radius: 3px;
        }
        .brightness-slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: var(--primary-color);
          border-radius: 50%;
          cursor: pointer;
          border: 2px solid var(--card-background-color);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          transition: transform 0.1s ease;
        }
        .brightness-slider::-moz-range-thumb:hover {
          transform: scale(1.2);
        }
        
        /* Section divider */
        .section-divider {
          height: 1px;
          background: var(--divider-color);
          margin: 4px 0;
        }
        
        /* Section title */
        .section-title {
          font-size: 12px;
          font-weight: 500;
          color: var(--secondary-text-color);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 12px;
        }
        
        /* Colors section */
        .colors-section {
          display: grid;
          grid-template-columns: repeat(${this._config.columns}, 1fr);
          gap: 10px;
        }
        .color-button {
          aspect-ratio: 1;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 600;
          color: white;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
          position: relative;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
        }
        .color-button::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, transparent 50%, rgba(0, 0, 0, 0.2) 100%);
          pointer-events: none;
        }
        .color-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
        }
        .color-button:active {
          transform: translateY(0);
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
        }
        
        /* Effects section */
        .effects-section {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }
        .effect-button {
          padding: 14px 16px;
          border: 1px solid var(--divider-color);
          border-radius: 8px;
          background: var(--card-background-color);
          color: var(--primary-text-color);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .effect-button::before {
          content: '';
          position: absolute;
          inset: 0;
          background: var(--primary-color);
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        .effect-button:hover::before {
          opacity: 0.08;
        }
        .effect-button:active::before {
          opacity: 0.12;
        }
        .effect-button:hover {
          border-color: var(--primary-color);
          color: var(--primary-color);
        }
        .effect-button-text {
          position: relative;
          z-index: 1;
        }
        
        /* Disabled state */
        .disabled {
          opacity: 0.38;
          pointer-events: none;
        }
      </style>
      
      <ha-card>
        ${this._config.title ? `<div class="card-header">${this._config.title}</div>` : ''}
        <div class="card-content">
          <!-- Control Section -->
          <div class="control-section">
            <div class="entity-info">
              <div class="entity-name">${state.attributes.friendly_name || this._config.entity}</div>
              <div class="entity-state">${isOn ? `On • ${brightnessPercent}%` : 'Off'}</div>
            </div>
            <button class="power-button ${isOn ? 'on' : 'off'}">
              <svg class="power-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16.56 5.44l-1.45 1.45A5.969 5.969 0 0 1 18 12a6 6 0 0 1-6 6 6 6 0 0 1-6-6c0-2.17 1.16-4.06 2.88-5.12L7.44 5.44A7.961 7.961 0 0 0 4 12a8 8 0 0 0 8 8 8 8 0 0 0 8-8c0-2.72-1.36-5.12-3.44-6.56M13 3h-2v10h2V3z"/>
              </svg>
            </button>
          </div>
          
          <!-- Brightness Section -->
          ${this._config.show_brightness ? `
            <div class="brightness-section ${!isOn ? 'disabled' : ''}">
              <div class="brightness-header">
                <span class="brightness-label">Brightness</span>
                <span class="brightness-value">${brightnessPercent}%</span>
              </div>
              <div class="brightness-slider-wrapper">
                <input 
                  type="range" 
                  class="brightness-slider" 
                  min="0" 
                  max="255" 
                  value="${brightness}"
                >
              </div>
            </div>
          ` : ''}
          
          ${this._config.show_brightness && (this._config.colors.length > 0 || this._config.effects.length > 0) ? `<div class="section-divider"></div>` : ''}
          
          <!-- Colors Section -->
          ${this._config.colors.length > 0 ? `
            <div class="${!isOn ? 'disabled' : ''}">
              <div class="section-title">Colors</div>
              <div class="colors-section">
                ${this._config.colors.map(color => `
                  <button 
                    class="color-button" 
                    style="background-color: rgb(${color.rgb.join(',')})"
                    title="${color.name}"
                    aria-label="${color.name}"
                  >
                  </button>
                `).join('')}
              </div>
            </div>
          ` : ''}
          
          ${this._config.colors.length > 0 && this._config.effects.length > 0 ? `<div class="section-divider"></div>` : ''}
          
          <!-- Effects Section -->
          ${this._config.show_effects && this._config.effects.length > 0 ? `
            <div class="${!isOn ? 'disabled' : ''}">
              <div class="section-title">Effects</div>
              <div class="effects-section">
                ${this._config.effects.map(effect => `
                  <button class="effect-button" aria-label="${effect.name}">
                    <span class="effect-button-text">${effect.name}</span>
                  </button>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      </ha-card>
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
