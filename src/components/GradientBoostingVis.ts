import { html, svg, css, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import './DecisionTreeVis';

export const gradientBoostingStyles = css`
  :host {
    display: block;
    width: 100%;
    font-family: system-ui, -apple-system, sans-serif;
  }
  .selector {
    display: flex;
    align-items: center;
    gap: 12px;
    background: hsl(var(--card, 0 0% 100%) / 0.8);
    backdrop-filter: blur(8px);
    padding: 8px 16px;
    border-radius: 12px;
    border: 1px solid hsl(var(--border, 240 5.9% 90%));
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
  .selector label {
    font-size: 13px;
    font-weight: 600;
    color: hsl(var(--muted-foreground, 240 3.8% 46.1%));
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }
  .custom-dropdown {
    position: relative;
    user-select: none;
  }
  .dropdown-trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    background-color: hsl(var(--background, 0 0% 100%));
    color: hsl(var(--foreground, 240 10% 3.9%));
    border: 1px solid hsl(var(--border, 240 5.9% 90%));
    padding: 8px 12px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    min-width: 120px;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }
  .dropdown-trigger:hover {
    border-color: hsl(var(--primary, 240 5.9% 10%) / 0.4);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
  .dropdown-menu {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    width: 100%;
    max-height: 250px;
    overflow-y: auto;
    background: hsl(var(--card, 0 0% 100%) / 0.95);
    backdrop-filter: blur(16px);
    border: 1px solid hsl(var(--border, 240 5.9% 90%));
    border-radius: 8px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.15);
    z-index: 100;
    display: flex;
    flex-direction: column;
    padding: 4px;
    animation: zoomIn 0.15s ease-out;
  }
  .dropdown-menu::-webkit-scrollbar {
    width: 6px;
  }
  .dropdown-menu::-webkit-scrollbar-thumb {
    background: hsl(var(--border, 240 5.9% 90%));
    border-radius: 4px;
  }
  .dropdown-item {
    padding: 8px 12px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    color: hsl(var(--foreground, 240 10% 3.9%));
    transition: background 0.15s;
  }
  .dropdown-item:hover {
    background: hsl(var(--accent, 240 4.8% 95.9%));
  }
  .dropdown-item.selected {
    background: hsl(var(--primary, 240 5.9% 10%));
    color: hsl(var(--primary-foreground, 0 0% 98%));
  }
  @keyframes zoomIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
`;

const chevronDown = svg`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>`;

@customElement('skjson-gradient-boosting')
export class SkjsonGradientBoosting extends LitElement {
  @property({ type: Object }) model: any = null;
  @property({ type: Array }) inputFeatures: number[] = [];
  
  @state() protected selectedStageIndex: number = 0;
  @state() protected isDropdownOpen: boolean = false;

  private handleDocumentClick = (e: MouseEvent) => {
    const target = e.composedPath()[0] as HTMLElement;
    if (!target.closest('.custom-dropdown')) {
      this.isDropdownOpen = false;
    }
  };

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('click', this.handleDocumentClick);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('click', this.handleDocumentClick);
  }

  static styles = gradientBoostingStyles;

  protected renderSelector() {
    if (!this.model || !this.model.params || !this.model.params.trees) return '';
    const numStages = this.model.params.trees.length;
    return html`
      <div slot="overlay" class="selector">
        <label>View Stage:</label>
        <div class="custom-dropdown">
          <button class="dropdown-trigger" @click=${(e: Event) => { e.stopPropagation(); this.isDropdownOpen = !this.isDropdownOpen; }}>
            Stage ${this.selectedStageIndex}
            ${chevronDown}
          </button>
          ${this.isDropdownOpen ? html`
            <div class="dropdown-menu">
              ${Array.from({length: numStages}).map((_, i) => html`
                <div class="dropdown-item ${i === this.selectedStageIndex ? 'selected' : ''}" 
                     @click=${() => { this.selectedStageIndex = i; this.isDropdownOpen = false; }}>
                  Stage ${i}
                </div>
              `)}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  render() {
    if (!this.model || !this.model.params || !this.model.params.trees) {
      return html`<div>Invalid Gradient Boosting model</div>`;
    }

    const nOutputs = this.model.meta.n_tree_outputs || this.model.params.trees[0]?.length || 1;
    return html`
      <skjson-decision-tree 
        .model=${this.model} 
        .inputFeatures=${this.inputFeatures}
        .treeIndex=${this.selectedStageIndex * nOutputs}>
        ${this.renderSelector()}
      </skjson-decision-tree>
    `;
  }
}

@customElement('skjson-gradient-boosting-predict')
export class SkjsonGradientBoostingPredict extends SkjsonGradientBoosting {
  render() {
    if (!this.model || !this.model.params || !this.model.params.trees) {
      return html`<div>Invalid Gradient Boosting model</div>`;
    }

    const nOutputs = this.model.meta.n_tree_outputs || this.model.params.trees[0]?.length || 1;
    return html`
      <skjson-decision-tree-predict 
        .model=${this.model} 
        .inputFeatures=${this.inputFeatures}
        .treeIndex=${this.selectedStageIndex * nOutputs}>
        ${this.renderSelector()}
      </skjson-decision-tree-predict>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'skjson-gradient-boosting': SkjsonGradientBoosting;
    'skjson-gradient-boosting-predict': SkjsonGradientBoostingPredict;
  }
}
