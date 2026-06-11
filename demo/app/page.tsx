'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Eye, SearchCode, Sparkles, LayoutDashboard, Copy, Check, ArrowRight, Code2, MonitorPlay, FileJson } from 'lucide-react'
import { Button } from '@/components/8starlabs-ui/button'
import { LogoText } from '@/components/LogoText'
import { Github } from '@/components/GithubIcon'

function FadeSection({ children, className = '', delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.4, 0, 0.2, 1] }}
      className={`w-full flex flex-col items-center ${className}`}
    >
      {children}
    </motion.div>
  )
}

const FEATURES = [
  {
    icon: Sparkles,
    title: "Interactive UI",
    desc: "Rich visuals with dynamic decision path highlighting and feature importances.",
    gradient: "from-amber-500/20 to-orange-500/20",
    iconColor: "text-amber-400",
  },
  {
    icon: Eye,
    title: "Deep Insights",
    desc: "Visually explain exactly how your models make predictions.",
    gradient: "from-violet-500/20 to-purple-500/20",
    iconColor: "text-violet-400",
  },
  {
    icon: SearchCode,
    title: "Framework Agnostic",
    desc: "Built as standard Web Components. Works in React, Vue, Svelte, or Vanilla JS.",
    gradient: "from-emerald-500/20 to-teal-500/20",
    iconColor: "text-emerald-400",
  },
  {
    icon: LayoutDashboard,
    title: "Fully Themeable",
    desc: "Matches your application's look using standard CSS custom properties.",
    gradient: "from-blue-500/20 to-cyan-500/20",
    iconColor: "text-blue-400",
  },
]

const STEPS = [
  {
    icon: Code2,
    label: "Export",
    desc: "Train in scikit-learn, export with skjson",
    code: "skjson.save(clf, 'model.json')",
  },
  {
    icon: FileJson,
    label: "Load",
    desc: "Import the JSON model in your frontend",
    code: "import model from './model.json'",
  },
  {
    icon: MonitorPlay,
    label: "Visualize",
    desc: "Render with a single web component",
    code: "<skjson-decision-tree .model=${model}>",
  },
]

function InstallBlock() {
  const [copied, setCopied] = React.useState(false)
  const command = 'npm install skjson-vsl'

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
      const ta = document.createElement('textarea')
      ta.value = command
      ta.style.position = 'fixed'
      ta.style.left = '-9999px'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="install-block flex items-center justify-between gap-4 max-w-lg w-full">
      <code>
        <span className="prefix">$ </span>
        <span className="pkg">{command}</span>
      </code>
      <button
        onClick={handleCopy}
        className="flex-shrink-0 p-2 rounded-lg hover:bg-white/5 transition-colors text-muted-foreground hover:text-foreground"
        title="Copy to clipboard"
      >
        {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  )
}

export default function Page() {
  const [shake, setShake] = React.useState(false)

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShake(true)
      setTimeout(() => setShake(false), 400)
    }, 600)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen text-foreground flex flex-col overflow-x-hidden">
      {/* Header */}
      <header className="w-full px-6 py-4 fixed top-0 left-0 right-0 flex justify-between items-center z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <h3 className="text-xl font-black tracking-tight text-foreground">
          <LogoText text="{skjson-vsl}" />
        </h3>
        <div className="flex items-center gap-3">
          <Link href="/components" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
            Playground
          </Link>
          <a href="https://github.com/hongyaok/skjson-vsl" target="_blank" rel="noreferrer">
            <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
              <Github className="w-4 h-4" />
            </Button>
          </a>
        </div>
      </header>

      <main
        className={`flex-1 flex flex-col items-center w-full max-w-6xl mx-auto px-4 pt-32 pb-24 gap-28 ${shake ? 'animate-shake' : ''}`}
      >
        {/* 1. Hero Section */}
        <FadeSection className="gap-6 mt-8">
          <div className="relative inline-block">
            <motion.h1
              initial={{ y: -50, opacity: 0, scale: 1.1 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
              className="text-7xl sm:text-9xl font-black tracking-tighter text-center"
              style={{ textShadow: '0px 20px 30px rgba(0,0,0,0.8)' }}
            >
              <LogoText text="{skjson-vsl}" />
            </motion.h1>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-xl text-muted-foreground max-w-2xl text-center mt-4 normal-case"
          >
            Beautiful, interactive visualizations for your scikit-learn models.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.5 }}
            className="flex gap-3 mt-2 justify-center"
          >
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
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="mt-4 normal-case"
          >
            <InstallBlock />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 mt-6 w-[90%] sm:w-full max-w-md mx-auto justify-center"
          >
            <Link href="/components" className="flex-1">
              <Button size="lg" className="w-full h-14 text-lg btn-rainbow-hover border-border border" withArrow>
                Component Playground
              </Button>
            </Link>
          </motion.div>
        </FadeSection>

        {/* 2. Features */}
        <FadeSection className="gap-8 normal-case">
          <div className="text-center mb-2">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">Features</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Everything you need to understand your ML models visually.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-3xl">
            {FEATURES.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className={`glass-card p-6 h-full bg-gradient-to-br ${feat.gradient}`}>
                  <feat.icon className={`h-7 w-7 mb-3 ${feat.iconColor}`} />
                  <h3 className="text-lg font-bold mb-1.5">{feat.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </FadeSection>

        {/* 3. How it Works */}
        <FadeSection className="gap-6 normal-case">
          <div className="text-center mb-2">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">How It Works</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Three steps. No backend needed.
            </p>
          </div>

          <div className="flex flex-col items-center w-full max-w-lg gap-0">
            {STEPS.map((step, i) => (
              <React.Fragment key={step.label}>
                <motion.div
                  initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.15 }}
                  className="glass-card p-5 w-full"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center text-primary font-black text-lg border border-primary/20">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <step.icon className="w-4 h-4 text-primary" />
                        <h3 className="font-bold text-base">{step.label}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{step.desc}</p>
                      <code className="text-xs bg-black/30 px-2 py-1 rounded-md text-emerald-400 font-mono">
                        {step.code}
                      </code>
                    </div>
                  </div>
                </motion.div>
                {i < STEPS.length - 1 && <div className="step-connector" />}
              </React.Fragment>
            ))}
          </div>
        </FadeSection>

        {/* 4. CTA Section */}
        <FadeSection className="normal-case">
          <div className="glass-card p-8 sm:p-12 w-full max-w-3xl text-center bg-gradient-to-br from-primary/5 to-primary/10">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
              Ready to visualize your models?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Explore the interactive component playground to see every visualizer in action.
            </p>
            <Link href="/components">
              <Button size="lg" className="h-12 px-8 text-base gap-2">
                Open Playground
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </FadeSection>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-border mt-auto normal-case">
        <div className="px-6 py-6 flex justify-between flex-wrap gap-4 text-xs sm:text-sm w-full max-w-6xl mx-auto">
          <p className="text-muted-foreground">© 2026 Hong Yao</p>
          <div className="flex gap-4">
            <a href="https://github.com/hongyaok/skjson" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">GitHub (skjson)</a>
            <a href="https://github.com/hongyaok/skjson-vsl" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">GitHub (skjson-vsl)</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
