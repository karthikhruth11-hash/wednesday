import React, { useEffect, useRef } from 'react';
import spaceImgUrl from '../assets/serenity-space.jpg';

export default function Visualizer({ state, activeGesture }) {
  const canvasRef = useRef(null);
  const spaceImgRef = useRef(null);

  useEffect(() => {
    const img = new Image();
    spaceImgRef.current = img;
    img.src = spaceImgUrl;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animationId;
    let time = 0;

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

      let speedMult = 1.0;
      let primaryColor = '#a855f7';
      let secondaryColor = '#00f0ff';

      if (state === 'listening') speedMult = 2.0;
      else if (state === 'processing') speedMult = 3.2;
      else if (state === 'speaking') speedMult = 1.8;

      time += 0.012 * speedMult;

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

        const drawX = (width - drawW) / 2;
        const drawY = (height - drawH) / 2;

        ctx.drawImage(spaceImg, drawX, drawY, drawW, drawH);
      } else {
        const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, width);
        bgGrad.addColorStop(0, '#150a2a');
        bgGrad.addColorStop(0.6, '#080d1e');
        bgGrad.addColorStop(1, '#02040a');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);
      }

      particles.forEach(p => {
        p.x = (p.x + p.speedX * 0.0006 * speedMult + 1) % 1;
        p.y = (p.y + p.speedY * 0.0006 * speedMult + 1) % 1;
        p.pulsePhase += 0.03 * speedMult;

        const px = p.x * width;
        const py = p.y * height;

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

      ctx.restore();
      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [state, activeGesture]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
    </div>
  );
}
