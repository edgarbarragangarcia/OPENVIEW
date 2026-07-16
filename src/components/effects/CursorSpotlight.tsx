import { useEffect, useRef } from 'react';

export function CursorSpotlight() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    if (isTouch) return;

    let raf = 0;
    const handleMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        ref.current?.style.setProperty('--x', `${e.clientX}px`);
        ref.current?.style.setProperty('--y', `${e.clientY}px`);
      });
    };
    window.addEventListener('mousemove', handleMove);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="hidden sm:block fixed inset-0 z-[1] pointer-events-none"
      style={{
        background: 'radial-gradient(600px circle at var(--x, 50%) var(--y, 50%), rgba(14,165,233,0.06), transparent 70%)',
      }}
    />
  );
}
