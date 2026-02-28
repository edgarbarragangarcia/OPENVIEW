"use client";

import React from "react";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";

const projects = [
    {
        title: "APEG Golf",
        category: "Plataforma Pro",
        description: "Sistema de gestión integral para la Asociación de Profesionales de Golf de Colombia.",
        tags: ["Next.js", "Dashboard", "Fintech"]
    },
    {
        title: "Monitor Regina",
        category: "Inteligencia Artificial",
        description: "Plataforma de monitoreo y análisis automatizado para el sector educativo.",
        tags: ["AI", "Real-time", "Node.js"]
    },
    {
        title: "KREO Dashboard",
        category: "Marketing Digital",
        description: "Herramienta de visualización de datos y optimización de pauta para agencias.",
        tags: ["Data Viz", "APIs", "Cloud"]
    }
];

export const Portfolio = () => {
    return (
        <section id="portafolio" className="pt-0 pb-32 relative px-6 bg-transparent -mt-[35vh] md:-mt-[40vh]">
            <div className="max-w-7xl mx-auto mb-12 text-center">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight"
                >
                    Proyectos Seleccionados. <br />
                    <span className="text-white/40">Calidad sobre cantidad.</span>
                </motion.h2>
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
                {projects.map((project, index) => (
                    <motion.div
                        key={project.title}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: index * 0.1 }}
                        className="group cursor-pointer"
                    >
                        <div className="aspect-[16/10] bg-[#1d1d1f] rounded-[2.5rem] p-12 flex flex-col justify-between overflow-hidden relative border border-white/5 transition-transform duration-700 hover:scale-[1.02]">
                            <div>
                                <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/30 mb-6 block">
                                    {project.category}
                                </span>
                                <h3 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
                                    {project.title}
                                </h3>
                                <p className="text-white/50 text-base max-w-sm leading-relaxed">
                                    {project.description}
                                </p>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex gap-4">
                                    {project.tags.map(tag => (
                                        <span key={tag} className="text-[10px] text-white/20 font-medium">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                <ExternalLink className="w-6 h-6 text-white/10 group-hover:text-white transition-colors" />
                            </div>

                            {/* Subtle Ambient Glow */}
                            <div className="absolute -bottom-1/2 -right-1/4 w-full h-full bg-white/[0.02] blur-[100px] rounded-full" />
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};
