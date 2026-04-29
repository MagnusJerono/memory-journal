import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrandMark } from '@/components/BrandMark';

interface LogoHomeButtonProps {
  isDarkMode?: boolean;
  onClick: () => void;
  size?: 'sm' | 'md' | 'lg';
}

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  angle: number;
  delay: number;
  colorIndex: number;
  distance: number;
}

const lightColors = ['#5b4ba8', '#6b5bb8', '#7a5fad', '#7056a8', '#5b4ba8'];
const darkColors = ['#e0d4f7', '#d8c8f5', '#e8d0f0', '#ddd0f8', '#e0d4f7'];

const lightShadowColors = [
  '0 2px 12px rgba(91, 75, 168, 0.25)',
  '0 2px 14px rgba(107, 91, 184, 0.28)',
  '0 2px 14px rgba(122, 95, 173, 0.26)',
  '0 2px 14px rgba(112, 86, 168, 0.27)',
  '0 2px 12px rgba(91, 75, 168, 0.25)',
];

const darkShadowColors = [
  '0 2px 12px rgba(180, 140, 220, 0.35)',
  '0 2px 14px rgba(170, 135, 210, 0.38)',
  '0 2px 14px rgba(185, 145, 200, 0.36)',
  '0 2px 14px rgba(175, 140, 215, 0.37)',
  '0 2px 12px rgba(180, 140, 220, 0.35)',
];

const lightHoverGlow = [
  '0 0 20px rgba(91, 75, 168, 0.3), 0 0 40px rgba(91, 75, 168, 0.15)',
  '0 0 28px rgba(91, 75, 168, 0.45), 0 0 50px rgba(91, 75, 168, 0.2)',
  '0 0 20px rgba(91, 75, 168, 0.3), 0 0 40px rgba(91, 75, 168, 0.15)',
];

const darkHoverGlow = [
  '0 0 20px rgba(180, 140, 220, 0.4), 0 0 40px rgba(180, 140, 220, 0.2)',
  '0 0 32px rgba(180, 140, 220, 0.6), 0 0 55px rgba(180, 140, 220, 0.3)',
  '0 0 20px rgba(180, 140, 220, 0.4), 0 0 40px rgba(180, 140, 220, 0.2)',
];

const lightSparkleColors = ['#5b4ba8', '#7a5fad', '#9b7fd0', '#b8a0e0', '#ffffff'];
const darkSparkleColors = ['#e0d4f7', '#c8b8f0', '#f0e8ff', '#ffffff', '#d8c8f5'];

function SparkleParticle({ sparkle, isDarkMode }: { sparkle: Sparkle; isDarkMode: boolean }) {
  const colors = isDarkMode ? darkSparkleColors : lightSparkleColors;
  const color = colors[sparkle.colorIndex];
  
  const endX = Math.cos(sparkle.angle) * sparkle.distance;
  const endY = Math.sin(sparkle.angle) * sparkle.distance;

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: sparkle.x,
        top: sparkle.y,
        width: sparkle.size,
        height: sparkle.size,
      }}
      initial={{ 
        opacity: 1, 
        scale: 0,
        x: 0,
        y: 0,
      }}
      animate={{ 
        opacity: [1, 1, 0],
        scale: [0, 1.2, 0.8],
        x: endX,
        y: endY,
      }}
      transition={{ 
        duration: 0.6,
        delay: sparkle.delay,
        ease: "easeOut",
      }}
    >
      <svg viewBox="0 0 24 24" fill={color} className="w-full h-full drop-shadow-sm">
        <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
      </svg>
    </motion.div>
  );
}

export function LogoHomeButton({ isDarkMode = false, onClick, size = 'md' }: LogoHomeButtonProps) {
  const [isClicked, setIsClicked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  const sizeClasses = {
    sm: 'text-xl sm:text-2xl',
    md: 'text-2xl sm:text-3xl',
    lg: 'text-3xl sm:text-4xl'
  };
  const markSizes = {
    sm: 'sm',
    md: 'md',
    lg: 'lg',
  } as const;

  const generateSparkles = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const newSparkles: Sparkle[] = [];
    const sparkleCount = 12;
    
    for (let i = 0; i < sparkleCount; i++) {
      const angle = (i / sparkleCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      newSparkles.push({
        id: Date.now() + i,
        x: centerX,
        y: centerY,
        size: 6 + Math.random() * 8,
        angle,
        delay: Math.random() * 0.1,
        colorIndex: Math.floor(Math.random() * lightSparkleColors.length),
        distance: 30 + Math.random() * 40,
      });
    }
    
    setSparkles(newSparkles);
    setTimeout(() => setSparkles([]), 800);
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsClicked(true);
    generateSparkles(e);
    setTimeout(() => setIsClicked(false), 600);
    onClick();
  };

  const colors = isDarkMode ? darkColors : lightColors;
  const shadows = isDarkMode ? darkShadowColors : lightShadowColors;
  const hoverGlow = isDarkMode ? darkHoverGlow : lightHoverGlow;

  const getTextShadow = () => {
    if (isClicked) {
      return isDarkMode
        ? ['0 2px 12px rgba(180, 140, 220, 0.3)', '0 2px 24px rgba(180, 140, 220, 0.6)', '0 2px 12px rgba(180, 140, 220, 0.3)']
        : ['0 2px 12px rgba(91, 75, 168, 0.2)', '0 2px 24px rgba(91, 75, 168, 0.5)', '0 2px 12px rgba(91, 75, 168, 0.2)'];
    }
    if (isHovered) {
      return hoverGlow;
    }
    return shadows;
  };

  const getTextShadowTransition = () => {
    if (isClicked) {
      return { duration: 0.5 } as const;
    }
    if (isHovered) {
      return { duration: 1.5, repeat: Infinity, ease: "easeInOut" as const };
    }
    return { duration: 8, repeat: Infinity, ease: "easeInOut" as const };
  };

  return (
    <motion.button
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-xl px-1 -ml-1 overflow-visible"
      animate={{
        y: [0, -4, 0, -2, 0],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
        times: [0, 0.25, 0.5, 0.75, 1],
      }}
      whileTap={{ scale: 0.95 }}
    >
      <AnimatePresence>
        {isClicked && (
          <motion.span
            className="absolute inset-0 rounded-lg pointer-events-none"
            initial={{ opacity: 0.6, scale: 0.8 }}
            animate={{ opacity: 0, scale: 1.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{
              background: isDarkMode
                ? 'radial-gradient(circle, rgba(180, 140, 220, 0.4) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(91, 75, 168, 0.3) 0%, transparent 70%)',
            }}
          />
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {sparkles.map((sparkle) => (
          <SparkleParticle key={sparkle.id} sparkle={sparkle} isDarkMode={isDarkMode} />
        ))}
      </AnimatePresence>

      <motion.span
        animate={{ rotate: isHovered ? [0, -4, 4, 0] : 0 }}
        transition={{ duration: 1.2, repeat: isHovered ? Infinity : 0, ease: "easeInOut" }}
      >
        <BrandMark size={markSizes[size]} className="shadow-primary/25" />
      </motion.span>

      <motion.h1 
        className={`${sizeClasses[size]} tracking-tight select-none relative`}
        animate={{
          color: colors,
          textShadow: getTextShadow(),
        }}
        transition={{
          color: {
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          },
          textShadow: getTextShadowTransition(),
        }}
        style={{
          fontFamily: "'Dancing Script', cursive",
          fontWeight: 700,
          letterSpacing: '-0.01em',
        }}
      >
        tightly
      </motion.h1>
    </motion.button>
  );
}
