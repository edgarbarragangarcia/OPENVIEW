"use client";

import React, { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface Star {
    x: number;
    y: number;
    size: number;
    speed: number;
    opacity: number;
    twinkle: number;
    twinkleSpeed: number;
    color: string;
}

const Starfield = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const mousePos = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrameId: number;
        let stars: Star[] = [];
        let isMobile = false;

        const colors = ["#ffffff", "#e0f2fe", "#fef9c3", "#fee2e2"];

        const initStars = () => {
            const width = canvas.width = container.offsetWidth;
            const height = canvas.height = container.offsetHeight;
            isMobile = window.innerWidth < 768;
            const STAR_COUNT = isMobile ? 150 : 450;
            stars = [];

            for (let i = 0; i < STAR_COUNT; i++) {
                stars.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    size: Math.random() * (isMobile ? 1.5 : 2.5) + 0.5,
                    speed: Math.random() * 0.12 + 0.04,
                    opacity: Math.random() * 0.4 + 0.5,
                    twinkle: Math.random() * Math.PI,
                    twinkleSpeed: Math.random() * 0.03 + 0.01,
                    color: colors[Math.floor(Math.random() * colors.length)]
                });
            }
        };

        const draw = () => {
            const width = canvas.width;
            const height = canvas.height;

            ctx.clearRect(0, 0, width, height);

            // Parallax based on mouse/touch
            const parallaxX = (mousePos.current.x - width / 2) * (isMobile ? 0.03 : 0.015);
            const parallaxY = (mousePos.current.y - height / 2) * (isMobile ? 0.03 : 0.015);

            stars.forEach((star) => {
                // Update twinkling
                star.twinkle += star.twinkleSpeed;
                const currentOpacity = star.opacity * (0.6 + 0.4 * Math.sin(star.twinkle));

                ctx.globalAlpha = currentOpacity;
                ctx.fillStyle = star.color;

                // Disable heavy shadowBlur on mobile for performance
                if (!isMobile) {
                    ctx.shadowBlur = star.size * 5;
                    ctx.shadowColor = star.color;
                }

                ctx.beginPath();

                // Add parallax to position
                const drawX = (star.x + parallaxX * star.speed * 8) % width;
                const drawY = (star.y + parallaxY * star.speed * 8) % height;

                ctx.arc(
                    drawX < 0 ? drawX + width : drawX,
                    drawY < 0 ? drawY + height : drawY,
                    star.size, 0, Math.PI * 2
                );
                ctx.fill();

                if (!isMobile) ctx.shadowBlur = 0;

                // Slow vertical drift
                star.y -= star.speed;
                star.x -= star.speed * 0.15;

                // Wrap around
                if (star.y < 0) star.y = height;
                if (star.x < 0) star.x = width;
                if (star.x > width) star.x = 0;
            });

            animationFrameId = requestAnimationFrame(draw);
        };

        const handleResize = () => initStars();
        const handleMouseMove = (e: MouseEvent) => {
            mousePos.current = { x: e.clientX, y: e.clientY };
        };
        const handleTouchMove = (e: TouchEvent) => {
            if (e.touches[0]) {
                mousePos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            }
        };

        initStars();
        draw();

        window.addEventListener("resize", handleResize);
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("touchmove", handleTouchMove, { passive: true });

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener("resize", handleResize);
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("touchmove", handleTouchMove);
        };
    }, []);

    return (
        <div ref={containerRef} className="absolute inset-0">
            <canvas
                ref={canvasRef}
                className="absolute inset-0 pointer-events-none"
            />
        </div>
    );
};

export const HeroBackground = () => {
    return (
        <div className="absolute inset-0 z-0 bg-black overflow-hidden">
            {/* Moving Starfield */}
            <Starfield />

            {/* Subtle atmospheric nebula glow */}
            <motion.div
                animate={{
                    opacity: [0.3, 0.5, 0.3],
                    scale: [1, 1.2, 1],
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]"
            />

            <motion.div
                animate={{
                    opacity: [0.2, 0.4, 0.2],
                    scale: [1.2, 1, 1.2],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute bottom-1/4 right-0 translate-x-1/2 translate-y-1/2 w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[150px]"
            />

            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none" />

            {/* Mask for smoother transition from top */}
            <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black opacity-60" />
        </div>
    );
};
