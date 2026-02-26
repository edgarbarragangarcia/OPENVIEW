"use client";

import React from "react";
import { motion } from "framer-motion";

const clients = [
    { name: "Gymboree", logo: "Gymboree" },
    { name: "Ingenes", logo: "Ingenes" },
    { name: "APEG Golf", logo: "APEG Golf" },
    { name: "Regina", logo: "Regina" },
    { name: "SheetSync", logo: "SheetSync" },
    { name: "Monitor Regina", logo: "Monitor Regina" },
];

export const Clients = () => {
    return (
        <section className="py-20 bg-black/50 overflow-hidden relative border-y border-white/5 -mt-64 z-10">
            <div className="max-w-7xl mx-auto px-6 mb-12 text-center">
                <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                    Confían en nosotros
                </h2>
            </div>

            <div className="flex relative items-center">
                <motion.div
                    animate={{
                        x: [0, -1035], // Half of the double-list width roughly
                    }}
                    transition={{
                        x: {
                            repeat: Infinity,
                            repeatType: "loop",
                            duration: 30,
                            ease: "linear",
                        },
                    }}
                    className="flex gap-20 items-center whitespace-nowrap"
                >
                    {[...clients, ...clients, ...clients].map((client, index) => (
                        <div
                            key={`${client.name}-${index}`}
                            className="group flex items-center justify-center grayscale hover:grayscale-0 opacity-40 hover:opacity-100 transition-all duration-300"
                        >
                            <span className="text-2xl md:text-3xl font-heading font-black text-white px-4 py-2 rounded-lg border border-transparent group-hover:border-primary/20 group-hover:bg-primary/5">
                                {client.name}
                            </span>
                        </div>
                    ))}
                </motion.div>

                {/* Gradients for smooth fade out */}
                <div className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-black to-transparent z-10" />
                <div className="absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-black to-transparent z-10" />
            </div>
        </section>
    );
};
