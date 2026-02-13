import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface AudioWaveformProps {
  audioLevel: number;
  isActive: boolean;
  className?: string;
  height?: number; // Height in pixels (default: 48)
  isDarkMode?: boolean; // Optional dark mode flag
}

export function AudioWaveform({ 
  audioLevel, 
  isActive, 
  className,
  height = 48,
  isDarkMode = false
}: AudioWaveformProps) {
  const barsCount = 24;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const barsRef = useRef<number[]>(Array(barsCount).fill(0));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const draw = () => {
      ctx.clearRect(0, 0, rect.width, rect.height);

      const barWidth = rect.width / barsCount;
      const gap = 3;
      const actualBarWidth = barWidth - gap;
      const maxHeight = rect.height * 0.8;
      const minHeight = 4;

      for (let i = 0; i < barsCount; i++) {
        const targetHeight = isActive 
          ? minHeight + (maxHeight - minHeight) * audioLevel * (0.5 + Math.sin(Date.now() / 100 + i * 0.5) * 0.3 + Math.random() * 0.2)
          : minHeight;
        
        // Smoother animation
        barsRef.current[i] += (targetHeight - barsRef.current[i]) * 0.4;
        
        const barHeight = Math.max(minHeight, barsRef.current[i]);
        const x = i * barWidth + gap / 2;
        const y = (rect.height - barHeight) / 2;

        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        if (isActive) {
          // Use theme-aware colors with more vibrant active state
          if (isDarkMode) {
            gradient.addColorStop(0, 'oklch(0.75 0.18 45 / 0.95)');
            gradient.addColorStop(0.5, 'oklch(0.65 0.16 50 / 1)');
            gradient.addColorStop(1, 'oklch(0.75 0.18 45 / 0.95)');
          } else {
            gradient.addColorStop(0, 'oklch(0.60 0.15 45 / 0.9)');
            gradient.addColorStop(0.5, 'oklch(0.50 0.14 50 / 1)');
            gradient.addColorStop(1, 'oklch(0.60 0.15 45 / 0.9)');
          }
        } else {
          // Inactive state - more muted
          if (isDarkMode) {
            gradient.addColorStop(0, 'oklch(0.55 0.02 250 / 0.4)');
            gradient.addColorStop(1, 'oklch(0.55 0.02 250 / 0.4)');
          } else {
            gradient.addColorStop(0, 'oklch(0.45 0.02 250 / 0.3)');
            gradient.addColorStop(1, 'oklch(0.45 0.02 250 / 0.3)');
          }
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, actualBarWidth, barHeight, actualBarWidth / 2);
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [audioLevel, isActive, barsCount, isDarkMode, height]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("w-full", className)}
      style={{ width: '100%', height: `${height}px` }}
      role="img"
      aria-label={isActive ? `Recording audio level: ${Math.round(audioLevel * 100)}%` : "Audio waveform (inactive)"}
      aria-live="polite"
    />
  );
}
