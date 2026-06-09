"use client"

import { DotPattern } from "@/components/ui/dot-pattern"

export function BackgroundWrapper({ children }: { children: React.ReactNode }) {
    // Cyan/blue color for the dot hover effect
    const glowColor = "#3399ff" 

    // Base dots: subtle grey.
    const baseColor = "#404040"
    
    // Vignette: Dark metallic vignette
    const vignetteColor = "rgba(10,12,15,0.6)"

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
