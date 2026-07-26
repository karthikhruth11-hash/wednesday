import React from 'react';
import { Heart, Scale, Sparkles, Code2, Globe } from 'lucide-react';
import { soundFx } from '../services/soundFx';

export default function PersonalitySelector({ currentMode, onSelectMode }) {
  const modes = [
    { id: 'girlfriend', label: 'Casual & Romantic Companion', icon: Heart, color: '#ff4d6d' },
    { id: 'lawyer', label: 'Senior Legal Advocate & Constitution', icon: Scale, color: '#ffb703' },
    { id: 'jarvis', label: 'Stark J.A.R.V.I.S. AI Assistant', icon: Sparkles, color: '#00f0ff' },
    { id: 'polyglot', label: 'Polyglot & System Code Master', icon: Code2, color: '#a855f7' }
  ];

  return (
    <div style={{ background: 'rgba(0, 240, 255, 0.04)', border: '1px solid var(--border-hud)', borderRadius: '8px', padding: '0.6rem', marginBottom: '0.5rem' }}>
      <div style={{ fontSize: '0.7rem', color: 'var(--cyan-bright)', fontFamily: 'Orbitron', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <Globe size={12} /> SELECT WEDNESDAY PERSONALITY MODE
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.4rem' }}>
        {modes.map((mode) => {
          const Icon = mode.icon;
          const isActive = currentMode === mode.id;
          return (
            <button
              key={mode.id}
              className={`btn-hud ${isActive ? 'active' : ''}`}
              onClick={() => {
                soundFx.playClick();
                onSelectMode(mode.id);
              }}
              style={{
                fontSize: '0.7rem',
                padding: '0.4rem 0.5rem',
                borderColor: isActive ? mode.color : 'rgba(0,240,255,0.2)',
                color: isActive ? '#040711' : mode.color,
                background: isActive ? mode.color : 'rgba(0,0,0,0.4)',
                justifyContent: 'flex-start'
              }}
            >
              <Icon size={14} /> {mode.label.split(' ')[0]} {mode.label.split(' ')[1]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
