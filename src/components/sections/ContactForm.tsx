"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Send, CheckCircle2 } from "lucide-react";

const formSchema = z.object({
    name: z.string().min(2, "El nombre es muy corto"),
    email: z.string().email("Email inválido"),
    company: z.string().optional(),
    budget: z.string().min(1, "Selecciona un rango"),
    message: z.string().min(10, "Cuéntanos un poco más"),
});

type FormData = z.infer<typeof formSchema>;

export const ContactForm = () => {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm<FormData>({
        resolver: zodResolver(formSchema),
    });

    const onSubmit = async (data: FormData) => {
        setLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setLoading(false);
        setIsSubmitted(true);
        reset();
    };

    return (
        <section id="contacto" className="py-24 relative px-6 overflow-hidden">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div>
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="flex items-center gap-2 mb-4"
                    >
                        <div className="w-12 h-px bg-primary" />
                        <span className="text-primary font-bold uppercase tracking-widest text-sm">Hablemos</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-heading font-bold text-white mb-6"
                    >
                        ¿Tienes un <span className="text-gradient">proyecto en mente?</span>
                    </motion.h2>

                    <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                        Estamos listos para escucharte. Cuéntanos tu idea y te responderemos en menos de 24 horas.
                    </p>

                    <div className="space-y-6">
                        <div className="flex items-center gap-4 text-white/60">
                            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5 text-primary" />
                            </div>
                            <span className="text-sm font-medium">Asesoría técnica grauita</span>
                        </div>
                        <div className="flex items-center gap-4 text-white/60">
                            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5 text-primary" />
                            </div>
                            <span className="text-sm font-medium">Cotización clara y detallada</span>
                        </div>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="relative"
                >
                    <div className="absolute inset-0 bg-primary/20 rounded-[40px] blur-3xl -z-10 opacity-30" />

                    <div className="bg-[#111111] border border-white/10 p-10 rounded-[40px] shadow-2xl">
                        <AnimatePresence mode="wait">
                            {!isSubmitted ? (
                                <motion.form
                                    key="form"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onSubmit={handleSubmit(onSubmit)}
                                    className="space-y-6"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-white/40 tracking-wider">Nombre</label>
                                            <input
                                                {...register("name")}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
                                                placeholder="Edgar..."
                                            />
                                            {errors.name && <p className="text-red-400 text-[10px] uppercase font-bold">{errors.name.message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-white/40 tracking-wider">Email</label>
                                            <input
                                                {...register("email")}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
                                                placeholder="edgar@empresa.com"
                                            />
                                            {errors.email && <p className="text-red-400 text-[10px] uppercase font-bold">{errors.email.message}</p>}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase text-white/40 tracking-wider">Presupuesto Estimado</label>
                                        <select
                                            {...register("budget")}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors appearance-none"
                                        >
                                            <option value="" className="bg-black">Selecciona un rango</option>
                                            <option value="1k-5k" className="bg-black">$1,000 - $5,000</option>
                                            <option value="5k-15k" className="bg-black">$5,000 - $15,000</option>
                                            <option value="15k+" className="bg-black">$15,000+</option>
                                        </select>
                                        {errors.budget && <p className="text-red-400 text-[10px] uppercase font-bold">{errors.budget.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase text-white/40 tracking-wider">Mensaje</label>
                                        <textarea
                                            {...register("message")}
                                            rows={4}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors resize-none"
                                            placeholder="Cuéntanos un poco sobre tu proyecto..."
                                        />
                                        {errors.message && <p className="text-red-400 text-[10px] uppercase font-bold">{errors.message.message}</p>}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-4 rounded-2xl bg-primary text-white font-bold flex items-center justify-center gap-2 hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-all duration-300 disabled:opacity-50 group overflow-hidden relative"
                                    >
                                        {loading ? (
                                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <span className="relative z-10">Enviar Propuesta</span>
                                                <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform relative z-10" />
                                            </>
                                        )}
                                        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                    </button>
                                </motion.form>
                            ) : (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-10"
                                >
                                    <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
                                        <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-2">¡Mensaje Recibido!</h3>
                                    <p className="text-muted-foreground mb-8">Te contactaremos en menos de 24 horas para dar el siguiente paso.</p>
                                    <button
                                        onClick={() => setIsSubmitted(false)}
                                        className="text-primary font-bold hover:underline"
                                    >
                                        Enviar otro mensaje
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};
