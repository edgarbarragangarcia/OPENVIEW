"use client";

import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
    AppWindow,
    Settings2,
    Cloud,
    Lightbulb,
    ShieldAlert,
    BarChart,
    Laptop,
    Database,
    BrainCircuit,
    Network,
    Leaf,
    Server,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const services = [
    {
        title: "Application Services",
        description: "Diseño y desarrollo de aplicaciones de próxima generación, centradas en el usuario y escalables.",
        icon: AppWindow,
        tech: ["Legacy Modernization", "Custom App Dev"],
        shade: "sapphire"
    },
    {
        title: "Business Process Services",
        description: "Optimización y automatización de flujos de trabajo críticos.",
        icon: Settings2,
        tech: ["Automation", "RPA"],
        shade: "slate"
    },
    {
        title: "Cloud",
        description: "Aceleramos la transformación digital con arquitecturas de nube híbrida.",
        icon: Cloud,
        tech: ["Azure", "AWS"],
        shade: "silver"
    },
    {
        title: "Consulting",
        description: "Estrategias tecnológicas visionarias que conectan con los objetivos de negocio.",
        icon: Lightbulb,
        tech: ["Digital Strategy", "IT Roadmaps"],
        shade: "gold"
    },
    {
        title: "Cybersecurity",
        description: "Protección integral de activos digitales en un entorno de amenazas.",
        icon: ShieldAlert,
        tech: ["Zero Trust", "Managed Security"],
        shade: "ruby"
    },
    {
        title: "Data and Analytics",
        description: "Convertimos datos crudos en inteligencia accionable.",
        icon: BarChart,
        tech: ["Big Data", "BI"],
        shade: "emerald"
    },
    {
        title: "Digital Workplace",
        description: "Habilitamos la colaboración moderna con entornos fluidos.",
        icon: Laptop,
        tech: ["Remote", "UCaaS"],
        shade: "amethyst"
    },
    {
        title: "Enterprise Application Platforms",
        description: "Implementación y optimización de plataformas SAP y Salesforce.",
        icon: Database,
        tech: ["ERP", "CRM"],
        shade: "copper"
    },
    {
        title: "Generative AI",
        description: "Potenciamos la innovación con modelos de IA personalizados.",
        icon: BrainCircuit,
        tech: ["LLMs", "Copilots"],
        shade: "titanium"
    },
    {
        title: "Enterprise Networking",
        description: "Conectividad robusta y segura a escala global.",
        icon: Network,
        tech: ["SD-WAN", "5G"],
        shade: "sapphire"
    },
    {
        title: "Sustainability Services",
        description: "Tecnología diseñada para cumplir con objetivos ambientales.",
        icon: Leaf,
        tech: ["Green IT", "Carbon"],
        shade: "emerald"
    },
    {
        title: "Infrastructure Solutions",
        description: "Sistemas de alto rendimiento para demandas críticas.",
        icon: Server,
        tech: ["Data Center", "Storage"],
        shade: "slate"
    }
];

const ServiceCard = ({ service }: { service: any }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateY,
                rotateX,
                transformStyle: "preserve-3d",
            }}
            className={cn(
                "relative h-[380px] w-[280px] shrink-0 rounded-[2rem] p-8 metallic-card border border-white/10 group cursor-grab active:cursor-grabbing overflow-hidden",
                service.shade
            )}
        >
            <div style={{ transform: "translateZ(50px)" }} className="flex flex-col h-full items-center text-center">
                <div className="mb-6 p-4 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
                    <service.icon className="w-8 h-8 text-white transition-transform duration-500 group-hover:scale-110" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 tracking-tight">
                    {service.title}
                </h3>
                <p className="text-white/60 text-xs leading-relaxed mb-6 flex-grow font-medium">
                    {service.description}
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                    {service.tech.map((t: string) => (
                        <span key={t} className="text-[8px] uppercase tracking-[0.15em] text-white/30 font-bold px-2 py-1 rounded bg-white/5">
                            {t}
                        </span>
                    ))}
                </div>
            </div>

            {/* Reflection Effect */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-white/5 to-transparent" />
        </motion.div>
    );
};

export const Services = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: "left" | "right") => {
        if (containerRef.current) {
            const { scrollLeft, clientWidth } = containerRef.current;
            const scrollTo = direction === "left" ? scrollLeft - 300 : scrollLeft + 300;
            containerRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
        }
    };

    return (
        <section id="servicios" className="py-32 relative overflow-hidden bg-black">
            <div className="max-w-7xl mx-auto px-6 mb-20 flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <motion.h2
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tighter"
                    >
                        Soluciones <span className="text-white/40">Globales.</span>
                    </motion.h2>
                    <p className="text-white/50 max-w-md">Explora nuestra oferta integral de servicios diseñados para la era digital.</p>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={() => scroll("left")}
                        className="p-4 rounded-full border border-white/10 hover:bg-white/5 transition-colors text-white"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button
                        onClick={() => scroll("right")}
                        className="p-4 rounded-full border border-white/10 hover:bg-white/5 transition-colors text-white"
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>
            </div>

            {/* Carousel Container */}
            <div
                ref={containerRef}
                className="flex gap-8 px-6 md:px-[calc((100vw-min(1280px,94vw))/2)] overflow-x-auto no-scrollbar pb-12 snap-x snap-mandatory"
                style={{ scrollbarWidth: 'none' }}
            >
                {services.map((service, index) => (
                    <div key={service.title} className="snap-center first:pl-0 last:pr-6">
                        <ServiceCard service={service} />
                    </div>
                ))}
            </div>

            {/* Custom Styles for hiding scrollbar */}
            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </section>
    );
};
