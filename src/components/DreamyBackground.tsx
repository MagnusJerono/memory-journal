import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  opacity: number;
}

interface Thread {
  id: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  delay: number;
  duration: number;
  thickness: number;
}

interface FloatingOrb {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
}

function generateStars(count: number): Star[] {
  const stars: Star[] = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 10,
      duration: Math.random() * 5 + 3,
      opacity: Math.random() * 0.7 + 0.3,
    });
  }
  return stars;
}

function generateThreads(count: number): Thread[] {
  const threads: Thread[] = [];
  for (let i = 0; i < count; i++) {
    const startX = Math.random() * 100;
    const startY = Math.random() * 100;
    threads.push({
      id: i,
      startX,
      startY,
      endX: startX + (Math.random() - 0.5) * 40,
      endY: startY + (Math.random() - 0.5) * 40,
      delay: Math.random() * 8,
      duration: Math.random() * 12 + 15,
      thickness: Math.random() * 0.8 + 0.4,
    });
  }
  return threads;
}

function generateOrbs(count: number): FloatingOrb[] {
  const orbs: FloatingOrb[] = [];
  const colors = [
    'oklch(0.75 0.12 280 / 0.25)',
    'oklch(0.72 0.14 330 / 0.2)',
    'oklch(0.78 0.10 250 / 0.22)',
    'oklch(0.70 0.15 200 / 0.18)',
  ];
  for (let i = 0; i < count; i++) {
    orbs.push({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 150 + 80,
      color: colors[i % colors.length],
      delay: Math.random() * 5,
      duration: Math.random() * 20 + 25,
    });
  }
  return orbs;
}

function StarElement({ star }: { star: Star }) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        left: `${star.x}%`,
        top: `${star.y}%`,
        width: star.size,
        height: star.size,
        background: `radial-gradient(circle, oklch(1 0 0) 0%, oklch(0.95 0.03 280) 40%, transparent 100%)`,
        boxShadow: `0 0 ${star.size * 4}px ${star.size * 1.5}px oklch(0.95 0.05 275 / 0.6)`,
      }}
      animate={{
        opacity: [star.opacity * 0.4, star.opacity, star.opacity * 0.4],
        scale: [1, 1.4, 1],
      }}
      transition={{
        duration: star.duration,
        delay: star.delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

function ThreadElement({ thread }: { thread: Thread }) {
  return (
    <motion.svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ overflow: 'visible' }}
    >
      <motion.line
        x1={`${thread.startX}%`}
        y1={`${thread.startY}%`}
        x2={`${thread.endX}%`}
        y2={`${thread.endY}%`}
        stroke="oklch(0.85 0.08 280 / 0.25)"
        strokeWidth={thread.thickness}
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ 
          pathLength: [0, 1, 1, 0],
          opacity: [0, 0.5, 0.5, 0],
        }}
        transition={{
          duration: thread.duration,
          delay: thread.delay,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.svg>
  );
}

function FloatingOrbElement({ orb }: { orb: FloatingOrb }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: `${orb.x}%`,
        top: `${orb.y}%`,
        width: orb.size,
        height: orb.size,
        background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
        filter: 'blur(30px)',
      }}
      animate={{
        x: [0, 30, -20, 0],
        y: [0, -25, 20, 0],
        scale: [1, 1.1, 0.95, 1],
      }}
      transition={{
        duration: orb.duration,
        delay: orb.delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

export function DreamyBackground() {
  const stars = useMemo(() => generateStars(80), []);
  const threads = useMemo(() => generateThreads(12), []);
  const orbs = useMemo(() => generateOrbs(6), []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: -1 }}>
      <div 
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(135deg, 
              oklch(0.35 0.08 280) 0%, 
              oklch(0.28 0.10 270) 20%,
              oklch(0.22 0.12 260) 40%,
              oklch(0.20 0.10 255) 60%,
              oklch(0.18 0.08 250) 80%,
              oklch(0.15 0.06 245) 100%
            )
          `,
        }}
      />

      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 100% 60% at 10% 0%, oklch(0.45 0.15 280 / 0.5) 0%, transparent 50%),
            radial-gradient(ellipse 80% 50% at 90% 20%, oklch(0.40 0.18 330 / 0.4) 0%, transparent 50%),
            radial-gradient(ellipse 90% 55% at 50% 100%, oklch(0.35 0.14 250 / 0.45) 0%, transparent 50%)
          `,
        }}
      />

      <div className="absolute inset-0 pointer-events-none">
        {orbs.map((orb) => (
          <FloatingOrbElement key={orb.id} orb={orb} />
        ))}
      </div>

      <motion.div
        className="absolute w-[800px] h-[500px] rounded-full"
        style={{
          background: 'radial-gradient(ellipse, oklch(0.50 0.12 280 / 0.35) 0%, transparent 70%)',
          filter: 'blur(80px)',
          top: '-10%',
          left: '5%',
        }}
        animate={{
          x: [0, 60, 30, 0],
          y: [0, 30, -20, 0],
          scale: [1, 1.08, 0.96, 1],
        }}
        transition={{
          duration: 50,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute w-[600px] h-[450px] rounded-full"
        style={{
          background: 'radial-gradient(ellipse, oklch(0.45 0.16 330 / 0.3) 0%, transparent 70%)',
          filter: 'blur(70px)',
          top: '25%',
          right: '-5%',
        }}
        animate={{
          x: [0, -40, -20, 0],
          y: [0, 35, 15, 0],
          scale: [1, 0.94, 1.05, 1],
        }}
        transition={{
          duration: 45,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute w-[550px] h-[400px] rounded-full"
        style={{
          background: 'radial-gradient(ellipse, oklch(0.42 0.14 260 / 0.35) 0%, transparent 70%)',
          filter: 'blur(75px)',
          bottom: '5%',
          left: '20%',
        }}
        animate={{
          x: [0, 45, 15, 0],
          y: [0, -20, 30, 0],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{
          duration: 48,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="absolute inset-0 pointer-events-none">
        {threads.map((thread) => (
          <ThreadElement key={thread.id} thread={thread} />
        ))}
      </div>

      <div className="absolute inset-0 pointer-events-none">
        {stars.map((star) => (
          <StarElement key={star.id} star={star} />
        ))}
      </div>

      <div className="absolute inset-0 pointer-events-none">
        <svg className="absolute w-full h-full" preserveAspectRatio="none">
          <defs>
            <pattern id="knot-pattern" x="0" y="0" width="150" height="150" patternUnits="userSpaceOnUse">
              <circle cx="75" cy="75" r="1.5" fill="oklch(0.80 0.10 280 / 0.15)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#knot-pattern)" />
        </svg>
      </div>

      <div 
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[oklch(0.12_0.05_250)] to-transparent" />
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[oklch(0.30_0.08_280_/_0.5)] to-transparent" />
    </div>
  );
}
