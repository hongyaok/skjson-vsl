import React from 'react'

export function LogoText({ text, className = "" }: { text: string, className?: string }) {
  if (!text.toLowerCase().includes('json')) {
    return <span className={className}>{text}</span>
  }
  
  const parts = text.split(/(json)/i);
  
  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (part.toLowerCase() === 'json') {
          return (
            <span key={i} className="text-yellow-400">
              js<span className="text-[0.75em] -translate-y-[0.05em] inline-block">●</span>n
            </span>
          )
        }
        return (
          <span key={i}>
            {part.split(/o/i).map((subPart, subI, arr) => (
              <React.Fragment key={subI}>
                {subPart}
                {subI < arr.length - 1 && <span className="text-[0.75em] -translate-y-[0.05em] inline-block">●</span>}
              </React.Fragment>
            ))}
          </span>
        )
      })}
    </span>
  )
}
