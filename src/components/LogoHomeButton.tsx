import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LogoHomeButtonProps {
  isDarkMode?: boolean;
  onClick: () => void;
  size?: 'sm' | 'md' | 'lg';
}

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
        animate={isClicked ? {
          textShadow: isDarkMode
            ? ['0 2px 12px rgba(180, 140, 220, 0.3)', '0 2px 24px rgba(180, 140, 220, 0.6)', '0 2px 12px rgba(180, 140, 220, 0.3)']
            : ['0 2px 12px rgba(91, 75, 168, 0.2)', '0 2px 24px rgba(91, 75, 168, 0.5)', '0 2px 12px rgba(91, 75, 168, 0.2)']
        } : {}}
        transition={{ duration: 0.5 }}
        style={{
          fontFamily: "'Dancing Script', cursive",
          fontWeight: 700,
          color: isDarkMode ? '#e0d4f7' : '#5b4ba8',
          letterSpacing: '-0.01em',
          textShadow: isDarkMode
            ? '0 2px 12px rgba(180, 140, 220, 0.3)'
            : '0 2px 12px rgba(91, 75, 168, 0.2)',
        }}
      >
        tightly
      </motion.h1>
    </motion.button>
  );
}
