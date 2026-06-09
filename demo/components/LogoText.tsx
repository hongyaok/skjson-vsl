import React from 'react'

export function LogoText({ className = "" }: { className?: string; text?: string }) {
  // Hardcoded to exact user requirement
  return (
    <span className={className}>
      <span className="text-gray-300">
        &#123;skjs<span className="text-[0.75em] -translate-y-[0.05em] inline-block">●</span>n-
      </span>
      <span className="animate-vsl-gradient font-black">vsl</span>
      <span className="text-gray-300">&#125;</span>
    </span>
  )
}
