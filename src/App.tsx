/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { Products } from './components/Products';
import { Stats } from './components/Stats';
import { Process } from './components/Process';
import { Testimonials } from './components/Testimonials';
import { Footer } from './components/Footer';
import { GalaxyBackground } from './components/GalaxyBackground';

export default function App() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#000511] text-white font-body antialiased selection:bg-primary/20">
      <Header />
      <main className="grow">
        <Hero />
        <Features />
        <Products />
        <Stats />
        <Process />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}
