"use client";

import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { HeroBackground } from "./HeroBackground";
import { ShatterImage } from "../ui/ShatterImage";

export const Hero = () => {
    const { scrollYProgress } = useScroll();
    const scale = useTransform(scrollYProgress, [0, 0.3], [1, 1.1]);
    const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
    const textY = useTransform(scrollYProgress, [0, 0.3], [0, -50]);

    return (
        <section className="relative min-h-screen md:h-[140vh] flex flex-col items-center pt-24 md:pt-32 overflow-hidden bg-black">
            <HeroBackground />

            {/* Shatter Effect Background - Adjusted for mobile */}
            <div className="absolute inset-0 z-0 opacity-70 scale-[1.2] md:scale-[1.4] -translate-y-[20vh] md:translate-y-0">
                <ShatterImage src="/shatter-glass.png" />
            </div>

            <motion.div
                style={{ scale, opacity, y: textY }}
                className="relative md:sticky top-12 md:top-32 z-10 max-w-7xl mx-auto px-6 text-center"
            >
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-heading font-bold text-white tracking-tighter leading-[0.9] mb-6 md:mb-8"
                >
                    Ingeniería Digital <br />
                    <span className="text-white/40">con Propósito.</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.6 }}
                    className="text-base sm:text-lg md:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed font-medium px-4"
                >
                    Construimos productos digitales a la medida que transforman la manera en que las empresas operan, venden y se conectan con sus usuarios.
                </motion.p>
            </motion.div>

            {/* Scroll Indicator - Hidden on very small screens to save space */}
            <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute bottom-20 md:bottom-60 left-1/2 -translate-x-1/2 text-white/30 hidden sm:block"
            >
                <div className="w-px h-12 bg-gradient-to-b from-white to-transparent" />
            </motion.div>
        </section>
    );
};
