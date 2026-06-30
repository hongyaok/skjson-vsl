'use client';

import React, { useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowLeft, UploadCloud, RefreshCcw } from 'lucide-react';
import { LogoText } from '@/components/LogoText';
import { Button } from '@/components/8starlabs-ui/button';

const WebComponentWrapper = dynamic(() => import('@/components/WebComponentWrapper'), { ssr: false });

export default function TryItPage() {
  const [modelData, setModelData] = useState<any>(null);
  const [error, setError] = useState<string>('');
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (!json.meta || !json.meta.model_type) {
          throw new Error('Invalid model format. Missing meta.model_type');
        }
        setModelData(json);
        setError('');
      } catch (err: any) {
        setError(err.message || 'Failed to parse JSON file');
      }
    };
    reader.readAsText(file);
  };
  
  const resetModel = () => {
    setModelData(null);
    setError('');
  };

  const getComponentName = (modelType: string) => {
    // Determine the component name. Default to predict component if possible
    if (modelType === 'linear_model') return 'skjson-linear-model';
    return `skjson-${modelType.replace(/_/g, '-')}-predict`;
  };

  return (
    <div className="min-h-screen text-foreground flex flex-col bg-background normal-case">
      {/* Header */}
      <header className="w-full px-6 py-4 fixed top-0 left-0 right-0 flex justify-between items-center z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <ArrowLeft className="w-5 h-5" />
          <h3 className="text-xl font-black tracking-tight text-foreground">
            <LogoText text="{skjson-vsl}" />
          </h3>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/components" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
            Playground
          </Link>
          <a href="https://github.com/hongyaok/skjson-vsl" target="_blank" rel="noreferrer" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
            GitHub
          </a>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center w-full px-4 pt-24 pb-24">
        {!modelData ? (
          <div className="w-full max-w-2xl text-center">
            <h1 className="text-4xl font-extrabold tracking-tight mb-4">Try It with Your Model</h1>
            <p className="text-lg text-muted-foreground mb-12">Upload a JSON model exported from scikit-learn via skjson.</p>
            
            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-primary/40 rounded-xl cursor-pointer bg-primary/5 hover:bg-primary/10 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <UploadCloud className="w-12 h-12 text-primary mb-4" />
                <p className="mb-2 text-sm text-foreground font-semibold">Click to upload or drag and drop</p>
                <p className="text-xs text-muted-foreground">JSON files only</p>
              </div>
              <input type="file" className="hidden" accept=".json,application/json" onChange={handleFileChange} />
            </label>
            {error && <p className="mt-4 text-red-500 font-medium">{error}</p>}
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center max-w-[1400px] flex-1">
             <div className="w-full flex justify-between items-center mb-6">
               <h2 className="text-2xl font-bold tracking-tight">Visualization: {modelData.meta.model_type}</h2>
               <Button variant="outline" onClick={resetModel} className="gap-2">
                 <RefreshCcw className="w-4 h-4" />
                 Upload Another
               </Button>
             </div>
             <div className="w-full flex-1 min-h-[600px] border border-border rounded-xl bg-card overflow-hidden flex flex-col">
                <WebComponentWrapper 
                  component={getComponentName(modelData.meta.model_type)} 
                  model={modelData} 
                />
             </div>
          </div>
        )}
      </main>
    </div>
  );
}
