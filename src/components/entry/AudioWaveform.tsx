import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface AudioWaveformProps {
  audioLevel: number;
  isActive: boolean;
  className?: string;
}

export function AudioWaveform({ audioLevel, isActive, className }: AudioWaveformProps) {
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
        
        barsRef.current[i] += (targetHeight - barsRef.current[i]) * 0.3;
        
        const barHeight = Math.max(minHeight, barsRef.current[i]);
        const x = i * barWidth + gap / 2;
        const y = (rect.height - barHeight) / 2;

        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        if (isActive) {
          gradient.addColorStop(0, 'oklch(0.65 0.15 45 / 0.9)');
          gradient.addColorStop(0.5, 'oklch(0.55 0.14 50 / 1)');
          gradient.addColorStop(1, 'oklch(0.65 0.15 45 / 0.9)');
        } else {
          gradient.addColorStop(0, 'oklch(0.5 0.02 250 / 0.3)');
          gradient.addColorStop(1, 'oklch(0.5 0.02 250 / 0.3)');
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
  }, [audioLevel, isActive, barsCount]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("w-full h-12", className)}
      style={{ width: '100%', height: '48px' }}
    />
  );
}
