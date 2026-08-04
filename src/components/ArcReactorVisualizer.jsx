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
    let rRingRot = 0;
    let pulsePhase = 0;
    let waveRadius = 0;

    // Cosmic Star Dust Particles
    const particles = Array.from({ length: 90 }, () => ({
      angle: Math.random() * Math.PI * 2,
      speed: 0.5 + Math.random() * 1.8,
      dist: 20 + Math.random() * 200,
      size: 1.0 + Math.random() * 2.5,
      alpha: 0.3 + Math.random() * 0.7
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
      let primaryColor = '#00f0ff'; // Stark Neon Cyan
      let secondaryColor = '#ff6b00'; // Cosmic Fiery Amber
      let accentGlow = 'rgba(0, 240, 255, 0.4)';

      if (state === 'listening') {
        speedMult = 2.2;
        primaryColor = '#00ff88'; // Matrix Emerald Green
        secondaryColor = '#ffaa00';
        accentGlow = 'rgba(0, 255, 136, 0.4)';
      } else if (state === 'processing') {
        speedMult = 3.5;
        primaryColor = '#a855f7'; // Quantum Deep Purple
        secondaryColor = '#ff0055';
        accentGlow = 'rgba(168, 85, 247, 0.5)';
      } else if (state === 'speaking') {
        speedMult = 2.0;
        primaryColor = '#ff0055'; // Solar Fusion Crimson
        secondaryColor = '#ffb703'; // Golden Blaze
        accentGlow = 'rgba(255, 0, 85, 0.5)';
      }

      rGalaxyRot += 0.008 * speedMult;
      rRingRot -= 0.012 * speedMult;
      pulsePhase += 0.045 * speedMult;
      waveRadius = (waveRadius + 1.8 * speedMult) % 230;

      const scale = (handPos && handPos.pinchDist) ? Math.max(0.6, Math.min(1.8, handPos.pinchDist * 6)) : 1;

      // --- 1. SWIRLING COSMIC STARDUST PARTICLES ---
      particles.forEach(p => {
        p.dist += p.speed * speedMult * 0.45;
        if (p.dist > 220 * scale) {
          p.dist = (20 + Math.random() * 30) * scale;
          p.angle = Math.random() * Math.PI * 2;
        }

        const px = centerX + Math.cos(p.angle) * p.dist;
        const py = centerY + Math.sin(p.angle) * p.dist;

        ctx.fillStyle = p.dist < 110 ? secondaryColor : primaryColor;
        ctx.shadowColor = primaryColor;
        ctx.shadowBlur = 8;
        ctx.globalAlpha = p.alpha * Math.sin((p.dist / (220 * scale)) * Math.PI);
        ctx.beginPath();
        ctx.arc(px, py, p.size * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      // --- 2. PULSING GALAXY ENERGY SHOCKWAVE ---
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = Math.max(0.5, (1 - waveRadius / 230) * 3);
      ctx.globalAlpha = Math.max(0, 1 - waveRadius / 230);
      ctx.shadowColor = primaryColor;
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(0, 0, waveRadius * scale, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // --- 3. PURE GALAXY ARC REACTOR ANIMATION ---
      ctx.save();
      ctx.translate(centerX, centerY);

      const baseRadius = 115 * scale;
      const corePulse = baseRadius + Math.sin(pulsePhase) * (6 * scale);

      // Outer Fiery Corona Aura Glow
      const coronaGlow = ctx.createRadialGradient(0, 0, baseRadius * 0.3, 0, 0, corePulse * 1.85);
      coronaGlow.addColorStop(0, 'rgba(255, 90, 20, 0.65)');
      coronaGlow.addColorStop(0.5, 'rgba(255, 40, 0, 0.35)');
      coronaGlow.addColorStop(0.85, accentGlow);
      coronaGlow.addColorStop(1, 'transparent');

      ctx.fillStyle = coronaGlow;
      ctx.beginPath();
      ctx.arc(0, 0, corePulse * 1.85, 0, Math.PI * 2);
      ctx.fill();

      // Render Real Galaxy Image at Full Prominence
      const galaxyImg = galaxyImgRef.current;
      if (galaxyImg && (galaxyImg.complete || galaxyImg.naturalWidth > 0)) {
        ctx.save();

        // 360-degree Smooth Galaxy Spin
        ctx.rotate(rGalaxyRot);

        // Perfect Circular Clip
        ctx.beginPath();
        ctx.arc(0, 0, corePulse, 0, Math.PI * 2);
        ctx.clip();

        // Draw Real Galaxy Image at 100% Crisp Color Vibrancy
        const imgSize = corePulse * 2.15;
        ctx.drawImage(
          galaxyImg,
          -imgSize / 2,
          -imgSize / 2,
          imgSize,
          imgSize
        );

        // Soft Outer Edge Blend Overlay
        const edgeMask = ctx.createRadialGradient(0, 0, corePulse * 0.75, 0, 0, corePulse);
        edgeMask.addColorStop(0, 'rgba(0, 0, 0, 0)');
        edgeMask.addColorStop(0.85, 'rgba(255, 70, 0, 0.2)');
        edgeMask.addColorStop(1, primaryColor);
        ctx.fillStyle = edgeMask;
        ctx.beginPath();
        ctx.arc(0, 0, corePulse, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // Rotating Outer Cosmic Perimeter Energy Rings
      ctx.save();
      ctx.rotate(rRingRot);

      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 3 * scale;
      ctx.shadowColor = primaryColor;
      ctx.shadowBlur = 22;
      ctx.beginPath();
      ctx.arc(0, 0, corePulse, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2 * scale;
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(0, 0, corePulse * 1.08, 0, Math.PI * 2);
      ctx.stroke();

      // Orbiting Energy Dots on Perimeter
      const numOrbitDots = 8;
      for (let i = 0; i < numOrbitDots; i++) {
        const dotAngle = (i / numOrbitDots) * Math.PI * 2;
        const dx = Math.cos(dotAngle) * (corePulse * 1.08);
        const dy = Math.sin(dotAngle) * (corePulse * 1.08);

        ctx.fillStyle = primaryColor;
        ctx.shadowColor = primaryColor;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(dx, dy, 3.5 * scale, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
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
          <Sparkles size={14} /> GALAXY REACTOR ACTIVE: {activeGesture}
        </div>
      )}
    </div>
  );
}


