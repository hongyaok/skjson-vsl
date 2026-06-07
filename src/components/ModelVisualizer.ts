import { html, css, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import './DecisionTreeVis';
import './RandomForestVis';
import './GradientBoostingVis';
import './LinearModelVis';

@customElement('skjson-model-visualizer')
export class SkjsonModelVisualizer extends LitElement {
  @property({ type: Object }) model: any = null;
  @property({ type: Array }) inputFeatures: number[] = [];

  render() {
    if (!this.model || !this.model.meta) {
      return html`<div>Please provide a valid skjson model.</div>`;
    }

    const type = this.model.meta.model_type;

    if (type === 'DecisionTreeClassifier' || type === 'DecisionTreeRegressor') {
      return html`<skjson-decision-tree .model=${this.model} .inputFeatures=${this.inputFeatures}></skjson-decision-tree>`;
    }
    
    if (type === 'RandomForestClassifier' || type === 'RandomForestRegressor') {
      return html`<skjson-random-forest .model=${this.model} .inputFeatures=${this.inputFeatures}></skjson-random-forest>`;
    }
    
    if (type === 'GradientBoostingClassifier' || type === 'GradientBoostingRegressor') {
      return html`<skjson-gradient-boosting .model=${this.model} .inputFeatures=${this.inputFeatures}></skjson-gradient-boosting>`;
    }

    if (['LinearRegression', 'Ridge', 'Lasso', 'ElasticNet', 'LogisticRegression'].includes(type)) {
      return html`<skjson-linear-model .model=${this.model} .inputFeatures=${this.inputFeatures}></skjson-linear-model>`;
    }

    return html`<div>Unsupported model type for visualization: ${type}</div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'skjson-model-visualizer': SkjsonModelVisualizer;
  }
}
