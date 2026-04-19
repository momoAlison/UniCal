"use client";

import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

interface UnicornConfettiProps {
    trigger: boolean;
    onDone?: () => void;
}

/**
 * Full-screen unicorn confetti burst.
 * Fires when `trigger` flips to true, then calls `onDone`.
 */
export default function UnicornConfetti({ trigger, onDone }: UnicornConfettiProps) {
    const firedRef = useRef(false);

    useEffect(() => {
        if (!trigger || firedRef.current) return;
        firedRef.current = true;

        // Unicorn color palette
        const colors = ["#7c6fcd", "#e784b0", "#4bbfa8", "#f0a653", "#5ba4e5", "#fff"];

        // Left burst
        confetti({
            particleCount: 80,
            angle: 60,
            spread: 70,
            origin: { x: 0, y: 0.65 },
            colors,
            shapes: ["circle", "square"],
            scalar: 1.1,
        });

        // Right burst
        confetti({
            particleCount: 80,
            angle: 120,
            spread: 70,
            origin: { x: 1, y: 0.65 },
            colors,
            shapes: ["circle", "square"],
            scalar: 1.1,
        });

        // Center shower
        confetti({
            particleCount: 60,
            angle: 90,
            spread: 120,
            origin: { x: 0.5, y: 0.3 },
            colors,
            shapes: ["circle"],
            scalar: 0.9,
            gravity: 0.8,
        });

        const timer = setTimeout(() => {
            firedRef.current = false;
            onDone?.();
        }, 2500);

        return () => clearTimeout(timer);
    }, [trigger, onDone]);

    return null; // purely side-effect component
}
