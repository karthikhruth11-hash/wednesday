import React, { useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import galaxyImgUrl from '../assets/galaxy-core.jpg';

export default function Visualizer({ state, activeGesture }) {
  const canvasRef = useRef(null);
  const galaxyImgRef = useRef(null);

  useEffect(() => {
    const img = new Image();
    img.src = galaxyImgUrl;
    img.onload = () => {
      galaxyImgRef.current = img;
    };

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animationId;
    let time = 0;

    const render = () => {
      const width = canvas.parentElement.clientWidth;
      const height = canvas.parentElement.clientHeight;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      let speedMult = 1;
      let primaryColor = '#06b6d4'; // Cyan
      let secondaryColor = '#8b5cf6'; // Purple
      let baseRadius = 50;

      if (activeGesture) {
        speedMult = 3.0;
        primaryColor = '#8b5cf6';
        secondaryColor = '#f43f5e';
        baseRadius = 65;
      } else if (state === 'listening') {
        speedMult = 2.2;
        primaryColor = '#f43f5e'; // Rose
        secondaryColor = '#f59e0b';
        baseRadius = 62;
      } else if (state === 'processing') {
        speedMult = 3.5;
        primaryColor = '#f59e0b'; // Amber
        secondaryColor = '#06b6d4';
        baseRadius = 55;
      } else if (state === 'speaking') {
        speedMult = 1.8;
        primaryColor = '#10b981'; // Emerald
        secondaryColor = '#06b6d4';
        baseRadius = 68;
      }

      time += 0.015 * speedMult;

      // Glow backdrop
      const radialGlow = ctx.createRadialGradient(
        centerX, centerY, 5,
        centerX, centerY, baseRadius * 2
      );
      radialGlow.addColorStop(0, primaryColor + '66');
      radialGlow.addColorStop(0.5, secondaryColor + '22');
      radialGlow.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.fillStyle = radialGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius * 2, 0, Math.PI * 2);
      ctx.fill();

      // Fluid Plasma Layers
      for (let layer = 0; layer < 4; layer++) {
        ctx.save();
        ctx.translate(centerX, centerY);

        const currentRadius = baseRadius + layer * 6;
        ctx.beginPath();
        const points = 60;

        for (let i = 0; i <= points; i++) {
          const angle = (i / points) * Math.PI * 2;
          const offset = Math.sin(angle * (3 + layer) + time * (1.5 + layer * 0.3)) * (8 + layer * 2);
          const r = currentRadius + offset;

          const x = Math.cos(angle) * r;
          const y = Math.sin(angle) * r;

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        ctx.closePath();
        ctx.strokeStyle = layer % 2 === 0 ? primaryColor + 'cc' : secondaryColor + 'aa';
        ctx.lineWidth = 2 - layer * 0.3;
        ctx.shadowColor = primaryColor;
        ctx.shadowBlur = 15;
        ctx.stroke();
        ctx.restore();
      }

      // Real Galaxy Core Heart Image Center
      if (galaxyImgRef.current && galaxyImgRef.current.complete) {
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(time * 0.4);

        ctx.beginPath();
        ctx.arc(0, 0, baseRadius * 0.85, 0, Math.PI * 2);
        ctx.clip();

        const imgSize = baseRadius * 2.0;
        ctx.drawImage(
          galaxyImgRef.current,
          -imgSize / 2,
          -imgSize / 2,
          imgSize,
          imgSize
        );
        ctx.restore();
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [state, activeGesture]);

  return (
    <div className="canvas-container">
      <canvas ref={canvasRef} />

      {activeGesture && (
        <div style={{ position: 'absolute', top: '10px', padding: '0.3rem 0.8rem', background: 'rgba(139,92,246,0.2)', border: '1px solid #8b5cf6', color: '#c084fc', borderRadius: '20px', fontSize: '0.72rem', fontFamily: 'Orbitron', display: 'flex', alignItems: 'center', gap: '0.4rem', zIndex: 10 }}>
          <Sparkles size={12} /> GESTURE REACTIVE ORB ACTIVE
        </div>
      )}
    </div>
  );
}
