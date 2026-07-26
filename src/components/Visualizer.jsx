import React, { useEffect, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { soundFx } from '../services/soundFx';

export default function Visualizer({ state, isListening, isHandsFree, onToggleListening, onStartWednesday }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animationId;
    let rotation = 0;
    let pulseAngle = 0;

    const particleCount = 70;
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: (Math.random() - 0.5) * 140,
        y: (Math.random() - 0.5) * 140,
        size: Math.random() * 2.5 + 1,
        speedX: (Math.random() - 0.5) * 0.7,
        speedY: (Math.random() - 0.5) * 0.7,
        opacity: Math.random() * 0.8 + 0.2
      });
    }

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
      let glowColor = 'rgba(0, 240, 255, ';
      let coreRadius = 55;

      if (state === 'listening') {
        speedMult = 2.5;
        glowColor = 'rgba(255, 77, 109, '; // Warm pink/pink glow when listening
        coreRadius = 70;
      } else if (state === 'processing') {
        speedMult = 4.0;
        glowColor = 'rgba(255, 183, 3, ';
        coreRadius = 60;
      } else if (state === 'speaking') {
        speedMult = 2.0;
        glowColor = 'rgba(0, 240, 255, ';
        coreRadius = 75;
      }

      rotation += 0.008 * speedMult;
      pulseAngle += 0.04 * speedMult;

      const dynamicRadius = coreRadius + Math.sin(pulseAngle) * 5;

      // Glow Core
      const gradient = ctx.createRadialGradient(
        centerX, centerY, 5,
        centerX, centerY, dynamicRadius * 1.5
      );
      gradient.addColorStop(0, `${glowColor}0.9)`);
      gradient.addColorStop(0.4, `${glowColor}0.3)`);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, dynamicRadius * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Rotating Arc Rings
      ctx.save();
      ctx.translate(centerX, centerY);

      ctx.save();
      ctx.rotate(rotation);
      ctx.strokeStyle = `${glowColor}0.7)`;
      ctx.lineWidth = 2;

      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.arc(0, 0, dynamicRadius + 25, (i * Math.PI) / 2, (i * Math.PI) / 2 + Math.PI / 3);
        ctx.stroke();
      }
      ctx.restore();

      ctx.save();
      ctx.rotate(-rotation * 1.3);
      ctx.strokeStyle = `${glowColor}0.5)`;
      ctx.lineWidth = 1.5;

      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(0, 0, dynamicRadius + 12, (i * 2 * Math.PI) / 3, (i * 2 * Math.PI) / 3 + Math.PI / 4);
        ctx.stroke();
      }
      ctx.restore();

      // Particles
      particles.forEach(p => {
        p.x += p.speedX * speedMult;
        p.y += p.speedY * speedMult;

        const dist = Math.sqrt(p.x * p.x + p.y * p.y);
        if (dist > dynamicRadius + 45) {
          p.x = (Math.random() - 0.5) * dynamicRadius;
          p.y = (Math.random() - 0.5) * dynamicRadius;
        }

        ctx.fillStyle = `${glowColor}${p.opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Sound Wave Ripples
      if (state === 'speaking' || state === 'listening') {
        ctx.strokeStyle = `${glowColor}0.8)`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        const waveCount = 36;
        for (let i = 0; i <= waveCount; i++) {
          const angle = (i / waveCount) * Math.PI * 2;
          const amp = Math.sin(angle * 6 + pulseAngle * 2) * 6;
          const r = dynamicRadius + 35 + amp;
          const wx = Math.cos(angle) * r;
          const wy = Math.sin(angle) * r;
          if (i === 0) ctx.moveTo(wx, wy);
          else ctx.lineTo(wx, wy);
        }
        ctx.closePath();
        ctx.stroke();
      }

      ctx.restore();

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [state]);

  return (
    <div className="canvas-container">
      <canvas ref={canvasRef} />
      <div className="hud-target-reticle" />

      {/* Interactive Hero Controls */}
      <div style={{ position: 'absolute', bottom: '15px', display: 'flex', gap: '0.6rem', zIndex: 10 }}>
        <button
          className={`btn-start-wednesday ${isHandsFree ? 'active' : ''}`}
          onClick={() => {
            soundFx.playClick();
            if (onStartWednesday) onStartWednesday();
          }}
          style={{
            padding: '0.5rem 1.4rem',
            borderRadius: '30px',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          ⚡ {isHandsFree ? 'W.E.D.N.E.S.D.A.Y. ACTIVE' : 'START W.E.D.N.E.S.D.A.Y.'}
        </button>

        <button
          onClick={() => {
            soundFx.playClick();
            onToggleListening();
          }}
          style={{
            padding: '0.5rem 1.2rem',
            borderRadius: '30px',
            background: isListening ? '#ff4d6d' : 'rgba(0, 240, 255, 0.2)',
            border: `2px solid ${isListening ? '#ff4d6d' : 'var(--cyan-bright)'}`,
            color: isListening ? '#ffffff' : 'var(--cyan-bright)',
            fontFamily: 'Orbitron',
            fontSize: '0.8rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: isListening ? '0 0 25px #ff4d6d' : '0 0 15px rgba(0, 240, 255, 0.3)',
            transition: 'all 0.3s ease'
          }}
        >
          {isListening ? <MicOff size={16} /> : <Mic size={16} />}
          {isListening ? 'STOP MIC' : 'TALK (MIC)'}
        </button>
      </div>
    </div>
  );
}
