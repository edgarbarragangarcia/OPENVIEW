import React from "react";
import Link from "next/link";
import { Github, Instagram, Linkedin, MessageCircle } from "lucide-react";

export const Footer = () => {
    return (
        <footer className="bg-black pt-20 pb-10 border-t border-white/5 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
                    <div className="lg:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold">O</span>
                            </div>
                            <span className="text-white font-bold text-xl tracking-tight">OpenView</span>
                        </Link>
                        <p className="text-muted-foreground text-sm leading-relaxed mb-8 max-w-xs">
                            Agencia de desarrollo de software e inteligencia artificial. Construyendo el futuro digital desde Colombia para el mundo.
                        </p>
                        <div className="flex items-center gap-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary transition-colors hover:scale-110 duration-300">
                                <Linkedin className="w-4 h-4 text-white" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary transition-colors hover:scale-110 duration-300">
                                <Github className="w-4 h-4 text-white" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary transition-colors hover:scale-110 duration-300">
                                <Instagram className="w-4 h-4 text-white" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary transition-colors hover:scale-110 duration-300">
                                <MessageCircle className="w-4 h-4 text-white" />
                            </a>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Servicios</h4>
                        <ul className="space-y-4">
                            <li><Link href="#servicios" className="text-muted-foreground text-sm hover:text-white transition-colors">Plataformas Web</Link></li>
                            <li><Link href="#servicios" className="text-muted-foreground text-sm hover:text-white transition-colors">Inteligencia Artificial</Link></li>
                            <li><Link href="#servicios" className="text-muted-foreground text-sm hover:text-white transition-colors">Automatización</Link></li>
                            <li><Link href="#servicios" className="text-muted-foreground text-sm hover:text-white transition-colors">Consultoría IT</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Empresa</h4>
                        <ul className="space-y-4">
                            <li><Link href="#nosotros" className="text-muted-foreground text-sm hover:text-white transition-colors">Sobre Nosotros</Link></li>
                            <li><Link href="#portafolio" className="text-muted-foreground text-sm hover:text-white transition-colors">Portafolio</Link></li>
                            <li><Link href="#blog" className="text-muted-foreground text-sm hover:text-white transition-colors">Blog</Link></li>
                            <li><Link href="#contacto" className="text-muted-foreground text-sm hover:text-white transition-colors">Conversemos</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Legal</h4>
                        <ul className="space-y-4">
                            <li><Link href="#" className="text-muted-foreground text-sm hover:text-white transition-colors">Privacidad</Link></li>
                            <li><Link href="#" className="text-muted-foreground text-sm hover:text-white transition-colors">Términos de Servicio</Link></li>
                            <li><Link href="#" className="text-muted-foreground text-sm hover:text-white transition-colors">Cookies</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-white/30 text-[10px] uppercase font-bold tracking-[0.2em]">
                        © 2024 Open View. Todos los derechos reservados.
                    </p>

                    <div className="flex items-center gap-2 bg-emerald-500/5 border border-emerald-500/20 px-4 py-1.5 rounded-full">
                        <span className="text-xl">🇨🇴</span>
                        <span className="text-emerald-500 font-bold text-[10px] uppercase tracking-wider">
                            Hecho en Colombia, pensado para el mundo
                        </span>
                    </div>
                </div>
            </div>

            {/* Subtle background glow */}
            <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px] -z-10 translate-x-1/2 translate-y-1/2" />
        </footer>
    );
};
