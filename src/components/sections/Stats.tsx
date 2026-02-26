"use client";

import React from "react";
import { motion } from "framer-motion";

const stats = [
    { label: "Proyectos Entregados", value: "+30", suffix: "" },
    { label: "Clientes Activos", value: "15", suffix: "+" },
    { label: "Países Alcanzados", value: "4", suffix: "" },
    { label: "Satisfacción Cliente", value: "98", suffix: "%" }
];

export const Stats = () => {
    return (
        <section className="py-24 relative overflow-hidden">
            {/* Background with Noise & Glow */}
            <div className="absolute inset-0 bg-[#0A0A0A] -z-20" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-64 bg-primary/20 rounded-full blur-[120px] -z-10" />

            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="text-center"
                        >
                            <div className="text-5xl md:text-6xl font-heading font-black text-white mb-2 flex items-center justify-center">
                                <span>{stat.value}</span>
                                <span className="text-primary ml-1">{stat.suffix}</span>
                            </div>
                            <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px] md:text-sm">
                                {stat.label}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
