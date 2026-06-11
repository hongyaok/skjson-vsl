'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { LogoText } from '@/components/LogoText';
import Link from 'next/link';
import { ArrowLeft, TreeDeciduous, GitFork, TrendingUp, LineChart, Sun, Moon, ArrowUp, Layers, Hash, Tag } from 'lucide-react';
import { CodeBlock } from '@/components/CodeBlock';
import { motion, AnimatePresence } from 'framer-motion';

const WebComponentWrapper = dynamic(() => import('@/components/WebComponentWrapper'), { ssr: false });

function getCodeSnippet(componentName: string) {
  return [
    {
      label: "React",
      language: "tsx",
      code: `import React, { useEffect, useRef } from 'react';
import 'skjson-vsl';
import modelData from './${componentName.replace('skjson-', '')}.json';

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
import modelData from './${componentName.replace('skjson-', '')}.json';
</script>`
    },
    {
      label: "Svelte",
      language: "svelte",
      code: `<script>
  import 'skjson-vsl';
  import modelData from './${componentName.replace('skjson-', '')}.json';
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
    import modelData from './${componentName.replace('skjson-', '')}.json' with { type: 'json' };
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

const ACCENT_MAP: Record<string, string> = {
  decision_tree: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  random_forest: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  gradient_boosting: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  linear_model: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
};

function MetaBadge({ icon: Icon, label }: { icon: React.ElementType, label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-full border border-border/50">
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

function ComponentShowcase({ model, modelData, Icon, modelId }: any) {
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [isLightMode, setIsLightMode] = useState(false);
  const accentClasses = ACCENT_MAP[modelId] || '';

  return (
    <div className={`flex flex-col gap-5 ${isLightMode ? 'showcase-light text-foreground' : ''}`}>
      {/* Title header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className={`flex items-center justify-center w-10 h-10 rounded-xl border ${accentClasses}`}>
            <Icon className="w-5 h-5" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{model.title}</h2>
        </div>
        <p className="text-muted-foreground max-w-2xl mb-3">{model.description}</p>

        {/* Metadata badges */}
        {modelData && modelData.meta && (
          <div className="flex flex-wrap gap-2">
            <MetaBadge icon={Layers} label={modelData.meta.model_type} />
            <MetaBadge icon={Hash} label={`${modelData.meta.n_features} features`} />
            {modelData.meta.classes && (
              <MetaBadge icon={Tag} label={`${modelData.meta.classes.length} classes`} />
            )}
          </div>
        )}
      </div>

      {/* Preview / Code Card */}
      <div className="rounded-xl border border-border shadow-sm overflow-hidden bg-card">
        {/* Card Header / Tabs */}
        <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                activeTab === 'preview'
                  ? 'bg-background shadow-sm border border-border text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Preview
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                activeTab === 'code'
                  ? 'bg-background shadow-sm border border-border text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Code
            </button>
          </div>
          <button
            onClick={() => setIsLightMode(!isLightMode)}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors bg-background border border-border shadow-sm"
            title={`Switch to ${isLightMode ? 'Dark' : 'Light'} Mode`}
          >
            {isLightMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
        </div>

        {/* Card Body */}
        <div className="p-0 bg-background relative min-h-[500px] flex flex-col">
          {activeTab === 'preview' ? (
            <div className="w-full h-full min-h-[500px] flex-1 overflow-hidden flex flex-col">
               {model.predictive && (
                 <div className="p-4 bg-muted/30 border-b border-border text-sm text-muted-foreground">
                   <span className="font-semibold text-primary mr-2">Interactive:</span>
                   Adjust input features and watch the model traverse to a prediction.
                 </div>
               )}
               <WebComponentWrapper
                 component={model.predictive || model.nonPredictive}
                 model={modelData}
               />
            </div>
          ) : (
            <div className="flex-1 flex flex-col w-full h-full min-h-[500px]">
              <CodeBlock tabs={getCodeSnippet(model.predictive || model.nonPredictive)} className="flex-1 w-full border-0 rounded-none" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ComponentsPage() {
  const [modelsData, setModelsData] = useState<Record<string, any>>({});
  const [activeSection, setActiveSection] = useState<string>('');
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const modelFiles = ['decision_tree.json', 'random_forest.json', 'gradient_boosting.json', 'linear_model.json'];
    modelFiles.forEach(file => {
      fetch(`/${file}`)
        .then(res => res.json())
        .then(data => setModelsData(prev => ({ ...prev, [file.replace('.json', '')]: data })))
        .catch(err => console.error(`Failed to load ${file}:`, err));
    });
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

    const sections = document.querySelectorAll('[data-showcase-entry]');
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  // Show back-to-top on scroll
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 600);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
    <div className="min-h-screen text-foreground flex flex-col scroll-smooth bg-background normal-case">
      {/* Header */}
      <header className="w-full px-6 py-4 fixed top-0 left-0 right-0 flex justify-between items-center z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <ArrowLeft className="w-5 h-5" />
          <h3 className="text-xl font-black tracking-tight text-foreground">
            <LogoText text="{skjson-vsl}" />
          </h3>
        </Link>
        <div className="flex items-center gap-3">
          <a href="https://github.com/hongyaok/skjson-vsl" target="_blank" rel="noreferrer" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
            GitHub
          </a>
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
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                      ? 'bg-primary/10 text-primary shadow-sm'
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

        {/* Main Content */}
        <main className="flex-1 px-4 lg:px-0">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-16 pt-4"
          >
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-3">
              Component Playground
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Explore framework-agnostic visualization components powered by <code className="px-1.5 py-0.5 bg-muted rounded text-sm font-mono text-primary">skjson-vsl</code>.
              Load models exported by <code className="px-1.5 py-0.5 bg-muted rounded text-sm font-mono text-primary">skjson</code> and render them instantly.
            </p>
          </motion.div>

          {/* Components List */}
          <div className="flex flex-col gap-28">
            {models.map((model, index) => {
              const Icon = ICON_MAP[model.id];

              return (
                <motion.section
                  key={model.id}
                  id={model.id}
                  data-showcase-entry
                  className="scroll-mt-32"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  <ComponentShowcase
                    model={model}
                    modelData={modelsData[model.id]}
                    Icon={Icon}
                    modelId={model.id}
                  />
                </motion.section>
              );
            })}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="w-full border-t border-border mt-auto normal-case">
        <div className="px-6 py-6 flex justify-between flex-wrap gap-4 text-xs sm:text-sm w-full max-w-[1400px] mx-auto">
          <p className="text-muted-foreground">© 2026 Hong Yao</p>
          <div className="flex gap-4">
            <a href="https://github.com/hongyaok/skjson" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">GitHub (skjson)</a>
            <a href="https://github.com/hongyaok/skjson-vsl" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">GitHub (skjson-vsl)</a>
          </div>
        </div>
      </footer>

      {/* Back to Top FAB */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-50 w-10 h-10 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center"
            title="Back to top"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
