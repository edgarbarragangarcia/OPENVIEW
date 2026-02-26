"use client";

import React, { useRef, useState } from "react";
import {
    motion,
    useAnimationFrame,
    useMotionValue,
    useTransform,
    useMotionTemplate,
    MotionValue
} from "framer-motion";
import {
    SiNextdotjs,
    SiSalesforce,
    SiAmazon,
    SiCloudflare,
    SiSnowflake,
    SiSlack,
    SiSap,
    SiOpenai,
    SiCisco,
    SiDocker
} from "react-icons/si";
import { Leaf, Layout, Monitor, ShieldCheck, Database, BrainCircuit, Network, Server, Settings2, Cloud, AppWindow } from "lucide-react";
import { cn } from "@/lib/utils";

const services = [
    {
        title: "Application Services",
        description: "Diseño y desarrollo de apps de próxima generación con Next.js y React.",
        icon: SiNextdotjs,
        shade: "sapphire"
    },
    {
        title: "Business Process",
        description: "Optimización y automatización con Salesforce y soluciones CRM.",
        icon: SiSalesforce,
        shade: "slate"
    },
    {
        title: "Cloud",
        description: "Infraestructura escalable y segura potenciada por AWS.",
        icon: SiAmazon,
        shade: "silver"
    },
    {
        title: "Consulting",
        description: "Estrategias de transformación digital con el ecosistema moderno.",
        icon: Layout,
        shade: "gold"
    },
    {
        title: "Cybersecurity",
        description: "Protección integral de red y datos con Cloudflare Zero Trust.",
        icon: SiCloudflare,
        shade: "ruby"
    },
    {
        title: "Data & Analytics",
        description: "Inteligencia de datos avanzada con Snowflake y Big Data.",
        icon: SiSnowflake,
        shade: "emerald"
    },
    {
        title: "Digital Workplace",
        description: "Entornos de colaboración fluidos integrando Slack y Teams.",
        icon: SiSlack,
        shade: "amethyst"
    },
    {
        title: "Platforms",
        description: "Implementación y consultoría experta en ERP con SAP.",
        icon: SiSap,
        shade: "copper"
    },
    {
        title: "Generative AI",
        description: "Innovación exponencial con modelos de OpenAI y LLMs.",
        icon: SiOpenai,
        shade: "titanium"
    },
    {
        title: "Networking",
        description: "Conectividad robusta y segura con tecnología Cisco.",
        icon: SiCisco,
        shade: "sapphire"
    },
    {
        title: "Sustainability",
        description: "Tecnología para objetivos ambientales y reportes ESG.",
        icon: Leaf,
        shade: "emerald"
    },
    {
        title: "Infrastructure",
        description: "Modernización de sistemas mediante contenedores Docker.",
        icon: SiDocker,
        shade: "slate"
    }
];

const RADIUS = 520; // Even tighter grouping for a dense ecosystem feel

const SphereCard = ({ service, index, total, rotation }: { service: any; index: number; total: number; rotation: MotionValue<number> }) => {
    const angle = (index / total) * Math.PI * 2;

    // Calculate 3D position
    const x = useTransform(rotation, (r: number) => Math.sin(angle + r) * RADIUS);
    const z = useTransform(rotation, (r: number) => Math.cos(angle + r) * RADIUS);

    const opacity = useTransform(z, [-RADIUS, 0, RADIUS], [0.03, 0.2, 1]);
    const scale = useTransform(z, [-RADIUS, RADIUS], [0.5, 1.3]);
    const blurValue = useTransform(z, [-RADIUS, 0, RADIUS], [20, 4, 0]);
    const blur = useMotionTemplate`blur(${blurValue}px)`;

    return (
        <motion.div
            style={{
                x,
                z,
                opacity,
                scale,
                filter: blur,
                transformStyle: "preserve-3d",
                position: "absolute",
                left: "50%",
                top: "50%",
                marginLeft: "-120px",
                marginTop: "-150px",
            }}
            className={cn(
                "h-[300px] w-[240px] rounded-[3rem] p-10 metallic-card border border-white/5 flex flex-col items-center justify-center text-center",
                service.shade
            )}
        >
            <div className="relative z-20 flex flex-col items-center h-full justify-center">
                <div className="mb-6 p-5 rounded-full bg-white/5 flex items-center justify-center">
                    {service.icon && <service.icon size={48} className="text-white" />}
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight leading-none mb-4">
                    {service.title}
                </h3>
                <p className="text-[12px] text-white/40 leading-relaxed font-medium">
                    {service.description}
                </p>
            </div>
            <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-br from-white/10 to-transparent opacity-30" />
        </motion.div>
    );
};

export const Services = () => {
    const rotation = useMotionValue(0);
    const [isDragging, setIsDragging] = useState(false);
    const lastX = useRef(0);
    const autoRotateSpeed = useRef(0.0001);
    const dragFactor = 0.005;

    useAnimationFrame((time, delta) => {
        if (!isDragging) {
            rotation.set(rotation.get() + delta * autoRotateSpeed.current);
        }
    });

    const handlePointerDown = (e: React.PointerEvent) => {
        setIsDragging(true);
        lastX.current = e.clientX;
    };

    const handlePointerUp = () => setIsDragging(false);

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging) return;
        const deltaX = e.clientX - lastX.current;
        lastX.current = e.clientX;
        rotation.set(rotation.get() + deltaX * dragFactor);
        if (Math.abs(deltaX) > 2) {
            autoRotateSpeed.current = deltaX > 0 ? 0.0001 : -0.0001;
        }
    };

    return (
        <section
            id="servicios"
            className="relative h-[1100px] overflow-visible bg-transparent -mt-[40vh] md:-mt-[50vh] border-none outline-none select-none"
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onPointerMove={handlePointerMove}
            style={{ touchAction: "none", cursor: isDragging ? "grabbing" : "grab" }}
        >
            {/* Header with padding */}
            <div className="max-w-7xl mx-auto px-6 pt-[12vh] mb-[150px] text-center relative z-50 pointer-events-none">
                <motion.h2
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-6xl md:text-9xl font-bold text-white tracking-tighter"
                >
                    Ecosistema de <br />
                    <span className="text-white/20">Nuestros Servicios.</span>
                </motion.h2>
            </div>

            {/* 3D Sphere Scene - Adjusted push to respect the title padding */}
            <div className="absolute inset-0 perspective-[4000px] flex items-center justify-center pt-[180px]">
                <div
                    className="relative w-full h-full flex items-center justify-center transform-gpu"
                    style={{ transformStyle: "preserve-3d" }}
                >
                    {services.map((service, index) => (
                        <SphereCard
                            key={service.title}
                            service={service}
                            index={index}
                            total={services.length}
                            rotation={rotation}
                        />
                    ))}
                </div>
            </div>

            <div className="absolute inset-x-0 bottom-0 h-[400px] bg-gradient-to-t from-black via-black/40 to-transparent z-40 pointer-events-none" />
        </section>
    );
};
