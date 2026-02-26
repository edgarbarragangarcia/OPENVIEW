"use client";

import React from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";

interface ShatterImageProps {
    src: string;
}

const fragments = [
    { path: "polygon(0% 0%, 45% 0%, 35% 45%, 0% 30%)", move: [-350, -320, -45] },
    { path: "polygon(45% 0%, 100% 0%, 100% 40%, 60% 45%, 35% 45%)", move: [360, -340, 55] },
    { path: "polygon(0% 30%, 35% 45%, 45% 100%, 0% 100%)", move: [-340, 360, 35] },
    { path: "polygon(60% 45%, 100% 40%, 100% 100%, 75% 100%, 50% 70%)", move: [380, 330, -50] },
    { path: "polygon(35% 45%, 60% 45%, 50% 70%, 45% 100%)", move: [0, 480, 25] },
    { path: "polygon(40% 10%, 60% 10%, 55% 40%, 35% 45%)", move: [50, -480, 20], scale: 1.4 },
];

const Fragment = ({ frag, scrollYProgress, src }: { frag: typeof fragments[0], scrollYProgress: MotionValue<number>, src: string }) => {
    const x = useTransform(scrollYProgress, [0, 0.4], [0, frag.move[0]]);
    const y = useTransform(scrollYProgress, [0, 0.4], [0, frag.move[1]]);
    const rotate = useTransform(scrollYProgress, [0, 0.4], [0, frag.move[2]]);
    const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
    const scale = useTransform(scrollYProgress, [0, 0.4], [1, (frag as any).scale || 1.1]);

    return (
        <motion.div
            style={{
                clipPath: frag.path,
                x,
                y,
                rotate,
                opacity,
                scale,
                backgroundImage: `url(${src})`,
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}
            className="absolute inset-0 bg-contain bg-no-repeat bg-center"
        />
    );
};

export const ShatterImage: React.FC<ShatterImageProps> = ({ src }) => {
    const { scrollYProgress } = useScroll();

    return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
            <div className="relative w-full h-full max-w-7xl max-h-7xl aspect-square">
                {fragments.map((frag, i) => (
                    <Fragment
                        key={i}
                        frag={frag}
                        scrollYProgress={scrollYProgress}
                        src={src}
                    />
                ))}
            </div>
        </div>
    );
};
