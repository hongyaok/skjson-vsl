import { html, svg, css, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { computeTreeLayout, LayoutNode, LayoutEdge, isLeaf, CLASS_COLORS } from '../utils';

export const treeStyles = css`
  :host {
    display: block;
    width: 100%;
    font-family: system-ui, -apple-system, sans-serif;
  }
  .container {
    position: relative;
    width: 100%;
    height: 500px;
    overflow: hidden;
    border-radius: var(--radius, 0.75rem);
    border: 1px solid hsl(var(--border, 240 5.9% 90%));
    background-color: hsl(var(--card, 0 0% 100%));
    color: hsl(var(--card-foreground, 240 10% 3.9%));
    cursor: grab;
  }
  .container:active {
    cursor: grabbing;
  }
  .tree-wrapper {
    position: absolute;
    /* Remove transition for transform to allow smooth dragging */
    will-change: transform;
  }
  .tree-wrapper.animated {
    transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }
  svg {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: visible;
  }
  .node {
    position: absolute;
    width: 120px;
    padding: 8px;
    border-radius: var(--radius, 8px);
    border: 1px solid hsl(var(--border, 240 5.9% 90%));
    background-color: hsl(var(--background, 0 0% 100%));
    font-size: 10px;
    line-height: 1.2;
    text-align: center;
    transition: all 0.3s ease;
    box-sizing: border-box;
    transform: translate(-50%, -50%);
    user-select: none;
  }
  
  /* Prediction Highlight States */
  .node.evaluating {
    border-color: #eab308; /* Yellow */
    background-color: rgba(234, 179, 8, 0.1);
    transform: translate(-50%, -50%) scale(1.1);
    z-index: 20;
    box-shadow: 0 0 20px rgba(234, 179, 8, 0.5);
  }
  .node.traversed {
    border-color: #22c55e; /* Green */
    background-color: rgba(34, 197, 94, 0.05);
    z-index: 10;
    box-shadow: 0 0 10px rgba(34, 197, 94, 0.2);
  }
  
  .node-feature {
    font-weight: 600;
    margin-bottom: 2px;
  }
  .node-threshold {
    color: hsl(var(--muted-foreground, 240 3.8% 46.1%));
  }
  .node-class {
    font-weight: bold;
    font-size: 12px;
    padding: 2px 8px;
    border-radius: 999px;
    display: inline-block;
    margin-bottom: 4px;
  }
  .prob-bar {
    display: flex;
    width: 100%;
    height: 6px;
    border-radius: 999px;
    overflow: hidden;
    margin-top: 4px;
  }
  .prob-segment {
    height: 100%;
    transition: width 0.3s;
  }
  
  .edge {
    fill: none;
    stroke: hsl(var(--border, 240 5.9% 90%));
    stroke-width: 1;
    opacity: 0.4;
    transition: all 0.5s;
  }
  .edge.traversed {
    stroke: #22c55e;
    stroke-width: 2;
    opacity: 0.7;
  }
  .edge-animating {
    fill: none;
    stroke: #eab308;
    stroke-width: 3;
    stroke-linecap: round;
    stroke-dasharray: 1000;
    stroke-dashoffset: 1000;
    animation: dash 0.5s ease-in-out forwards;
  }
  @keyframes dash {
    to {
      stroke-dashoffset: 0;
    }
  }
  
  .popup {
    position: absolute;
    top: -50px;
    left: 50%;
    transform: translateX(-50%);
    background: #fef08a; /* Yellow */
    border: 1px solid #eab308;
    padding: 6px 12px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    z-index: 100;
    pointer-events: none;
    font-size: 11px;
    white-space: nowrap;
    animation: fadeUp 0.3s ease-out;
    color: #000;
    font-weight: 600;
  }

  .inputs-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
    margin-bottom: 16px;
    padding: 16px;
    border-radius: 12px;
    background-color: hsl(var(--card, 0 0% 100%));
    border: 1px solid hsl(var(--border, 240 5.9% 90%));
  }
  .feature-input {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .feature-input label {
    font-size: 11px;
    font-weight: 600;
    color: hsl(var(--muted-foreground, 240 3.8% 46.1%));
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .feature-input input {
    padding: 8px 12px;
    border-radius: 8px;
    border: 1px solid hsl(var(--border, 240 5.9% 90%));
    background: hsl(var(--background, 0 0% 100%));
    color: hsl(var(--foreground, 240 10% 3.9%));
    font-family: inherit;
    font-size: 14px;
    font-weight: 500;
    width: 100%;
    box-sizing: border-box;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    -moz-appearance: textfield;
  }
  .feature-input input::-webkit-outer-spin-button,
  .feature-input input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  .feature-input input:hover {
    border-color: hsl(var(--foreground, 240 10% 3.9%) / 0.3);
  }
  .feature-input input:focus {
    outline: none;
    border-color: hsl(var(--primary, 240 5.9% 10%));
    box-shadow: 0 0 0 3px hsl(var(--primary, 240 5.9% 10%) / 0.15);
  }
  .feature-input input:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .controls {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
    flex-wrap: wrap;
    justify-content: center;
  }
  button {
    padding: 10px 20px;
    border-radius: 10px;
    border: 1px solid hsl(var(--border, 240 5.9% 90%));
    background-color: hsl(var(--background, 0 0% 100%));
    color: hsl(var(--foreground, 240 10% 3.9%));
    cursor: pointer;
    font-weight: 600;
    font-size: 13px;
    letter-spacing: 0.01em;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    position: relative;
  }
  button:hover:not(:disabled) {
    background-color: hsl(var(--accent, 240 4.8% 95.9%));
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transform: translateY(-1px);
  }
  button:active:not(:disabled) {
    transform: translateY(0) scale(0.97);
    box-shadow: 0 0 0 rgba(0, 0, 0, 0);
  }
  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  button.primary {
    background-color: hsl(var(--primary, 240 5.9% 10%));
    color: hsl(var(--primary-foreground, 0 0% 98%));
    border-color: hsl(var(--primary, 240 5.9% 10%));
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.1);
  }
  button.primary:hover:not(:disabled) {
    background-color: hsl(var(--primary, 240 5.9% 10%) / 0.9);
    box-shadow: 0 4px 12px hsl(var(--primary, 240 5.9% 10%) / 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.1);
  }
  
  .prediction-result {
    margin-top: 16px;
    padding: 16px;
    border-radius: var(--radius, 0.75rem);
    border: 1px solid hsl(var(--primary, 240 5.9% 10%) / 0.3);
    background-color: hsl(var(--primary, 240 5.9% 10%) / 0.05);
    text-align: center;
    animation: fadeUp 0.3s ease-out;
  }
  .prediction-title {
    font-size: 14px;
    color: hsl(var(--muted-foreground, 240 3.8% 46.1%));
    margin-bottom: 4px;
  }
  .prediction-value {
    font-size: 24px;
    font-weight: 900;
    color: hsl(var(--primary, 240 5.9% 10%));
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translate(-50%, 10px); }
    to { opacity: 1; transform: translate(-50%, 0); }
  }
  .overlay-controls-slot {
    position: absolute;
    top: 16px;
    right: 24px;
    z-index: 50;
    pointer-events: auto;
  }
`;

@customElement('skjson-decision-tree')
export class SkjsonDecisionTree extends LitElement {
  @property({ type: Object }) model: any = null;
  @property({ type: Number }) treeIndex: number = 0;
  
  @state() protected containerBounds = { width: 0, height: 0 };
  
  // Panning state
  @state() protected panX: number = 0;
  @state() protected panY: number = 0;
  protected isDragging: boolean = false;
  private lastMouseX: number = 0;
  private lastMouseY: number = 0;
  
  // Flag to know if transform should be animated (e.g. centering on a node vs drag-to-pan)
  @state() protected isAnimatingTransform: boolean = false;

  static styles = treeStyles;

  firstUpdated() {
    const container = this.shadowRoot?.querySelector('.container');
    if (container) {
      this.containerBounds = {
        width: container.clientWidth,
        height: container.clientHeight
      };
      
      const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
          this.containerBounds = {
            width: entry.contentRect.width,
            height: entry.contentRect.height
          };
        }
      });
      resizeObserver.observe(container);
    }
  }

  protected getNodes() {
    if (!this.model || !this.model.params) return [];
    
    const params = this.model.params;
    if (params.nodes) return params.nodes;
    if (params.trees) {
      if (this.model.meta.model_type.startsWith('GradientBoosting')) {
        const stage = Math.floor(this.treeIndex / (this.model.meta.n_tree_outputs || 1));
        const output = this.treeIndex % (this.model.meta.n_tree_outputs || 1);
        return params.trees[stage]?.[output] || [];
      }
      return params.trees[this.treeIndex] || params.trees[0] || [];
    }
    return [];
  }

  protected getFeatureName(index: number) {
    if (this.model?.meta?.feature_names) {
      return this.model.meta.feature_names[index];
    }
    return `Feature ${index}`;
  }

  protected getClassName(index: number) {
    if (this.model?.meta?.classes) {
      return this.model.meta.classes[index];
    }
    return `Class ${index}`;
  }

  private handlePointerDown(e: PointerEvent) {
    this.isDragging = true;
    this.isAnimatingTransform = false;
    this.lastMouseX = e.clientX;
    this.lastMouseY = e.clientY;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  private handlePointerMove(e: PointerEvent) {
    if (!this.isDragging) return;
    const dx = e.clientX - this.lastMouseX;
    const dy = e.clientY - this.lastMouseY;
    this.panX += dx;
    this.panY += dy;
    this.lastMouseX = e.clientX;
    this.lastMouseY = e.clientY;
  }

  private handlePointerUp(e: PointerEvent) {
    this.isDragging = false;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  }

  // Hook for subclass to provide custom node styles
  protected getNodeClasses(nodeId: number): string {
    return '';
  }

  // Hook for subclass to provide custom edge styles
  protected getEdgeClasses(fromId: number, toId: number): string {
    return '';
  }
  
  // Hook for subclass to inject custom HTML inside the node
  protected renderNodeAddons(ln: LayoutNode): unknown {
    return '';
  }
  
  // Hook for subclass to render animated edges
  protected renderEdgeAddons(fromId: number, toId: number, pathD: string): unknown {
    return '';
  }

  render() {
    if (!this.model) return html`<div>No model provided</div>`;

    const nodes = this.getNodes();
    const { layoutNodes, edges } = computeTreeLayout(nodes);

    if (layoutNodes.length === 0) return html`<div>Empty tree</div>`;

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    layoutNodes.forEach(n => {
      minX = Math.min(minX, n.x);
      maxX = Math.max(maxX, n.x);
      minY = Math.min(minY, n.y);
      maxY = Math.max(maxY, n.y);
    });

    minX -= 80; maxX += 80;
    minY -= 40; maxY += 60;

    const treeWidth = maxX - minX;
    const treeHeight = maxY - minY;

    // Default center if no pan is set
    if (this.panX === 0 && this.panY === 0) {
      const rootNode = layoutNodes.find(n => n.id === 0);
      if (rootNode) {
        this.panX = this.containerBounds.width / 2 - (rootNode.x - minX);
        this.panY = this.containerBounds.height / 2 - (rootNode.y - minY);
      }
    }

    return html`
      <div class="container"
           @pointerdown=${this.handlePointerDown}
           @pointermove=${this.handlePointerMove}
           @pointerup=${this.handlePointerUp}
           @pointercancel=${this.handlePointerUp}>
        <div class="tree-wrapper ${this.isAnimatingTransform ? 'animated' : ''}" 
             style="width: ${treeWidth}px; height: ${treeHeight}px; transform: translate(${this.panX}px, ${this.panY}px)">
          <svg width="${treeWidth}" height="${treeHeight}">
            <g transform="translate(${-minX}, ${-minY})">
              ${edges.map(edge => {
                const from = layoutNodes.find(n => n.id === edge.fromId);
                const to = layoutNodes.find(n => n.id === edge.toId);
                if (!from || !to) return '';
                
                const x1 = from.x;
                const y1 = from.y + 20;
                const x2 = to.x;
                const y2 = to.y - 24;
                const midY = (y1 + y2) / 2;
                const pathD = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;

                const edgeClasses = this.getEdgeClasses(edge.fromId, edge.toId);

                return svg`
                  <path class="edge ${edgeClasses}" d="${pathD}"></path>
                  ${this.renderEdgeAddons(edge.fromId, edge.toId, pathD)}
                  <text x="${x1 + (x2 - x1) * 0.3}" y="${y1 + 14}" text-anchor="middle" fill="hsl(var(--muted-foreground, 240 3.8% 46.1%))" font-size="8" opacity="0.6">
                    ${edge.direction === 'left' ? 'Yes' : 'No'}
                  </text>
                `;
              })}
            </g>
          </svg>
          
          <div style="position: absolute; inset: 0; transform: translate(${-minX}px, ${-minY}px)">
            ${layoutNodes.map(ln => {
              const leaf = isLeaf(ln.node);
              const total = ln.node.value.reduce((a: number, b: number) => a + b, 0) || 1;
              const maxIdx = ln.node.value.indexOf(Math.max(...ln.node.value));
              const extraClasses = this.getNodeClasses(ln.node.id);
              
              return html`
                <div class="node ${extraClasses}" style="left: ${ln.x}px; top: ${ln.y}px;">
                  ${this.renderNodeAddons(ln)}
                  ${leaf ? html`
                    <div class="node-class" style="background-color: ${CLASS_COLORS[maxIdx]}20; color: ${CLASS_COLORS[maxIdx]}">
                      ${this.getClassName(maxIdx)}
                    </div>
                  ` : html`
                    <div class="node-feature">${this.getFeatureName(ln.node.feature)}</div>
                    <div class="node-threshold">≤ ${ln.node.threshold.toFixed(2)}</div>
                  `}
                  <div class="prob-bar">
                    ${ln.node.value.map((v: number, i: number) => html`
                      <div class="prob-segment" style="width: ${(v/total)*100}%; background-color: ${CLASS_COLORS[i]}"></div>
                    `)}
                  </div>
                </div>
              `;
            })}
          </div>
        </div>
        <div class="overlay-controls-slot">
          <slot name="overlay"></slot>
        </div>
      </div>
    `;
  }
}

@customElement('skjson-decision-tree-predict')
export class SkjsonDecisionTreePredict extends SkjsonDecisionTree {
  @property({ type: Array }) inputFeatures: number[] = [];
  
  @state() private activePath: number[] = [];
  @state() private currentStep: number = -1;
  @state() private isAnimating: boolean = false;
  @state() private prediction: string | null = null;
  @state() private animatingEdge: string | null = null;

  async predict() {
    if (this.isAnimating || !this.model) return;
    this.isAnimating = true;
    this.prediction = null;
    this.currentStep = -1;
    this.animatingEdge = null;

    const nodes = this.getNodes();
    if (!nodes.length) {
      this.isAnimating = false;
      return;
    }

    const path: number[] = [0];
    let currId = 0;

    while (true) {
      const node = nodes.find((n: any) => n.id === currId);
      if (!node || node.feature === -2) break;

      const val = this.inputFeatures[node.feature] || 0;
      if (val <= node.threshold) {
        currId = node.left;
      } else {
        currId = node.right;
      }
      path.push(currId);
    }

    this.activePath = path;

    // Need to center tree on root node to start
    this.centerOnNode(0);

    for (let i = 0; i < path.length; i++) {
      if (i > 0) {
        this.animatingEdge = `${path[i - 1]}-${path[i]}`;
        await new Promise(r => setTimeout(r, 400));
      }
      this.currentStep = i;
      this.animatingEdge = null;
      this.centerOnNode(path[i]);
      await new Promise(r => setTimeout(r, 600)); // Time to see the evaluation
    }

    const leafId = path[path.length - 1];
    const leafNode = nodes.find((n: any) => n.id === leafId);
    if (leafNode) {
      const vals = leafNode.value;
      const maxIdx = vals.indexOf(Math.max(...vals));
      this.prediction = String(this.getClassName(maxIdx));
    }

    this.isAnimating = false;
  }
  
  private centerOnNode(nodeId: number) {
    const nodes = this.getNodes();
    const { layoutNodes } = computeTreeLayout(nodes);
    const activeNode = layoutNodes.find(n => n.id === nodeId);
    if (activeNode) {
      let minX = Infinity, minY = Infinity;
      layoutNodes.forEach(n => {
        minX = Math.min(minX, n.x);
        minY = Math.min(minY, n.y);
      });
      minX -= 80;
      minY -= 40;
      
      this.isAnimatingTransform = true;
      this.panX = this.containerBounds.width / 2 - (activeNode.x - minX);
      this.panY = this.containerBounds.height / 2 - (activeNode.y - minY);
    }
  }

  reset() {
    this.activePath = [];
    this.currentStep = -1;
    this.prediction = null;
    this.animatingEdge = null;
    this.isAnimating = false;
    this.centerOnNode(0);
  }

  protected getNodeClasses(nodeId: number): string {
    const isEvaluating = this.activePath[this.currentStep] === nodeId;
    const isTraversed = this.activePath.indexOf(nodeId) !== -1 && this.activePath.indexOf(nodeId) < this.currentStep;
    const isLeafReached = isTraversed && isLeaf(this.getNodes().find((n: any) => n.id === nodeId));
    
    // Leaf node reached glows green since evaluation finishes there
    if (isLeafReached || (this.currentStep === this.activePath.length - 1 && isEvaluating && isLeaf(this.getNodes().find((n: any) => n.id === nodeId)))) {
      return 'traversed';
    }

    if (isEvaluating) return 'evaluating';
    if (isTraversed) return 'traversed';
    
    return '';
  }

  protected getEdgeClasses(fromId: number, toId: number): string {
    const edgeKey = `${fromId}-${toId}`;
    
    let isTraversed = false;
    for (let i = 0; i < this.currentStep; i++) {
      if (this.activePath[i] === fromId && this.activePath[i+1] === toId) {
        isTraversed = true;
        break;
      }
    }
    
    if (isTraversed) return 'traversed';
    return '';
  }
  
  protected renderNodeAddons(ln: LayoutNode) {
    const isEvaluating = this.activePath[this.currentStep] === ln.node.id;
    if (isEvaluating && !isLeaf(ln.node)) {
      const featName = this.getFeatureName(ln.node.feature);
      const val = this.inputFeatures[ln.node.feature] || 0;
      return html`
        <div class="popup">
          ${featName} (${val.toFixed(2)}) ≤ ${ln.node.threshold.toFixed(2)}
        </div>
      `;
    }
    return '';
  }
  
  protected renderEdgeAddons(fromId: number, toId: number, pathD: string) {
    const edgeKey = `${fromId}-${toId}`;
    if (this.animatingEdge === edgeKey) {
      return svg`<path class="edge-animating" d="${pathD}"></path>`;
    }
    return '';
  }

  private updateFeature(index: number, e: Event) {
    const target = e.target as HTMLInputElement;
    const val = parseFloat(target.value);
    const newFeatures = [...this.inputFeatures];
    newFeatures[index] = isNaN(val) ? 0 : val;
    this.inputFeatures = newFeatures;
  }

  private getNumFeatures(): number {
    // Priority 1: model metadata
    if (this.model?.meta?.feature_names?.length) {
      return this.model.meta.feature_names.length;
    }
    // Priority 2: scan tree nodes for the highest feature index used
    const nodes = this.getNodes();
    if (nodes.length) {
      const featureIndices = nodes
        .map((n: any) => n.feature)
        .filter((f: number) => f >= 0);
      if (featureIndices.length) {
        return Math.max(...featureIndices) + 1;
      }
    }
    // Priority 3: use inputFeatures length or fallback to 4
    return this.inputFeatures.length || 4;
  }

  render() {
    const numFeatures = this.getNumFeatures();

    // Ensure inputFeatures array has the right length, filling with 0s
    if (this.inputFeatures.length < numFeatures) {
      const padded = [...this.inputFeatures];
      while (padded.length < numFeatures) padded.push(0);
      this.inputFeatures = padded;
    }

    const inputs = Array.from({ length: numFeatures }).map((_, i) => {
      const featName = this.getFeatureName(i);
      const val = this.inputFeatures[i] ?? 0;
      return html`
        <div class="feature-input">
          <label>${featName}</label>
          <input type="number" step="0.1" .value="${String(val)}" @input="${(e: Event) => this.updateFeature(i, e)}" ?disabled="${this.isAnimating}" />
        </div>
      `;
    });

    return html`
      <div class="inputs-container">
        ${inputs}
      </div>
      <div class="controls">
        <button class="primary" @click=${this.predict} ?disabled=${this.isAnimating}>
          ${this.isAnimating ? 'Traversing...' : 'Predict (Traverse)'}
        </button>
        ${this.activePath.length > 0 && !this.isAnimating ? html`
          <button @click=${this.reset}>Reset</button>
        ` : ''}
      </div>
      ${super.render()}
      ${this.prediction ? html`
        <div class="prediction-result">
          <div class="prediction-title">Predicted Class</div>
          <div class="prediction-value">${this.prediction}</div>
        </div>
      ` : ''}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'skjson-decision-tree': SkjsonDecisionTree;
    'skjson-decision-tree-predict': SkjsonDecisionTreePredict;
  }
}
