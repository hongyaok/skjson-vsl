import { html, css, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { TreeNode, isLeaf } from '../utils';

@customElement('skjson-decision-tree-flashcards')
export class DecisionTreeFlashcards extends LitElement {
  @property({ type: Object }) model: any = null;
  
  @state() private currentPath: number[] = [0];
  @state() private currentTreeIndex: number = 0;

  static styles = css`
    :host {
      display: block;
      width: 100%;
      min-height: 500px;
      font-family: system-ui, -apple-system, sans-serif;
      perspective: 1200px;
    }
    .flashcards-container {
      position: relative;
      width: 100%;
      max-width: 450px;
      margin: 60px auto;
      height: 320px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .card {
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 16px;
      padding: 32px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
      transform-style: preserve-3d;
      background: hsl(var(--card) / 0.8);
      backdrop-filter: blur(20px);
      border: 1px solid hsl(var(--border) / 0.5);
      box-shadow: 0 12px 40px rgba(0,0,0,0.15);
    }
    /* 3D Stacking behind */
    .card.stack-1 {
      transform: translateZ(-80px) translateY(-30px) rotateX(5deg) scale(0.95);
      opacity: 0.7;
      z-index: 10;
      pointer-events: none;
    }
    .card.stack-2 {
      transform: translateZ(-160px) translateY(-60px) rotateX(10deg) scale(0.9);
      opacity: 0.4;
      z-index: 9;
      pointer-events: none;
    }
    .card.stack-hidden {
      transform: translateZ(-240px) translateY(-90px) rotateX(15deg) scale(0.85);
      opacity: 0;
      pointer-events: none;
      z-index: 8;
    }
    .card.active {
      transform: translateZ(0) translateY(0) rotateX(0) scale(1);
      opacity: 1;
      z-index: 20;
    }
    
    .question {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 32px;
      color: hsl(var(--foreground));
      line-height: 1.4;
    }
    .feature-name {
      color: hsl(var(--primary));
      background: hsl(var(--primary) / 0.1);
      padding: 2px 8px;
      border-radius: 4px;
    }
    .actions {
      display: flex;
      gap: 16px;
      width: 100%;
    }
    .card button {
      flex: 1;
      padding: 14px 20px;
      border-radius: 8px;
      border: 1px solid hsl(var(--border) / 0.8);
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      background-color: hsl(var(--secondary));
      color: hsl(var(--secondary-foreground));
    }
    .card button:hover {
      background-color: hsl(var(--primary));
      color: hsl(var(--primary-foreground));
      border-color: hsl(var(--primary));
      transform: translateY(-2px);
      box-shadow: 0 4px 12px hsl(var(--primary) / 0.3);
    }
    
    .voter-selector {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin-bottom: 24px;
      background: hsl(var(--card) / 0.5);
      backdrop-filter: blur(10px);
      border: 1px solid hsl(var(--border) / 0.5);
      border-radius: 999px;
      padding: 6px 16px;
      width: fit-content;
      margin: 0 auto 20px auto;
    }
    .voter-nav-btn {
      background: transparent;
      border: none;
      color: hsl(var(--foreground));
      font-size: 1.2rem;
      cursor: pointer;
      padding: 4px 12px;
      border-radius: 999px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      font-weight: bold;
    }
    .voter-nav-btn:hover:not(:disabled) {
      background: hsl(var(--secondary));
      color: hsl(var(--secondary-foreground));
    }
    .voter-nav-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }
    .voter-info {
      font-size: 0.9rem;
      font-weight: 600;
      color: hsl(var(--muted-foreground));
      user-select: none;
      min-width: 140px;
      text-align: center;
    }
    
    .leaf-result {
      font-size: 2.5rem;
      font-weight: 800;
      background: linear-gradient(to right, #ff007f, #ffaa00, #00ffaa, #00aaff, #ff007f);
      background-size: 200% auto;
      color: transparent;
      background-clip: text;
      -webkit-background-clip: text;
      animation: shine 3s linear infinite;
      margin-top: 16px;
    }
    
    .reset-btn {
      margin-top: 32px;
      background: transparent;
      border: 1px solid hsl(var(--border));
      color: hsl(var(--muted-foreground));
    }
    .reset-btn:hover {
      background: hsl(var(--secondary));
      color: hsl(var(--secondary-foreground));
    }
    .reset-btn::before {
      display: none;
    }
    
    @keyframes shine {
      to {
        background-position: 200% center;
      }
    }
  `;

  private handleAnswer(node: TreeNode, answer: 'yes' | 'no') {
    const nextNodeId = answer === 'yes' ? node.left : node.right;
    this.currentPath = [...this.currentPath, nextNodeId];
  }

  private reset() {
    this.currentPath = [0];
  }

  private getNumTrees(): number {
    if (!this.model || !this.model.params) return 0;
    const params = this.model.params;
    if (params.nodes) return 1;
    if (params.trees) {
      if (this.model.meta?.model_type?.startsWith('GradientBoosting')) {
        const nOutputs = this.model.meta.n_tree_outputs || params.trees[0]?.length || 1;
        return params.trees.length * nOutputs;
      }
      return params.trees.length;
    }
    return 0;
  }

  private getNodes(): TreeNode[] {
    if (!this.model || !this.model.params) return [];
    const params = this.model.params;
    if (params.nodes) return params.nodes;
    if (params.trees) {
      if (this.model.meta?.model_type?.startsWith('GradientBoosting')) {
        const nOutputs = this.model.meta.n_tree_outputs || params.trees[0]?.length || 1;
        const stage = Math.floor(this.currentTreeIndex / nOutputs);
        const output = this.currentTreeIndex % nOutputs;
        return params.trees[stage]?.[output] || [];
      }
      return params.trees[this.currentTreeIndex] || params.trees[0] || [];
    }
    return [];
  }

  private prevVoter() {
    if (this.currentTreeIndex > 0) {
      this.currentTreeIndex--;
      this.reset();
    }
  }

  private nextVoter() {
    const numTrees = this.getNumTrees();
    if (this.currentTreeIndex < numTrees - 1) {
      this.currentTreeIndex++;
      this.reset();
    }
  }

  render() {
    const nodes = this.getNodes();
    if (nodes.length === 0) {
      return html`<div>No tree model provided.</div>`;
    }

    const featureNames: string[] = this.model.meta?.feature_names || [];
    const classNames: string[] = this.model.meta?.classes || [];
    const numTrees = this.getNumTrees();

    return html`
      ${numTrees > 1 ? html`
        <div class="voter-selector">
          <button class="voter-nav-btn" @click=${this.prevVoter} ?disabled=${this.currentTreeIndex === 0}>&larr;</button>
          <span class="voter-info">Voter ${this.currentTreeIndex + 1} of ${numTrees}</span>
          <button class="voter-nav-btn" @click=${this.nextVoter} ?disabled=${this.currentTreeIndex === numTrees - 1}>&rarr;</button>
        </div>
      ` : html``}
      <div class="flashcards-container">
        ${this.currentPath.map((nodeId, index) => {
          const node = nodes.find(n => n.id === nodeId);
          if (!node) return html``;

          const distance = this.currentPath.length - 1 - index;
          
          let stackClass = 'stack-hidden';
          if (distance === 0) stackClass = 'active';
          else if (distance === 1) stackClass = 'stack-1';
          else if (distance === 2) stackClass = 'stack-2';

          const isLeafNode = isLeaf(node);
          
          let content;
          if (isLeafNode) {
            let prediction = '';
            if (this.model.meta?.model_type?.includes('Classifier')) {
              const maxVal = Math.max(...node.value);
              const classIdx = node.value.indexOf(maxVal);
              prediction = classNames[classIdx] || `Class ${classIdx}`;
            } else {
              prediction = Number(node.value[0]).toFixed(3);
            }
            
            content = html`
              <div class="question">Prediction Reached</div>
              <div class="leaf-result">${prediction}</div>
              <button class="reset-btn" @click=${this.reset}>Start Over</button>
            `;
          } else {
            const fname = featureNames[node.feature] || `Feature ${node.feature}`;
            const thresh = Number(node.threshold).toFixed(3);
            content = html`
              <div class="question">
                Is <span class="feature-name">${fname}</span> &le; ${thresh}?
              </div>
              <div class="actions">
                <button @click=${() => this.handleAnswer(node, 'yes')}>Yes</button>
                <button @click=${() => this.handleAnswer(node, 'no')}>No</button>
              </div>
            `;
          }

          return html`
            <div class="card ${stackClass}">
              ${content}
            </div>
          `;
        })}
      </div>
    `;
  }
}
