import { html, css, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { CLASS_COLORS } from '../utils';

@customElement('skjson-linear-model')
export class SkjsonLinearModel extends LitElement {
  @property({ type: Object }) model: any = null;
  @property({ type: Array }) inputFeatures: number[] = [];
  
  @state() private currentStep: number = -1;
  @state() private isAnimating: boolean = false;
  @state() private classIndex: number = 0;

  static styles = css`
    :host {
      display: block;
      width: 100%;
      font-family: system-ui, -apple-system, sans-serif;
    }
    .container {
      width: 100%;
      padding: 24px;
      border-radius: var(--radius, 0.75rem);
      border: 1px solid hsl(var(--border, 240 5.9% 90%));
      background-color: hsl(var(--card, 0 0% 100%));
      color: hsl(var(--card-foreground, 240 10% 3.9%));
      box-sizing: border-box;
    }
    .bar-chart {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 20px;
    }
    .bar-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .feature-name {
      width: 120px;
      text-align: right;
      font-size: 14px;
      color: hsl(var(--muted-foreground, 240 3.8% 46.1%));
    }
    .bar-container {
      flex: 1;
      display: flex;
      align-items: center;
      position: relative;
      height: 24px;
    }
    .center-line {
      position: absolute;
      left: 50%;
      top: -10px;
      bottom: -10px;
      width: 1px;
      background-color: hsl(var(--border, 240 5.9% 90%));
      z-index: 0;
    }
    .bar {
      height: 16px;
      border-radius: 4px;
      transition: width 0.3s ease, left 0.3s ease, right 0.3s ease;
      position: absolute;
      z-index: 1;
    }
    .val-text {
      font-size: 12px;
      font-family: monospace;
      position: absolute;
      z-index: 2;
    }
    .controls {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;
      justify-content: center;
      flex-wrap: wrap;
    }
    select, button {
      padding: 8px 16px;
      border-radius: var(--radius, 0.5rem);
      border: 1px solid hsl(var(--border, 240 5.9% 90%));
      background-color: hsl(var(--background, 0 0% 100%));
      color: hsl(var(--foreground, 240 10% 3.9%));
      cursor: pointer;
      font-weight: 500;
      font-size: 14px;
      transition: background-color 0.2s;
    }
    select:hover, button:hover {
      background-color: hsl(var(--accent, 240 4.8% 95.9%));
    }
    button.primary {
      background-color: hsl(var(--primary, 240 5.9% 10%));
      color: hsl(var(--primary-foreground, 0 0% 98%));
      border-color: hsl(var(--primary, 240 5.9% 10%));
    }
    button.primary:hover:not(:disabled) {
      background-color: hsl(var(--primary, 240 5.9% 10%) / 0.9);
    }
    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .equation {
      background-color: hsl(var(--muted, 240 4.8% 95.9%));
      color: hsl(var(--muted-foreground, 240 3.8% 46.1%));
      padding: 16px;
      border-radius: var(--radius, 0.5rem);
      font-family: monospace;
      font-size: 16px;
      text-align: center;
      margin-bottom: 24px;
    }
    .term {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      margin: 0 4px;
      transition: background-color 0.3s;
    }
    .term.active {
      background-color: hsl(var(--primary, 240 5.9% 10%) / 0.1);
      color: hsl(var(--primary, 240 5.9% 10%));
      font-weight: bold;
    }
    .result-box {
      margin-top: 24px;
      text-align: center;
      padding: 16px;
      border-radius: var(--radius, 0.5rem);
      background-color: hsl(var(--primary, 240 5.9% 10%) / 0.05);
      border: 1px solid hsl(var(--primary, 240 5.9% 10%) / 0.2);
    }
    .result-value {
      font-size: 24px;
      font-weight: bold;
      color: hsl(var(--primary, 240 5.9% 10%));
    }
  `;

  private getFeatureName(index: number) {
    if (this.model?.meta?.feature_names) {
      return this.model.meta.feature_names[index];
    }
    return `Feature ${index}`;
  }

  async predict() {
    if (this.isAnimating || !this.model) return;
    this.isAnimating = true;
    this.currentStep = -1;

    const n_features = this.model.meta.n_features;
    for (let i = 0; i <= n_features; i++) {
      this.currentStep = i;
      await new Promise(r => setTimeout(r, 600));
    }
    this.currentStep = n_features + 1; // Final result
    this.isAnimating = false;
  }

  render() {
    if (!this.model || !this.model.params || !this.model.params.coef) {
      return html`<div>Invalid linear model</div>`;
    }

    const isBinary = this.model.meta.model_type === "LogisticRegression" && 
      (Array.isArray(this.model.params.coef) && (!Array.isArray(this.model.params.coef[0]) || this.model.params.coef.length === 1));
      
    const isMultiClass = this.model.meta.model_type === "LogisticRegression" && 
      (Array.isArray(this.model.params.coef) && Array.isArray(this.model.params.coef[0]) && this.model.params.coef.length > 1);

    let baseCoef = this.model.params.coef;
    let baseIntercept = this.model.params.intercept;

    let coef = baseCoef;
    let intercept = baseIntercept;

    if (isMultiClass) {
      coef = baseCoef[this.classIndex];
      intercept = Array.isArray(baseIntercept) ? baseIntercept[this.classIndex] : baseIntercept;
    } else {
      if (Array.isArray(coef) && Array.isArray(coef[0]) && coef.length === 1) {
        coef = coef[0];
      }
      intercept = Array.isArray(baseIntercept) ? baseIntercept[0] : baseIntercept;
    }

    // Calculate terms based on input
    const terms = coef.map((c: number, i: number) => c * (this.inputFeatures[i] || 0));
    const vals = [...terms, intercept];
    const labels = [...coef.map((_: any, i: number) => this.getFeatureName(i)), "Intercept"];
    
    let total = 0;
    if (this.currentStep >= 0) {
      for (let i = 0; i <= Math.min(this.currentStep, vals.length - 1); i++) {
        total += vals[i];
      }
    }

    let finalPrediction = "";
    if (this.currentStep >= vals.length) {
      if (this.model.meta.model_type === "LogisticRegression") {
        if (isMultiClass) {
          finalPrediction = `Logit (Class ${this.classIndex}): ${total.toFixed(4)}`;
        } else {
          const prob = 1 / (1 + Math.exp(-total));
          finalPrediction = `Probability (Class 1): ${(prob * 100).toFixed(2)}%`;
        }
      } else {
        finalPrediction = `Output: ${total.toFixed(4)}`;
      }
    }

    // Find max abs value for scaling
    const maxAbs = Math.max(...vals.map(Math.abs)) * 1.1 || 1;

    return html`
      <div class="controls">
        ${isMultiClass ? html`
          <select 
            .value=${String(this.classIndex)} 
            @change=${(e: Event) => {
              this.classIndex = parseInt((e.target as HTMLSelectElement).value);
              this.currentStep = -1;
              this.isAnimating = false;
            }}
            ?disabled=${this.isAnimating}
          >
            ${baseCoef.map((_: any, idx: number) => html`
              <option value="${idx}">Class ${idx} ${this.model.meta?.classes ? `(${this.model.meta.classes[idx]})` : ''}</option>
            `)}
          </select>
        ` : ''}
        <button class="primary" @click=${this.predict} ?disabled=${this.isAnimating}>
          ${this.isAnimating ? 'Computing...' : 'Predict step-by-step'}
        </button>
      </div>
      
      <div class="container">
        <div class="equation">
          ŷ = 
          ${vals.map((v, i) => html`
            <span class="term ${this.currentStep === i ? 'active' : ''}">
              ${i === vals.length - 1 ? 'b' : `(w${i} · x${i})`}
            </span>
            ${i < vals.length - 1 ? '+' : ''}
          `)}
        </div>

        <div class="bar-chart">
          ${vals.map((v, i) => {
            const isVisible = this.currentStep >= i;
            const w = isVisible ? (Math.abs(v) / maxAbs) * 50 : 0;
            const isPos = v >= 0;
            const color = isPos ? CLASS_COLORS[0] : CLASS_COLORS[3];
            
            return html`
              <div class="bar-row" style="opacity: ${isVisible ? 1 : 0.3}">
                <div class="feature-name">${labels[i]}</div>
                <div class="bar-container">
                  <div class="center-line"></div>
                  <div class="bar" style="
                    width: ${w}%;
                    background-color: ${color};
                    ${isPos ? 'left: 50%;' : 'right: 50%;'}
                  "></div>
                  <div class="val-text" style="${isPos ? `left: calc(50% + ${w}% + 8px);` : `right: calc(50% + ${w}% + 8px);`}">
                    ${isVisible ? v.toFixed(3) : ''}
                  </div>
                </div>
              </div>
            `;
          })}
        </div>
        
        ${this.currentStep >= 0 ? html`
          <div class="result-box">
            <div>Running Sum (${this.model.meta.model_type === "LogisticRegression" ? "Logit" : "Output"})</div>
            <div class="result-value">${total.toFixed(4)}</div>
            ${finalPrediction ? html`
              <div style="margin-top: 12px; color: #f8fafc;">${finalPrediction}</div>
            ` : ''}
          </div>
        ` : ''}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'skjson-linear-model': SkjsonLinearModel;
  }
}
