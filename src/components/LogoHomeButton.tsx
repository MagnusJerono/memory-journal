import { motion } from 'framer-motion';

interface LogoHomeButtonProps {
  isDarkMode?: boolean;
  onClick: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export function LogoHomeButton({ isDarkMode = false, onClick, size = 'md' }: LogoHomeButtonProps) {
  const sizeClasses = {
    sm: 'text-xl sm:text-2xl',
    md: 'text-2xl sm:text-3xl',
    lg: 'text-3xl sm:text-4xl'
  };

  return (
    <motion.button
      onClick={onClick}
      className="flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-lg px-1 -ml-1"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <h1 
        className={`${sizeClasses[size]} tracking-tight select-none`}
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
      </h1>
    </motion.button>
  );
}
