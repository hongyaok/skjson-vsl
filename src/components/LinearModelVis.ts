import { LitElement, html, css, PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('skjson-linear-model')
export class SkjsonLinearModel extends LitElement {
  @property({ type: Object }) model: any = null;
  
  @state() private inputFeatures: number[] = [];
  
  static styles = css`
    :host {
      display: block;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      color: hsl(var(--foreground, 240 10% 3.9%));
      padding: 24px;
      background: hsl(var(--background, 0 0% 100%));
    }
    .header {
      margin-bottom: 24px;
    }
    .header h2 {
      margin: 0 0 8px 0;
      font-size: 24px;
      font-weight: 700;
    }
    .header p {
      margin: 0;
      color: hsl(var(--muted-foreground, 240 3.8% 46.1%));
      font-size: 14px;
    }
    
    .grid {
      display: grid;
      grid-template-columns: 320px 1fr;
      gap: 32px;
      align-items: start;
    }

    /* Inputs Panel */
    .inputs-panel {
      background: hsl(var(--card, 0 0% 100%) / 0.8);
      backdrop-filter: blur(12px);
      border: 1px solid hsl(var(--border, 240 5.9% 90%));
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 12px 32px rgba(0,0,0,0.08);
      position: sticky;
      top: 24px;
    }
    .inputs-panel h3 {
      margin: 0 0 16px 0;
      font-size: 16px;
      font-weight: 600;
    }
    .input-group {
      margin-bottom: 16px;
    }
    .input-group label {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 8px;
    }
    .input-group label span {
      color: hsl(var(--primary, 240 5.9% 10%));
    }
    input[type="range"] {
      -webkit-appearance: none;
      width: 100%;
      height: 6px;
      background: hsl(var(--secondary, 240 4.8% 95.9%));
      border-radius: 999px;
      outline: none;
    }
    input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: hsl(var(--primary, 240 5.9% 10%));
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    
    /* Classes Grid */
    .classes-grid {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .class-card {
      background: hsl(var(--card, 0 0% 100%) / 0.6);
      backdrop-filter: blur(12px);
      border: 1px solid hsl(var(--border, 240 5.9% 90%));
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.05);
      transition: all 0.3s ease;
    }
    .class-card.winning {
      border-color: #22c55e;
      box-shadow: 0 12px 32px rgba(34, 197, 94, 0.15);
      background: linear-gradient(145deg, hsl(var(--card, 0 0% 100%) / 0.9), rgba(34, 197, 94, 0.05));
    }
    .class-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 1px solid hsl(var(--border, 240 5.9% 90%));
    }
    .class-header h3 {
      margin: 0;
      font-size: 20px;
      font-weight: 700;
    }
    .prob-badge {
      font-size: 18px;
      font-weight: 800;
      padding: 6px 12px;
      border-radius: 8px;
      background: hsl(var(--secondary, 240 4.8% 95.9%));
    }
    .winning .prob-badge {
      background: #22c55e;
      color: white;
    }
    
    /* Coefficient Bars */
    .coef-row {
      display: grid;
      grid-template-columns: 140px 1fr 80px;
      gap: 16px;
      align-items: center;
      margin-bottom: 12px;
      font-size: 13px;
    }
    .coef-name {
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .bar-container {
      position: relative;
      height: 8px;
      background: hsl(var(--secondary, 240 4.8% 95.9%));
      border-radius: 4px;
    }
    .bar-center {
      position: absolute;
      left: 50%;
      top: 0;
      bottom: 0;
      width: 1px;
      background: hsl(var(--muted-foreground, 240 3.8% 46.1%) / 0.3);
      z-index: 2;
    }
    .bar-fill {
      position: absolute;
      top: 0;
      height: 100%;
      border-radius: 4px;
      transition: width 0.3s ease, left 0.3s ease;
    }
    .bar-fill.positive {
      background: #22c55e;
    }
    .bar-fill.negative {
      background: #ef4444;
    }
    .coef-value {
      text-align: right;
      font-variant-numeric: tabular-nums;
      font-weight: 600;
    }
    
    /* Calculation Summary */
    .calc-summary {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px dotted hsl(var(--border, 240 5.9% 90%));
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 14px;
    }
    .calc-intercept {
      color: hsl(var(--muted-foreground, 240 3.8% 46.1%));
    }
    .calc-total {
      font-weight: 700;
      font-size: 16px;
    }
  `;

  willUpdate(changedProperties: PropertyValues) {
    if (changedProperties.has('model') && this.model) {
      if (this.inputFeatures.length !== this.model.meta.n_features) {
        this.inputFeatures = new Array(this.model.meta.n_features).fill(0);
      }
    }
  }

  private updateFeature(index: number, val: string) {
    const newFeatures = [...this.inputFeatures];
    newFeatures[index] = parseFloat(val) || 0;
    this.inputFeatures = newFeatures;
  }

  private computeOutputs(): { sums: number[], probs: number[] } {
    if (!this.model || !this.model.params.coef) return { sums: [], probs: [] };
    
    const coef = this.model.params.coef; // [n_classes, n_features]
    const intercept = this.model.params.intercept; // [n_classes]
    
    const sums: number[] = coef.map((classCoefs: number[], classIdx: number) => {
      let sum = intercept[classIdx] || 0;
      for (let i = 0; i < this.inputFeatures.length; i++) {
        sum += classCoefs[i] * this.inputFeatures[i];
      }
      return sum;
    });

    // Softmax
    const maxSum = Math.max(...sums);
    const exps = sums.map((s: number) => Math.exp(s - maxSum));
    const sumExps = exps.reduce((a: number, b: number) => a + b, 0);
    const probs = exps.map((e: number) => e / sumExps);
    
    return { sums, probs };
  }

  render() {
    if (!this.model || !this.model.params.coef) {
      return html`<div>Invalid Linear Model</div>`;
    }

    const { sums, probs } = this.computeOutputs();
    const winningClassIdx = probs.indexOf(Math.max(...probs));
    const isBinary = this.model.params.coef.length === 1;

    // Determine max coefficient magnitude for scaling the bars
    let maxMagnitude = 0;
    this.model.params.coef.forEach((classCoefs: number[]) => {
      classCoefs.forEach((c: number) => {
        maxMagnitude = Math.max(maxMagnitude, Math.abs(c));
      });
    });
    // Ensure we don't divide by zero
    maxMagnitude = Math.max(maxMagnitude, 0.01);

    return html`
      <div class="header">
        <h2>${this.model.meta.model_type} Visualization</h2>
        <p>Interactive linear model with ${this.model.meta.n_features} features and ${this.model.meta.classes?.length || 2} classes.</p>
      </div>
      
      <div class="grid">
        <div class="inputs-panel">
          <h3>Input Features</h3>
          ${this.model.meta.feature_names.map((name: string, i: number) => html`
            <div class="input-group">
              <label>${name} <span>${this.inputFeatures[i].toFixed(2)}</span></label>
              <input type="range" 
                min="-10" max="10" step="0.1" 
                .value=${String(this.inputFeatures[i])} 
                @input=${(e: Event) => this.updateFeature(i, (e.target as HTMLInputElement).value)} />
            </div>
          `)}
        </div>
        
        <div class="classes-grid">
          ${this.model.params.coef.map((classCoefs: number[], classIdx: number) => {
            const className = this.model.meta.classes?.[classIdx] || `Class ${classIdx}`;
            const prob = isBinary ? (classIdx === 0 ? probs[0] : 1 - probs[0]) : probs[classIdx];
            const sum = sums[classIdx];
            const intercept = this.model.params.intercept[classIdx] || 0;
            const isWinning = classIdx === winningClassIdx;
            
            return html`
              <div class="class-card ${isWinning ? 'winning' : ''}">
                <div class="class-header">
                  <h3>${className}</h3>
                  <div class="prob-badge">${(prob * 100).toFixed(1)}%</div>
                </div>
                
                <div class="coef-bars">
                  ${classCoefs.map((coef: number, featIdx: number) => {
                    const featName = this.model.meta.feature_names[featIdx];
                    const inputVal = this.inputFeatures[featIdx];
                    const contribution = coef * inputVal;
                    
                    // We visualize the COEFFICIENT * INPUT value, not just the static coefficient
                    const isPositive = contribution >= 0;
                    
                    // Scale from 0 to 50% max
                    const maxCont = maxMagnitude * 10; // Approx max possible contribution
                    const pct = Math.min(50, (Math.abs(contribution) / maxCont) * 50);
                    
                    const left = isPositive ? '50%' : `${50 - pct}%`;
                    const width = `${pct}%`;
                    
                    return html`
                      <div class="coef-row">
                        <div class="coef-name">${featName}</div>
                        <div class="bar-container">
                          <div class="bar-center"></div>
                          <div class="bar-fill ${isPositive ? 'positive' : 'negative'}" style="left: ${left}; width: ${width};"></div>
                        </div>
                        <div class="coef-value">${contribution > 0 ? '+' : ''}${contribution.toFixed(2)}</div>
                      </div>
                    `;
                  })}
                </div>
                
                <div class="calc-summary">
                  <div class="calc-intercept">Intercept: ${intercept > 0 ? '+' : ''}${intercept.toFixed(4)}</div>
                  <div class="calc-total">Raw Sum: ${sum.toFixed(4)}</div>
                </div>
              </div>
            `;
          })}
        </div>
      </div>
    `;
  }
}
