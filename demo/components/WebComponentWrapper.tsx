'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

// Track web component registration globally
let webComponentsRegistered = false;
let registrationPromise: Promise<void> | null = null;

function ensureRegistered(): Promise<void> {
  if (webComponentsRegistered) return Promise.resolve();
  if (!registrationPromise && typeof window !== 'undefined') {
    registrationPromise = import('skjson-vsl').then(() => {
      webComponentsRegistered = true;
    });
  }
  return registrationPromise || Promise.resolve();
}

const WebComponentWrapper = ({ component, model, inputFeatures }: any) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(webComponentsRegistered);

  useEffect(() => {
    ensureRegistered().then(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!ready || !containerRef.current) return;

    // Only create the element if it doesn't exist or the component type changed
    const existing = containerRef.current.firstElementChild;
    if (!existing || existing.tagName.toLowerCase() !== component) {
      containerRef.current.innerHTML = `<${component}></${component}>`;
    }

    const el = containerRef.current.firstElementChild as any;
    if (el) {
      if (model) el.model = model;
      if (inputFeatures) el.inputFeatures = inputFeatures;
    }
  }, [component, model, inputFeatures, ready]);

  if (!ready) {
    return (
      <div className="w-full h-full min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <span className="text-sm text-muted-foreground">Loading component…</span>
        </div>
      </div>
    );
  }

  return <div ref={containerRef} className="w-full h-full min-h-[400px]"></div>;
};

export default WebComponentWrapper;
