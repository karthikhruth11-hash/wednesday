import React, { useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';

export default function ArcReactorVisualizer({ state, activeGesture, handPos }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animationId;
    let rOuter = 0;
    let rInner = 0;
    let rCore = 0;
    let pulsePhase = 0;
    let waveRadius = 0;

    // Interactive Plasma Particle System
    const particles = Array.from({ length: 70 }, () => ({
      angle: Math.random() * Math.PI * 2,
      speed: 0.6 + Math.random() * 2.0,
      dist: 15 + Math.random() * 130,
      size: 1.2 + Math.random() * 2.8,
      alpha: 0.3 + Math.random() * 0.7
    }));

    const orbitalNodes = [
      'ChatGPT Core',
      'Gestures AI',
      'Voice Synth',
      'Sigma OS',
      'Auto ML',
      'Galaxy Radar',
      'Atomic Core'
    ];

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

      // Dynamic Theme Color Palette & Rotation Speeds based on state
      let speedMult = 1.0;
      let primaryColor = '#00f0ff'; // Stark Neon Cyan
      let secondaryColor = '#0066ff'; // Electric Blue
      let accentGlow = 'rgba(0, 240, 255, 0.4)';

      if (state === 'listening') {
        speedMult = 2.2;
        primaryColor = '#00ff88'; // Matrix Emerald Green
        secondaryColor = '#00cc44';
        accentGlow = 'rgba(0, 255, 136, 0.4)';
      } else if (state === 'processing') {
        speedMult = 3.5;
        primaryColor = '#a855f7'; // Quantum Deep Purple
        secondaryColor = '#e040fb';
        accentGlow = 'rgba(168, 85, 247, 0.5)';
      } else if (state === 'speaking') {
        speedMult = 2.0;
        primaryColor = '#ff0055'; // Solar Fusion Crimson
        secondaryColor = '#ffb703'; // Golden Blaze
        accentGlow = 'rgba(255, 0, 85, 0.5)';
      }

      rOuter += 0.007 * speedMult;
      rInner -= 0.014 * speedMult;
      rCore += 0.022 * speedMult;
      pulsePhase += 0.045 * speedMult;
      waveRadius = (waveRadius + 1.8 * speedMult) % 190;

      const scale = (handPos && handPos.pinchDist) ? Math.max(0.6, Math.min(1.8, handPos.pinchDist * 6)) : 1;

      // --- 1. SWIRLING PLASMA SPARK PARTICLES ---
      particles.forEach(p => {
        p.dist += p.speed * speedMult * 0.45;
        if (p.dist > 155 * scale) {
          p.dist = (15 + Math.random() * 20) * scale;
          p.angle = Math.random() * Math.PI * 2;
        }

        const px = centerX + Math.cos(p.angle) * p.dist;
        const py = centerY + Math.sin(p.angle) * p.dist;

        ctx.fillStyle = primaryColor;
        ctx.shadowColor = primaryColor;
        ctx.shadowBlur = 10;
        ctx.globalAlpha = p.alpha * Math.sin((p.dist / (155 * scale)) * Math.PI);
        ctx.beginPath();
        ctx.arc(px, py, p.size * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      // --- 2. PULSING SHOCKWAVE EXPANSION RING ---
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = Math.max(0.5, (1 - waveRadius / 190) * 3.5);
      ctx.globalAlpha = Math.max(0, 1 - waveRadius / 190);
      ctx.shadowColor = primaryColor;
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(0, 0, waveRadius * scale, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // --- 3. OUTER TUNGSTEN ALLOY FIN SEGMENTS ---
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rOuter);

      const numFins = 10;
      for (let i = 0; i < numFins; i++) {
        const angle = (i / numFins) * Math.PI * 2;
        ctx.save();
        ctx.rotate(angle);

        ctx.fillStyle = 'rgba(6, 18, 36, 0.88)';
        ctx.strokeStyle = primaryColor;
        ctx.lineWidth = 1.5 * scale;
        ctx.shadowColor = primaryColor;
        ctx.shadowBlur = 12;

        ctx.beginPath();
        ctx.moveTo(92 * scale, -10 * scale);
        ctx.lineTo(128 * scale, -14 * scale);
        ctx.lineTo(128 * scale, 14 * scale);
        ctx.lineTo(92 * scale, 10 * scale);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Inner glowing copper wire windings
        ctx.strokeStyle = secondaryColor;
        ctx.lineWidth = 2 * scale;
        ctx.beginPath();
        ctx.moveTo(100 * scale, -6 * scale);
        ctx.lineTo(120 * scale, -9 * scale);
        ctx.moveTo(100 * scale, 0);
        ctx.lineTo(120 * scale, 0);
        ctx.moveTo(100 * scale, 6 * scale);
        ctx.lineTo(120 * scale, 9 * scale);
        ctx.stroke();

        ctx.restore();
      }
      ctx.restore();

      // --- 4. COUNTER-ROTATING HAZARD & TICK RINGS ---
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rInner);

      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 2 * scale;
      ctx.shadowColor = primaryColor;
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(0, 0, 84 * scale, 0, Math.PI * 2);
      ctx.stroke();

      // Dashed inner ring
      ctx.setLineDash([7 * scale, 9 * scale]);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3.5 * scale;
      ctx.beginPath();
      ctx.arc(0, 0, 76 * scale, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.restore();

      // --- 5. ORBITAL SATELLITE NODES ---
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rOuter * 0.75);

      orbitalNodes.forEach((nodeText, idx) => {
        const angle = (idx / orbitalNodes.length) * Math.PI * 2;
        const r = 146 * scale;
        const nx = Math.cos(angle) * r;
        const ny = Math.sin(angle) * r;

        ctx.fillStyle = primaryColor;
        ctx.shadowColor = primaryColor;
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(nx, ny, 4 * scale, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = 'bold 9px Orbitron, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(nodeText, nx + 7, ny + 3);
      });
      ctx.restore();

      // --- 6. CENTRAL QUANTUM PLASMA REACTOR CORE ---
      ctx.save();
      ctx.translate(centerX, centerY);

      const corePulse = (44 + Math.sin(pulsePhase) * 5) * scale;

      // Multi-stop Radiant Gradient
      const radGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, corePulse * 2.0);
      radGrad.addColorStop(0, '#ffffff');
      radGrad.addColorStop(0.25, primaryColor);
      radGrad.addColorStop(0.6, secondaryColor);
      radGrad.addColorStop(0.88, accentGlow);
      radGrad.addColorStop(1, 'transparent');

      ctx.fillStyle = radGrad;
      ctx.beginPath();
      ctx.arc(0, 0, corePulse * 2.0, 0, Math.PI * 2);
      ctx.fill();

      // Core Glass Lens Ring
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3 * scale;
      ctx.shadowColor = primaryColor;
      ctx.shadowBlur = 32;
      ctx.beginPath();
      ctx.arc(0, 0, 46 * scale, 0, Math.PI * 2);
      ctx.stroke();

      // Core Tri-Arc Orbit Rings
      for (let i = 0; i < 3; i++) {
        ctx.save();
        ctx.rotate(rCore + (i * Math.PI * 2) / 3);
        ctx.strokeStyle = primaryColor;
        ctx.lineWidth = 2 * scale;
        ctx.beginPath();
        ctx.ellipse(0, 0, 38 * scale, 13 * scale, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Central Quantum Emblem ⚛️
      ctx.font = `bold ${Math.round(28 * scale)}px Orbitron, sans-serif`;
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = primaryColor;
      ctx.shadowBlur = 18;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⚛️', 0, 0);

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
          <Sparkles size={14} /> STARK ARC REACTOR ENGAGED: {activeGesture}
        </div>
      )}
    </div>
  );
}
