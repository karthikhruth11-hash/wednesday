import React, { useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';

export default function ArcReactorVisualizer({ state, activeGesture, handPos }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animationId;
    let rotation1 = 0;
    let rotation2 = 0;
    let rotation3 = 0;
    let galaxyAngle = 0;

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
      const width = canvas.parentElement.clientWidth;
      const height = canvas.parentElement.clientHeight;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      ctx.clearRect(0, 0, width, height);

      let centerX = width / 2;
      let centerY = height / 2;

      // Track hand position live on screen if camera hand is active
      if (handPos && handPos.x !== undefined && handPos.y !== undefined) {
        centerX = (1 - handPos.x) * width; // Mirrored for natural hand tracking
        centerY = handPos.y * height;
      }

      let speedMult = 1;
      let coreColor = '#00f0ff'; // Cyan

      if (state === 'listening') {
        speedMult = 2.2;
        coreColor = '#00ff66'; // Green
      } else if (state === 'processing') {
        speedMult = 3.5;
        coreColor = '#a855f7'; // Purple
      } else if (state === 'speaking') {
        speedMult = 1.8;
        coreColor = '#f43f5e'; // Pink/Rose
      }

      rotation1 += 0.008 * speedMult;
      rotation2 -= 0.012 * speedMult;
      rotation3 += 0.018 * speedMult;
      galaxyAngle += 0.005 * speedMult;

      const pinchScale = (handPos && handPos.pinchDist) ? Math.max(0.6, Math.min(1.8, handPos.pinchDist * 6)) : 1;

      // --- 1. GALAXY SPIRAL ARMS BACKGROUND ---
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(galaxyAngle);

      for (let arm = 0; arm < 4; arm++) {
        const armOffset = (arm * Math.PI) / 2;
        ctx.beginPath();
        for (let i = 0; i < 120; i++) {
          const r = (i * 1.5 + 20) * pinchScale;
          const a = armOffset + i * 0.06;
          const x = Math.cos(a) * r;
          const y = Math.sin(a) * r;

          ctx.fillStyle = i % 2 === 0 ? coreColor : 'rgba(0, 240, 255, 0.4)';
          ctx.beginPath();
          ctx.arc(x, y, (i % 3 === 0 ? 2 : 1) * pinchScale, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();

      // --- 2. OUTER RETICLE ROTATING RINGS ---
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotation1);

      ctx.strokeStyle = coreColor;
      ctx.lineWidth = 2 * pinchScale;
      ctx.shadowColor = coreColor;
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(0, 0, 115 * pinchScale, 0, Math.PI * 2);
      ctx.stroke();

      // Outer Degree Tick Marks
      for (let i = 0; i < 36; i++) {
        const angle = (i / 36) * Math.PI * 2;
        const len = i % 3 === 0 ? 12 : 6;
        ctx.strokeStyle = i % 3 === 0 ? coreColor : 'rgba(0, 240, 255, 0.5)';
        ctx.lineWidth = i % 3 === 0 ? 2 : 1;
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * (115 * pinchScale), Math.sin(angle) * (115 * pinchScale));
        ctx.lineTo(Math.cos(angle) * ((115 + len) * pinchScale), Math.sin(angle) * ((115 + len) * pinchScale));
        ctx.stroke();
      }
      ctx.restore();

      // --- 3. INNER HAZARD-STRIPED RING ---
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotation2);

      ctx.strokeStyle = 'rgba(0, 240, 255, 0.7)';
      ctx.lineWidth = 2.5 * pinchScale;
      ctx.beginPath();
      ctx.arc(0, 0, 85 * pinchScale, 0, Math.PI * 2);
      ctx.stroke();

      // Hazard dashed ring
      ctx.setLineDash([8 * pinchScale, 8 * pinchScale]);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 5 * pinchScale;
      ctx.beginPath();
      ctx.arc(0, 0, 75 * pinchScale, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.restore();

      // --- 4. ORBITAL SATELLITE NODES ---
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotation3);

      orbitalNodes.forEach((nodeText, idx) => {
        const angle = (idx / orbitalNodes.length) * Math.PI * 2;
        const r = 145 * pinchScale;
        const nx = Math.cos(angle) * r;
        const ny = Math.sin(angle) * r;

        ctx.fillStyle = coreColor;
        ctx.shadowColor = coreColor;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(nx, ny, 4 * pinchScale, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = 'bold 9px Orbitron, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(nodeText, nx + 8, ny + 3);
      });
      ctx.restore();

      // --- 5. CENTRAL ATOMIC POWER PLASMA CORE ---
      ctx.save();
      ctx.translate(centerX, centerY);

      const pulseRadius = (35 + Math.sin(Date.now() * 0.005) * 4) * pinchScale;
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, pulseRadius * 1.8);
      gradient.addColorStop(0, '#ffffff');
      gradient.addColorStop(0.3, coreColor);
      gradient.addColorStop(0.7, 'rgba(0, 240, 255, 0.3)');
      gradient.addColorStop(1, 'transparent');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, pulseRadius * 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Core Glass Ring
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3 * pinchScale;
      ctx.shadowColor = coreColor;
      ctx.shadowBlur = 24;
      ctx.beginPath();
      ctx.arc(0, 0, 38 * pinchScale, 0, Math.PI * 2);
      ctx.stroke();

      // Central Atomic Symbol ⚛️
      ctx.font = `bold ${Math.round(24 * pinchScale)}px Orbitron, sans-serif`;
      ctx.fillStyle = '#00f0ff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⚛️', 0, 0);

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
      <canvas ref={canvasRef} />

      {activeGesture && (
        <div style={{ position: 'absolute', top: '10px', padding: '0.3rem 0.8rem', background: 'rgba(168,85,247,0.2)', border: '1px solid #a855f7', color: '#c084fc', borderRadius: '16px', fontSize: '0.7rem', fontFamily: 'Orbitron', display: 'flex', alignItems: 'center', gap: '0.4rem', zIndex: 10 }}>
          <Sparkles size={12} /> GALAXY ARC REACTOR REACTING: {activeGesture}
        </div>
      )}
    </div>
  );
}
