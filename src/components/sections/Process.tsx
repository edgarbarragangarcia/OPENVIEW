"use client";

import React from "react";
import { motion } from "framer-motion";
import {
    Lightbulb,
    Settings,
    Palette,
    Code2,
    Rocket
} from "lucide-react";

const steps = [
    {
        title: "Descubrimiento",
        description: "Entendemos tu negocio, tus retos y tus objetivos estratégicos.",
        icon: Lightbulb,
        color: "text-amber-500",
        bgColor: "bg-amber-500/10"
    },
    {
        title: "Arquitectura",
        description: "Diseñamos la solución técnica robusta, escalable y segura.",
        icon: Settings,
        color: "text-blue-500",
        bgColor: "bg-blue-500/10"
    },
    {
        title: "Diseño UX/UI",
        description: "Creamos interfaces elegantes que priorizan la experiencia del usuario.",
        icon: Palette,
        color: "text-pink-500",
        bgColor: "bg-pink-500/10"
    },
    {
        title: "Desarrollo",
        description: "Construimos tu producto con sprints ágiles y demos semanales.",
        icon: Code2,
        color: "text-primary",
        bgColor: "bg-primary/10"
    },
    {
        title: "Lanzamiento",
        description: "Hacemos el despliegue y te acompañamos en el crecimiento continuo.",
        icon: Rocket,
        color: "text-emerald-500",
        bgColor: "bg-emerald-500/10"
    }
];

export const Process = () => {
    return (
        <section id="proceso" className="py-24 relative px-6">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-4"
                    >
                        Metodología Open View
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-4xl md:text-5xl font-heading font-bold text-white"
                    >
                        Cómo lo <span className="text-gradient">hacemos realidad.</span>
                    </motion.h2>
                </div>

                <div className="relative">
                    {/* Timeline Line (Desktop) */}
                    <div className="hidden lg:block absolute top-[44px] left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 relative z-10">
                        {steps.map((step, index) => (
                            <motion.div
                                key={step.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.15 }}
                                className="flex flex-col items-center lg:items-start text-center lg:text-left"
                            >
                                <div className="relative mb-8">
                                    <div className={cn("w-20 h-20 rounded-3xl flex items-center justify-center relative transition-transform duration-500 hover:rotate-6", step.bgColor)}>
                                        <step.icon className={cn("w-10 h-10", step.color)} />

                                        {/* Step Number Badge */}
                                        <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-black border border-white/20 flex items-center justify-center text-xs font-bold text-white">
                                            0{index + 1}
                                        </div>
                                    </div>

                                    {/* Decorative Glow */}
                                    <div className={cn("absolute inset-0 blur-2xl opacity-20 -z-10", step.bgColor)} />
                                </div>

                                <h3 className="text-xl font-bold text-white mb-4">
                                    {step.title}
                                </h3>

                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    {step.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

// Helper function locally if needed
function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(" ");
}
