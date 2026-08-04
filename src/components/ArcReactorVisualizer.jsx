import React, { useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import spaceImgUrl from '../assets/serenity-space.jpg';

export default function ArcReactorVisualizer({ state, activeGesture, handPos }) {
  const canvasRef = useRef(null);
  const spaceImgRef = useRef(null);

  useEffect(() => {
    // Preload Cosmic Space Image synchronously
    const img = new Image();
    spaceImgRef.current = img;
    img.src = spaceImgUrl;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animationId;
    let time = 0;

    // Live Twinkling Stardust & Nebular Particles
    const particles = Array.from({ length: 140 }, () => ({
      x: Math.random(),
      y: Math.random(),
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.3,
      size: 0.8 + Math.random() * 2.5,
      alpha: 0.2 + Math.random() * 0.8,
      pulsePhase: Math.random() * Math.PI * 2
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

      // Parallax Tilt Offset from Hand Tracking / Mouse
      let parallaxX = 0;
      let parallaxY = 0;

      if (handPos && handPos.x !== undefined && handPos.y !== undefined) {
        centerX = (1 - handPos.x) * width;
        centerY = handPos.y * height;
        parallaxX = (0.5 - handPos.x) * 45;
        parallaxY = (handPos.y - 0.5) * 30;
      }

      // Dynamic State Color Palette & Animation Speeds
      let speedMult = 1.0;
      let primaryColor = '#00f0ff'; // Neon Cyan
      let secondaryColor = '#a855f7'; // Quantum Purple
      let accentGlow = 'rgba(0, 240, 255, 0.35)';

      if (state === 'listening') {
        speedMult = 2.0;
        primaryColor = '#00ff88'; // Emerald Green
        secondaryColor = '#00f0ff';
        accentGlow = 'rgba(0, 255, 136, 0.4)';
      } else if (state === 'processing') {
        speedMult = 3.2;
        primaryColor = '#e040fb'; // Deep Magenta Purple
        secondaryColor = '#ff0055';
        accentGlow = 'rgba(224, 64, 251, 0.5)';
      } else if (state === 'speaking') {
        speedMult = 1.8;
        primaryColor = '#ff0055'; // Crimson
        secondaryColor = '#ffb703'; // Gold
        accentGlow = 'rgba(255, 0, 85, 0.5)';
      }

      time += 0.012 * speedMult;

      // --- 1. FULLSCREEN SPACE WALLPAPER WITH PERFECT ASPECT-RATIO COVER FITTING ---
      const spaceImg = spaceImgRef.current;
      if (spaceImg && (spaceImg.complete || spaceImg.naturalWidth > 0)) {
        const imgW = spaceImg.naturalWidth || spaceImg.width || 1920;
        const imgH = spaceImg.naturalHeight || spaceImg.height || 1080;
        const imgRatio = imgW / imgH;
        const canvasRatio = width / height;

        let drawW, drawH;
        if (canvasRatio > imgRatio) {
          drawW = width * 1.08;
          drawH = drawW / imgRatio;
        } else {
          drawH = height * 1.08;
          drawW = drawH * imgRatio;
        }

        // Center with interactive Parallax shift
        const drawX = (width - drawW) / 2 + parallaxX;
        const drawY = (height - drawH) / 2 + parallaxY;

        ctx.drawImage(spaceImg, drawX, drawY, drawW, drawH);
      } else {
        // Fallback Deep Space Gradient
        const bgGrad = ctx.createRadialGradient(centerX, centerY, 50, centerX, centerY, width);
        bgGrad.addColorStop(0, '#150a2a');
        bgGrad.addColorStop(0.6, '#080d1e');
        bgGrad.addColorStop(1, '#02040a');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);
      }

      // --- 2. DYNAMIC STATE NEBULA GLOW OVERLAY ---
      const stateNebulaGlow = ctx.createRadialGradient(
        centerX, centerY, width * 0.1,
        centerX, centerY, width * 0.8
      );
      stateNebulaGlow.addColorStop(0, 'rgba(0, 0, 0, 0)');
      stateNebulaGlow.addColorStop(0.5, accentGlow);
      stateNebulaGlow.addColorStop(1, 'rgba(2, 4, 10, 0.7)');

      ctx.fillStyle = stateNebulaGlow;
      ctx.fillRect(0, 0, width, height);

      // --- 3. LIVE TWINKLING COSMIC STARDUST PARTICLES ---
      particles.forEach(p => {
        p.x = (p.x + p.speedX * 0.0006 * speedMult + 1) % 1;
        p.y = (p.y + p.speedY * 0.0006 * speedMult + 1) % 1;
        p.pulsePhase += 0.03 * speedMult;

        const px = p.x * width + parallaxX * 0.5;
        const py = p.y * height + parallaxY * 0.5;

        const alpha = p.alpha * (0.5 + 0.5 * Math.sin(p.pulsePhase));
        const col = Math.random() > 0.4 ? primaryColor : secondaryColor;

        ctx.fillStyle = col;
        ctx.shadowColor = primaryColor;
        ctx.shadowBlur = 8;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      // --- 4. LIVE ANIMATED 3D PLANET MOVEMENT (FROM THE 1ST IMAGE) ---
      if (spaceImg && (spaceImg.complete || spaceImg.naturalWidth > 0)) {
        const imgW = spaceImg.naturalWidth || spaceImg.width || 1920;
        const imgH = spaceImg.naturalHeight || spaceImg.height || 1080;

        // Source planet coordinates inside the Serenity wallpaper
        const srcPX = imgW * 0.685;
        const srcPY = imgH * 0.525;
        const srcPR = imgW * 0.118;

        const pinchScale = (handPos && handPos.pinchDist) ? Math.max(0.6, Math.min(1.8, handPos.pinchDist * 6)) : 1;
        const basePlanetRadius = 145 * pinchScale;
        const planetPulse = basePlanetRadius + Math.sin(time * 2.2) * (6 * pinchScale);

        ctx.save();
        ctx.translate(centerX, centerY);

        // A. Atmospheric Purple/Magma Corona Glow
        const coronaGrad = ctx.createRadialGradient(0, 0, basePlanetRadius * 0.5, 0, 0, planetPulse * 1.75);
        coronaGrad.addColorStop(0, 'rgba(168, 85, 247, 0.7)');
        coronaGrad.addColorStop(0.45, 'rgba(255, 107, 0, 0.35)');
        coronaGrad.addColorStop(0.85, accentGlow);
        coronaGrad.addColorStop(1, 'transparent');

        ctx.fillStyle = coronaGrad;
        ctx.beginPath();
        ctx.arc(0, 0, planetPulse * 1.75, 0, Math.PI * 2);
        ctx.fill();

        // B. Render & Rotate the Actual Planet Texture from the 1st Image
        ctx.save();
        // 360-degree Continuous 3D Planet Rotation
        ctx.rotate(time * 0.35);

        // Circular Clip for Planet
        ctx.beginPath();
        ctx.arc(0, 0, planetPulse, 0, Math.PI * 2);
        ctx.clip();

        // Draw the exact planet from the user's image centered
        ctx.drawImage(
          spaceImg,
          srcPX - srcPR,
          srcPY - srcPR,
          srcPR * 2,
          srcPR * 2,
          -planetPulse,
          -planetPulse,
          planetPulse * 2,
          planetPulse * 2
        );

        // Counter-Rotating Magma Surface Swirl for 3D Shimmer
        ctx.save();
        ctx.rotate(-time * 0.65);
        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = 0.4;
        ctx.drawImage(
          spaceImg,
          srcPX - srcPR,
          srcPY - srcPR,
          srcPR * 2,
          srcPR * 2,
          -planetPulse * 1.05,
          -planetPulse * 1.05,
          planetPulse * 2.1,
          planetPulse * 2.1
        );
        ctx.restore();

        // 3D Spherical Light & Volumetric Shadow Mask
        const sphereShade = ctx.createRadialGradient(
          -planetPulse * 0.35, -planetPulse * 0.35, planetPulse * 0.1,
          0, 0, planetPulse
        );
        sphereShade.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
        sphereShade.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
        sphereShade.addColorStop(0.85, 'rgba(10, 4, 30, 0.6)');
        sphereShade.addColorStop(1, 'rgba(3, 1, 10, 0.9)');

        ctx.fillStyle = sphereShade;
        ctx.beginPath();
        ctx.arc(0, 0, planetPulse, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore(); // end clip

        // C. 3D Rayleigh Limb Edge Glow
        const rimGrad = ctx.createRadialGradient(
          planetPulse * 0.25, planetPulse * 0.25, planetPulse * 0.75,
          0, 0, planetPulse
        );
        rimGrad.addColorStop(0, 'transparent');
        rimGrad.addColorStop(0.8, 'rgba(168, 85, 247, 0.35)');
        rimGrad.addColorStop(0.98, 'rgba(255, 255, 255, 0.85)');

        ctx.fillStyle = rimGrad;
        ctx.beginPath();
        ctx.arc(0, 0, planetPulse, 0, Math.PI * 2);
        ctx.fill();

        // D. Ultra-Sleek Glass Rim Ring
        ctx.strokeStyle = primaryColor;
        ctx.lineWidth = 2.5 * pinchScale;
        ctx.shadowColor = primaryColor;
        ctx.shadowBlur = 22;
        ctx.beginPath();
        ctx.arc(0, 0, planetPulse, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
      }

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
          background: 'rgba(168, 85, 247, 0.15)',
          border: '1px solid #a855f7',
          color: '#e040fb',
          borderRadius: '20px',
          fontSize: '0.75rem',
          fontFamily: 'Orbitron',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          boxShadow: '0 0 15px rgba(168, 85, 247, 0.4)',
          zIndex: 10
        }}>
          <Sparkles size={14} /> PLANET MOVEMENT ACTIVE: {activeGesture}
        </div>
      )}
    </div>
  );
}
