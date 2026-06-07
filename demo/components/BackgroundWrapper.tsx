"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { DotPattern } from "@/components/ui/dot-pattern"

export function BackgroundWrapper({ children }: { children: React.ReactNode }) {
    const { theme, systemTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        // Prevent layout shift/hydration mismatch before theme loads
        return <div className="min-h-screen bg-background">{children}</div>
    }

    const currentTheme = theme === "system" ? systemTheme : theme

    // Yellow colors matching json logo (#facc15 is yellow-400)
    const glowColor = "#facc15" 

    // Base dots: subtle grey.
    const baseColor = currentTheme === "dark" ? "#404040" : "#d4d4d8"
    
    // Vignette: Dark mode gets black vignette, light mode gets white vignette
    const vignetteColor = currentTheme === "dark" ? "rgba(10,10,10,0.6)" : "rgba(255,255,255,0.6)"

    return (
        <div className="relative min-h-screen">
            <DotPattern
                baseColor={baseColor}
                glowColor={glowColor}
                vignetteColor={vignetteColor}
                waveSpeed={0.5}
                glowIntensity={1.2}
            />
            <div className="relative z-0">
                {children}
            </div>
        </div>
    )
}
