import { html, css, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import './DecisionTreeVis';

export const randomForestStyles = css`
  :host {
    display: block;
    width: 100%;
    font-family: system-ui, -apple-system, sans-serif;
  }
  .selector {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .selector label {
    font-size: 13px;
    font-weight: 600;
    color: hsl(var(--muted-foreground, 240 3.8% 46.1%));
  }
  select {
    background-color: hsl(var(--background, 0 0% 100%));
    color: hsl(var(--foreground, 240 10% 3.9%));
    border: 1px solid hsl(var(--border, 240 5.9% 90%));
    padding: 6px 12px;
    border-radius: 8px;
    cursor: pointer;
    outline: none;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }
  select:hover {
    background-color: hsl(var(--accent, 240 4.8% 95.9%));
    border-color: hsl(var(--foreground, 240 10% 3.9%) / 0.3);
  }
  select:focus {
    box-shadow: 0 0 0 2px hsl(var(--primary, 240 5.9% 10%) / 0.15);
    border-color: hsl(var(--primary, 240 5.9% 10%));
  }
`;

@customElement('skjson-random-forest')
export class SkjsonRandomForest extends LitElement {
  @property({ type: Object }) model: any = null;
  @property({ type: Array }) inputFeatures: number[] = [];
  
  @state() protected selectedTreeIndex: number = 0;

  static styles = randomForestStyles;

  protected renderSelector() {
    if (!this.model || !this.model.params || !this.model.params.trees) return '';
    const numTrees = this.model.params.trees.length;
    return html`
      <div slot="overlay" class="selector">
        <label>View Tree:</label>
        <select @change=${(e: Event) => this.selectedTreeIndex = parseInt((e.target as HTMLSelectElement).value)}>
          ${Array.from({length: numTrees}).map((_, i) => html`
            <option value="${i}" ?selected=${i === this.selectedTreeIndex}>Tree ${i}</option>
          `)}
        </select>
      </div>
    `;
  }

  render() {
    if (!this.model || !this.model.params || !this.model.params.trees) {
      return html`<div>Invalid Random Forest model</div>`;
    }

    return html`
      <skjson-decision-tree 
        .model=${this.model} 
        .inputFeatures=${this.inputFeatures}
        .treeIndex=${this.selectedTreeIndex}>
        ${this.renderSelector()}
      </skjson-decision-tree>
    `;
  }
}

@customElement('skjson-random-forest-predict')
export class SkjsonRandomForestPredict extends SkjsonRandomForest {
  render() {
    if (!this.model || !this.model.params || !this.model.params.trees) {
      return html`<div>Invalid Random Forest model</div>`;
    }

    return html`
      <skjson-decision-tree-predict 
        .model=${this.model} 
        .inputFeatures=${this.inputFeatures}
        .treeIndex=${this.selectedTreeIndex}>
        ${this.renderSelector()}
      </skjson-decision-tree-predict>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'skjson-random-forest': SkjsonRandomForest;
    'skjson-random-forest-predict': SkjsonRandomForestPredict;
  }
}
