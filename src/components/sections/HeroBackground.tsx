"use client";

import React from "react";
import { motion } from "framer-motion";

export const HeroBackground = () => {
    return (
        <div className="absolute inset-0 z-0 bg-black overflow-hidden">
            {/* Extremely subtle atmospheric glow */}
            <motion.div
                animate={{
                    opacity: [0.1, 0.2, 0.1],
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-500/5 rounded-full blur-[150px]"
            />

            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none" />
        </div>
    );
};
