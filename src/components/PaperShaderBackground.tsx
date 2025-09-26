import React, { useEffect, useRef } from 'react';

export const PaperShaderBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const animate = () => {
      time += 0.01;
      
      // Clear canvas
      ctx.fillStyle = '#0a0a0f';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Create flowing energy patterns
      const gradient1 = ctx.createRadialGradient(
        canvas.width * 0.3 + Math.sin(time) * 200,
        canvas.height * 0.4 + Math.cos(time * 0.8) * 150,
        0,
        canvas.width * 0.3 + Math.sin(time) * 200,
        canvas.height * 0.4 + Math.cos(time * 0.8) * 150,
        400
      );
      gradient1.addColorStop(0, 'rgba(147, 51, 234, 0.3)');
      gradient1.addColorStop(0.5, 'rgba(147, 51, 234, 0.1)');
      gradient1.addColorStop(1, 'rgba(147, 51, 234, 0)');

      const gradient2 = ctx.createRadialGradient(
        canvas.width * 0.7 + Math.cos(time * 1.2) * 180,
        canvas.height * 0.6 + Math.sin(time * 0.9) * 120,
        0,
        canvas.width * 0.7 + Math.cos(time * 1.2) * 180,
        canvas.height * 0.6 + Math.sin(time * 0.9) * 120,
        350
      );
      gradient2.addColorStop(0, 'rgba(168, 85, 247, 0.4)');
      gradient2.addColorStop(0.5, 'rgba(168, 85, 247, 0.15)');
      gradient2.addColorStop(1, 'rgba(168, 85, 247, 0)');

      const gradient3 = ctx.createRadialGradient(
        canvas.width * 0.5 + Math.sin(time * 0.7) * 160,
        canvas.height * 0.3 + Math.cos(time * 1.1) * 140,
        0,
        canvas.width * 0.5 + Math.sin(time * 0.7) * 160,
        canvas.height * 0.3 + Math.cos(time * 1.1) * 140,
        300
      );
      gradient3.addColorStop(0, 'rgba(124, 58, 237, 0.25)');
      gradient3.addColorStop(0.5, 'rgba(124, 58, 237, 0.08)');
      gradient3.addColorStop(1, 'rgba(124, 58, 237, 0)');

      // Apply gradients
      ctx.fillStyle = gradient1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = gradient2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = gradient3;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add flowing lines/connections
      ctx.strokeStyle = 'rgba(147, 51, 234, 0.2)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      for (let i = 0; i < 5; i++) {
        const x1 = canvas.width * (0.2 + i * 0.15) + Math.sin(time + i) * 100;
        const y1 = canvas.height * 0.5 + Math.cos(time * 0.8 + i) * 200;
        const x2 = canvas.width * (0.3 + i * 0.15) + Math.sin(time + i + 1) * 120;
        const y2 = canvas.height * 0.5 + Math.cos(time * 0.8 + i + 1) * 180;
        
        ctx.moveTo(x1, y1);
        ctx.quadraticCurveTo(
          (x1 + x2) / 2 + Math.sin(time * 2) * 50,
          (y1 + y2) / 2 + Math.cos(time * 2) * 50,
          x2, y2
        );
      }
      ctx.stroke();

      // Add subtle noise texture
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * 10;
        data[i] += noise;     // Red
        data[i + 1] += noise; // Green
        data[i + 2] += noise; // Blue
      }
      
      ctx.putImageData(imageData, 0, 0);

      animationId = requestAnimationFrame(animate);
    };

    resize();
    animate();

    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 w-full h-full"
      style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%)' }}
    />
  );
};