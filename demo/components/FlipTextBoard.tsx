'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function FlipTextBoard({ phrases }: { phrases: string[] }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % phrases.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [phrases.length])

  // Pad all phrases to max length
  const maxLength = Math.max(...phrases.map((p) => p.length))
  const paddedPhrases = phrases.map((p) => p.padEnd(maxLength, ' '))

  const currentPhrase = paddedPhrases[index]

  return (
    <>
      {/* Desktop Split-Flap Animation */}
      <div className="hidden sm:flex gap-1 justify-center max-w-[95vw] overflow-hidden py-4">
        {currentPhrase.split('').map((char, i) => (
          <FlipCard key={i} char={char} i={i} phraseIndex={index} />
        ))}
      </div>

      {/* Mobile Fade Animation */}
      <div className="flex sm:hidden justify-center items-center h-[80px]">
        <AnimatePresence mode="wait">
          <motion.h2
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-black tracking-tight text-center px-4"
          >
            {phrases[index]}
          </motion.h2>
        </AnimatePresence>
      </div>
    </>
  )
}

function FlipCard({ char, i, phraseIndex }: { char: string; i: number; phraseIndex: number }) {
  return (
    <div
      className="relative flex items-center justify-center 
                 w-[4.8vw] h-[6.5vw] sm:w-[2.2rem] sm:h-[3.2rem] md:w-[3rem] md:h-[4rem] lg:w-[3.5rem] lg:h-[4.5rem]
                 bg-zinc-900 text-white dark:bg-zinc-800 dark:text-zinc-100 rounded-sm shadow-lg border border-zinc-700/50 
                 text-[3.5vw] sm:text-xl md:text-3xl lg:text-4xl font-mono font-bold"
      style={{ perspective: 1200 }}
    >
      <AnimatePresence>
        <motion.div
          key={phraseIndex}
          initial={{ rotateX: -90, opacity: 0 }}
          animate={{ rotateX: 0, opacity: 1 }}
          exit={{ rotateX: 90, opacity: 0 }}
          transition={{ duration: 0.4, delay: i * 0.04, type: "spring", bounce: 0.3 }}
          className="absolute inset-0 flex items-center justify-center origin-center"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.div>
      </AnimatePresence>

      {/* Visual split line for the flap effect */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <div className="w-full h-[1px] bg-black/60 shadow-sm" />
      </div>
    </div>
  )
}
