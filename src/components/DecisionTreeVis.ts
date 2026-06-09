import { html, svg, css, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { computeTreeLayout, LayoutNode, LayoutEdge, isLeaf, CLASS_COLORS } from '../utils';

const zoomInIcon = svg`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>`;
const zoomOutIcon = svg`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>`;
const settingsIcon = svg`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`;
const closeIcon = svg`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
const predictIcon = svg`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;


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
  .tree-canvas {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: visible;
  }
  .node {
    position: absolute;
    width: var(--node-size, 80px);
    height: var(--node-size, 80px);
    padding: 8px;
    border-radius: 50%;
    border: 1px solid hsl(var(--border, 240 5.9% 90%));
    background-color: hsl(var(--background, 0 0% 100%));
    opacity: var(--node-opacity, 1);
    font-size: 11px;
    line-height: 1.2;
    text-align: center;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-sizing: border-box;
    transform: translate(-50%, -50%);
    user-select: none;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    backdrop-filter: blur(8px);
  }
  .node:hover {
    transform: translate(-50%, -50%) scale(1.05);
    box-shadow: 0 12px 24px -4px rgba(0, 0, 0, 0.15), 0 8px 12px -4px rgba(0, 0, 0, 0.1);
    z-index: 5;
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
    width: 80%;
    height: 6px;
    border-radius: 999px;
    overflow: hidden;
    margin-top: 6px;
  }
  .prob-segment {
    height: 100%;
    transition: width 0.3s;
  }
  
  .edge {
    fill: none;
    stroke: hsl(var(--border, 240 5.9% 90%));
    stroke-width: var(--edge-thickness, 1px);
    opacity: 0.4;
    transition: all 0.5s;
  }
  .edge.traversed {
    stroke: #22c55e;
    stroke-width: calc(var(--edge-thickness, 1px) + 1px);
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

  .edge-label {
    position: absolute;
    transform: translate(-50%, -50%);
    background: hsl(var(--background, 0 0% 100%));
    border: 1px solid hsl(var(--border, 240 5.9% 90%));
    padding: 3px 8px;
    border-radius: 12px;
    font-size: 10px;
    font-weight: 700;
    color: hsl(var(--muted-foreground, 240 3.8% 46.1%));
    z-index: 5;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    pointer-events: none;
  }
  .edge-label.left { color: #22c55e; border-color: #22c55e; background: #f0fdf4; }
  .edge-label.right { color: #ef4444; border-color: #ef4444; background: #fef2f2; }
  
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

  .info-popup {
    position: absolute;
    bottom: calc(100% + 10px);
    left: 50%;
    transform: translateX(-50%);
    background: hsl(var(--foreground, 240 10% 3.9%));
    color: hsl(var(--background, 0 0% 100%));
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 11px;
    white-space: nowrap;
    z-index: 100;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    text-align: left;
    pointer-events: none;
    animation: fadeUp 0.2s ease-out;
  }
  .info-popup::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 6px solid transparent;
    border-top-color: hsl(var(--foreground, 240 10% 3.9%));
  }
  
  .floating-controls {
    position: absolute;
    bottom: 16px;
    right: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
    background: hsl(var(--card, 0 0% 100%) / 0.85);
    backdrop-filter: blur(12px);
    border: 1px solid hsl(var(--border, 240 5.9% 90%));
    border-radius: 999px;
    padding: 6px 12px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
    z-index: 50;
  }
  .icon-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: none;
    background: transparent;
    cursor: pointer;
    color: hsl(var(--foreground, 240 10% 3.9%));
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    padding: 0;
  }
  .icon-btn:hover {
    background: hsl(var(--accent, 240 4.8% 95.9%));
    transform: scale(1.05);
  }
  .icon-btn:active {
    transform: scale(0.95);
  }
  .zoom-label {
    font-size: 13px;
    font-weight: 700;
    min-width: 44px;
    text-align: center;
    user-select: none;
    color: hsl(var(--foreground, 240 10% 3.9%));
  }
  .divider {
    width: 1px;
    height: 20px;
    background: hsl(var(--border, 240 5.9% 90%));
    margin: 0 4px;
  }
  
  .settings-panel {
    position: absolute;
    bottom: 72px;
    right: 16px;
    width: 280px;
    background: hsl(var(--card, 0 0% 100%) / 0.95);
    backdrop-filter: blur(16px);
    border: 1px solid hsl(var(--border, 240 5.9% 90%));
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 12px 32px rgba(0,0,0,0.15);
    z-index: 100;
    animation: zoomIn 0.2s ease-out;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .settings-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
  }
  .settings-header h4 {
    margin: 0;
    font-size: 15px;
    font-weight: 700;
    color: hsl(var(--foreground, 240 10% 3.9%));
  }
  .settings-row {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .settings-row label {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    font-weight: 600;
    color: hsl(var(--muted-foreground, 240 3.8% 46.1%));
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .settings-row label span {
    color: hsl(var(--primary, 240 5.9% 10%));
    font-weight: 800;
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
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: hsl(var(--primary, 240 5.9% 10%));
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    transition: transform 0.1s;
  }
  input[type="range"]::-webkit-slider-thumb:hover {
    transform: scale(1.1);
  }

  .inputs-container {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 24px;
    max-height: 50vh;
    overflow-y: auto;
    padding-right: 8px;
  }
  .inputs-container::-webkit-scrollbar {
    width: 6px;
  }
  .inputs-container::-webkit-scrollbar-track {
    background: transparent;
  }
  .inputs-container::-webkit-scrollbar-thumb {
    background-color: hsl(var(--muted-foreground, 240 3.8% 46.1%) / 0.3);
    border-radius: 4px;
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
  .fab-predict {
    display: flex;
    align-items: center;
    gap: 8px;
    background: hsl(var(--primary, 240 5.9% 10%));
    color: hsl(var(--primary-foreground, 0 0% 98%));
    padding: 10px 20px;
    border-radius: 999px;
    font-weight: 700;
    font-size: 14px;
    box-shadow: 0 4px 14px rgba(0,0,0,0.25);
    border: none;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .fab-predict:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.3);
    background: hsl(var(--primary, 240 5.9% 10%) / 0.9);
  }

  .modal-backdrop {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(4px);
    z-index: 200;
    animation: fadeIn 0.2s ease-out;
  }
  .modal {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: hsl(var(--card, 0 0% 100%) / 0.85);
    backdrop-filter: blur(16px);
    border: 1px solid hsl(var(--border, 240 5.9% 90%));
    padding: 24px;
    border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    z-index: 201;
    width: 90%;
    max-width: 500px;
    max-height: 90%;
    overflow-y: auto;
    animation: zoomIn 0.2s ease-out;
  }
  .modal h3 {
    margin: 0 0 16px 0;
    font-size: 18px;
    color: hsl(var(--foreground, 240 10% 3.9%));
  }
  
  .result-popup {
    position: absolute;
    bottom: 24px;
    left: 24px;
    background: hsl(var(--card, 0 0% 100%) / 0.85);
    backdrop-filter: blur(16px);
    padding: 20px;
    border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.15);
    border: 1px solid hsl(var(--border, 240 5.9% 90%));
    z-index: 150;
    min-width: 250px;
    animation: slideRight 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .result-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }
  .result-header h4 {
    margin: 0;
    font-size: 14px;
    color: hsl(var(--muted-foreground, 240 3.8% 46.1%));
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .close-btn {
    background: transparent;
    border: none;
    font-size: 20px;
    cursor: pointer;
    color: hsl(var(--muted-foreground, 240 3.8% 46.1%));
    padding: 0;
    box-shadow: none;
  }
  .close-btn:hover {
    color: hsl(var(--foreground, 240 10% 3.9%));
    background: transparent;
    transform: none;
  }
  .forest-votes {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid hsl(var(--border, 240 5.9% 90%));
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .vote-row {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    color: hsl(var(--foreground, 240 10% 3.9%));
  }

  .prediction-value {
    font-size: 24px;
    font-weight: 900;
    color: hsl(var(--primary, 240 5.9% 10%));
  }

  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes zoomIn { from { opacity: 0; transform: translate(-50%, -45%) scale(0.95); } to { opacity: 1; transform: translate(-50%, -50%) scale(1); } }
  @keyframes slideRight { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
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
  
  @state() protected initialCenterDone: boolean = false;

  @state() protected zoom: number = 1;
  @state() protected activePopupNodeId: number | null = null;

  @state() protected customNodeSize: number = 80;
  @state() protected nodeOpacity: number = 1.0;
  @state() protected edgeThickness: number = 1.0;
  @state() protected isSettingsOpen: boolean = false;

  static styles = treeStyles;

  protected get nodeSizePx(): number {
    return this.customNodeSize;
  }

  connectedCallback() {
    super.connectedCallback();
    const storedSize = localStorage.getItem('skjson-node-size');
    if (storedSize) this.customNodeSize = parseInt(storedSize);
    
    const storedOpacity = localStorage.getItem('skjson-node-opacity');
    if (storedOpacity) this.nodeOpacity = parseFloat(storedOpacity);
    
    const storedThickness = localStorage.getItem('skjson-edge-thickness');
    if (storedThickness) this.edgeThickness = parseFloat(storedThickness);
  }

  updateSettings(key: string, value: string) {
    if (key === 'size') {
      this.customNodeSize = parseInt(value);
      localStorage.setItem('skjson-node-size', value);
    } else if (key === 'opacity') {
      this.nodeOpacity = parseFloat(value);
      localStorage.setItem('skjson-node-opacity', value);
    } else if (key === 'thickness') {
      this.edgeThickness = parseFloat(value);
      localStorage.setItem('skjson-edge-thickness', value);
    }
  }

  updated(changedProperties: Map<string | number | symbol, unknown>) {
    super.updated(changedProperties);
    if (!this.initialCenterDone && this.containerBounds.width > 0 && this.getNodes().length > 0) {
      this.initialCenterDone = true;
      requestAnimationFrame(() => {
        this.centerOnNode(0);
      });
    }
  }

  protected centerOnNode(nodeId: number) {
    const nodes = this.getNodes();
    const { layoutNodes } = computeTreeLayout(nodes, this.customNodeSize);
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
        const nOutputs = this.model.meta.n_tree_outputs || params.trees[0]?.length || 1;
        const stage = Math.floor(this.treeIndex / nOutputs);
        const output = this.treeIndex % nOutputs;
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
    if ((e.target as HTMLElement).closest('.floating-controls') || 
        (e.target as HTMLElement).closest('.node') || 
        (e.target as HTMLElement).closest('.settings-panel') ||
        (e.target as HTMLElement).closest('.overlay-controls-slot')) return;
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
    if (this.isDragging) {
      this.isDragging = false;
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    }
  }

  protected togglePopup(nodeId: number, e: Event) {
    e.stopPropagation();
    if (this.activePopupNodeId === nodeId) {
      this.activePopupNodeId = null;
    } else {
      this.activePopupNodeId = nodeId;
    }
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

  protected renderFAB() {
    return html``;
  }

  render() {
    if (!this.model) return html`<div>No model provided</div>`;

    const nodes = this.getNodes();
    const radius = this.nodeSizePx / 2;
    const { layoutNodes, edges } = computeTreeLayout(nodes, this.customNodeSize);

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

    // Default center logic has been moved to updated() lifecycle

    return html`
      <div class="container" style="--node-size: ${this.customNodeSize}px; --node-opacity: ${this.nodeOpacity}; --edge-thickness: ${this.edgeThickness}px;"
           @pointerdown=${this.handlePointerDown}
           @pointermove=${this.handlePointerMove}
           @pointerup=${this.handlePointerUp}
           @pointercancel=${this.handlePointerUp}
           @click=${() => this.activePopupNodeId = null}>
        <div class="tree-wrapper ${this.isAnimatingTransform ? 'animated' : ''}" 
             style="width: ${treeWidth}px; height: ${treeHeight}px; transform: translate(${this.panX}px, ${this.panY}px) scale(${this.zoom}); transform-origin: top left;">
          <svg class="tree-canvas" width="${treeWidth}" height="${treeHeight}">
            <g transform="translate(${-minX}, ${-minY})">
              ${edges.map(edge => {
                const from = layoutNodes.find(n => n.id === edge.fromId);
                const to = layoutNodes.find(n => n.id === edge.toId);
                if (!from || !to) return '';
                
                const x1 = from.x;
                const y1 = from.y + radius;
                const x2 = to.x;
                const y2 = to.y - radius;
                const midY = (y1 + y2) / 2;
                const pathD = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;

                const edgeClasses = this.getEdgeClasses(edge.fromId, edge.toId);

                return svg`
                  <path class="edge ${edgeClasses}" d="${pathD}"></path>
                  ${this.renderEdgeAddons(edge.fromId, edge.toId, pathD)}
                `;
              })}
            </g>
          </svg>
          
          <div style="position: absolute; inset: 0; transform: translate(${-minX}px, ${-minY}px)">
            ${edges.map(edge => {
              const from = layoutNodes.find(n => n.id === edge.fromId);
              const to = layoutNodes.find(n => n.id === edge.toId);
              if (!from || !to) return '';
              
              const x1 = from.x;
              const y1 = from.y + radius;
              const x2 = to.x;
              const y2 = to.y - radius;
              const midY = (y1 + y2) / 2;
              const midX = (x1 + x2) / 2;
              
              return html`
                <div class="edge-label ${edge.direction}" style="left: ${midX}px; top: ${midY}px;">
                  ${edge.direction === 'left' ? 'Yes' : 'No'}
                </div>
              `;
            })}
            ${layoutNodes.map(ln => {
              const leaf = isLeaf(ln.node);
              const total = ln.node.value.reduce((a: number, b: number) => a + b, 0) || 1;
              const maxIdx = ln.node.value.indexOf(Math.max(...ln.node.value));
              const extraClasses = this.getNodeClasses(ln.node.id);
              
              return html`
                <div class="node ${extraClasses}" style="left: ${ln.x}px; top: ${ln.y}px;" @click=${(e: Event) => this.togglePopup(ln.node.id, e)}>
                  ${this.activePopupNodeId === ln.node.id ? html`
                    <div class="info-popup">
                      <div><strong>ID:</strong> ${ln.node.id}</div>
                      <div><strong>Values:</strong> [${ln.node.value.map((v: number) => v.toFixed(2)).join(', ')}]</div>
                      ${(ln.node as any).impurity !== undefined ? html`<div><strong>Impurity:</strong> ${(ln.node as any).impurity.toFixed(4)}</div>` : ''}
                      ${(ln.node as any).n_node_samples !== undefined ? html`<div><strong>Samples:</strong> ${(ln.node as any).n_node_samples}</div>` : ''}
                    </div>
                  ` : ''}
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
        
        <div class="floating-controls">
          <button class="icon-btn" @click=${(e: Event) => { e.stopPropagation(); this.zoom = Math.max(0.1, this.zoom - 0.1); }}>${zoomOutIcon}</button>
          <span class="zoom-label">${Math.round(this.zoom * 100)}%</span>
          <button class="icon-btn" @click=${(e: Event) => { e.stopPropagation(); this.zoom = Math.min(3, this.zoom + 0.1); }}>${zoomInIcon}</button>
          <div class="divider"></div>
          <button class="icon-btn" @click=${(e: Event) => { e.stopPropagation(); this.isSettingsOpen = !this.isSettingsOpen; }}>${settingsIcon}</button>
          ${this.renderFAB()}
        </div>

        ${this.isSettingsOpen ? html`
          <div class="settings-panel">
            <div class="settings-header">
              <h4>Settings</h4>
              <button class="icon-btn" style="width: 24px; height: 24px;" @click=${(e: Event) => { e.stopPropagation(); this.isSettingsOpen = false; }}>${closeIcon}</button>
            </div>
            <div class="settings-row">
              <label>Node Size <span>${this.customNodeSize}px</span></label>
              <input type="range" min="40" max="140" step="5" .value=${String(this.customNodeSize)} @input=${(e: Event) => this.updateSettings('size', (e.target as HTMLInputElement).value)} />
            </div>
            <div class="settings-row">
              <label>Transparency <span>${Math.round(this.nodeOpacity * 100)}%</span></label>
              <input type="range" min="0.1" max="1" step="0.05" .value=${String(this.nodeOpacity)} @input=${(e: Event) => this.updateSettings('opacity', (e.target as HTMLInputElement).value)} />
            </div>
            <div class="settings-row">
              <label>Branch Thickness <span>${this.edgeThickness}px</span></label>
              <input type="range" min="1" max="8" step="0.5" .value=${String(this.edgeThickness)} @input=${(e: Event) => this.updateSettings('thickness', (e.target as HTMLInputElement).value)} />
            </div>
          </div>
        ` : ''}

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
  @state() private isModalOpen: boolean = false;
  @state() private forestPrediction: any = null;
  @state() private isAnimating: boolean = false;
  @state() private prediction: string | null = null;
  @state() private animatingEdge: string | null = null;
  private allPaths: number[][] = [];

  async predict() {
    if (this.isAnimating || !this.model) return;
    this.isAnimating = true;
    this.prediction = null;
    this.forestPrediction = null;
    this.currentStep = -1;
    this.animatingEdge = null;
    this.allPaths = [];

    let isForest = false;
    let isGradientBoosting = false;
    let treesToEval: any[] = [];

    if (this.model.params.trees) {
      if (this.model.meta.model_type?.startsWith('GradientBoosting')) {
        isForest = true;
        isGradientBoosting = true;
        for (const stage of this.model.params.trees) {
          for (const tree of stage) {
            treesToEval.push(tree);
          }
        }
      } else {
        isForest = true;
        treesToEval = this.model.params.trees;
      }
    } else if (this.model.params.nodes) {
      treesToEval = [this.model.params.nodes];
    }

    if (treesToEval.length === 0) {
      this.isAnimating = false;
      return;
    }

    const leafNodes: any[] = [];

    treesToEval.forEach((nodes, idx) => {
      const path: number[] = [0];
      let currId = 0;
      while (true) {
        const node = nodes.find((n: any) => n.id === currId);
        if (!node || node.feature === -2) {
          leafNodes.push(node);
          break;
        }
        const val = this.inputFeatures[node.feature] || 0;
        if (val <= node.threshold) {
          currId = node.left;
        } else {
          currId = node.right;
        }
        path.push(currId);
      }
      this.allPaths.push(path);
    });

    this.isModalOpen = false;

    let currentTreeIdx = 0;
    if (isForest) {
      if (isGradientBoosting) {
        const nOutputs = this.model.meta.n_tree_outputs || this.model.params.trees[0]?.length || 1;
        const stage = Math.floor(this.treeIndex / nOutputs);
        const output = this.treeIndex % nOutputs;
        currentTreeIdx = stage * nOutputs + output;
      } else {
        currentTreeIdx = this.treeIndex;
      }
    }
    
    this.activePath = this.allPaths[currentTreeIdx] || [];

    this.centerOnNode(0);

    for (let i = 0; i < this.activePath.length; i++) {
      if (i > 0) {
        this.animatingEdge = `${this.activePath[i - 1]}-${this.activePath[i]}`;
        await new Promise(r => setTimeout(r, 400));
      }
      this.currentStep = i;
      this.animatingEdge = null;
      this.centerOnNode(this.activePath[i]);
      await new Promise(r => setTimeout(r, 600)); 
    }

    if (isForest) {
      if (isGradientBoosting) {
        const nOutputs = this.model.meta.n_tree_outputs || this.model.params.trees[0]?.length || 1;
        const sums = new Array(nOutputs).fill(0);
        leafNodes.forEach((node, i) => {
          if (node && node.value && node.value.length) {
            const outputIdx = i % nOutputs;
            sums[outputIdx] += node.value[0] || 0;
          }
        });
        
        if (nOutputs > 1) {
          const maxIdx = sums.indexOf(Math.max(...sums));
          this.prediction = String(this.getClassName(maxIdx));
          this.forestPrediction = {
            type: 'gradient-boosting-multi',
            sums: sums.map((s, i) => ({ class: this.getClassName(i), sum: s }))
          };
        } else {
          this.forestPrediction = {
            type: 'gradient-boosting',
            sum: sums[0]
          };
        }
      } else {
        const votes: Record<string, number> = {};
        leafNodes.forEach((node) => {
          if (node) {
            const vals = node.value;
            const maxIdx = vals.indexOf(Math.max(...vals));
            const className = String(this.getClassName(maxIdx));
            votes[className] = (votes[className] || 0) + 1;
          }
        });
        
        let bestClass = '';
        let maxVotes = -1;
        for (const [cls, v] of Object.entries(votes)) {
          if (v > maxVotes) {
            maxVotes = v;
            bestClass = cls;
          }
        }
        this.prediction = bestClass;
        this.forestPrediction = {
          type: 'random-forest',
          votes: Object.entries(votes).map(([cls, v]) => ({ class: cls, count: v })).sort((a,b) => b.count - a.count)
        };
      }
    } else {
      const leafNode = leafNodes[0];
      if (leafNode) {
        const vals = leafNode.value;
        const maxIdx = vals.indexOf(Math.max(...vals));
        this.prediction = String(this.getClassName(maxIdx));
      }
    }

    this.isAnimating = false;
  }

  updated(changedProperties: Map<string | number | symbol, unknown>) {
    super.updated(changedProperties);
    if (changedProperties.has('treeIndex') && !this.isAnimating && this.allPaths.length > 0) {
      let isGradientBoosting = this.model?.meta?.model_type?.startsWith('GradientBoosting');
      let currentTreeIdx = this.treeIndex;
      if (isGradientBoosting) {
        const nOutputs = this.model.meta.n_tree_outputs || this.model.params.trees[0]?.length || 1;
        const stage = Math.floor(this.treeIndex / nOutputs);
        const output = this.treeIndex % nOutputs;
        currentTreeIdx = stage * nOutputs + output;
      }
      this.activePath = this.allPaths[currentTreeIdx] || [];
      this.currentStep = this.activePath.length - 1;
    }
  }
  
  reset() {
    this.activePath = [];
    this.currentStep = -1;
    this.prediction = null;
    this.forestPrediction = null;
    this.animatingEdge = null;
    this.allPaths = [];
    this.isAnimating = false;
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

  protected renderFAB() {
    return html`
      <button class="fab-predict" @click=${() => this.isModalOpen = true}>${predictIcon} Predict</button>
    `;
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
      ${this.isModalOpen ? html`
        <div class="modal-backdrop" @click=${() => this.isModalOpen = false}></div>
        <div class="modal">
          <h3>Input Features</h3>
          <div class="inputs-container">
            ${inputs}
          </div>
          <div class="controls">
            <button class="primary" @click=${this.predict} ?disabled=${this.isAnimating}>Run Prediction</button>
            <button @click=${() => this.isModalOpen = false}>Cancel</button>
          </div>
        </div>
      ` : ''}

      ${this.prediction || this.forestPrediction ? html`
        <div class="result-popup">
          <div class="result-header">
            <h4>Prediction Result</h4>
            <button class="close-btn" @click=${() => { this.prediction = null; this.forestPrediction = null; this.activePath = []; }}>×</button>
          </div>
          ${this.forestPrediction ? (
            this.forestPrediction.type === 'random-forest' ? html`
              <div class="prediction-value">${this.prediction}</div>
              <div class="forest-votes">
                ${this.forestPrediction.votes.map((v: any) => html`
                  <div class="vote-row"><span>${v.class}</span> <strong>${v.count} trees</strong></div>
                `)}
              </div>
            ` : this.forestPrediction.type === 'gradient-boosting-multi' ? html`
              <div class="prediction-value">${this.prediction}</div>
              <div class="forest-votes">
                ${this.forestPrediction.sums.map((v: any) => html`
                  <div class="vote-row"><span>${v.class}</span> <strong>${v.sum.toFixed(4)}</strong></div>
                `)}
              </div>
            ` : html`
              <div style="font-size: 13px; margin-bottom: 4px; color: hsl(var(--muted-foreground, 240 3.8% 46.1%));">Raw Sum (Stages)</div>
              <div class="prediction-value">${this.forestPrediction.sum.toFixed(4)}</div>
            `
          ) : html`
            <div class="prediction-value">${this.prediction}</div>
          `}
        </div>
      ` : ''}

      ${super.render()}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'skjson-decision-tree': SkjsonDecisionTree;
    'skjson-decision-tree-predict': SkjsonDecisionTreePredict;
  }
}
