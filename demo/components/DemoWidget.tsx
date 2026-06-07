'use client'

import * as React from 'react'
import { Activity, Cpu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardFooter, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { loadModel } from 'skjson-js'
import { CodeBlock, CodeTab } from '@/components/CodeBlock'

export function DemoWidget() {
  const [mounted, setMounted] = React.useState(false)
  const [model, setModel] = React.useState<any>(null)
  const [features, setFeatures] = React.useState(['5.1', '3.5', '1.4', '0.2'])
  const [prediction, setPrediction] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    fetch('/model.json')
      .then(res => res.json())
      .then(json => {
        const predictor = loadModel(json)
        setModel(predictor)
      })
      .catch(console.error)
  }, [])

  const handlePredict = () => {
    if (!model) return
    setLoading(true)
    setTimeout(() => {
      try {
        const input = [features.map(f => parseFloat(f) || 0)]
        const preds = model.predict(input)
        const classes = ['Setosa', 'Versicolor', 'Virginica']
        setPrediction(classes[preds[0]] || `Class ${preds[0]}`)
      } catch (err) {
        console.error(err)
        setPrediction('Error predicting')
      }
      setLoading(false)
    }, 50)
  }

  const updateFeature = (index: number, val: string) => {
    const newFeatures = [...features]
    newFeatures[index] = val
    setFeatures(newFeatures)
  }

  const codeTabs: CodeTab[] = [
    {
      label: 'JavaScript',
      language: 'javascript',
      code: `import { loadModel } from 'skjson-js';\nimport modelJson from './model.json';\n\nconst predictor = loadModel(modelJson);\n\n// Running inference\nconst input = [[${features.join(', ')}]];\nconst prediction = predictor.predict(input);\n\nconsole.log("Predicted Class:", prediction[0]);`
    },
    {
      label: 'HTML (CDN)',
      language: 'html',
      code: `<!-- Import directly from CDN in plain HTML -->\n<script type="module">\n  import { loadModel } from 'https://unpkg.com/skjson-js/dist/index.js';\n\n  async function run() {\n    const response = await fetch('./model.json');\n    const modelJson = await response.json();\n    const predictor = loadModel(modelJson);\n\n    // Run inference on current inputs\n    const input = [[${features.join(', ')}]];\n    const prediction = predictor.predict(input);\n    document.getElementById('result').innerText = prediction[0];\n  }\n  run();\n</script>`
    },
    {
      label: 'Python',
      language: 'python',
      code: `from sklearn.datasets import load_iris\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.ensemble import RandomForestClassifier\nimport skjson\n\n# Load the Iris dataset and split\nX, y = load_iris(return_X_y=True)\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)\n\n# Train a classifier\nclf = RandomForestClassifier(random_state=42)\nclf.fit(X_train, y_train)\n\n# Export the trained model to JSON\nskjson.save(clf, 'model.json')`
    }
  ]

  return (
    <div className="flex flex-col w-full max-w-4xl gap-6">
      <Card className="w-full bg-card">
        <CardHeader>
          <CardDescription className="text-center mb-4 text-lg">
            Try classifying an Iris flower (Random Forest model):
          </CardDescription>
          <div className="flex flex-wrap gap-4 justify-center">
            {['Sepal Length', 'Sepal Width', 'Petal Length', 'Petal Width'].map((label, idx) => (
              <div key={idx} className="flex flex-col gap-2 w-28">
                <Label htmlFor={`feature-${idx}`}>{label}</Label>
                <Input 
                  id={`feature-${idx}`} 
                  value={features[idx]} 
                  onChange={(e) => updateFeature(idx, e.target.value)} 
                  type="number" 
                  step="0.1" 
                />
              </div>
            ))}
          </div>
        </CardHeader>
        <CardFooter className="flex justify-center">
          {mounted ? (
            <Button onClick={handlePredict} disabled={!model || loading} className="gap-2">
              {loading ? <Activity className="h-4 w-4 animate-spin" /> : <Cpu className="h-4 w-4" />}
              {model ? (loading ? 'Predicting...' : 'Predict') : 'Loading Model...'}
            </Button>
          ) : (
            <Button disabled className="gap-2">
              <Cpu className="h-4 w-4" />
              Loading Model...
            </Button>
          )}
        </CardFooter>
        {prediction && (
          <div className="p-4 bg-muted border-t border-border flex flex-col items-center rounded-b-xl gap-2 mt-2">
            <p className="text-muted-foreground text-sm font-medium">Predicted Class:</p>
            <h2 className="text-2xl font-black text-primary">{prediction}</h2>
          </div>
        )}
      </Card>
      <CodeBlock tabs={codeTabs} className="w-full shadow-lg" />
    </div>
  )
}
