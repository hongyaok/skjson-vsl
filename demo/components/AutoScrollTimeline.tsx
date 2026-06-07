"use client"

import { useRef, useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface AutoScrollTimelineProps {
    children: React.ReactNode;
    orientation?: "horizontal" | "vertical";
    className?: string;
}

export function AutoScrollTimeline({ children, orientation = "horizontal", className }: AutoScrollTimelineProps) {
    const scrollRef = useRef<HTMLDivElement>(null)
    const isHoveredRef = useRef(false)

    useEffect(() => {
        let animationFrameId: number;
        let scrollPos = 0;

        const loop = () => {
            const el = scrollRef.current;
            const isHovered = isHoveredRef.current;
            if (el && !isHovered) {
                const maxScroll = orientation === "horizontal"
                    ? el.scrollWidth - el.clientWidth
                    : el.scrollHeight - el.clientHeight;

                if (maxScroll > 0) {
                    scrollPos += 0.5; // Speed: 0.5px per frame
                    
                    // Once reached the end, reset back to 0
                    if (scrollPos >= maxScroll + 50) {
                        scrollPos = 0;
                    }
                    
                    if (orientation === "horizontal") {
                        el.scrollLeft = Math.max(0, Math.min(scrollPos, maxScroll));
                    } else {
                        el.scrollTop = Math.max(0, Math.min(scrollPos, maxScroll));
                    }
                }
            } else if (el && isHovered) {
                // If hovered, sync scrollPos with manual scrolling
                scrollPos = orientation === "horizontal" ? el.scrollLeft : el.scrollTop;
            }
            animationFrameId = requestAnimationFrame(loop);
        };
        
        animationFrameId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(animationFrameId);
    }, [orientation]);

    return (
        <div 
            ref={scrollRef} 
            className={cn(
                "w-full cursor-grab active:cursor-grabbing",
                orientation === "horizontal" ? "overflow-x-auto pb-8" : "overflow-y-auto",
                "[&::-webkit-scrollbar]:hidden",
                className
            )}
            onMouseEnter={() => { isHoveredRef.current = true }}
            onMouseLeave={() => { isHoveredRef.current = false }}
            onTouchStart={() => { isHoveredRef.current = true }}
            onTouchEnd={() => { isHoveredRef.current = false }}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
            {children}
        </div>
    )
}
