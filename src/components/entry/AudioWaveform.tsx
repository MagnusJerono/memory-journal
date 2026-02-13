import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface AudioWaveformProps {
  audioLevel: number;
  isActive: boolean;
  className?: string;
  height?: number; // Height in pixels (default: 64)
  isDarkMode?: boolean; // Optional dark mode flag
}

export function AudioWaveform({ 
  audioLevel, 
  isActive, 
  className,
  height = 64,
  isDarkMode = false
}: AudioWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const currentLevelRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

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

      // Smooth interpolation for dreamy feel (lerp factor 0.15)
      const targetLevel = isActive ? audioLevel : 0.05; // Gentle breathing when idle
      currentLevelRef.current += (targetLevel - currentLevelRef.current) * 0.15;
      
      // Increment time for wave animation
      timeRef.current += 0.016; // ~60fps

      const centerY = rect.height / 2;
      const points = 200; // Number of points for smooth curves
      
      // Define wave parameters for 3 layers
      const waves = [
        {
          frequency: 0.02,
          amplitude: currentLevelRef.current * 0.6,
          phase: timeRef.current * 0.001,
          colors: isDarkMode 
            ? { r: 167, g: 139, b: 250, a: 0.8 } // violet-300
            : { r: 139, g: 92, b: 246, a: 0.8 },  // violet-500
          lineWidth: 3,
          glowWidth: 8,
          glowAlpha: 0.4
        },
        {
          frequency: 0.015,
          amplitude: currentLevelRef.current * 0.4,
          phase: timeRef.current * 0.0015 + 1,
          colors: isDarkMode 
            ? { r: 216, g: 180, b: 254, a: 0.5 } // purple-300
            : { r: 168, g: 85, b: 247, a: 0.5 },  // purple-500
          lineWidth: 2.5,
          glowWidth: 7,
          glowAlpha: 0.3
        },
        {
          frequency: 0.025,
          amplitude: currentLevelRef.current * 0.3,
          phase: timeRef.current * 0.002 + 2,
          colors: isDarkMode 
            ? { r: 249, g: 168, b: 212, a: 0.3 } // pink-300
            : { r: 244, g: 114, b: 182, a: 0.3 }, // pink-400
          lineWidth: 2,
          glowWidth: 6,
          glowAlpha: 0.2
        }
      ];

      // Draw each wave layer
      waves.forEach(wave => {
        const baseAmplitude = rect.height * 0.25;
        const amplitude = baseAmplitude * wave.amplitude;
        
        // Draw glow layer first (behind the main wave)
        if (isActive) {
          ctx.save();
          ctx.shadowBlur = 12;
          ctx.shadowColor = `rgba(${wave.colors.r}, ${wave.colors.g}, ${wave.colors.b}, ${wave.glowAlpha})`;
          ctx.lineWidth = wave.glowWidth;
          ctx.strokeStyle = `rgba(${wave.colors.r}, ${wave.colors.g}, ${wave.colors.b}, ${wave.glowAlpha * 0.5})`;
          
          ctx.beginPath();
          for (let i = 0; i <= points; i++) {
            const x = (i / points) * rect.width;
            const progress = i / points;
            const sineValue = Math.sin(progress * Math.PI * 2 * wave.frequency * rect.width + wave.phase);
            const y = centerY + sineValue * amplitude;
            
            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
          ctx.stroke();
          ctx.restore();
        }
        
        // Draw main wave
        const gradient = ctx.createLinearGradient(0, 0, rect.width, 0);
        if (isActive) {
          // Active gradient violet → purple → pink
          if (isDarkMode) {
            gradient.addColorStop(0, `rgba(167, 139, 250, ${wave.colors.a})`);    // violet-300
            gradient.addColorStop(0.5, `rgba(216, 180, 254, ${wave.colors.a})`);  // purple-300
            gradient.addColorStop(1, `rgba(249, 168, 212, ${wave.colors.a * 0.7})`); // pink-300
          } else {
            gradient.addColorStop(0, `rgba(139, 92, 246, ${wave.colors.a})`);     // violet-500
            gradient.addColorStop(0.5, `rgba(168, 85, 247, ${wave.colors.a})`);   // purple-500
            gradient.addColorStop(1, `rgba(244, 114, 182, ${wave.colors.a * 0.7})`); // pink-400
          }
        } else {
          // Inactive - very subtle violet
          const inactiveAlpha = isDarkMode ? 0.15 : 0.1;
          gradient.addColorStop(0, `rgba(167, 139, 250, ${inactiveAlpha})`);
          gradient.addColorStop(1, `rgba(167, 139, 250, ${inactiveAlpha})`);
        }
        
        ctx.lineWidth = wave.lineWidth;
        ctx.strokeStyle = gradient;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        ctx.beginPath();
        for (let i = 0; i <= points; i++) {
          const x = (i / points) * rect.width;
          const progress = i / points;
          const sineValue = Math.sin(progress * Math.PI * 2 * wave.frequency * rect.width + wave.phase);
          const y = centerY + sineValue * amplitude;
          
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      });

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [audioLevel, isActive, isDarkMode, height]);

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
