import React, { useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';

export default function ArcReactorVisualizer({ state, activeGesture, handPos }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animationId;
    let time = 0;

    // --- 1. GENERATE 3D GALAXY SPIRAL ACCRETION PARTICLES ---
    const numParticles = 320;
    const galaxyParticles = Array.from({ length: numParticles }, (_, i) => {
      const arm = i % 2; // Dual spiral arms
      const angleOffset = arm * Math.PI;
      const distRatio = Math.pow(Math.random(), 0.7);
      const r = 20 + distRatio * 200;
      const angle = angleOffset + distRatio * Math.PI * 4 + (Math.random() - 0.5) * 0.4;
      const yOffset = (Math.random() - 0.5) * (15 + distRatio * 35);
      const size = 1.0 + Math.random() * 2.5;

      return {
        baseR: r,
        baseAngle: angle,
        y: yOffset,
        size,
        alpha: 0.3 + Math.random() * 0.7,
        isFiery: Math.random() > 0.45
      };
    });

    // --- 2. 3D ATOMIC ORBIT RINGS CONFIGURATION ---
    const atomRings = [
      { tiltX: 0.35, tiltY: 0.2, tiltZ: 0.1, radius: 95, speed: 1.2 },
      { tiltX: -0.65, tiltY: 0.5, tiltZ: -0.3, radius: 105, speed: -1.5 },
      { tiltX: 0.8, tiltY: -0.4, tiltZ: 0.5, radius: 115, speed: 1.8 },
      { tiltX: -0.2, tiltY: -0.8, tiltZ: -0.4, radius: 125, speed: -1.1 }
    ];

    // --- 3. 3D ORBITAL SATELLITE NODES ---
    const orbitalNodes = [
      'ChatGPT Core',
      'Gestures AI',
      'Voice Synth',
      'Sigma OS',
      'Auto ML',
      'Galaxy Radar',
      'Atomic Core'
    ];

    // --- 3D PERSPECTIVE PROJECTION HELPER ---
    const project3D = (x, y, z, pitch, yaw, roll, focalLength, cx, cy) => {
      // Yaw (Y-axis)
      const cosY = Math.cos(yaw), sinY = Math.sin(yaw);
      const x1 = x * cosY - z * sinY;
      const z1 = z * cosY + x * sinY;

      // Pitch (X-axis)
      const cosX = Math.cos(pitch), sinX = Math.sin(pitch);
      const y2 = y * cosX - z1 * sinX;
      const z2 = z1 * cosX + y * sinX;

      // Roll (Z-axis)
      const cosZ = Math.cos(roll), sinZ = Math.sin(roll);
      const x3 = x1 * cosZ - y2 * sinZ;
      const y3 = y2 * cosZ + x1 * sinZ;

      // Perspective scale factor
      const depth = z2 + 450;
      const scale = focalLength / Math.max(100, depth);
      const screenX = cx + x3 * scale;
      const screenY = cy + y3 * scale;

      return { screenX, screenY, scale, depth, rawZ: z2 };
    };

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

      // Dynamic Interactive 3D Parallax Pitch and Yaw
      let targetPitch = 0.35; // Default 3D perspective tilt
      let targetYaw = time * 0.4;

      if (handPos && handPos.x !== undefined && handPos.y !== undefined) {
        centerX = (1 - handPos.x) * width;
        centerY = handPos.y * height;
        targetPitch = (handPos.y - 0.5) * 1.2;
        targetYaw = (0.5 - handPos.x) * 1.5 + time * 0.4;
      }

      // Dynamic State Themes & Speeds
      let speedMult = 1.0;
      let primaryColor = '#00f0ff'; // Stark Neon Cyan
      let secondaryColor = '#ff6b00'; // Fiery Amber Gold
      let accentGlow = 'rgba(0, 240, 255, 0.5)';

      if (state === 'listening') {
        speedMult = 2.2;
        primaryColor = '#00ff88'; // Matrix Emerald
        secondaryColor = '#ffaa00';
        accentGlow = 'rgba(0, 255, 136, 0.5)';
      } else if (state === 'processing') {
        speedMult = 3.5;
        primaryColor = '#a855f7'; // Quantum Purple
        secondaryColor = '#ff0055';
        accentGlow = 'rgba(168, 85, 247, 0.6)';
      } else if (state === 'speaking') {
        speedMult = 2.0;
        primaryColor = '#ff0055'; // Solar Fusion Crimson
        secondaryColor = '#ffb703'; // Golden Flame
        accentGlow = 'rgba(255, 0, 85, 0.6)';
      }

      time += 0.012 * speedMult;
      const pitch = targetPitch;
      const yaw = targetYaw;
      const roll = Math.sin(time * 0.5) * 0.08;
      const focalLength = 500;

      const pinchScale = (handPos && handPos.pinchDist) ? Math.max(0.6, Math.min(1.8, handPos.pinchDist * 6)) : 1.0;

      // Collection of 3D elements for Z-sorting (Depth Sorting for realistic 3D occlusion)
      const renderQueue = [];

      // --- 1. 3D GALAXY SPIRAL PARTICLES ---
      galaxyParticles.forEach((p) => {
        const curAngle = p.baseAngle + time * (0.3 + (200 - p.baseR) * 0.002);
        const r = p.baseR * pinchScale;
        const x = Math.cos(curAngle) * r;
        const z = Math.sin(curAngle) * r;
        const y = p.y * pinchScale;

        const proj = project3D(x, y, z, pitch, yaw, roll, focalLength, centerX, centerY);
        const col = p.isFiery ? secondaryColor : primaryColor;

        renderQueue.push({
          depth: proj.depth,
          draw: () => {
            ctx.fillStyle = col;
            ctx.shadowColor = col;
            ctx.shadowBlur = 10 * proj.scale;
            ctx.globalAlpha = p.alpha * Math.min(1, Math.max(0.2, proj.scale * 0.9));
            ctx.beginPath();
            ctx.arc(proj.screenX, proj.screenY, p.size * proj.scale, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
          }
        });
      });

      // --- 2. 3D ATOMIC ORBIT RINGS & ELECTRONS ---
      atomRings.forEach((ring, rIdx) => {
        const ringR = ring.radius * pinchScale;
        const numPoints = 80;
        const ringPoints = [];

        for (let i = 0; i <= numPoints; i++) {
          const a = (i / numPoints) * Math.PI * 2;
          const rx0 = Math.cos(a) * ringR;
          const ry0 = Math.sin(a) * ringR;
          const rz0 = 0;

          // Apply ring inclination rotations
          const cx1 = Math.cos(ring.tiltX), sx1 = Math.sin(ring.tiltX);
          const cy1 = Math.cos(ring.tiltY), sy1 = Math.sin(ring.tiltY);
          const cz1 = Math.cos(ring.tiltZ), sz1 = Math.sin(ring.tiltZ);

          let rx1 = rx0 * cz1 - ry0 * sz1;
          let ry1 = ry0 * cz1 + rx0 * sz1;
          let rz1 = rz0;

          let rx2 = rx1;
          let ry2 = ry1 * cx1 - rz1 * sx1;
          let rz2 = rz1 * cx1 + ry1 * sx1;

          let rx3 = rx2 * cy1 + rz2 * sy1;
          let ry3 = ry2;
          let rz3 = rz2 * cy1 - rx2 * sy1;

          const proj = project3D(rx3, ry3, rz3, pitch, yaw, roll, focalLength, centerX, centerY);
          ringPoints.push(proj);
        }

        // Calculate average depth of ring
        const avgDepth = ringPoints.reduce((sum, pt) => sum + pt.depth, 0) / ringPoints.length;

        renderQueue.push({
          depth: avgDepth,
          draw: () => {
            ctx.beginPath();
            ringPoints.forEach((pt, i) => {
              if (i === 0) ctx.moveTo(pt.screenX, pt.screenY);
              else ctx.lineTo(pt.screenX, pt.screenY);
            });
            ctx.closePath();

            ctx.strokeStyle = rIdx % 2 === 0 ? primaryColor : secondaryColor;
            ctx.lineWidth = 2.2 * (focalLength / avgDepth);
            ctx.shadowColor = primaryColor;
            ctx.shadowBlur = 16;
            ctx.stroke();

            // 3D Revolving Quantum Electron
            const eAngle = time * ring.speed * 2;
            const eIdx = Math.floor((((eAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)) / (Math.PI * 2) * numPoints);
            const ePt = ringPoints[eIdx] || ringPoints[0];

            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = primaryColor;
            ctx.shadowBlur = 20;
            ctx.beginPath();
            ctx.arc(ePt.screenX, ePt.screenY, 5 * ePt.scale, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      });

      // --- 3. 3D OUTER TUNGSTEN ALLOY ARC FINS ---
      const numFins = 10;
      const finR1 = 150 * pinchScale;
      const finR2 = 190 * pinchScale;

      for (let i = 0; i < numFins; i++) {
        const angle = (i / numFins) * Math.PI * 2 + time * 0.2;
        const widthAngle = 0.18;

        const p1 = project3D(Math.cos(angle - widthAngle) * finR1, 0, Math.sin(angle - widthAngle) * finR1, pitch, yaw, roll, focalLength, centerX, centerY);
        const p2 = project3D(Math.cos(angle - widthAngle) * finR2, 0, Math.sin(angle - widthAngle) * finR2, pitch, yaw, roll, focalLength, centerX, centerY);
        const p3 = project3D(Math.cos(angle + widthAngle) * finR2, 0, Math.sin(angle + widthAngle) * finR2, pitch, yaw, roll, focalLength, centerX, centerY);
        const p4 = project3D(Math.cos(angle + widthAngle) * finR1, 0, Math.sin(angle + widthAngle) * finR1, pitch, yaw, roll, focalLength, centerX, centerY);

        const avgDepth = (p1.depth + p2.depth + p3.depth + p4.depth) / 4;

        renderQueue.push({
          depth: avgDepth,
          draw: () => {
            ctx.fillStyle = 'rgba(6, 18, 36, 0.85)';
            ctx.strokeStyle = primaryColor;
            ctx.lineWidth = 1.5 * p1.scale;
            ctx.shadowColor = primaryColor;
            ctx.shadowBlur = 12;

            ctx.beginPath();
            ctx.moveTo(p1.screenX, p1.screenY);
            ctx.lineTo(p2.screenX, p2.screenY);
            ctx.lineTo(p3.screenX, p3.screenY);
            ctx.lineTo(p4.screenX, p4.screenY);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
          }
        });
      }

      // --- 4. 3D ORBITAL SATELLITE TEXT NODES ---
      orbitalNodes.forEach((nodeText, idx) => {
        const angle = (idx / orbitalNodes.length) * Math.PI * 2 + time * 0.25;
        const r = 215 * pinchScale;
        const proj = project3D(Math.cos(angle) * r, 0, Math.sin(angle) * r, pitch, yaw, roll, focalLength, centerX, centerY);

        renderQueue.push({
          depth: proj.depth,
          draw: () => {
            ctx.fillStyle = primaryColor;
            ctx.shadowColor = primaryColor;
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.arc(proj.screenX, proj.screenY, 4.5 * proj.scale, 0, Math.PI * 2);
            ctx.fill();

            const fontSize = Math.max(7, Math.round(10 * proj.scale));
            ctx.font = `bold ${fontSize}px Orbitron, sans-serif`;
            ctx.fillStyle = '#ffffff';
            ctx.shadowBlur = 8;
            ctx.fillText(nodeText, proj.screenX + 7 * proj.scale, proj.screenY + 3 * proj.scale);
          }
        });
      });

      // --- 5. 3D CENTRAL QUANTUM PLASMA CORE (NUCLEUS) ---
      const coreProj = project3D(0, 0, 0, pitch, yaw, roll, focalLength, centerX, centerY);
      const corePulse = (62 + Math.sin(time * 3) * 6) * coreProj.scale * pinchScale;

      renderQueue.push({
        depth: coreProj.depth - 1, // Core renders near center
        draw: () => {
          // Radiant 3D Core Aura
          const radGrad = ctx.createRadialGradient(
            coreProj.screenX, coreProj.screenY, 0,
            coreProj.screenX, coreProj.screenY, corePulse * 2.0
          );
          radGrad.addColorStop(0, '#ffffff');
          radGrad.addColorStop(0.25, primaryColor);
          radGrad.addColorStop(0.6, secondaryColor);
          radGrad.addColorStop(0.88, accentGlow);
          radGrad.addColorStop(1, 'transparent');

          ctx.fillStyle = radGrad;
          ctx.beginPath();
          ctx.arc(coreProj.screenX, coreProj.screenY, corePulse * 2.0, 0, Math.PI * 2);
          ctx.fill();

          // Core Glass Lens Rim
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 3 * coreProj.scale;
          ctx.shadowColor = primaryColor;
          ctx.shadowBlur = 28;
          ctx.beginPath();
          ctx.arc(coreProj.screenX, coreProj.screenY, corePulse, 0, Math.PI * 2);
          ctx.stroke();

          // Core Center Quantum Sparkle
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = '#ffffff';
          ctx.shadowBlur = 18;
          ctx.beginPath();
          ctx.arc(coreProj.screenX, coreProj.screenY, 6 * coreProj.scale, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // --- EXECUTE 3D Z-SORTED RENDER QUEUE (Far to Near) ---
      renderQueue.sort((a, b) => b.depth - a.depth);
      renderQueue.forEach(item => item.draw());

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
          <Sparkles size={14} /> 3D JARVIS ATOMIC REACTOR ENGAGED: {activeGesture}
        </div>
      )}
    </div>
  );
}


