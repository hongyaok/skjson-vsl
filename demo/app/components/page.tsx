'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Card } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LogoText } from '@/components/LogoText';
import Link from 'next/link';
import { ArrowLeft, TreeDeciduous, GitFork, TrendingUp, LineChart } from 'lucide-react';
import { CodeBlock } from '@/components/CodeBlock';

const WebComponentWrapper = dynamic(() => import('@/components/WebComponentWrapper'), { ssr: false });

function getCodeSnippet(componentName: string) {
  return [
    {
      label: "React",
      language: "tsx",
      code: `import React, { useEffect, useRef } from 'react';
import 'skjson-vsl';
import modelData from './model.json';

export default function MyVisualization() {
  const visRef = useRef(null);

  useEffect(() => {
    if (visRef.current) {
      visRef.current.model = modelData;
    }
  }, []);

  return (
    <div className="visualization-container">
      <${componentName} ref={visRef}></${componentName}>
    </div>
  );
}`
    },
    {
      label: "Vue 3",
      language: "vue",
      code: `<template>
  <div class="visualization-container">
    <${componentName} :model="modelData"></${componentName}>
  </div>
</template>

<script setup>
import 'skjson-vsl';
import modelData from './model.json';
</script>`
    },
    {
      label: "Svelte",
      language: "svelte",
      code: `<script>
  import 'skjson-vsl';
  import modelData from './model.json';
</script>

<div class="visualization-container">
  <${componentName} model={modelData}></${componentName}>
</div>`
    },
    {
      label: "HTML",
      language: "html",
      code: `<!DOCTYPE html>
<html>
<head>
  <script type="module" src="https://unpkg.com/skjson-vsl/dist/index.js"></script>
</head>
<body>
  <${componentName} id="my-vis"></${componentName}>

  <script type="module">
    import modelData from './model.json' with { type: 'json' };
    const vis = document.getElementById('my-vis');
    vis.model = modelData;
  </script>
</body>
</html>`
    }
  ];
}

const ICON_MAP: Record<string, React.ElementType> = {
  decision_tree: TreeDeciduous,
  random_forest: GitFork,
  gradient_boosting: TrendingUp,
  linear_model: LineChart,
};

const COLOR_MAP: Record<string, string> = {
  decision_tree: 'bg-emerald-500',
  random_forest: 'bg-blue-500',
  gradient_boosting: 'bg-amber-500',
  linear_model: 'bg-violet-500',
};

export default function ComponentsPage() {
  const [modelData, setModelData] = useState<any>(null);
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    fetch('/model.json')
      .then(res => res.json())
      .then(data => setModelData(data))
      .catch(err => console.error("Failed to load model.json:", err));
  }, []);

  // Intersection observer for sidebar highlight
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-30% 0px -60% 0px' }
    );

    const sections = document.querySelectorAll('[data-timeline-entry]');
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const models = [
    {
      id: 'decision_tree',
      title: 'Decision Tree',
      description: 'Visualize how a single decision tree splits features to reach predictions. Supports animated traversal with threshold comparison popups.',
      nonPredictive: 'skjson-decision-tree',
      predictive: 'skjson-decision-tree-predict',
    },
    {
      id: 'random_forest',
      title: 'Random Forest',
      description: 'Explore individual trees in a Random Forest ensemble. Switch between estimators to understand how the forest votes.',
      nonPredictive: 'skjson-random-forest',
      predictive: 'skjson-random-forest-predict',
    },
    {
      id: 'gradient_boosting',
      title: 'Gradient Boosting',
      description: 'Inspect sequential boosting stages. See how each tree corrects the residuals of the previous stage.',
      nonPredictive: 'skjson-gradient-boosting',
      predictive: 'skjson-gradient-boosting-predict',
    },
    {
      id: 'linear_model',
      title: 'Linear Model',
      description: 'Visualize feature weights, intercepts, and decision boundaries for linear classifiers and regressors.',
      nonPredictive: 'skjson-linear-model',
      predictive: null,
    },
  ];

  return (
    <div className="min-h-screen text-foreground flex flex-col overflow-x-hidden scroll-smooth bg-background normal-case">
      {/* Header */}
      <header className="w-full px-6 py-4 fixed top-0 left-0 right-0 flex justify-between items-center z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <ArrowLeft className="w-5 h-5" />
          <h3 className="text-xl font-black tracking-tight text-foreground">
            <LogoText text="{skjson-vsl}" />
          </h3>
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </header>

      <div className="flex flex-1 w-full max-w-[1400px] mx-auto pt-24 pb-24">
        {/* Sticky Sidebar Nav */}
        <aside className="w-56 hidden lg:flex flex-col sticky top-24 h-[calc(100vh-6rem)] flex-shrink-0 pr-8">
          <nav className="flex flex-col gap-1 pt-4">
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 pl-3">Models</div>
            {models.map(model => {
              const Icon = ICON_MAP[model.id];
              const isActive = activeSection === model.id;
              return (
                <a
                  key={model.id}
                  href={`#${model.id}`}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {model.title}
                </a>
              );
            })}
          </nav>
        </aside>

        {/* Main Content — Timeline */}
        <main className="flex-1 px-4 lg:px-0">
          {/* Hero */}
          <div className="mb-16 pt-4">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-3">Component Playground</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Explore framework-agnostic visualization components powered by <code className="px-1.5 py-0.5 bg-muted rounded text-sm font-mono">skjson-vsl</code>.
              Load models exported by <code className="px-1.5 py-0.5 bg-muted rounded text-sm font-mono">skjson</code> and render them instantly.
            </p>
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Vertical timeline line */}
            <div className="absolute left-[15px] top-0 bottom-0 w-px bg-border hidden md:block" />

            {models.map((model, idx) => {
              const Icon = ICON_MAP[model.id];
              const dotColor = COLOR_MAP[model.id];

              return (
                <section
                  key={model.id}
                  id={model.id}
                  data-timeline-entry
                  className="scroll-mt-32 relative md:pl-16 pb-24 last:pb-0"
                >
                  {/* Timeline dot */}
                  <div className={`absolute left-0 top-1 hidden md:flex items-center justify-center w-[31px] h-[31px] rounded-full border-4 border-background ${dotColor} shadow-md`}>
                    <Icon className="w-3.5 h-3.5 text-white" />
                  </div>

                  {/* Entry content */}
                  <div className="flex flex-col gap-10">
                    {/* Title header */}
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="md:hidden flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground">
                          <Icon className="w-4 h-4" />
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{model.title}</h2>
                      </div>
                      <p className="text-muted-foreground max-w-xl">{model.description}</p>
                    </div>

                    {/* 1. Non-Predictive Viewer */}
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs font-bold">1</span>
                        <h3 className="text-lg font-semibold">Viewer</h3>
                      </div>
                      <p className="text-sm text-muted-foreground -mt-2">A read-only component for visualizing the model structure. Supports click-and-drag panning.</p>
                      <Card className="w-full p-0 border-border bg-card overflow-hidden">
                        <div className="w-full min-h-[500px] bg-background overflow-hidden relative">
                          <WebComponentWrapper
                            component={model.nonPredictive}
                            model={modelData}
                          />
                        </div>
                      </Card>
                    </div>

                    {/* 2. Viewer Code */}
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs font-bold">2</span>
                        <h3 className="text-lg font-semibold">Viewer Code</h3>
                      </div>
                      <CodeBlock tabs={getCodeSnippet(model.nonPredictive)} />
                    </div>

                    {/* 3. Interactive Predictive */}
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs font-bold">3</span>
                        <h3 className="text-lg font-semibold">Interactive Predict</h3>
                      </div>
                      <p className="text-sm text-muted-foreground -mt-2">
                        {model.predictive
                          ? 'Adjust input features and watch the model traverse to a prediction with animated highlighting.'
                          : 'Interactive prediction traversal is coming soon for this model type.'}
                      </p>
                      <Card className="w-full p-0 border-border bg-card overflow-hidden">
                        <div className="w-full min-h-[500px] bg-background overflow-hidden relative">
                          <WebComponentWrapper
                            component={model.predictive || model.nonPredictive}
                            model={modelData}
                          />
                        </div>
                      </Card>
                    </div>

                    {/* 4. Predictive Code */}
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs font-bold">4</span>
                        <h3 className="text-lg font-semibold">Predictive Code</h3>
                      </div>
                      <CodeBlock tabs={getCodeSnippet(model.predictive || model.nonPredictive)} />
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
