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
    SiSnowflake,
    SiSlack,
    SiOpenai
} from "react-icons/si";
import { Layout, Monitor, BrainCircuit, Settings2, AppWindow, Rocket, Palette, Zap, Megaphone } from "lucide-react";
import { cn } from "../../lib/utils";

const services = [
    {
        title: "Product Engineering",
        description: "Construcción de productos digitales escalables con tecnologías de vanguardia.",
        icon: SiNextdotjs,
        shade: "sapphire"
    },
    {
        title: "Strategy & UX",
        description: "Diseño de experiencias centradas en el usuario y rutas estratégicas de innovación.",
        icon: Palette,
        shade: "gold"
    },
    {
        title: "Generative AI",
        description: "Soluciones disruptivas con IA generativa para transformar operaciones de negocio.",
        icon: SiOpenai,
        shade: "titanium"
    },
    {
        title: "Digital Strategy",
        description: "Hoja de ruta para la transformación y competitividad en la era digital.",
        icon: Rocket,
        shade: "silver"
    },
    {
        title: "Business Process",
        description: "Optimización de flujos de trabajo con ecosistemas CRM modernos como Salesforce.",
        icon: SiSalesforce,
        shade: "slate"
    },
    {
        title: "Data Intelligence",
        description: "Analítica avanzada y Big Data para decisiones basadas en el conocimiento.",
        icon: SiSnowflake,
        shade: "emerald"
    },
    {
        title: "Growth Acceleration",
        description: "Estrategias digitales de alto impacto para escalar el alcance y mercado.",
        icon: Zap,
        shade: "ruby"
    },
    {
        title: "E-commerce Tech",
        description: "Plataformas de comercio digital optimizadas para conversión y escala.",
        icon: AppWindow,
        shade: "amethyst"
    },
    {
        title: "Enterprise Solutions",
        description: "Ecosistemas de colaboración y plataformas corporativas integradas.",
        icon: SiSlack,
        shade: "copper"
    }
];

const SphereCard = ({ service, index, total, rotation }: { service: any; index: number; total: number; rotation: MotionValue<number> }) => {
    const angle = (index / total) * Math.PI * 2;

    // Responsive sizing
    const [dimensions, setDimensions] = useState({ radius: 520, cardW: 240, cardH: 300 });

    React.useEffect(() => {
        const updateDimensions = () => {
            const isMobile = window.innerWidth < 768;
            setDimensions({
                radius: isMobile ? 320 : 520,
                cardW: isMobile ? 180 : 240,
                cardH: isMobile ? 240 : 300
            });
        };
        updateDimensions();
        window.addEventListener("resize", updateDimensions);
        return () => window.removeEventListener("resize", updateDimensions);
    }, []);

    const { radius, cardW, cardH } = dimensions;

    // Calculate 3D position
    const x = useTransform(rotation, (r: number) => Math.sin(angle + r) * radius);
    const z = useTransform(rotation, (r: number) => Math.cos(angle + r) * radius);

    const opacity = useTransform(z, [-radius, 0, radius], [0.03, 0.2, 1]);
    const scale = useTransform(z, [-radius, radius], [0.5, 1.3]);
    const blurValue = useTransform(z, [-radius, 0, radius], [15, 4, 0]);
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
                marginLeft: `-${cardW / 2}px`,
                marginTop: `-${cardH / 2}px`,
                width: cardW,
                height: cardH,
            }}
            className={cn(
                "rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 metallic-card border border-white/5 flex flex-col items-center justify-center text-center transform-gpu",
                service.shade
            )}
        >
            <div className="relative z-20 flex flex-col items-center h-full justify-center">
                <div className="mb-4 md:mb-6 p-3 md:p-5 rounded-full bg-white/5 flex items-center justify-center">
                    {service.icon && <service.icon className="text-white w-8 h-8 md:w-12 md:h-12" />}
                </div>
                <h3 className="text-lg md:text-xl font-bold text-white tracking-tight leading-none mb-3 md:mb-4">
                    {service.title}
                </h3>
                <p className="text-[10px] md:text-[12px] text-white/40 leading-relaxed font-medium">
                    {service.description}
                </p>
            </div>
            <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-br from-white/10 to-transparent opacity-30" />
        </motion.div>
    );
};

export const Services = () => {
    const rotation = useMotionValue(0);
    const [isMounted, setIsMounted] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const lastX = useRef(0);
    const autoRotateSpeed = useRef(0.0001);
    const dragFactor = 0.005;

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    useAnimationFrame((time, delta) => {
        if (!isDragging && isMounted) {
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

    // Hide during hydration to prevent coordinate mismatch
    if (!isMounted) return <div className="h-[500px]" />;

    return (
        <section
            id="servicios"
            className="relative h-[800px] md:h-[1100px] overflow-visible bg-transparent -mt-[15vh] md:-mt-[45vh] border-none outline-none select-none"
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onPointerMove={handlePointerMove}
            style={{ touchAction: "none", cursor: isDragging ? "grabbing" : "grab" }}
        >
            <div className="max-w-7xl mx-auto px-6 pt-[10vh] md:pt-[5vh] mb-[20px] md:mb-[40px] text-center relative z-50 pointer-events-none">
                <motion.h2
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-4xl sm:text-5xl md:text-7xl font-bold text-white tracking-tighter"
                >
                    Ecosistema de <br className="md:hidden" />
                    <span className="text-white/20"> Nuestros Servicios.</span>
                </motion.h2>
            </div>

            <div className="absolute inset-0 perspective-[2000px] md:perspective-[4000px] flex items-center justify-center pt-20 md:pt-0 overflow-hidden">
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

            <div className="absolute inset-x-0 bottom-0 h-[300px] bg-gradient-to-t from-black via-black/20 to-transparent z-40 pointer-events-none" />
        </section>
    );
};
