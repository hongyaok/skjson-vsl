import { LitElement, html, css, PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('skjson-linear-model')
export class SkjsonLinearModel extends LitElement {
  @property({ type: Object }) model: any = null;
  @property({ type: Boolean, attribute: 'show-header' }) showHeader: boolean = false;
  
  @state() private inputFeatures: number[] = [];
  
  static styles = css`
    :host {
      display: block;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      color: hsl(var(--foreground, 210 20% 98%));
      background: hsl(var(--background, 220 13% 10%));
      container-type: inline-size;
    }

    /* ─── Layout ─── */
    .root {
      padding: 24px;
    }
    .header {
      margin-bottom: 24px;
    }
    .header h2 {
      margin: 0 0 6px 0;
      font-size: 22px;
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    .header p {
      margin: 0;
      color: hsl(var(--muted-foreground, 215 15% 65%));
      font-size: 14px;
    }

    .grid {
      display: grid;
      grid-template-columns: 300px 1fr;
      gap: 28px;
      align-items: start;
    }
    @container (max-width: 700px) {
      .grid {
        grid-template-columns: 1fr;
      }
    }

    /* ─── Inputs Panel ─── */
    .inputs-panel {
      background: hsl(var(--card, 220 13% 14%) / 0.85);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid hsl(var(--border, 220 13% 25%));
      border-radius: 16px;
      padding: 20px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.12);
      position: sticky;
      top: 24px;
    }
    .inputs-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .inputs-header h3 {
      margin: 0;
      font-size: 15px;
      font-weight: 700;
      letter-spacing: -0.01em;
    }
    .reset-btn {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 5px 10px;
      border-radius: 8px;
      border: 1px solid hsl(var(--border, 220 13% 25%));
      background: transparent;
      color: hsl(var(--muted-foreground, 215 15% 65%));
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: inherit;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .reset-btn:hover {
      background: hsl(var(--secondary, 220 13% 20%));
      color: hsl(var(--foreground, 210 20% 98%));
      border-color: hsl(var(--foreground, 210 20% 98%) / 0.2);
    }

    .input-group {
      margin-bottom: 14px;
    }
    .input-group:last-child {
      margin-bottom: 0;
    }
    .input-label {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 6px;
      color: hsl(var(--muted-foreground, 215 15% 65%));
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .input-value {
      font-variant-numeric: tabular-nums;
      color: hsl(var(--foreground, 210 20% 98%));
      font-weight: 700;
      font-size: 13px;
      background: hsl(var(--secondary, 220 13% 20%));
      padding: 1px 6px;
      border-radius: 4px;
    }

    /* ─── Custom Range Slider ─── */
    input[type="range"] {
      -webkit-appearance: none;
      appearance: none;
      width: 100%;
      height: 6px;
      background: hsl(var(--secondary, 220 13% 20%));
      border-radius: 999px;
      outline: none;
      transition: background 0.2s;
    }
    input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: hsl(var(--primary, 210 100% 60%));
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      transition: transform 0.15s ease, box-shadow 0.15s ease;
      border: 2px solid hsl(var(--background, 220 13% 10%));
    }
    input[type="range"]::-webkit-slider-thumb:hover {
      transform: scale(1.15);
      box-shadow: 0 2px 12px hsl(var(--primary, 210 100% 60%) / 0.4);
    }
    input[type="range"]::-moz-range-thumb {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: hsl(var(--primary, 210 100% 60%));
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      border: 2px solid hsl(var(--background, 220 13% 10%));
    }

    /* ─── Classes Grid ─── */
    .classes-grid {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    /* ─── Class Card ─── */
    .class-card {
      background: hsl(var(--card, 220 13% 14%) / 0.7);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid hsl(var(--border, 220 13% 25%));
      border-radius: 16px;
      padding: 20px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      transition: border-color 0.4s ease, box-shadow 0.4s ease, background 0.4s ease;
    }
    .class-card.winning {
      border-color: hsl(var(--winning-hue, 142) 70% 45%);
      box-shadow: 0 8px 32px hsl(var(--winning-hue, 142) 70% 45% / 0.12);
    }
    .class-card.winning .class-header {
      border-bottom-color: hsl(var(--winning-hue, 142) 70% 45% / 0.25);
    }

    .class-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid hsl(var(--border, 220 13% 25%));
      transition: border-color 0.4s ease;
    }
    .class-name {
      font-size: 17px;
      font-weight: 700;
      letter-spacing: -0.01em;
    }

    /* ─── Probability / Value Badge ─── */
    .prob-badge {
      font-size: 16px;
      font-weight: 800;
      padding: 5px 12px;
      border-radius: 10px;
      font-variant-numeric: tabular-nums;
      background: hsl(var(--secondary, 220 13% 20%));
      color: hsl(var(--foreground, 210 20% 98%));
      transition: all 0.4s ease;
    }
    .winning .prob-badge {
      background: hsl(var(--winning-hue, 142) 70% 45%);
      color: #fff;
      box-shadow: 0 2px 12px hsl(var(--winning-hue, 142) 70% 45% / 0.3);
    }

    /* ─── Coefficient Bars ─── */
    .coef-row {
      display: grid;
      grid-template-columns: 120px 1fr 70px;
      gap: 12px;
      align-items: center;
      margin-bottom: 10px;
      font-size: 12px;
    }
    @container (max-width: 500px) {
      .coef-row {
        grid-template-columns: 90px 1fr 55px;
        gap: 8px;
        font-size: 11px;
      }
    }
    .coef-name {
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: hsl(var(--muted-foreground, 215 15% 65%));
    }
    .bar-container {
      position: relative;
      height: 10px;
      background: hsl(var(--secondary, 220 13% 20%));
      border-radius: 5px;
      overflow: hidden;
    }
    .bar-center {
      position: absolute;
      left: 50%;
      top: 0;
      bottom: 0;
      width: 1px;
      background: hsl(var(--muted-foreground, 215 15% 65%) / 0.25);
      z-index: 2;
    }
    .bar-fill {
      position: absolute;
      top: 0;
      height: 100%;
      border-radius: 5px;
      transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1), left 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s;
    }
    .bar-fill.positive {
      background: linear-gradient(90deg, hsl(142 70% 45%), hsl(142 70% 55%));
    }
    .bar-fill.negative {
      background: linear-gradient(90deg, hsl(0 72% 55%), hsl(0 72% 50%));
    }
    .coef-value {
      text-align: right;
      font-variant-numeric: tabular-nums;
      font-weight: 700;
      font-size: 12px;
      transition: color 0.3s;
    }
    .coef-value.positive {
      color: hsl(142 70% 55%);
    }
    .coef-value.negative {
      color: hsl(0 72% 60%);
    }
    .coef-value.zero {
      color: hsl(var(--muted-foreground, 215 15% 65%));
    }

    /* ─── Calculation Summary ─── */
    .calc-summary {
      margin-top: 16px;
      padding-top: 12px;
      border-top: 1px dashed hsl(var(--border, 220 13% 25%));
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 8px 16px;
      font-size: 13px;
      align-items: center;
    }
    .calc-label {
      color: hsl(var(--muted-foreground, 215 15% 65%));
      font-size: 12px;
    }
    .calc-val {
      text-align: right;
      font-variant-numeric: tabular-nums;
      font-weight: 600;
    }
    .calc-val.total {
      font-weight: 800;
      font-size: 15px;
      color: hsl(var(--foreground, 210 20% 98%));
    }

    /* ─── Regression card ─── */
    .regression-card {
      background: hsl(var(--card, 220 13% 14%) / 0.7);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid hsl(var(--border, 220 13% 25%));
      border-radius: 16px;
      padding: 20px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    }
    .regression-header {
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid hsl(var(--border, 220 13% 25%));
    }
    .regression-header h3 {
      margin: 0 0 4px 0;
      font-size: 17px;
      font-weight: 700;
    }
    .regression-value {
      font-size: 36px;
      font-weight: 900;
      letter-spacing: -0.03em;
      color: hsl(var(--primary, 210 100% 60%));
      font-variant-numeric: tabular-nums;
      text-align: center;
      padding: 12px 0;
    }

    /* ─── Empty state ─── */
    .empty {
      padding: 40px 20px;
      text-align: center;
      color: hsl(var(--muted-foreground, 215 15% 65%));
      font-size: 14px;
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

  private resetFeatures() {
    this.inputFeatures = new Array(this.model.meta.n_features).fill(0);
  }

  private isRegression(): boolean {
    if (!this.model) return false;
    const task = this.model.meta.task;
    if (task === 'regression') return true;
    const type = this.model.meta.model_type;
    return ['LinearRegression', 'Ridge', 'Lasso', 'ElasticNet', 'SVR'].includes(type);
  }

  private isBinaryClassification(): boolean {
    if (!this.model) return false;
    return !this.isRegression() && this.model.params.coef.length === 1;
  }

  private computeClassificationOutputs(): { sums: number[], probs: number[] } {
    if (!this.model || !this.model.params.coef) return { sums: [], probs: [] };

    const coef = this.model.params.coef;
    const intercept = this.model.params.intercept;

    if (this.isBinaryClassification()) {
      // Binary: single coef row → sigmoid
      const classCoefs = coef[0];
      let sum = intercept[0] || 0;
      for (let i = 0; i < this.inputFeatures.length; i++) {
        sum += classCoefs[i] * this.inputFeatures[i];
      }
      const prob1 = 1 / (1 + Math.exp(-sum));
      return {
        sums: [-sum, sum],
        probs: [1 - prob1, prob1],
      };
    }

    // Multi-class: softmax
    const sums: number[] = coef.map((classCoefs: number[], classIdx: number) => {
      let sum = intercept[classIdx] || 0;
      for (let i = 0; i < this.inputFeatures.length; i++) {
        sum += classCoefs[i] * this.inputFeatures[i];
      }
      return sum;
    });

    const maxSum = Math.max(...sums);
    const exps = sums.map((s: number) => Math.exp(s - maxSum));
    const sumExps = exps.reduce((a: number, b: number) => a + b, 0);
    const probs = exps.map((e: number) => e / sumExps);

    return { sums, probs };
  }

  private computeRegressionOutput(): { sum: number, contributions: number[] } {
    if (!this.model || !this.model.params.coef) return { sum: 0, contributions: [] };

    const coef = this.model.params.coef[0] || this.model.params.coef;
    const intercept = Array.isArray(this.model.params.intercept)
      ? this.model.params.intercept[0] || 0
      : this.model.params.intercept || 0;

    let sum = intercept;
    const contributions: number[] = [];
    const coefArray = Array.isArray(coef[0]) ? coef[0] : coef;

    for (let i = 0; i < this.inputFeatures.length; i++) {
      const c = coefArray[i] * this.inputFeatures[i];
      contributions.push(c);
      sum += c;
    }

    return { sum, contributions };
  }

  private renderInputsPanel() {
    if (!this.model) return '';
    return html`
      <div class="inputs-panel">
        <div class="inputs-header">
          <h3>Input Features</h3>
          <button class="reset-btn" @click=${this.resetFeatures}>
            ↺ Reset
          </button>
        </div>
        ${this.model.meta.feature_names.map((name: string, i: number) => html`
          <div class="input-group">
            <div class="input-label">
              ${name}
              <span class="input-value">${this.inputFeatures[i]?.toFixed(2) ?? '0.00'}</span>
            </div>
            <input type="range"
              min="-10" max="10" step="0.1"
              .value=${String(this.inputFeatures[i] ?? 0)}
              @input=${(e: Event) => this.updateFeature(i, (e.target as HTMLInputElement).value)} />
          </div>
        `)}
      </div>
    `;
  }

  private renderCoefficientBars(classCoefs: number[], maxContribution: number) {
    return classCoefs.map((coef: number, featIdx: number) => {
      const featName = this.model.meta.feature_names[featIdx];
      const inputVal = this.inputFeatures[featIdx];
      const contribution = coef * inputVal;
      const isPositive = contribution >= 0;
      const safeDenom = Math.max(maxContribution, 0.001);
      const pct = Math.min(48, (Math.abs(contribution) / safeDenom) * 48);
      const left = isPositive ? '50%' : `${50 - pct}%`;
      const width = `${pct}%`;
      const sign = contribution > 0 ? '+' : '';
      const valClass = Math.abs(contribution) < 0.001 ? 'zero' : (isPositive ? 'positive' : 'negative');

      return html`
        <div class="coef-row">
          <div class="coef-name" title="${featName}">${featName}</div>
          <div class="bar-container">
            <div class="bar-center"></div>
            <div class="bar-fill ${isPositive ? 'positive' : 'negative'}"
                 style="left: ${left}; width: ${width};"></div>
          </div>
          <div class="coef-value ${valClass}">${sign}${contribution.toFixed(3)}</div>
        </div>
      `;
    });
  }

  private renderClassificationCards() {
    const { sums, probs } = this.computeClassificationOutputs();
    const winningClassIdx = probs.indexOf(Math.max(...probs));
    const isBinary = this.isBinaryClassification();

    // Get the actual coef arrays to render
    const coefArrays = isBinary
      ? [this.model.params.coef[0], this.model.params.coef[0].map((c: number) => -c)]
      : this.model.params.coef;

    // Determine max contribution for bar scaling
    let maxContribution = 0;
    coefArrays.forEach((classCoefs: number[]) => {
      classCoefs.forEach((c: number, i: number) => {
        maxContribution = Math.max(maxContribution, Math.abs(c * this.inputFeatures[i]));
      });
    });

    const classes = this.model.meta.classes || [];

    return html`
      <div class="classes-grid">
        ${classes.map((className: string, classIdx: number) => {
          const prob = probs[classIdx];
          const sum = sums[classIdx];
          const classCoefs = coefArrays[classIdx] || coefArrays[0];
          const intercept = isBinary
            ? (classIdx === 0 ? -(this.model.params.intercept[0] || 0) : (this.model.params.intercept[0] || 0))
            : (this.model.params.intercept[classIdx] || 0);
          const isWinning = classIdx === winningClassIdx;

          return html`
            <div class="class-card ${isWinning ? 'winning' : ''}">
              <div class="class-header">
                <span class="class-name">${className}</span>
                <div class="prob-badge">${(prob * 100).toFixed(1)}%</div>
              </div>

              <div class="coef-bars">
                ${this.renderCoefficientBars(classCoefs, maxContribution)}
              </div>

              <div class="calc-summary">
                <span class="calc-label">Intercept</span>
                <span class="calc-val">${intercept > 0 ? '+' : ''}${intercept.toFixed(4)}</span>
                <span class="calc-label">Decision function</span>
                <span class="calc-val total">${sum.toFixed(4)}</span>
              </div>
            </div>
          `;
        })}
      </div>
    `;
  }

  private renderRegressionCard() {
    const { sum, contributions } = this.computeRegressionOutput();
    const coef = Array.isArray(this.model.params.coef[0]) ? this.model.params.coef[0] : this.model.params.coef;
    const intercept = Array.isArray(this.model.params.intercept)
      ? this.model.params.intercept[0] || 0
      : this.model.params.intercept || 0;

    let maxContribution = 0;
    contributions.forEach((c: number) => {
      maxContribution = Math.max(maxContribution, Math.abs(c));
    });

    return html`
      <div class="classes-grid">
        <div class="regression-card">
          <div class="regression-header">
            <h3>Predicted Value</h3>
          </div>
          <div class="regression-value">${sum.toFixed(4)}</div>

          <div class="coef-bars" style="margin-top: 16px;">
            ${this.renderCoefficientBars(coef, maxContribution)}
          </div>

          <div class="calc-summary">
            <span class="calc-label">Intercept</span>
            <span class="calc-val">${intercept > 0 ? '+' : ''}${intercept.toFixed(4)}</span>
            <span class="calc-label">Σ contributions</span>
            <span class="calc-val">${contributions.reduce((a: number, b: number) => a + b, 0).toFixed(4)}</span>
            <span class="calc-label">Output (intercept + Σ)</span>
            <span class="calc-val total">${sum.toFixed(4)}</span>
          </div>
        </div>
      </div>
    `;
  }

  render() {
    if (!this.model || !this.model.params?.coef) {
      return html`<div class="empty">Provide a valid linear model to visualize.</div>`;
    }

    const regression = this.isRegression();

    return html`
      <div class="root">
        ${this.showHeader ? html`
          <div class="header">
            <h2>${this.model.meta.model_type} Visualization</h2>
            <p>Interactive linear model with ${this.model.meta.n_features} features${regression ? '' : ` and ${this.model.meta.classes?.length || 2} classes`}.</p>
          </div>
        ` : ''}

        <div class="grid">
          ${this.renderInputsPanel()}
          ${regression ? this.renderRegressionCard() : this.renderClassificationCards()}
        </div>
      </div>
    `;
  }
}
