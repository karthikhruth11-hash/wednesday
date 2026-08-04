import React, { useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import galaxyImgUrl from '../assets/galaxy-core.jpg';

export default function ArcReactorVisualizer({ state, activeGesture, handPos }) {
  const canvasRef = useRef(null);
  const galaxyImgRef = useRef(null);

  useEffect(() => {
    // Synchronously assign image to ref for immediate rendering
    const img = new Image();
    galaxyImgRef.current = img;
    img.src = galaxyImgUrl;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animationId;
    let rGalaxyRot = 0;
    let pulsePhase = 0;

    // Fullscreen Cosmic Stardust Sparkles
    const particles = Array.from({ length: 120 }, () => ({
      x: Math.random(),
      y: Math.random(),
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: (Math.random() - 0.5) * 0.4,
      size: 1.0 + Math.random() * 2.8,
      alpha: 0.2 + Math.random() * 0.8
    }));

    const render = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const width = parent.clientWidth;
      const height = parent.clientHeight;
      const dpr = window.devicePixelRatio || 1;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      let centerX = width / 2;
      let centerY = height / 2;

      // Track hand position live if gesture engine active
      if (handPos && handPos.x !== undefined && handPos.y !== undefined) {
        centerX = (1 - handPos.x) * width;
        centerY = handPos.y * height;
      }

      // Dynamic State Color Palette & Animation Speeds
      let speedMult = 1.0;
      let primaryColor = '#00f0ff'; // Neon Cyan
      let secondaryColor = '#ff6b00'; // Fiery Amber

      if (state === 'listening') {
        speedMult = 2.0;
        primaryColor = '#00ff88'; // Emerald Green
        secondaryColor = '#ffaa00';
      } else if (state === 'processing') {
        speedMult = 3.2;
        primaryColor = '#a855f7'; // Purple
        secondaryColor = '#ff0055';
      } else if (state === 'speaking') {
        speedMult = 1.8;
        primaryColor = '#ff0055'; // Crimson
        secondaryColor = '#ffb703'; // Gold
      }

      rGalaxyRot += 0.005 * speedMult;
      pulsePhase += 0.035 * speedMult;

      const scale = (handPos && handPos.pinchDist) ? Math.max(0.7, Math.min(1.6, handPos.pinchDist * 5)) : 1;

      // --- 1. FULLSCREEN ROTATING GALAXY IMAGE ---
      const galaxyImg = galaxyImgRef.current;
      const diag = Math.sqrt(width * width + height * height) * 1.18 * scale;
      const pulseSize = diag + Math.sin(pulsePhase) * 20;

      if (galaxyImg && (galaxyImg.complete || galaxyImg.naturalWidth > 0)) {
        ctx.save();
        ctx.translate(centerX, centerY);

        // 360-degree Continuous Fullscreen Galaxy Rotation
        ctx.rotate(rGalaxyRot);

        // Draw Real Galaxy Image covering full screen edge to edge
        ctx.drawImage(
          galaxyImg,
          -pulseSize / 2,
          -pulseSize / 2,
          pulseSize,
          pulseSize
        );

        ctx.restore();
      } else {
        // Fallback space gradient
        const bgGrad = ctx.createRadialGradient(centerX, centerY, 50, centerX, centerY, width);
        bgGrad.addColorStop(0, '#0a0d1a');
        bgGrad.addColorStop(1, '#02040a');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);
      }

      // --- 2. STATE REACTIVE AMBIENT LUMINOSITY OVERLAY ---
      const ambientGlow = ctx.createRadialGradient(centerX, centerY, 50, centerX, centerY, width * 0.75);
      ambientGlow.addColorStop(0, 'rgba(0, 0, 0, 0)');
      ambientGlow.addColorStop(0.6, 'rgba(0, 0, 0, 0.35)');
      ambientGlow.addColorStop(1, 'rgba(2, 6, 16, 0.8)');

      ctx.fillStyle = ambientGlow;
      ctx.fillRect(0, 0, width, height);

      // --- 3. FULLSCREEN COSMIC STARDUST SPARKLES ---
      particles.forEach(p => {
        p.x = (p.x + p.speedX * 0.001 * speedMult + 1) % 1;
        p.y = (p.y + p.speedY * 0.001 * speedMult + 1) % 1;

        const px = p.x * width;
        const py = p.y * height;

        ctx.fillStyle = Math.random() > 0.5 ? primaryColor : secondaryColor;
        ctx.shadowColor = primaryColor;
        ctx.shadowBlur = 10;
        ctx.globalAlpha = p.alpha * (0.6 + 0.4 * Math.sin(pulsePhase * 2));
        ctx.beginPath();
        ctx.arc(px, py, p.size * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      ctx.restore();

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [state, activeGesture, handPos]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />

      {activeGesture && (
        <div style={{
          position: 'absolute',
          top: '12px',
          padding: '0.4rem 1rem',
          background: 'rgba(0, 240, 255, 0.15)',
          border: '1px solid #00f0ff',
          color: '#00f0ff',
          borderRadius: '20px',
          fontSize: '0.75rem',
          fontFamily: 'Orbitron',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          boxShadow: '0 0 15px rgba(0, 240, 255, 0.4)',
          zIndex: 10
        }}>
          <Sparkles size={14} /> FULLSCREEN GALAXY ACTIVE: {activeGesture}
        </div>
      )}
    </div>
  );
}


