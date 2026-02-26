"use client";

import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export const About = () => {
    const { scrollYProgress } = useScroll();
    const opacity = useTransform(scrollYProgress, [0.3, 0.45, 0.6], [0.1, 1, 0.1]);
    const scale = useTransform(scrollYProgress, [0.3, 0.45, 0.6], [0.95, 1, 0.95]);

    return (
        <section id="nosotros" className="relative min-h-[100vh] flex items-center justify-center bg-black px-6 py-32">
            <div className="max-w-5xl mx-auto text-center">
                <motion.div
                    style={{ opacity, scale }}
                    className="space-y-12"
                >
                    <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-tight">
                        Construimos herramientas que se sienten <br />
                        <span className="text-white/40">como una extensión de tu visión.</span>
                    </h2>

                    <p className="text-xl md:text-2xl text-white/50 max-w-3xl mx-auto leading-relaxed">
                        Nuestra misión es simple: elevar el estándar del software en Latinoamérica a través de ingeniería impecable y diseño de primer nivel.
                    </p>
                </motion.div>
            </div>
        </section>
    );
};
