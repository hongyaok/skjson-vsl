'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, Cpu, RotateCcw } from 'lucide-react'
import { Button } from '@/components/8starlabs-ui/button'
import { Card, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// ─── Tree Data (first estimator from model.json) ───────────────────────────

const FEATURE_NAMES = ['Sepal Length', 'Sepal Width', 'Petal Length', 'Petal Width']
const CLASS_NAMES = ['Setosa', 'Versicolor', 'Virginica']
const CLASS_COLORS = ['#22c55e', '#eab308', '#8b5cf6'] // green, yellow, purple

interface TreeNode {
  id: number
  feature: number     // -2 for leaf
  threshold: number   // -2 for leaf
  left: number        // child id, -1 for leaf
  right: number       // child id, -1 for leaf
  value: number[]     // class probabilities
}

const TREE_NODES: TreeNode[] = [
  { id: 0, feature: 3, threshold: 0.70, left: 1, right: 2, value: [0.367, 0.308, 0.325] },
  { id: 1, feature: -2, threshold: -2, left: -1, right: -1, value: [1.0, 0.0, 0.0] },
  { id: 2, feature: 3, threshold: 1.55, left: 3, right: 6, value: [0.0, 0.487, 0.513] },
  { id: 3, feature: 2, threshold: 4.95, left: 4, right: 5, value: [0.0, 0.895, 0.105] },
  { id: 4, feature: -2, threshold: -2, left: -1, right: -1, value: [0.0, 1.0, 0.0] },
  { id: 5, feature: -2, threshold: -2, left: -1, right: -1, value: [0.0, 0.0, 1.0] },
  { id: 6, feature: 3, threshold: 1.85, left: 7, right: 16, value: [0.0, 0.079, 0.921] },
  { id: 7, feature: 1, threshold: 3.15, left: 8, right: 15, value: [0.0, 0.2, 0.8] },
  { id: 8, feature: 3, threshold: 1.75, left: 9, right: 14, value: [0.0, 0.077, 0.923] },
  { id: 9, feature: 0, threshold: 5.80, left: 10, right: 11, value: [0.0, 0.25, 0.75] },
  { id: 10, feature: -2, threshold: -2, left: -1, right: -1, value: [0.0, 0.0, 1.0] },
  { id: 11, feature: 2, threshold: 5.40, left: 12, right: 13, value: [0.0, 0.5, 0.5] },
  { id: 12, feature: -2, threshold: -2, left: -1, right: -1, value: [0.0, 1.0, 0.0] },
  { id: 13, feature: -2, threshold: -2, left: -1, right: -1, value: [0.0, 0.0, 1.0] },
  { id: 14, feature: -2, threshold: -2, left: -1, right: -1, value: [0.0, 0.0, 1.0] },
  { id: 15, feature: -2, threshold: -2, left: -1, right: -1, value: [0.0, 1.0, 0.0] },
  { id: 16, feature: -2, threshold: -2, left: -1, right: -1, value: [0.0, 0.0, 1.0] },
]

// ─── Layout Computation ─────────────────────────────────────────────────────

interface LayoutNode {
  id: number
  x: number
  y: number
  node: TreeNode
}

interface LayoutEdge {
  fromId: number
  toId: number
  direction: 'left' | 'right'
}

function isLeaf(node: TreeNode) {
  return node.feature === -2
}

function computeLayout(nodes: TreeNode[]): { layoutNodes: LayoutNode[], edges: LayoutEdge[] } {
  const layoutNodes: LayoutNode[] = []
  const edges: LayoutEdge[] = []
  const NODE_Y_GAP = 100
  const MIN_X_GAP = 70

  // Assign horizontal positions via in-order traversal
  let xCounter = 0

  function inOrder(nodeId: number, depth: number) {
    const node = nodes[nodeId]
    if (!node) return

    if (!isLeaf(node)) {
      inOrder(node.left, depth + 1)
    }

    layoutNodes.push({
      id: node.id,
      x: xCounter * MIN_X_GAP,
      y: depth * NODE_Y_GAP,
      node,
    })
    xCounter++

    if (!isLeaf(node)) {
      edges.push({ fromId: node.id, toId: node.left, direction: 'left' })
      edges.push({ fromId: node.id, toId: node.right, direction: 'right' })
      inOrder(node.right, depth + 1)
    }
  }

  inOrder(0, 0)

  return { layoutNodes, edges }
}

// ─── Traversal Logic ────────────────────────────────────────────────────────

function traverseTree(features: number[]): number[] {
  const path: number[] = [0]
  let currentId = 0

  while (true) {
    const node = TREE_NODES[currentId]
    if (isLeaf(node)) break

    const featureVal = features[node.feature]
    if (featureVal <= node.threshold) {
      currentId = node.left
    } else {
      currentId = node.right
    }
    path.push(currentId)
  }

  return path
}

// ─── Probability Bar ────────────────────────────────────────────────────────

function ProbBar({ value, compact = false }: { value: number[], compact?: boolean }) {
  const total = value.reduce((a, b) => a + b, 0)
  if (total === 0) return null

  return (
    <div className={`flex w-full rounded-full overflow-hidden ${compact ? 'h-1.5' : 'h-2'}`}>
      {value.map((v, i) => {
        const pct = (v / total) * 100
        if (pct === 0) return null
        return (
          <div
            key={i}
            style={{ width: `${pct}%`, backgroundColor: CLASS_COLORS[i] }}
            className="transition-all duration-300"
          />
        )
      })}
    </div>
  )
}

// ─── Node Component ─────────────────────────────────────────────────────────

function TreeNodeCard({
  layoutNode,
  isActive,
  isOnPath,
  isLeafResult,
}: {
  layoutNode: LayoutNode
  isActive: boolean
  isOnPath: boolean
  isLeafResult: boolean
}) {
  const { node } = layoutNode
  const leaf = isLeaf(node)
  const predictedClass = node.value.indexOf(Math.max(...node.value))

  return (
    <motion.div
      className="absolute"
      style={{
        left: layoutNode.x - 60,
        top: layoutNode.y - 20,
        width: 120,
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: layoutNode.id * 0.03 }}
    >
      <motion.div
        className={`
          rounded-lg border p-2 text-[10px] leading-tight transition-all duration-300
          ${isActive
            ? 'border-yellow-400 bg-yellow-400/10 shadow-[0_0_20px_rgba(250,204,21,0.3)] scale-110 z-20'
            : isOnPath
              ? 'border-yellow-400/50 bg-card/90 z-10'
              : 'border-border bg-card/60'
          }
          ${isLeafResult ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-background' : ''}
        `}
        animate={isActive ? { scale: 1.1 } : { scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {leaf ? (
          <div className="flex flex-col items-center gap-1">
            <span
              className="font-bold text-xs px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: `${CLASS_COLORS[predictedClass]}20`,
                color: CLASS_COLORS[predictedClass],
              }}
            >
              {CLASS_NAMES[predictedClass]}
            </span>
            <ProbBar value={node.value} compact />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <span className="font-semibold text-foreground text-center">
              {FEATURE_NAMES[node.feature]}
            </span>
            <span className="text-muted-foreground">
              ≤ {node.threshold.toFixed(2)}
            </span>
            <ProbBar value={node.value} compact />
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

// ─── Edge Component ─────────────────────────────────────────────────────────

function TreeEdge({
  from,
  to,
  isOnPath,
  isAnimating,
  direction,
}: {
  from: LayoutNode
  to: LayoutNode
  isOnPath: boolean
  isAnimating: boolean
  direction: 'left' | 'right'
}) {
  const x1 = from.x
  const y1 = from.y + 20
  const x2 = to.x
  const y2 = to.y - 24

  const midY = (y1 + y2) / 2
  const pathD = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`

  return (
    <g>
      {/* Base edge */}
      <path
        d={pathD}
        fill="none"
        stroke={isOnPath ? '#facc15' : 'hsl(var(--border))'}
        strokeWidth={isOnPath ? 2 : 1}
        strokeOpacity={isOnPath ? 0.7 : 0.4}
        className="transition-all duration-500"
      />

      {/* Animated light trail */}
      {isAnimating && (
        <>
          <defs>
            <linearGradient id={`trail-${from.id}-${to.id}`} gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="40%" stopColor="#facc15" stopOpacity="0" />
              <stop offset="50%" stopColor="#facc15" stopOpacity="1" />
              <stop offset="60%" stopColor="#facc15" stopOpacity="0" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <motion.path
            d={pathD}
            fill="none"
            stroke="#facc15"
            strokeWidth={3}
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: [0, 1, 1, 0.6] }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          />
        </>
      )}

      {/* Persistent glow for completed path edges */}
      {isOnPath && !isAnimating && (
        <path
          d={pathD}
          fill="none"
          stroke="#facc15"
          strokeWidth={2}
          strokeOpacity={0.5}
        />
      )}

      {/* Edge labels */}
      <text
        x={x1 + (x2 - x1) * 0.3}
        y={y1 + 14}
        textAnchor="middle"
        className="fill-muted-foreground"
        fontSize="8"
        opacity={0.6}
      >
        {direction === 'left' ? 'Yes' : 'No'}
      </text>
    </g>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function DecisionTreeVis() {
  const [features, setFeatures] = React.useState(['6', '3.1', '5', '1.75'])
  const [activePath, setActivePath] = React.useState<number[]>([])
  const [currentStep, setCurrentStep] = React.useState(-1)
  const [isAnimating, setIsAnimating] = React.useState(false)
  const [prediction, setPrediction] = React.useState<string | null>(null)
  const [animatingEdge, setAnimatingEdge] = React.useState<string | null>(null)

  const containerRef = React.useRef<HTMLDivElement>(null)
  const treeContainerRef = React.useRef<HTMLDivElement>(null)

  const { layoutNodes, edges } = React.useMemo(() => computeLayout(TREE_NODES), [])

  // Compute tree bounds
  const bounds = React.useMemo(() => {
    const xs = layoutNodes.map((n) => n.x)
    const ys = layoutNodes.map((n) => n.y)
    return {
      minX: Math.min(...xs) - 80,
      maxX: Math.max(...xs) + 80,
      minY: Math.min(...ys) - 40,
      maxY: Math.max(...ys) + 60,
    }
  }, [layoutNodes])

  const treeWidth = bounds.maxX - bounds.minX
  const treeHeight = bounds.maxY - bounds.minY

  // Center on active node
  const activeNode = currentStep >= 0 && activePath[currentStep] !== undefined
    ? layoutNodes.find((n) => n.id === activePath[currentStep])
    : null

  const [translate, setTranslate] = React.useState({ x: 0, y: 0 })

  React.useEffect(() => {
    if (!activeNode || !containerRef.current) return
    const container = containerRef.current
    const containerW = container.clientWidth
    const containerH = container.clientHeight

    const targetX = containerW / 2 - (activeNode.x - bounds.minX)
    const targetY = containerH / 2 - (activeNode.y - bounds.minY)

    setTranslate({ x: targetX, y: targetY })
  }, [activeNode, bounds])

  // Reset translate to center on initial render
  React.useEffect(() => {
    if (!containerRef.current) return
    const container = containerRef.current
    const containerW = container.clientWidth
    const containerH = container.clientHeight

    const rootNode = layoutNodes.find((n) => n.id === 0)
    if (rootNode) {
      setTranslate({
        x: containerW / 2 - (rootNode.x - bounds.minX),
        y: containerH / 2 - (rootNode.y - bounds.minY),
      })
    }
  }, [layoutNodes, bounds])

  const updateFeature = (index: number, val: string) => {
    const newFeatures = [...features]
    newFeatures[index] = val
    setFeatures(newFeatures)
  }

  const handlePredict = async () => {
    if (isAnimating) return
    setIsAnimating(true)
    setPrediction(null)
    setCurrentStep(-1)
    setAnimatingEdge(null)

    const featureValues = features.map((f) => parseFloat(f) || 0)
    const path = traverseTree(featureValues)
    setActivePath(path)

    // Animate through each step
    for (let i = 0; i < path.length; i++) {
      // Animate the edge leading to this node (if not root)
      if (i > 0) {
        const edgeKey = `${path[i - 1]}-${path[i]}`
        setAnimatingEdge(edgeKey)
        await new Promise((r) => setTimeout(r, 400))
      }

      setCurrentStep(i)
      setAnimatingEdge(null)
      await new Promise((r) => setTimeout(r, 500))
    }

    // Show prediction
    const leafNode = TREE_NODES[path[path.length - 1]]
    const predictedClass = leafNode.value.indexOf(Math.max(...leafNode.value))
    setPrediction(CLASS_NAMES[predictedClass])
    setIsAnimating(false)
  }

  const handleReset = () => {
    setActivePath([])
    setCurrentStep(-1)
    setPrediction(null)
    setAnimatingEdge(null)
    setIsAnimating(false)

    // Re-center on root
    if (containerRef.current) {
      const container = containerRef.current
      const rootNode = layoutNodes.find((n) => n.id === 0)
      if (rootNode) {
        setTranslate({
          x: container.clientWidth / 2 - (rootNode.x - bounds.minX),
          y: container.clientHeight / 2 - (rootNode.y - bounds.minY),
        })
      }
    }
  }

  const pathSet = new Set(activePath.slice(0, currentStep + 1))
  const pathEdgeSet = new Set<string>()
  for (let i = 0; i < currentStep; i++) {
    if (activePath[i + 1] !== undefined) {
      pathEdgeSet.add(`${activePath[i]}-${activePath[i + 1]}`)
    }
  }

  return (
    <div className="flex flex-col w-full gap-6">
      {/* Input Panel */}
      <Card className="w-full bg-card">
        <CardHeader>
          <p className="text-center mb-4 text-sm text-muted-foreground">
            Enter Iris flower measurements and watch the decision tree classify it step-by-step:
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            {FEATURE_NAMES.map((label, idx) => (
              <div key={idx} className="flex flex-col gap-2 w-28">
                <Label htmlFor={`vis-feature-${idx}`} className="text-xs">{label}</Label>
                <Input
                  id={`vis-feature-${idx}`}
                  value={features[idx]}
                  onChange={(e) => updateFeature(idx, e.target.value)}
                  type="number"
                  step="0.1"
                  disabled={isAnimating}
                  className="h-9 text-sm"
                />
              </div>
            ))}
          </div>
          <div className="flex gap-3 justify-center mt-4">
            <Button onClick={handlePredict} disabled={isAnimating} className="gap-2">
              {isAnimating ? (
                <Activity className="h-4 w-4 animate-spin" />
              ) : (
                <Cpu className="h-4 w-4" />
              )}
              {isAnimating ? 'Traversing...' : 'Predict'}
            </Button>
            {(activePath.length > 0 || prediction) && !isAnimating && (
              <Button onClick={handleReset} variant="outline" className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Tree Visualisation */}
      <div
        ref={containerRef}
        className="relative w-full h-[420px] sm:h-[500px] overflow-hidden rounded-xl border border-border bg-background/50"
      >
        {/* Light trail glow overlay at top */}
        {isAnimating && (
          <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-yellow-400/5 to-transparent z-10 pointer-events-none" />
        )}

        <motion.div
          ref={treeContainerRef}
          className="absolute"
          style={{ width: treeWidth, height: treeHeight }}
          animate={{ x: translate.x, y: translate.y }}
          transition={{ type: 'spring', stiffness: 80, damping: 20 }}
        >
          {/* SVG Edges */}
          <svg
            className="absolute inset-0 pointer-events-none"
            width={treeWidth}
            height={treeHeight}
            style={{ overflow: 'visible' }}
          >
            <g transform={`translate(${-bounds.minX}, ${-bounds.minY})`}>
              {edges.map((edge) => {
                const from = layoutNodes.find((n) => n.id === edge.fromId)!
                const to = layoutNodes.find((n) => n.id === edge.toId)!
                const edgeKey = `${edge.fromId}-${edge.toId}`
                return (
                  <TreeEdge
                    key={edgeKey}
                    from={from}
                    to={to}
                    isOnPath={pathEdgeSet.has(edgeKey)}
                    isAnimating={animatingEdge === edgeKey}
                    direction={edge.direction}
                  />
                )
              })}
            </g>
          </svg>

          {/* Node Cards */}
          <div
            className="absolute inset-0"
            style={{ transform: `translate(${-bounds.minX}px, ${-bounds.minY}px)` }}
          >
            {layoutNodes.map((ln) => (
              <TreeNodeCard
                key={ln.id}
                layoutNode={ln}
                isActive={activePath[currentStep] === ln.id}
                isOnPath={pathSet.has(ln.id)}
                isLeafResult={
                  prediction !== null &&
                  ln.id === activePath[activePath.length - 1]
                }
              />
            ))}
          </div>
        </motion.div>

        {/* Pan hint */}
        {activePath.length === 0 && (
          <div className="absolute bottom-3 left-0 right-0 text-center text-xs text-muted-foreground/50 pointer-events-none">
            click predict to see the traversal
          </div>
        )}
      </div>

      {/* Prediction Result */}
      <AnimatePresence>
        {prediction && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="flex flex-col items-center gap-2 p-6 rounded-xl border border-yellow-400/30 bg-yellow-400/5"
          >
            <p className="text-sm text-muted-foreground font-medium">Predicted Class</p>
            <h2 className="text-3xl font-black text-foreground">{prediction}</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Traversed {activePath.length} node{activePath.length !== 1 ? 's' : ''} to reach this leaf
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 justify-center text-xs text-muted-foreground">
        {CLASS_NAMES.map((name, i) => (
          <div key={name} className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: CLASS_COLORS[i] }}
            />
            <span>{name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
