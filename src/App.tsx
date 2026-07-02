/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LMSHero } from './components/LMSHero';
import { CourseGrid } from './components/CourseGrid';
import { FeaturesLMS } from './components/FeaturesLMS';

export default function App() {
  return (
    <div className="relative w-full overflow-x-hidden bg-white text-slate-900 font-body antialiased selection:bg-primary/20">
      <Header />
      <main>
        <LMSHero />
        <FeaturesLMS />
        <CourseGrid />
      </main>
      <Footer />
    </div>
  );
}
