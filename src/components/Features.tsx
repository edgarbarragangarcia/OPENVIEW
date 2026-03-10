import { SphericalCarousel } from './SphericalCarousel';

export function Features() {
  return (
    <section id="servicios" className="py-12 sm:py-16 overflow-hidden bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center mb-8">
          <h2 className="text-base font-semibold leading-7 text-primary">Servicios</h2>
          <p className="mt-2 font-display text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Nuestras Especialidades</p>
          <p className="mt-6 text-lg font-light leading-8 text-gray-600">
            Elevamos el estándar del software en Latinoamérica a través de ingeniería impecable y diseño de primer nivel.
          </p>
        </div>

        <div className="mx-auto mt-16 flex justify-center">
          <SphericalCarousel />
        </div>
      </div>
    </section>
  );
}
