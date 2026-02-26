"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
    { name: "Servicios", href: "#servicios" },
    { name: "Portafolio", href: "#portafolio" },
    { name: "Nosotros", href: "#nosotros" },
    { name: "Proceso", href: "#proceso" },
    { name: "Blog", href: "#blog" },
];

export const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <motion.header
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6",
                isScrolled ? "bg-black/80 backdrop-blur-xl" : "bg-transparent"
            )}
        >
            <div className="max-w-7xl mx-auto flex items-center justify-between py-6">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <span className="text-white font-bold text-lg tracking-tighter">
                        OPEN<span className="text-white/40">VIEW</span>
                    </span>
                </Link>

                {/* Desktop Links */}
                <nav className="hidden md:flex items-center gap-10">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-[12px] font-medium text-white/60 hover:text-white transition-colors"
                        >
                            {link.name}
                        </Link>
                    ))}
                </nav>

                {/* CTA */}
                <div className="hidden md:flex items-center">
                    <Link
                        href="#contacto"
                        className="px-6 py-2 rounded-full border border-white/20 text-white text-[12px] font-medium hover:bg-white hover:text-black transition-all duration-300"
                    >
                        Hablemos
                    </Link>
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden text-white"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="md:hidden absolute top-full left-6 right-6 mt-2 bg-[#161920] backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden shadow-2xl"
                    >
                        <div className="flex flex-col p-6 gap-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-sm font-medium text-white/70 hover:text-white transition-colors"
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <Link
                                href="#contacto"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="w-full py-3 rounded-xl bg-white text-black text-center font-bold text-sm"
                            >
                                Hablemos
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    );
};
