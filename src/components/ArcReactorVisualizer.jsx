import React, { useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import galaxyImgUrl from '../assets/galaxy-core.jpg';

export default function ArcReactorVisualizer({ state, activeGesture, handPos }) {
  const canvasRef = useRef(null);
  const galaxyImgRef = useRef(null);

  useEffect(() => {
    // Synchronously assign image to ref so cached/loaded images render instantly
    const img = new Image();
    galaxyImgRef.current = img;
    img.src = galaxyImgUrl;

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
    const particles = Array.from({ length: 80 }, () => ({
      angle: Math.random() * Math.PI * 2,
      speed: 0.6 + Math.random() * 2.0,
      dist: 15 + Math.random() * 140,
      size: 1.2 + Math.random() * 3.0,
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

      rOuter += 0.007 * speedMult;
      rInner -= 0.014 * speedMult;
      rCore += 0.018 * speedMult;
      pulsePhase += 0.045 * speedMult;
      waveRadius = (waveRadius + 1.8 * speedMult) % 190;

      const scale = (handPos && handPos.pinchDist) ? Math.max(0.6, Math.min(1.8, handPos.pinchDist * 6)) : 1;

      // --- 1. SWIRLING PLASMA SPARK PARTICLES ---
      particles.forEach(p => {
        p.dist += p.speed * speedMult * 0.45;
        if (p.dist > 165 * scale) {
          p.dist = (15 + Math.random() * 20) * scale;
          p.angle = Math.random() * Math.PI * 2;
        }

        const px = centerX + Math.cos(p.angle) * p.dist;
        const py = centerY + Math.sin(p.angle) * p.dist;

        ctx.fillStyle = p.dist < 80 ? secondaryColor : primaryColor;
        ctx.shadowColor = primaryColor;
        ctx.shadowBlur = 10;
        ctx.globalAlpha = p.alpha * Math.sin((p.dist / (165 * scale)) * Math.PI);
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

      // --- 6. REAL SPIRAL GALAXY REACTOR HEART ANIMATION ---
      ctx.save();
      ctx.translate(centerX, centerY);

      const baseCoreRadius = 76 * scale;
      const corePulse = baseCoreRadius + Math.sin(pulsePhase) * (3.5 * scale);

      // Multi-stop Cosmic Corona Glow (fiery orange matching galaxy arms)
      const radGrad = ctx.createRadialGradient(0, 0, baseCoreRadius * 0.3, 0, 0, corePulse * 1.8);
      radGrad.addColorStop(0, 'rgba(255, 100, 20, 0.5)');
      radGrad.addColorStop(0.5, 'rgba(255, 40, 0, 0.25)');
      radGrad.addColorStop(0.85, accentGlow);
      radGrad.addColorStop(1, 'transparent');

      ctx.fillStyle = radGrad;
      ctx.beginPath();
      ctx.arc(0, 0, corePulse * 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Render Pure Real Galaxy Image as Core Heart
      const galaxyImg = galaxyImgRef.current;
      if (galaxyImg && (galaxyImg.complete || galaxyImg.naturalWidth > 0)) {
        ctx.save();

        // Continuous Smooth Cosmic Galaxy Rotation (spinning the real galaxy photo!)
        ctx.rotate(rCore * 0.4);

        // Circular Clip to fit EXACTLY inside the reactor ring
        ctx.beginPath();
        ctx.arc(0, 0, corePulse, 0, Math.PI * 2);
        ctx.clip();

        // Draw Real Galaxy Image centered at 100% crisp color vibrancy
        const imgSize = corePulse * 2.15;
        ctx.drawImage(
          galaxyImg,
          -imgSize / 2,
          -imgSize / 2,
          imgSize,
          imgSize
        );

        // Edge Blend Vignette Ring
        const edgeMask = ctx.createRadialGradient(0, 0, corePulse * 0.7, 0, 0, corePulse);
        edgeMask.addColorStop(0, 'rgba(0, 0, 0, 0)');
        edgeMask.addColorStop(0.8, 'rgba(255, 70, 0, 0.15)');
        edgeMask.addColorStop(1, primaryColor);
        ctx.fillStyle = edgeMask;
        ctx.beginPath();
        ctx.arc(0, 0, corePulse, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // Sleek Sci-Fi Glass Core Rim Ring (Clean rim, NO atomic lines covering galaxy!)
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 2.5 * scale;
      ctx.shadowColor = primaryColor;
      ctx.shadowBlur = 22;
      ctx.beginPath();
      ctx.arc(0, 0, corePulse, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1 * scale;
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(0, 0, corePulse * 0.97, 0, Math.PI * 2);
      ctx.stroke();

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
          <Sparkles size={14} /> GALAXY ARC REACTOR ENGAGED: {activeGesture}
        </div>
      )}
    </div>
  );
}

