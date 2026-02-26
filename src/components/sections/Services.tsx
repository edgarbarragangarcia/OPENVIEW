"use client";

import React from "react";
import {
    motion,
    useAnimationFrame,
    useMotionValue,
    useTransform,
    useMotionTemplate
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
    { title: "Application Services", icon: AppWindow, shade: "sapphire" },
    { title: "Business Process", icon: Settings2, shade: "slate" },
    { title: "Cloud", icon: Cloud, shade: "silver" },
    { title: "Consulting", icon: Lightbulb, shade: "gold" },
    { title: "Cybersecurity", icon: ShieldAlert, shade: "ruby" },
    { title: "Data & Analytics", icon: BarChart, shade: "emerald" },
    { title: "Digital Workplace", icon: Laptop, shade: "amethyst" },
    { title: "Platforms", icon: Database, shade: "copper" },
    { title: "Generative AI", icon: BrainCircuit, shade: "titanium" },
    { title: "Networking", icon: Network, shade: "sapphire" },
    { title: "Sustainability", icon: Leaf, shade: "emerald" },
    { title: "Infrastructure", icon: Server, shade: "slate" }
];

const RADIUS = 700; // Orbit radius - slightly smaller to keep it in view

const SphereCard = ({ service, index, total, rotation }: { service: any; index: number; total: number; rotation: any }) => {
    const angle = (index / total) * Math.PI * 2;

    // Calculate 3D position
    const x = useTransform(rotation, (r: number) => Math.sin(angle + r) * RADIUS);
    const z = useTransform(rotation, (r: number) => Math.cos(angle + r) * RADIUS);

    // Multi-dimensional scaling and opacity based on Z-depth
    const opacity = useTransform(z, [-RADIUS, 0, RADIUS], [0.1, 0.4, 1]);
    const scale = useTransform(z, [-RADIUS, RADIUS], [0.6, 1.1]);
    const blurValue = useTransform(z, [-RADIUS, 0, RADIUS], [8, 2, 0]);
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
                marginLeft: "-100px",
                marginTop: "-110px",
            }}
            className={cn(
                "h-[220px] w-[200px] rounded-[2rem] p-6 metallic-card border border-white/10 flex flex-col items-center justify-center text-center",
                service.shade
            )}
        >
            <div className="relative z-20">
                <div className="mb-4 p-3 rounded-full bg-white/5 inline-block">
                    <service.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-sm font-bold text-white tracking-tight leading-tight">
                    {service.title}
                </h3>
            </div>
            {/* Reflection */}
            <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-br from-white/10 to-transparent opacity-50" />
        </motion.div>
    );
};

export const Services = () => {
    const rotation = useMotionValue(0);

    useAnimationFrame((time, delta) => {
        rotation.set(rotation.get() + delta * 0.0004); // Constant smooth rotation
    });

    return (
        <section id="servicios" className="relative h-[1000px] overflow-hidden bg-transparent -mt-[45vh] md:-mt-[55vh] pointer-events-none">
            {/* Background Atmosphere */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.03)_0%,_transparent_70%)]" />

            <div className="max-w-7xl mx-auto px-6 pt-[20vh] text-center relative z-50">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-4xl md:text-6xl font-bold text-white tracking-tighter"
                >
                    Ecosistema de <span className="text-white/40">Servicios.</span>
                </motion.h2>
            </div>

            {/* Sphere Scene */}
            <div className="absolute inset-x-0 bottom-0 top-[200px] perspective-[2500px] flex items-center justify-center scale-75 md:scale-100">
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

            {/* Atmosphere gradients for depth isolation */}
            <div className="absolute inset-x-0 bottom-0 h-[200px] bg-gradient-to-t from-black to-transparent z-40" />
        </section>
    );
};
