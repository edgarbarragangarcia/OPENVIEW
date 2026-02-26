"use client";

import React from "react";
import { motion } from "framer-motion";
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
    Server
} from "lucide-react";
import { cn } from "@/lib/utils";

const services = [
    {
        title: "Application Services",
        description: "Diseño y desarrollo de aplicaciones de próxima generación, centradas en el usuario y escalables.",
        icon: AppWindow,
        tech: ["Legacy Modernization", "Custom App Dev", "Mobile"],
        shade: "sapphire"
    },
    {
        title: "Business Process Services",
        description: "Optimización y automatización de flujos de trabajo críticos para maximizar la eficiencia operativa.",
        icon: Settings2,
        tech: ["Automation", "RPA", "BPO"],
        shade: "slate"
    },
    {
        title: "Cloud",
        description: "Aceleramos la transformación digital con arquitecturas de nube híbrida y nativa altamente seguras.",
        icon: Cloud,
        tech: ["Azure", "AWS", "Google Cloud"],
        shade: "silver"
    },
    {
        title: "Consulting",
        description: "Estrategias tecnológicas visionarias que conectan la ingeniería con los objetivos de negocio.",
        icon: Lightbulb,
        tech: ["Digital Strategy", "IT Roadmaps", "Advisory"],
        shade: "gold"
    },
    {
        title: "Cybersecurity",
        description: "Protección integral de activos digitales y datos sensibles en un entorno de amenazas en evolución.",
        icon: ShieldAlert,
        tech: ["Zero Trust", "Identity", "Managed Security"],
        shade: "ruby"
    },
    {
        title: "Data and Analytics",
        description: "Convertimos datos crudos en inteligencia accionable mediante analítica avanzada y visualización.",
        icon: BarChart,
        tech: ["Big Data", "BI", "Predictive Analytics"],
        shade: "emerald"
    },
    {
        title: "Digital Workplace",
        description: "Habilitamos la colaboración moderna con entornos de trabajo digitales seguros y fluidos.",
        icon: Laptop,
        tech: ["Remote Work", "UCaaS", "Employee Experience"],
        shade: "amethyst"
    },
    {
        title: "Enterprise Application Platforms",
        description: "Implementación y optimización de plataformas críticas como SAP, Salesforce y Microsoft Dynamics.",
        icon: Database,
        tech: ["ERP", "CRM", "Low-Code/No-Code"],
        shade: "copper"
    },
    {
        title: "Generative AI",
        description: "Potenciamos la innovación con modelos de IA generativa personalizados para resolver problemas reales.",
        icon: BrainCircuit,
        tech: ["LLMs", "Custom Copilots", "AI Transformation"],
        shade: "titanium"
    },
    {
        title: "Enterprise Networking",
        description: "Conectividad robusta y segura que sustenta las operaciones empresariales a escala global.",
        icon: Network,
        tech: ["SD-WAN", "Private 5G", "Network Security"],
        shade: "sapphire"
    },
    {
        title: "Sustainability Services",
        description: "Tecnología diseñada para cumplir con los objetivos ambientales y de responsabilidad social (ESG).",
        icon: Leaf,
        tech: ["Green IT", "Carbon Tracking", "Circular Economy"],
        shade: "emerald"
    },
    {
        title: "Infrastructure Solutions",
        description: "Sistemas y hardware de alto rendimiento para soportar las demandas computacionales más críticas.",
        icon: Server,
        tech: ["Data Center", "Edge Computing", "Storage"],
        shade: "titanium"
    }
];

export const Services = () => {
    return (
        <section id="servicios" className="py-32 relative px-6 overflow-hidden bg-black">
            <div className="max-w-7xl mx-auto text-center mb-32">
                <motion.h2
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight"
                >
                    Soluciones Globales <br />
                    <span className="text-white/40">Nuestra Oferta de Servicios.</span>
                </motion.h2>
            </div>

            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services.map((service, index) => (
                        <motion.div
                            key={service.title}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.8, delay: (index % 3) * 0.1 }}
                            className={cn(
                                "apple-card p-10 flex flex-col items-center text-center group metallic-card",
                                service.shade
                            )}
                        >
                            <div className="mb-6 p-4 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
                                <service.icon className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">
                                {service.title}
                            </h3>
                            <p className="text-white/80 text-sm leading-relaxed mb-8 flex-grow font-medium">
                                {service.description}
                            </p>
                            <div className="flex flex-wrap justify-center gap-3">
                                {service.tech.map((t) => (
                                    <span key={t} className="text-[9px] uppercase tracking-[0.2em] text-white/40 font-bold">
                                        {t}
                                    </span>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
