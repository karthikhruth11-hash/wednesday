import React, { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, Sparkles, Hand } from 'lucide-react';
import { gestureEngine } from '../services/gestureEngine';
import { soundFx } from '../services/soundFx';

export default function HandGesturePanel({ onGestureDetected }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [activeGesture, setActiveGesture] = useState(null);
  const [gestureLog, setGestureLog] = useState([]);

  const toggleCamera = async () => {
    soundFx.playClick();
    if (isCameraActive) {
      gestureEngine.stop();
      setIsCameraActive(false);
      setActiveGesture(null);
    } else {
      const success = await gestureEngine.start(
        videoRef.current,
        canvasRef.current,
        (evt) => {
          // Pass live tracking event to parent handler for smooth reactor tracking
          if (onGestureDetected) {
            onGestureDetected(evt);
          }

          // Only trigger UI pill, audio click, and log feed on a NEW gesture event
          if (evt.isNewGesture && evt.gesture && evt.gesture !== 'TRACKING') {
            setActiveGesture(evt.gesture);
            soundFx.playClick();
            setGestureLog(prev => [evt, ...prev.slice(0, 4)]);
          } else if (!evt.gesture) {
            setActiveGesture(null);
          }
        }
      );
      if (success) {
        setIsCameraActive(true);
      }
    }
  };

  useEffect(() => {
    return () => {
      gestureEngine.stop();
    };
  }, []);

  const getGestureDetails = (g) => {
    switch (g) {
      case 'OPEN_PALM': return { label: '🖐️ OPEN PALM', action: 'Hold AI / Pulse Hologram Orb', color: '#00f0ff' };
      case 'CLOSED_FIST': return { label: '✊ CLOSED FIST', action: 'Mute Audio / Stop Listening', color: '#ff4d6d' };
      case 'THUMBS_UP': return { label: '👍 THUMBS UP', action: 'Send Positive Confirmation', color: '#00ff66' };
      case 'PEACE_SIGN': return { label: '✌️ PEACE SIGN', action: 'Switch AI Persona Mode', color: '#a855f7' };
      case 'PINCH_OK': return { label: '👌 PINCH / OK', action: 'Toggle Voice Microphone Mode', color: '#ffb703' };
      case 'SWIPE_RIGHT': return { label: '👉 SWIPE RIGHT', action: 'Next Subsystem Tab', color: '#3b82f6' };
      case 'SWIPE_LEFT': return { label: '👈 SWIPE LEFT', action: 'Previous Subsystem Tab', color: '#3b82f6' };
      default: return { label: 'WAITING FOR GESTURE', action: 'Show your hand to the camera', color: '#94a3b8' };
    }
  };

  const currentDetails = getGestureDetails(activeGesture);

  return (
    <div className="hud-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div className="hud-card-header">
        <span className="hud-card-title">
          <Hand size={16} color="#00f0ff" /> Real-Time Webcam Hand Gesture AI
        </span>
        <button
          className={`btn-hud ${isCameraActive ? 'active' : ''}`}
          onClick={toggleCamera}
          style={{ padding: '0.3rem 0.8rem', fontSize: '0.75rem' }}
        >
          {isCameraActive ? <CameraOff size={14} /> : <Camera size={14} />}
          {isCameraActive ? 'DISABLE CAMERA' : 'ENABLE CAMERA GESTURES'}
        </button>
      </div>

      {/* Video & Skeleton Overlay Canvas Stage */}
      <div style={{ position: 'relative', width: '100%', height: '220px', background: '#02050b', borderRadius: '8px', border: '1px solid var(--border-hud)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <video
          ref={videoRef}
          playsInline
          muted
          style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)', opacity: isCameraActive ? 0.75 : 0 }}
        />
        <canvas
          ref={canvasRef}
          width={400}
          height={220}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', transform: 'scaleX(-1)' }}
        />

        {!isCameraActive && (
          <div style={{ position: 'absolute', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Hand size={36} color="var(--cyan-bright)" style={{ marginBottom: '0.5rem', opacity: 0.8 }} />
            <div style={{ fontSize: '0.85rem', fontFamily: 'Orbitron', color: '#e2e8f0' }}>
              WEBCAM GESTURE CONTROL INACTIVE
            </div>
            <div style={{ fontSize: '0.75rem', marginTop: '0.3rem' }}>
              Click "ENABLE CAMERA GESTURES" above to control W.E.D.N.E.S.D.A.Y. with hand moves!
            </div>
          </div>
        )}

        {/* Live Active Gesture Floating Pill */}
        {isCameraActive && (
          <div
            style={{
              position: 'absolute',
              bottom: '10px',
              left: '50%',
              transform: 'translateX(-50%)',
              padding: '0.4rem 1rem',
              borderRadius: '20px',
              background: 'rgba(4, 7, 17, 0.85)',
              backdropFilter: 'blur(10px)',
              border: `1px solid ${currentDetails.color}`,
              boxShadow: `0 0 15px ${currentDetails.color}`,
              color: currentDetails.color,
              fontSize: '0.8rem',
              fontFamily: 'Orbitron',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              zIndex: 10
            }}
          >
            <Sparkles size={14} />
            <span>{currentDetails.label}</span>
          </div>
        )}
      </div>

      {/* Gesture Action Legend Grid */}
      <div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'Orbitron', marginBottom: '0.4rem' }}>
          SUPPORTED HAND SIGNS & MOVES
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.4rem' }}>
          <div style={{ padding: '0.4rem 0.6rem', background: 'rgba(0,240,255,0.03)', border: '1px solid rgba(0,240,255,0.15)', borderRadius: '6px', fontSize: '0.75rem' }}>
            <span style={{ color: '#00f0ff', fontWeight: 'bold' }}>🖐️ Open Palm:</span> Hold / Wave Orb
          </div>
          <div style={{ padding: '0.4rem 0.6rem', background: 'rgba(255,77,109,0.03)', border: '1px solid rgba(255,77,109,0.15)', borderRadius: '6px', fontSize: '0.75rem' }}>
            <span style={{ color: '#ff4d6d', fontWeight: 'bold' }}>✊ Closed Fist:</span> Mute Microphone
          </div>
          <div style={{ padding: '0.4rem 0.6rem', background: 'rgba(168,85,247,0.03)', border: '1px solid rgba(168,85,247,0.15)', borderRadius: '6px', fontSize: '0.75rem' }}>
            <span style={{ color: '#a855f7', fontWeight: 'bold' }}>✌️ Peace Sign:</span> Switch AI Persona
          </div>
          <div style={{ padding: '0.4rem 0.6rem', background: 'rgba(0,255,102,0.03)', border: '1px solid rgba(0,255,102,0.15)', borderRadius: '6px', fontSize: '0.75rem' }}>
            <span style={{ color: '#00ff66', fontWeight: 'bold' }}>👍 Thumbs Up:</span> Confirm Command
          </div>
        </div>
      </div>

      {/* Recent Gesture Event Feed */}
      {gestureLog.length > 0 && (
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <div style={{ fontFamily: 'Orbitron', marginBottom: '0.3rem' }}>RECENT DETECTED MOVES:</div>
          {gestureLog.map((g, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.2rem 0', borderBottom: '1px dashed rgba(255,255,255,0.05)' }}>
              <span style={{ color: 'var(--cyan-bright)' }}>{g.gesture}</span>
              <span>{g.timestamp}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
