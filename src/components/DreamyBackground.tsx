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

function generateStars(count: number): Star[] {
  const stars: Star[] = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2.5 + 0.5,
      delay: Math.random() * 8,
      duration: Math.random() * 4 + 3,
      opacity: Math.random() * 0.4 + 0.2,
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
      endX: startX + (Math.random() - 0.5) * 30,
      endY: startY + (Math.random() - 0.5) * 30,
      delay: Math.random() * 5,
      duration: Math.random() * 8 + 10,
      thickness: Math.random() * 0.5 + 0.3,
    });
  }
  return threads;
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
        background: `radial-gradient(circle, oklch(0.95 0.02 280) 0%, oklch(0.85 0.05 260) 50%, transparent 100%)`,
        boxShadow: `0 0 ${star.size * 3}px ${star.size}px oklch(0.90 0.04 270 / 0.4)`,
      }}
      animate={{
        opacity: [star.opacity * 0.5, star.opacity, star.opacity * 0.5],
        scale: [1, 1.3, 1],
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
        stroke="oklch(0.80 0.06 280 / 0.15)"
        strokeWidth={thread.thickness}
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ 
          pathLength: [0, 1, 1, 0],
          opacity: [0, 0.3, 0.3, 0],
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

export function DreamyBackground() {
  const stars = useMemo(() => generateStars(60), []);
  const threads = useMemo(() => generateThreads(8), []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: -1 }}>
      <div 
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(180deg, 
              oklch(0.94 0.03 270) 0%, 
              oklch(0.96 0.025 280) 25%,
              oklch(0.97 0.02 290) 50%,
              oklch(0.95 0.025 275) 75%,
              oklch(0.93 0.035 265) 100%
            )
          `,
        }}
      />

      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 80% 50% at 20% 30%, oklch(0.88 0.08 280 / 0.5) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 80% 60%, oklch(0.85 0.10 330 / 0.4) 0%, transparent 50%),
            radial-gradient(ellipse 70% 45% at 50% 80%, oklch(0.90 0.06 250 / 0.3) 0%, transparent 50%)
          `,
        }}
      />

      <div className="absolute inset-0 pointer-events-none">
        {stars.map((star) => (
          <StarElement key={star.id} star={star} />
        ))}
      </div>

      <div className="absolute inset-0 pointer-events-none">
        {threads.map((thread) => (
          <ThreadElement key={thread.id} thread={thread} />
        ))}
      </div>

      <motion.div
        className="absolute w-[600px] h-[400px] rounded-full"
        style={{
          background: 'radial-gradient(ellipse, oklch(0.92 0.04 280 / 0.6) 0%, transparent 70%)',
          filter: 'blur(60px)',
          top: '-5%',
          left: '10%',
        }}
        animate={{
          x: [0, 40, 20, 0],
          y: [0, 20, -10, 0],
          scale: [1, 1.05, 0.98, 1],
        }}
        transition={{
          duration: 40,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute w-[500px] h-[350px] rounded-full"
        style={{
          background: 'radial-gradient(ellipse, oklch(0.88 0.06 330 / 0.5) 0%, transparent 70%)',
          filter: 'blur(50px)',
          top: '30%',
          right: '-5%',
        }}
        animate={{
          x: [0, -30, -15, 0],
          y: [0, 25, 10, 0],
          scale: [1, 0.95, 1.03, 1],
        }}
        transition={{
          duration: 35,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute w-[450px] h-[300px] rounded-full"
        style={{
          background: 'radial-gradient(ellipse, oklch(0.86 0.07 260 / 0.5) 0%, transparent 70%)',
          filter: 'blur(55px)',
          bottom: '10%',
          left: '25%',
        }}
        animate={{
          x: [0, 35, 10, 0],
          y: [0, -15, 20, 0],
          scale: [1, 1.08, 0.96, 1],
        }}
        transition={{
          duration: 38,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="absolute inset-0 pointer-events-none">
        <svg className="absolute w-full h-full" preserveAspectRatio="none">
          <defs>
            <pattern id="knot-pattern" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
              <circle cx="100" cy="100" r="2" fill="oklch(0.75 0.08 280 / 0.08)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#knot-pattern)" />
        </svg>
      </div>

      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[oklch(0.95_0.03_275)] to-transparent" />
      <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-[oklch(0.93_0.035_270)] to-transparent" />
    </div>
  );
}
