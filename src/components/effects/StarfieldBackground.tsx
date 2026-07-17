import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  z: number;
  r: number;
  twinkleSpeed: number;
  twinklePhase: number;
  hue: 'blue' | 'cyan' | 'white' | 'indigo';
}

const HUE_COLORS: Record<Star['hue'], string> = {
  blue: '56,189,248',
  cyan: '34,211,238',
  white: '255,255,255',
  indigo: '129,140,248',
};

const HUES: Star['hue'][] = ['white', 'white', 'blue', 'cyan', 'indigo'];

interface StarfieldBackgroundProps {
  density?: number;
  className?: string;
}

export function StarfieldBackground({ density = 1, className }: StarfieldBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Coarse-pointer/small-viewport devices (phones) get a much lighter starfield —
    // fewer stars, capped DPR, and a lower frame rate to avoid draining battery/CPU.
    const isMobile = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768;
    const container = canvas.parentElement!;
    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);
    let stars: Star[] = [];
    let raf = 0;

    const STAR_COUNT_BASE = isMobile ? 160 : 480;
    const mobileFrameInterval = 1000 / 30; // cap at ~30fps on mobile
    let lastFrameTime = 0;

    // Diagonal "dust band" direction (matches the CSS gradient band below)
    const bandAngle = (115 * Math.PI) / 180;
    const bandDir = { x: Math.cos(bandAngle), y: Math.sin(bandAngle) };

    const randomPoint = (bandBiased: boolean) => {
      if (!bandBiased) return { x: Math.random() * width, y: Math.random() * height };
      // Pick a point along the band line through the canvas center, then jitter perpendicular to it
      const cx = width / 2;
      const cy = height / 2;
      const along = (Math.random() - 0.5) * Math.max(width, height) * 1.6;
      const spread = (Math.random() - 0.5) * Math.min(width, height) * 0.35 * (1 - Math.random() * 0.6);
      const perpX = -bandDir.y;
      const perpY = bandDir.x;
      return {
        x: cx + bandDir.x * along + perpX * spread,
        y: cy + bandDir.y * along + perpY * spread,
      };
    };

    const buildStars = () => {
      const count = Math.round(STAR_COUNT_BASE * density * (width * height) / (1280 * 800));
      const total = Math.max(60, count);
      const bandCount = Math.round(total * 0.45);
      stars = Array.from({ length: total }, (_, i) => {
        const p = randomPoint(i < bandCount);
        return {
          x: p.x,
          y: p.y,
          z: Math.random(), // 0 = far, 1 = near
          r: 0,
          twinkleSpeed: 0.5 + Math.random() * 1.5,
          twinklePhase: Math.random() * Math.PI * 2,
          hue: HUES[Math.floor(Math.random() * HUES.length)],
        };
      }).map((s) => ({ ...s, r: 0.4 + s.z * 1.6 }));
    };

    const resize = () => {
      width = container.clientWidth;
      height = container.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildStars();
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      mouseRef.current.y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };

    let t = 0;
    const draw = (now?: number) => {
      if (isMobile && now !== undefined) {
        if (now - lastFrameTime < mobileFrameInterval) {
          raf = requestAnimationFrame(draw);
          return;
        }
        lastFrameTime = now;
      }

      t += 0.008;
      ctx.clearRect(0, 0, width, height);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      for (const s of stars) {
        // Parallax: nearer stars (higher z) shift more with mouse and drift
        const parallaxStrength = s.z * 18;
        const driftX = Math.sin(t * 0.15 + s.twinklePhase) * s.z * 6;
        const px = s.x + mx * parallaxStrength + driftX;
        const py = s.y + my * parallaxStrength;

        const twinkle = 0.55 + 0.45 * Math.sin(t * s.twinkleSpeed + s.twinklePhase);
        const alpha = (0.25 + s.z * 0.75) * twinkle;

        ctx.beginPath();
        ctx.fillStyle = `rgba(${HUE_COLORS[s.hue]}, ${alpha})`;
        ctx.arc(px, py, s.r, 0, Math.PI * 2);
        ctx.fill();

        // Skip the extra glow halo on mobile — it's a second draw call per near star
        if (!isMobile && s.z > 0.75) {
          ctx.beginPath();
          ctx.fillStyle = `rgba(${HUE_COLORS[s.hue]}, ${alpha * 0.15})`;
          ctx.arc(px, py, s.r * 3.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      raf = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize);
    if (!prefersReducedMotion) {
      window.addEventListener('mousemove', handleMouseMove);
      draw();
    } else {
      // Static single frame for reduced-motion users
      draw();
      cancelAnimationFrame(raf);
    }

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(raf);
    };
  }, [density]);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className ?? ''}`}>
      {/* Nebula haze (brand blue/indigo/cyan) — smaller/lighter blur radius on mobile, full size on desktop */}
      <div
        className="absolute -top-1/4 left-1/4 w-[900px] h-[900px] rounded-full blur-[60px] md:blur-[140px] opacity-50"
        style={{ background: 'radial-gradient(circle, rgba(13,89,242,0.6) 0%, transparent 70%)' }}
      />
      <div
        className="absolute top-1/3 -right-1/4 w-[700px] h-[700px] rounded-full blur-[55px] md:blur-[130px] opacity-40"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.6) 0%, transparent 70%)' }}
      />
      <div
        className="absolute -bottom-1/4 left-1/3 w-[600px] h-[600px] rounded-full blur-[50px] md:blur-[120px] opacity-35"
        style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.6) 0%, transparent 70%)' }}
      />
      {/* Milky Way dust band */}
      <div
        className="absolute inset-[-20%] blur-[60px] opacity-[0.18]"
        style={{
          background: 'linear-gradient(115deg, transparent 35%, rgba(226,232,240,0.9) 48%, rgba(129,140,248,0.7) 52%, transparent 65%)',
        }}
      />
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
