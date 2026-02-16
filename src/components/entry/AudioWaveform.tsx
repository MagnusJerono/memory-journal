import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface AudioWaveformProps {
  audioLevel: number;
  isActive: boolean;
  className?: string;
  height?: number; // Height in pixels (default: 64)
  isDarkMode?: boolean; // Optional dark mode flag
  getFrequencyData?: () => Uint8Array | null; // For per-bin spectral visualization
}

export function AudioWaveform({ 
  audioLevel, 
  isActive, 
  className,
  height = 64,
  isDarkMode = false,
  getFrequencyData
}: AudioWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const currentLevelRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const inactiveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

    let isAnimating = true;

    const draw = () => {
      ctx.clearRect(0, 0, rect.width, rect.height);

      // Fast attack, slow release for voice responsiveness
      const targetLevel = isActive ? audioLevel : 0.05; // Gentle breathing when idle
      const diff = targetLevel - currentLevelRef.current;
      const lerpUp = 0.5;   // Fast attack when voice gets louder
      const lerpDown = 0.15; // Slower release for smooth decay
      currentLevelRef.current += diff * (diff > 0 ? lerpUp : lerpDown);
      
      // Increment time for visible horizontal flow (2.5x faster than before)
      timeRef.current += 0.04;

      const centerY = rect.height / 2;
      const lineCount = 20; // Draw 20 thin flowing lines
      const baseAmplitude = rect.height * 0.35; // Use more vertical space
      
      // Get frequency data if available
      const frequencyData = getFrequencyData ? getFrequencyData() : null;
      
      // Create violet → blue gradient (left to right)
      const gradient = ctx.createLinearGradient(0, 0, rect.width, 0);
      if (isActive) {
        if (isDarkMode) {
          gradient.addColorStop(0, 'rgba(167, 139, 250, 0.6)');    // violet-300
          gradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.5)');   // violet-500/blue
          gradient.addColorStop(1, 'rgba(96, 165, 250, 0.4)');     // blue-400
        } else {
          gradient.addColorStop(0, 'rgba(139, 92, 246, 0.6)');     // violet-500
          gradient.addColorStop(0.5, 'rgba(124, 58, 237, 0.5)');   // violet-600/blue
          gradient.addColorStop(1, 'rgba(59, 130, 246, 0.4)');     // blue-500
        }
      } else {
        // Inactive - very subtle violet
        const inactiveAlpha = isDarkMode ? 0.15 : 0.1;
        gradient.addColorStop(0, `rgba(167, 139, 250, ${inactiveAlpha})`);
        gradient.addColorStop(1, `rgba(96, 165, 250, ${inactiveAlpha * 0.5})`);
      }

      // Draw each of the 20 thin lines
      for (let lineIdx = 0; lineIdx < lineCount; lineIdx++) {
        // Each line gets a slightly different frequency and phase
        const freq = 2 + lineIdx * 0.3; // Varying frequencies
        const phaseOffset = lineIdx * 0.4; // Different phases so lines cross
        
        // Use frequency data if available — each line maps to a frequency bin
        // This makes each line react to a DIFFERENT part of the audio spectrum
        let binValue = currentLevelRef.current;
        if (frequencyData && frequencyData.length > 0) {
          const binIndex = Math.floor((lineIdx / lineCount) * frequencyData.length);
          binValue = frequencyData[binIndex] / 255;
        }
        
        // Dynamic amplitude based on frequency bin or overall level
        const lineAmplitude = baseAmplitude * binValue * (0.5 + (lineIdx / lineCount) * 0.5);
        
        // Set line style
        ctx.beginPath();
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = gradient;
        ctx.globalAlpha = isActive ? (0.3 + binValue * 0.3) : 0.3; // More opaque when louder
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Draw the sine wave for this line
        for (let x = 0; x < rect.width; x += 2) {
          const progress = x / rect.width;
          const y = centerY + Math.sin(progress * freq * Math.PI + timeRef.current + phaseOffset) * lineAmplitude;
          
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }
      
      // Reset global alpha
      ctx.globalAlpha = 1.0;

      // Check if animation should pause: inactive and level has settled near target
      const hasSettled = Math.abs(currentLevelRef.current - targetLevel) < 0.001;
      if (!isActive && hasSettled) {
        // Stop rAF loop to save CPU when inactive and settled
        isAnimating = false;
        animationRef.current = null;
        
        // Use setTimeout for gentle breathing animation at reduced frame rate (~10fps)
        if (inactiveTimeoutRef.current) {
          clearTimeout(inactiveTimeoutRef.current);
        }
        inactiveTimeoutRef.current = setTimeout(() => {
          if (!isActive) {
            // Restart with low frame rate for breathing effect
            timeRef.current += 0.01; // Slower increment
            draw();
          }
        }, 100);
      } else if (isAnimating) {
        animationRef.current = requestAnimationFrame(draw);
      }
    };

    draw();

    return () => {
      isAnimating = false;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (inactiveTimeoutRef.current) {
        clearTimeout(inactiveTimeoutRef.current);
      }
    };
  }, [audioLevel, isActive, isDarkMode, height, getFrequencyData]);

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
