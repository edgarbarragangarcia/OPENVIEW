"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Quote } from "lucide-react";

const testimonials = [
    {
        name: "Camilo Sánchez",
        role: "Presidente",
        company: "APEG Golf",
        text: "Open View transformó por completo nuestra gestión administrativa. Su capacidad técnica y diseño elegante superó nuestras expectativas.",
        image: "https://i.pravatar.cc/150?u=camilo"
    },
    {
        name: "Marta Rodríguez",
        role: "Directora Ejecutiva",
        company: "Gymboree Colombia",
        text: "El sistema de pagos que desarrollaron es impecable. La atención al detalle y la rapidez de respuesta son su mayor diferencial.",
        image: "https://i.pravatar.cc/150?u=marta"
    }
];

export const Testimonials = () => {
    return (
        <section className="py-24 relative px-6 bg-black/40">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-heading font-bold text-white mb-4"
                    >
                        Lo que dicen <span className="text-gradient">nuestros aliados.</span>
                    </motion.h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={testimonial.name}
                            initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="relative p-10 rounded-[40px] glass border border-white/10 group"
                        >
                            <Quote className="absolute top-8 right-10 w-12 h-12 text-primary/10 transition-colors group-hover:text-primary/20" />

                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-primary/20 relative">
                                    <Image src={testimonial.image} alt={testimonial.name} fill className="object-cover" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-lg">{testimonial.name}</h4>
                                    <p className="text-muted-foreground text-sm">{testimonial.role} · {testimonial.company}</p>
                                </div>
                            </div>

                            <p className="text-white text-xl md:text-2xl leading-relaxed italic font-medium">
                                &quot;{testimonial.text}&quot;
                            </p>

                            <div className="mt-8 flex gap-1">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <div key={s} className="w-1.5 h-1.5 rounded-full bg-primary" />
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
