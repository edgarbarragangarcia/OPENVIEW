"use client";

import React from "react";
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
    Server
} from "lucide-react";
import { cn } from "@/lib/utils";

const services = [
    {
        title: "Application Services",
        icon: AppWindow,
        shade: "sapphire"
    },
    {
        title: "Business Process Services",
        icon: Settings2,
        shade: "slate"
    },
    {
        title: "Cloud",
        icon: Cloud,
        shade: "silver"
    },
    {
        title: "Consulting",
        icon: Lightbulb,
        shade: "gold"
    },
    {
        title: "Cybersecurity",
        icon: ShieldAlert,
        shade: "ruby"
    },
    {
        title: "Data and Analytics",
        icon: BarChart,
        shade: "emerald"
    },
    {
        title: "Digital Workplace",
        icon: Laptop,
        shade: "amethyst"
    },
    {
        title: "Enterprise Platforms",
        icon: Database,
        shade: "copper"
    },
    {
        title: "Generative AI",
        icon: BrainCircuit,
        shade: "titanium"
    },
    {
        title: "Enterprise Networking",
        icon: Network,
        shade: "sapphire"
    },
    {
        title: "Sustainability",
        icon: Leaf,
        shade: "emerald"
    },
    {
        title: "Infrastructure",
        icon: Server,
        shade: "slate"
    }
];

const RotatingCard = ({ service, index }: { service: any; index: number }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        x.set(mouseX / width - 0.5);
        y.set(mouseY / height - 0.5);
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
                "relative h-[220px] w-[200px] shrink-0 rounded-[2rem] p-6 metallic-card border border-white/10 group flex flex-col items-center justify-center text-center overflow-hidden",
                service.shade
            )}
        >
            <div style={{ transform: "translateZ(30px)" }} className="relative z-20">
                <div className="mb-4 p-3 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors inline-block">
                    <service.icon className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-sm font-bold text-white tracking-tight leading-tight">
                    {service.title}
                </h3>
            </div>
            {/* Reflection */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-white/10 to-transparent" />
        </motion.div>
    );
};

export const Services = () => {
    // Duplicate services for seamless loop
    const loopedServices = [...services, ...services, ...services];

    return (
        <section id="servicios" className="py-32 relative overflow-hidden bg-black">
            <div className="max-w-7xl mx-auto px-6 mb-16 text-center">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-4xl md:text-6xl font-bold text-white tracking-tighter"
                >
                    Ecosistema de <span className="text-white/40">Servicios.</span>
                </motion.h2>
            </div>

            {/* Orbiting Carousel Container */}
            <div className="relative flex items-center">
                <motion.div
                    animate={{
                        x: [0, -200 * services.length - 32 * services.length], // Width of icons + gap
                    }}
                    transition={{
                        x: {
                            repeat: Infinity,
                            repeatType: "loop",
                            duration: 40,
                            ease: "linear",
                        },
                    }}
                    className="flex gap-8 hover:[animation-play-state:paused]"
                >
                    {loopedServices.map((service, index) => (
                        <RotatingCard key={`${service.title}-${index}`} service={service} index={index} />
                    ))}
                </motion.div>

                {/* Fade edges */}
                <div className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-black to-transparent z-30 pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-black to-transparent z-30 pointer-events-none" />
            </div>

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
