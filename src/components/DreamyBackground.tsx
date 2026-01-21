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
  type: 'normal' | 'bright' | 'tiny';
}

interface ShootingStar {
  id: number;
  startX: number;
  startY: number;
  angle: number;
  delay: number;
  duration: number;
  length: number;
}

interface ComicCloud {
  id: number;
  x: number;
  y: number;
  scale: number;
  delay: number;
  duration: number;
  opacity: number;
  variant: number;
}

interface NightCloud {
  id: number;
  x: number;
  y: number;
  scale: number;
  delay: number;
  duration: number;
  opacity: number;
}

function generateStars(count: number): Star[] {
  const stars: Star[] = [];
  for (let i = 0; i < count; i++) {
    const type = Math.random() > 0.85 ? 'bright' : Math.random() > 0.5 ? 'normal' : 'tiny';
    stars.push({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: type === 'bright' ? Math.random() * 3 + 2 : type === 'normal' ? Math.random() * 2 + 1 : Math.random() * 1 + 0.5,
      delay: Math.random() * 8,
      duration: type === 'bright' ? Math.random() * 3 + 2 : Math.random() * 5 + 3,
      opacity: type === 'bright' ? 0.9 : type === 'normal' ? Math.random() * 0.5 + 0.4 : Math.random() * 0.4 + 0.2,
      type,
    });
  }
  return stars;
}

function generateShootingStars(count: number): ShootingStar[] {
  const stars: ShootingStar[] = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      id: i,
      startX: Math.random() * 60 + 20,
      startY: Math.random() * 40,
      angle: Math.random() * 30 + 15,
      delay: Math.random() * 20 + i * 8,
      duration: Math.random() * 1.5 + 0.8,
      length: Math.random() * 80 + 60,
    });
  }
  return stars;
}

function generateComicClouds(count: number): ComicCloud[] {
  const clouds: ComicCloud[] = [];
  for (let i = 0; i < count; i++) {
    clouds.push({
      id: i,
      x: Math.random() * 120 - 20,
      y: Math.random() * 70 + 10,
      scale: Math.random() * 0.6 + 0.5,
      delay: Math.random() * 20 + i * 3,
      duration: Math.random() * 80 + 120,
      opacity: Math.random() * 0.3 + 0.7,
      variant: Math.floor(Math.random() * 3),
    });
  }
  return clouds;
}

function generateNightClouds(count: number): NightCloud[] {
  const clouds: NightCloud[] = [];
  for (let i = 0; i < count; i++) {
    clouds.push({
      id: i,
      x: Math.random() * 120 - 20,
      y: Math.random() * 50 + 30,
      scale: Math.random() * 0.8 + 0.6,
      delay: Math.random() * 15,
      duration: Math.random() * 100 + 80,
      opacity: Math.random() * 0.15 + 0.08,
    });
  }
  return clouds;
}

function ComicCloudSVG({ variant, opacity }: { variant: number; opacity: number }) {
  const fillColor = `oklch(1 0 0 / ${opacity})`;
  const shadowColor = `oklch(0.92 0.02 220 / ${opacity * 0.5})`;
  
  if (variant === 0) {
    return (
      <svg width="280" height="140" viewBox="0 0 280 140" fill="none">
        <ellipse cx="70" cy="95" rx="55" ry="40" fill={shadowColor} />
        <ellipse cx="140" cy="85" rx="70" ry="50" fill={shadowColor} />
        <ellipse cx="210" cy="95" rx="50" ry="38" fill={shadowColor} />
        <ellipse cx="70" cy="90" rx="55" ry="40" fill={fillColor} />
        <ellipse cx="140" cy="75" rx="70" ry="50" fill={fillColor} />
        <ellipse cx="210" cy="90" rx="50" ry="38" fill={fillColor} />
        <ellipse cx="100" cy="55" rx="45" ry="35" fill={fillColor} />
        <ellipse cx="170" cy="50" rx="40" ry="32" fill={fillColor} />
        <ellipse cx="55" cy="75" rx="35" ry="28" fill={fillColor} />
        <ellipse cx="225" cy="75" rx="30" ry="25" fill={fillColor} />
      </svg>
    );
  }
  
  if (variant === 1) {
    return (
      <svg width="240" height="120" viewBox="0 0 240 120" fill="none">
        <ellipse cx="60" cy="80" rx="50" ry="35" fill={shadowColor} />
        <ellipse cx="120" cy="75" rx="60" ry="42" fill={shadowColor} />
        <ellipse cx="180" cy="80" rx="45" ry="32" fill={shadowColor} />
        <ellipse cx="60" cy="75" rx="50" ry="35" fill={fillColor} />
        <ellipse cx="120" cy="65" rx="60" ry="42" fill={fillColor} />
        <ellipse cx="180" cy="75" rx="45" ry="32" fill={fillColor} />
        <ellipse cx="90" cy="45" rx="38" ry="30" fill={fillColor} />
        <ellipse cx="150" cy="40" rx="35" ry="28" fill={fillColor} />
        <ellipse cx="195" cy="60" rx="25" ry="22" fill={fillColor} />
      </svg>
    );
  }
  
  return (
    <svg width="200" height="100" viewBox="0 0 200 100" fill="none">
      <ellipse cx="50" cy="70" rx="40" ry="28" fill={shadowColor} />
      <ellipse cx="100" cy="65" rx="50" ry="35" fill={shadowColor} />
      <ellipse cx="150" cy="70" rx="38" ry="26" fill={shadowColor} />
      <ellipse cx="50" cy="65" rx="40" ry="28" fill={fillColor} />
      <ellipse cx="100" cy="55" rx="50" ry="35" fill={fillColor} />
      <ellipse cx="150" cy="65" rx="38" ry="26" fill={fillColor} />
      <ellipse cx="75" cy="38" rx="32" ry="25" fill={fillColor} />
      <ellipse cx="125" cy="35" rx="28" ry="22" fill={fillColor} />
    </svg>
  );
}

function ComicCloudElement({ cloud }: { cloud: ComicCloud }) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: `${cloud.x}%`,
        top: `${cloud.y}%`,
        transform: `scale(${cloud.scale})`,
        filter: 'drop-shadow(0 8px 20px oklch(0.7 0.02 220 / 0.15))',
      }}
      animate={{
        x: [0, window.innerWidth * 1.5],
      }}
      transition={{
        duration: cloud.duration,
        delay: cloud.delay,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      <ComicCloudSVG variant={cloud.variant} opacity={cloud.opacity} />
    </motion.div>
  );
}

function StarElement({ star }: { star: Star }) {
  const baseColor = star.type === 'bright' 
    ? 'oklch(1 0.02 280)' 
    : star.type === 'normal'
    ? 'oklch(0.98 0.01 260)'
    : 'oklch(0.95 0 0)';
  
  const glowColor = star.type === 'bright'
    ? 'oklch(0.95 0.08 280 / 0.8)'
    : 'oklch(0.9 0.03 260 / 0.5)';

  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        left: `${star.x}%`,
        top: `${star.y}%`,
        width: star.size,
        height: star.size,
        background: `radial-gradient(circle, ${baseColor} 0%, ${baseColor} 50%, transparent 100%)`,
        boxShadow: star.type === 'bright' 
          ? `0 0 ${star.size * 6}px ${star.size * 2}px ${glowColor}, 0 0 ${star.size * 2}px ${star.size}px oklch(1 0 0 / 0.8)`
          : star.type === 'normal'
          ? `0 0 ${star.size * 3}px ${star.size}px ${glowColor}`
          : 'none',
      }}
      animate={{
        opacity: star.type === 'bright' 
          ? [star.opacity, star.opacity * 0.6, star.opacity]
          : [star.opacity * 0.5, star.opacity, star.opacity * 0.5],
        scale: star.type === 'bright' ? [1, 1.3, 1] : [1, 1.1, 1],
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

function ShootingStarElement({ star }: { star: ShootingStar }) {
  return (
    <motion.div
      className="absolute"
      style={{
        left: `${star.startX}%`,
        top: `${star.startY}%`,
        width: star.length,
        height: 2,
        background: `linear-gradient(90deg, transparent 0%, oklch(1 0 0 / 0) 10%, oklch(1 0.02 280 / 0.9) 50%, oklch(1 0 0) 100%)`,
        borderRadius: '999px',
        transform: `rotate(${star.angle}deg)`,
        transformOrigin: 'right center',
        filter: 'blur(0.5px)',
        boxShadow: '0 0 8px 2px oklch(0.9 0.1 280 / 0.5)',
      }}
      initial={{ opacity: 0, scaleX: 0 }}
      animate={{ 
        opacity: [0, 1, 1, 0],
        scaleX: [0, 1, 1, 0],
        x: [0, -star.length * 2],
        y: [0, star.length * Math.tan(star.angle * Math.PI / 180) * 2],
      }}
      transition={{
        duration: star.duration,
        delay: star.delay,
        repeat: Infinity,
        ease: "easeOut",
        times: [0, 0.1, 0.8, 1],
      }}
    />
  );
}

function NightCloudElement({ cloud }: { cloud: NightCloud }) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: `${cloud.x}%`,
        top: `${cloud.y}%`,
        transform: `scale(${cloud.scale})`,
      }}
      animate={{
        x: [0, 150, 300],
        opacity: [cloud.opacity, cloud.opacity * 1.2, cloud.opacity],
      }}
      transition={{
        duration: cloud.duration,
        delay: cloud.delay,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      <svg width="300" height="120" viewBox="0 0 300 120" fill="none">
        <defs>
          <linearGradient id={`nightCloudGrad-${cloud.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={`oklch(0.25 0.06 270 / ${cloud.opacity})`} />
            <stop offset="100%" stopColor={`oklch(0.20 0.04 260 / ${cloud.opacity * 0.7})`} />
          </linearGradient>
        </defs>
        <ellipse cx="80" cy="70" rx="60" ry="35" fill={`url(#nightCloudGrad-${cloud.id})`} />
        <ellipse cx="150" cy="60" rx="80" ry="45" fill={`url(#nightCloudGrad-${cloud.id})`} />
        <ellipse cx="220" cy="70" rx="55" ry="32" fill={`url(#nightCloudGrad-${cloud.id})`} />
        <ellipse cx="110" cy="40" rx="50" ry="30" fill={`url(#nightCloudGrad-${cloud.id})`} />
        <ellipse cx="190" cy="35" rx="45" ry="28" fill={`url(#nightCloudGrad-${cloud.id})`} />
      </svg>
    </motion.div>
  );
}

function AuroraWave({ delay, yOffset, color }: { delay: number; yOffset: number; color: string }) {
  return (
    <motion.div
      className="absolute w-full h-48 pointer-events-none"
      style={{
        top: `${yOffset}%`,
        background: `linear-gradient(180deg, transparent 0%, ${color} 50%, transparent 100%)`,
        filter: 'blur(40px)',
        opacity: 0.3,
      }}
      animate={{
        y: [0, -30, 0, 30, 0],
        scaleY: [1, 1.2, 1, 0.8, 1],
        opacity: [0.2, 0.35, 0.25, 0.3, 0.2],
      }}
      transition={{
        duration: 15,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

function DarkBackground() {
  const stars = useMemo(() => generateStars(150), []);
  const shootingStars = useMemo(() => generateShootingStars(4), []);
  const nightClouds = useMemo(() => generateNightClouds(5), []);

  return (
    <>
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 150% 100% at 50% 0%, 
              oklch(0.18 0.08 275) 0%, 
              oklch(0.12 0.06 265) 30%,
              oklch(0.08 0.04 255) 60%,
              oklch(0.05 0.02 250) 100%
            )
          `,
        }}
      />

      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 60% 40% at 20% 10%, oklch(0.22 0.12 280 / 0.4) 0%, transparent 50%),
            radial-gradient(ellipse 50% 35% at 80% 15%, oklch(0.18 0.10 300 / 0.3) 0%, transparent 50%),
            radial-gradient(ellipse 70% 50% at 50% 80%, oklch(0.15 0.08 260 / 0.25) 0%, transparent 50%)
          `,
        }}
      />

      <AuroraWave delay={0} yOffset={5} color="oklch(0.45 0.15 280 / 0.15)" />
      <AuroraWave delay={3} yOffset={15} color="oklch(0.50 0.18 300 / 0.12)" />
      <AuroraWave delay={6} yOffset={8} color="oklch(0.40 0.12 250 / 0.1)" />

      <motion.div
        className="absolute w-32 h-32 rounded-full"
        style={{
          top: '8%',
          right: '12%',
          background: `radial-gradient(circle, oklch(0.95 0.02 60 / 0.95) 0%, oklch(0.90 0.04 55 / 0.8) 40%, oklch(0.80 0.05 50 / 0.4) 70%, transparent 100%)`,
          boxShadow: `
            0 0 60px 30px oklch(0.95 0.04 60 / 0.3),
            0 0 120px 60px oklch(0.90 0.05 55 / 0.15),
            inset -8px -8px 20px oklch(0.85 0.03 50 / 0.3)
          `,
        }}
        animate={{
          scale: [1, 1.02, 1],
          opacity: [0.9, 1, 0.9],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {nightClouds.map((cloud) => (
          <NightCloudElement key={cloud.id} cloud={cloud} />
        ))}
      </div>

      <div className="absolute inset-0 pointer-events-none">
        {stars.map((star) => (
          <StarElement key={star.id} star={star} />
        ))}
      </div>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {shootingStars.map((star) => (
          <ShootingStarElement key={star.id} star={star} />
        ))}
      </div>

      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[oklch(0.04_0.02_250)] via-[oklch(0.06_0.03_255_/_0.5)] to-transparent" />
    </>
  );
}

function LightBackground() {
  const clouds = useMemo(() => generateComicClouds(10), []);

  return (
    <>
      <div 
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(180deg, 
              oklch(0.82 0.08 230) 0%,
              oklch(0.85 0.07 232) 15%,
              oklch(0.88 0.06 235) 35%,
              oklch(0.91 0.05 238) 55%,
              oklch(0.94 0.04 240) 75%,
              oklch(0.96 0.03 242) 100%
            )
          `,
        }}
      />

      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 80% 50% at 30% 0%, oklch(0.95 0.03 220 / 0.6) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 70% 5%, oklch(0.93 0.04 225 / 0.4) 0%, transparent 50%)
          `,
        }}
      />

      <motion.div
        className="absolute w-40 h-40 rounded-full"
        style={{
          top: '5%',
          right: '10%',
          background: `radial-gradient(circle, oklch(1 0.04 85 / 0.95) 0%, oklch(0.98 0.06 80 / 0.7) 40%, oklch(0.95 0.05 75 / 0.3) 70%, transparent 100%)`,
          boxShadow: `
            0 0 80px 40px oklch(1 0.05 85 / 0.4),
            0 0 160px 80px oklch(0.98 0.04 80 / 0.2)
          `,
        }}
        animate={{
          scale: [1, 1.03, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {clouds.map((cloud) => (
          <ComicCloudElement key={cloud.id} cloud={cloud} />
        ))}
      </div>

      <div 
        className="absolute inset-0 opacity-[0.01]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[oklch(0.96_0.03_242)] to-transparent" />
    </>
  );
}

interface DreamyBackgroundProps {
  isDarkMode?: boolean;
}

export function DreamyBackground({ isDarkMode = false }: DreamyBackgroundProps) {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: -1 }}>
      <motion.div
        key={isDarkMode ? 'dark' : 'light'}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="absolute inset-0"
      >
        {isDarkMode ? <DarkBackground /> : <LightBackground />}
      </motion.div>
    </div>
  );
}
