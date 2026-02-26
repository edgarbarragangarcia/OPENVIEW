"use client";

import React, { useRef, useState, useEffect } from "react";
import {
    motion,
    useAnimationFrame,
    useMotionValue,
    useTransform,
    useMotionTemplate,
    MotionValue
} from "framer-motion";
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
    { title: "Application Services", description: "Diseño y desarrollo de apps de próxima generación.", icon: AppWindow, shade: "sapphire" },
    { title: "Business Process", description: "Optimización y automatización de procesos críticos.", icon: Settings2, shade: "slate" },
    { title: "Cloud", description: "Transformación digital con arquitecturas híbridas.", icon: Cloud, shade: "silver" },
    { title: "Consulting", description: "Estrategias tecnológicas que conectan con el negocio.", icon: Lightbulb, shade: "gold" },
    { title: "Cybersecurity", description: "Protección integral de activos digitales.", icon: ShieldAlert, shade: "ruby" },
    { title: "Data & Analytics", description: "Inteligencia accionable mediante analítica avanzada.", icon: BarChart, shade: "emerald" },
    { title: "Digital Workplace", description: "Entornos de trabajo modernos y fluidos.", icon: Laptop, shade: "amethyst" },
    { title: "Platforms", description: "Optimización de plataformas SAP y Salesforce.", icon: Database, shade: "copper" },
    { title: "Generative AI", description: "Innovación con modelos de IA personalizados.", icon: BrainCircuit, shade: "titanium" },
    { title: "Networking", description: "Conectividad robusta a escala global.", icon: Network, shade: "sapphire" },
    { title: "Sustainability", description: "Tecnología para objetivos ambientales ESG.", icon: Leaf, shade: "emerald" },
    { title: "Infrastructure", description: "Sistemas de alto rendimiento para demandas tecnológicas.", icon: Server, shade: "slate" }
];

const RADIUS = 500; // Much closer cards

const SphereCard = ({ service, index, total, rotation }: { service: any; index: number; total: number; rotation: MotionValue<number> }) => {
    const angle = (index / total) * Math.PI * 2;

    // Calculate 3D position
    const x = useTransform(rotation, (r: number) => Math.sin(angle + r) * RADIUS);
    const z = useTransform(rotation, (r: number) => Math.cos(angle + r) * RADIUS);

    // Dynamic effects based on Z-depth
    const opacity = useTransform(z, [-RADIUS, 0, RADIUS], [0.05, 0.3, 1]);
    const scale = useTransform(z, [-RADIUS, RADIUS], [0.6, 1.3]);
    const blurValue = useTransform(z, [-RADIUS, 0, RADIUS], [15, 3, 0]);
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
                <div className="mb-6 p-4 rounded-full bg-white/5 inline-block">
                    <service.icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight leading-none mb-4">
                    {service.title}
                </h3>
                <p className="text-[12px] text-white/40 leading-relaxed font-medium">
                    {service.description}
                </p>
            </div>
            {/* Glossy reflection layer */}
            <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-br from-white/10 to-transparent opacity-30" />
        </motion.div>
    );
};

export const Services = () => {
    const rotation = useMotionValue(0);
    const [isDragging, setIsDragging] = useState(false);
    const lastX = useRef(0);
    const autoRotateSpeed = useRef(0.0001); // Even slower for elegance
    const dragFactor = 0.005;

    // Automatic smooth orbit
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

        // Direct control of rotation
        rotation.set(rotation.get() + deltaX * dragFactor);

        // Reverse auto-rotate direction based on drag
        if (Math.abs(deltaX) > 2) {
            autoRotateSpeed.current = deltaX > 0 ? 0.0001 : -0.0001;
        }
    };

    return (
        <section
            id="servicios"
            className="relative h-[1100px] overflow-visible bg-transparent -mt-[48vh] md:-mt-[58vh] border-none outline-none select-none"
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onPointerMove={handlePointerMove}
            style={{ touchAction: "none", cursor: isDragging ? "grabbing" : "grab" }}
        >
            {/* Blending layers to eliminate any visible split line */}
            <div className="absolute inset-0 bg-transparent pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 pt-[20vh] text-center relative z-50 pointer-events-none">
                <motion.h2
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-5xl md:text-8xl font-bold text-white tracking-tighter"
                >
                    Ecosistema de <br />
                    <span className="text-white/20">Nuestros Servicios.</span>
                </motion.h2>
            </div>

            {/* 3D Sphere Scene */}
            <div className="absolute inset-0 perspective-[4000px] flex items-center justify-center">
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

            {/* Bottom shadow blend */}
            <div className="absolute inset-x-0 bottom-0 h-[400px] bg-gradient-to-t from-black via-black/40 to-transparent z-40 pointer-events-none" />
        </section>
    );
};
