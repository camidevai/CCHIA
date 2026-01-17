import { useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const MatrixBackground = () => {
  const canvasRef = useRef(null);
  const { isDark } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Matrix characters
    const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    const fontSize = 14;
    const columns = canvas.width / fontSize;

    // Array to store y position of each column
    const drops = Array(Math.floor(columns)).fill(1);

    // Animation function
    const draw = () => {
      // Theme-aware background fade effect
      if (isDark) {
        // Dark mode: semi-transparent dark background
        ctx.fillStyle = 'rgba(15, 23, 42, 0.05)';
      } else {
        // Light mode: semi-transparent white background for fade effect
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      }
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Theme-aware text color
      if (isDark) {
        // Dark mode: bright cyan
        ctx.fillStyle = '#00bcd4';
      } else {
        // Light mode: much darker teal/cyan for strong visibility
        ctx.fillStyle = 'rgba(0, 105, 120, 0.85)';
      }
      ctx.font = `${fontSize}px monospace`;

      // Loop through drops
      for (let i = 0; i < drops.length; i++) {
        // Random character
        const text = chars[Math.floor(Math.random() * chars.length)];

        // Draw character
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        // Reset drop to top randomly
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        // Increment y position
        drops[i]++;
      }
    };

    // Animation loop
    const interval = setInterval(draw, 50);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [isDark]); // Re-run effect when theme changes

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 z-0 ${isDark ? 'opacity-20' : 'opacity-50'}`}
      aria-hidden="true"
    />
  );
};

export default MatrixBackground;

