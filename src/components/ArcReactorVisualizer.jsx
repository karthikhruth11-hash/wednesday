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

    const orbitalNodes = [
      'ChatGPT Core',
      'Gestures AI',
      'Voice Synth',
      'Sigma OS',
      'Auto ML'
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
      let outerColor = '#00a8ff';

      if (activeGesture) {
        speedMult = 2.8;
        coreColor = '#a855f7'; // Purple
        outerColor = '#f43f5e';
      } else if (state === 'listening') {
        speedMult = 2.2;
        coreColor = '#f43f5e'; // Rose
        outerColor = '#ffb703';
      } else if (state === 'processing') {
        speedMult = 3.2;
        coreColor = '#ffb703'; // Yellow
        outerColor = '#00f0ff';
      } else if (state === 'speaking') {
        speedMult = 1.6;
        coreColor = '#00ff66'; // Emerald
        outerColor = '#00f0ff';
      }

      rotation1 += 0.008 * speedMult;
      rotation2 -= 0.012 * speedMult;
      rotation3 += 0.005 * speedMult;

      // Outer Arc Ring (Degree Notches & Reticles)
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotation1);

      ctx.strokeStyle = outerColor + '77';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 105, 0, Math.PI * 2);
      ctx.stroke();

      // Degree Notches
      const notchCount = 72;
      for (let i = 0; i < notchCount; i++) {
        const angle = (i / notchCount) * Math.PI * 2;
        const isLong = i % 6 === 0;
        const r1 = 105;
        const r2 = isLong ? 116 : 110;

        ctx.strokeStyle = isLong ? coreColor : 'rgba(0, 240, 255, 0.4)';
        ctx.lineWidth = isLong ? 2 : 1;
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * r1, Math.sin(angle) * r1);
        ctx.lineTo(Math.cos(angle) * r2, Math.sin(angle) * r2);
        ctx.stroke();
      }

      // Segmented Arc Gauges
      ctx.strokeStyle = coreColor;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(0, 0, 92, 0, Math.PI * 0.7);
      ctx.stroke();

      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(0, 0, 92, Math.PI * 0.85, Math.PI * 1.3);
      ctx.stroke();

      ctx.restore();

      // Counter-Rotating Inner Ring with Hazard Dashes & Ticks
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotation2);

      ctx.strokeStyle = 'rgba(0, 240, 255, 0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 78, 0, Math.PI * 2);
      ctx.stroke();

      // Inner Hazard Stripes Ring
      ctx.setLineDash([6, 6]);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, 68, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]); // Reset dash

      // Inner Reticle Teeth
      for (let i = 0; i < 24; i++) {
        const angle = (i / 24) * Math.PI * 2;
        ctx.strokeStyle = coreColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * 60, Math.sin(angle) * 60);
        ctx.lineTo(Math.cos(angle) * 68, Math.sin(angle) * 68);
        ctx.stroke();
      }

      ctx.restore();

      // Floating Orbital Satellite Nodes with Text Labels
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotation3);

      const orbitR = 140;
      orbitalNodes.forEach((label, idx) => {
        const angle = (idx / orbitalNodes.length) * Math.PI * 2;
        const nx = Math.cos(angle) * orbitR;
        const ny = Math.sin(angle) * orbitR;

        // Satellite Dot
        ctx.fillStyle = coreColor;
        ctx.shadowColor = coreColor;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(nx, ny, 4, 0, Math.PI * 2);
        ctx.fill();

        // Connecting Line
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(nx, ny);
        ctx.stroke();

        // Label Text
        ctx.font = '10px Orbitron, sans-serif';
        ctx.fillStyle = '#00f0ff';
        ctx.fillText(label, nx + 8, ny + 3);
      });

      ctx.restore();

      // Central Arc Reactor Core Sphere
      ctx.save();
      ctx.translate(centerX, centerY);

      // Core Radial Glow
      const glowGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 55);
      glowGrad.addColorStop(0, '#ffffff');
      glowGrad.addColorStop(0.3, coreColor);
      glowGrad.addColorStop(0.7, 'rgba(0, 168, 255, 0.4)');
      glowGrad.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 55, 0, Math.PI * 2);
      ctx.fill();

      // Core Glass Shading Ring
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = coreColor;
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(0, 0, 32, 0, Math.PI * 2);
      ctx.stroke();

      // Digital 8 Center Counter
      ctx.font = 'bold 20px Orbitron, sans-serif';
      ctx.fillStyle = '#00f0ff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('8', 0, 0);

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
        <div style={{ position: 'absolute', top: '8px', padding: '0.2rem 0.6rem', background: 'rgba(168,85,247,0.2)', border: '1px solid #a855f7', color: '#c084fc', borderRadius: '14px', fontSize: '0.65rem', fontFamily: 'Orbitron', display: 'flex', alignItems: 'center', gap: '0.3rem', zIndex: 10 }}>
          <Sparkles size={11} /> ARC REACTOR GESTURE REACTION
        </div>
      )}
    </div>
  );
}
