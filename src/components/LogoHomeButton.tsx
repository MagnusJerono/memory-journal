import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LogoHomeButtonProps {
  isDarkMode?: boolean;
  onClick: () => void;
  size?: 'sm' | 'md' | 'lg';
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

export function LogoHomeButton({ isDarkMode = false, onClick, size = 'md' }: LogoHomeButtonProps) {
  const [isClicked, setIsClicked] = useState(false);

  const sizeClasses = {
    sm: 'text-xl sm:text-2xl',
    md: 'text-2xl sm:text-3xl',
    lg: 'text-3xl sm:text-4xl'
  };

  const handleClick = () => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 600);
    onClick();
  };

  const colors = isDarkMode ? darkColors : lightColors;
  const shadows = isDarkMode ? darkShadowColors : lightShadowColors;

  return (
    <motion.button
      onClick={handleClick}
      className="relative flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-lg px-1 -ml-1"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
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
      <motion.h1 
        className={`${sizeClasses[size]} tracking-tight select-none relative`}
        animate={{
          color: isClicked ? colors : colors,
          textShadow: isClicked
            ? (isDarkMode
              ? ['0 2px 12px rgba(180, 140, 220, 0.3)', '0 2px 24px rgba(180, 140, 220, 0.6)', '0 2px 12px rgba(180, 140, 220, 0.3)']
              : ['0 2px 12px rgba(91, 75, 168, 0.2)', '0 2px 24px rgba(91, 75, 168, 0.5)', '0 2px 12px rgba(91, 75, 168, 0.2)'])
            : shadows,
        }}
        transition={{
          color: {
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          },
          textShadow: isClicked 
            ? { duration: 0.5 } 
            : { duration: 8, repeat: Infinity, ease: "easeInOut" },
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
