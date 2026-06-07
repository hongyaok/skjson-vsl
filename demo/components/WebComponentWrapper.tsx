'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';

// We import the web components dynamically on the client side only
// to avoid SSR "window is not defined" issues.
let webComponentsRegistered = false;

const WebComponentWrapper = ({ component, model, inputFeatures }: any) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!webComponentsRegistered && typeof window !== 'undefined') {
      import('skjson-vsl').then(() => {
        webComponentsRegistered = true;
      });
    }
  }, []);

  useEffect(() => {
    if (containerRef.current && webComponentsRegistered) {
      containerRef.current.innerHTML = `<${component}></${component}>`;
      const el = containerRef.current.firstElementChild as any;
      if (el) {
        if (model) el.model = model;
        if (inputFeatures) el.inputFeatures = inputFeatures;
      }
    }
  }, [component, model, inputFeatures]);

  return <div ref={containerRef} className="w-full h-full min-h-[400px]"></div>;
};

export default WebComponentWrapper;
