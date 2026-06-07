'use client'

import React, { useState } from 'react'
import { Check, Copy } from 'lucide-react'

export interface CodeTab {
  language: string;
  label: string;
  code: string | React.ReactNode;
}

interface CodeBlockProps {
  tabs: CodeTab[];
  className?: string;
}

export function CodeBlock({ tabs, className = "" }: CodeBlockProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const currentCode = tabs[activeTab].code;
    const textToCopy = typeof currentCode === 'string' 
      ? currentCode 
      : extractTextFromNode(currentCode);
      
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        // Fallback for non-secure contexts (e.g., local network testing)
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
        } catch (err) {
          console.error('Fallback: Oops, unable to copy', err);
        }
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className={`rounded-xl border border-border bg-card overflow-hidden flex flex-col ${className}`}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          {tabs.map((tab, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={`text-sm px-3 py-1 rounded-md transition-colors ${
                activeTab === idx 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button 
          onClick={handleCopy}
          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors flex items-center gap-1 text-xs"
          title="Copy code"
        >
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <div className="p-4 overflow-x-auto text-sm font-mono text-muted-foreground bg-[#0d1117] dark:bg-[#0d1117] text-[#e6edf3]">
        <pre className="whitespace-pre-wrap break-all normal-case">
          <code>
            {tabs[activeTab].code}
          </code>
        </pre>
      </div>
    </div>
  );
}

function extractTextFromNode(node: React.ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(extractTextFromNode).join('');
  }
  if (React.isValidElement(node) && node.props.children) {
    return extractTextFromNode(node.props.children);
  }
  return '';
}
