'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Eye, SearchCode, Sparkles, LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/8starlabs-ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemeToggle } from '@/components/ThemeToggle'
import { LogoText } from '@/components/LogoText'
import { Github } from '@/components/GithubIcon'
import { FlipTextBoard } from '@/components/FlipTextBoard'

function FadeSection({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5 }}
      className={`w-full flex flex-col items-center ${className}`}
    >
      {children}
    </motion.div>
  )
}

function FeatureCard({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <Card className="w-72 transition-transform hover:scale-105">
      <CardHeader>
        <Icon className="h-6 w-6 mb-2" />
        <CardTitle>{title}</CardTitle>
        <CardDescription>{desc}</CardDescription>
      </CardHeader>
    </Card>
  )
}

export default function Page() {
  const [shake, setShake] = React.useState(false)

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShake(true)
      setTimeout(() => setShake(false), 400) // Shake for 400ms
    }, 600) // After drop completes
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen text-foreground flex flex-col overflow-x-hidden">
      {/* Header */}
      <header className="w-full px-6 py-4 fixed top-0 left-0 right-0 flex justify-between items-center z-50 bg-background/80 backdrop-blur-md">
        <h3 className="text-xl font-black tracking-tight text-foreground">
          <LogoText text="{skjson-vsl}" />
        </h3>
        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </header>

      <main
        className={`flex-1 flex flex-col items-center w-full max-w-6xl mx-auto px-4 pt-32 pb-24 gap-24 ${shake ? 'animate-shake' : ''}`}
      >
        {/* 1. Hero Section */}
        <FadeSection className="gap-6 mt-8">
          <motion.h1
            initial={{ y: -100, opacity: 0, scale: 1.2 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
            className="text-7xl sm:text-9xl font-black tracking-tighter text-center"
            style={{ textShadow: '0px 20px 30px rgba(0,0,0,0.5)' }}
          >
            <LogoText text="{skjson-vsl}" />
          </motion.h1>

          <div className="flex flex-col items-center mt-4 min-h-[100px] sm:min-h-[140px] justify-center relative w-full">
            <h1 className="sr-only">
              Visualize skjson models in the browser.
            </h1>
            <FlipTextBoard phrases={[
              "Visualize models.",
              "React components.",
              "No backend needed."
            ]} />
          </div>

          <p className="text-xl text-muted-foreground max-w-2xl text-center mt-4 normal-case">
            Beautiful, interactive visualizations for your scikit-learn models exported via skjson. Powered by Lit Web Components.
          </p>

          <div className="flex gap-4 mt-2 mb-4 justify-center">
            <a href="https://github.com/hongyaok/skjson" target="_blank" rel="noreferrer">
              <Button variant="outline" className="gap-2">
                <Github className="w-4 h-4" />
                skjson
              </Button>
            </a>
            <a href="https://github.com/hongyaok/skjson-vsl" target="_blank" rel="noreferrer">
              <Button variant="outline" className="gap-2">
                <Github className="w-4 h-4" />
                skjson-vsl
              </Button>
            </a>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-4 w-[90%] sm:w-full max-w-3xl mx-auto justify-center">
            <Link href="/components" className="flex-1">
              <Button size="lg" className="w-full h-14 text-lg" withArrow>
                Component Playground
              </Button>
            </Link>
          </div>
        </FadeSection>

        {/* 2. Features */}
        <FadeSection className="mt-10 gap-6 normal-case">
          <h2 className="text-3xl font-extrabold text-center mb-4">Features</h2>
          <div className="flex flex-wrap gap-4 justify-center">
            <FeatureCard icon={Sparkles} title="Interactive UI" desc="Rich visuals with dynamic decision path highlighting and feature importances." />
            <FeatureCard icon={Eye} title="Deep Insights" desc="Visually explain exactly how your models make predictions." />
            <FeatureCard icon={SearchCode} title="Framework Agnostic" desc="Built as standard Web Components. Works in React, Vue, Svelte, or Vanilla JS." />
            <FeatureCard icon={LayoutDashboard} title="Fully Customizable" desc="Matches your application's theme using standard CSS variables." />
          </div>
        </FadeSection>
        
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-border mt-auto normal-case">
        <div className="px-6 py-6 flex justify-between flex-wrap gap-4 text-xs sm:text-sm w-full">
          <p className="text-muted-foreground">© 2026 Hong Yao</p>
          <div className="flex gap-4">
            <a href="https://github.com/hongyaok/skjson-vsl" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground">GitHub (skjson-vsl)</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
