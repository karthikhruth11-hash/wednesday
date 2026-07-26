import React, { useState } from 'react';
import { Globe, Search, Atom, Zap } from 'lucide-react';
import { omniscientKnowledgeEngine } from '../services/omniscientKnowledgeEngine';
import { soundFx } from '../services/soundFx';

export default function CosmicKnowledgePanel() {
  const [searchTerm, setSearchTerm] = useState('');
  const [lookupResult, setLookupResult] = useState('');

  const planets = [
    { name: 'Mercury', distance: '57.9M km', moons: 0, temp: '167°C' },
    { name: 'Venus', distance: '108.2M km', moons: 0, temp: '464°C' },
    { name: 'Earth', distance: '149.6M km', moons: 1, temp: '15°C' },
    { name: 'Mars', distance: '227.9M km', moons: 2, temp: '-65°C' },
    { name: 'Jupiter', distance: '778.5M km', moons: 95, temp: '-110°C' },
    { name: 'Saturn', distance: '1.43B km', moons: 146, temp: '-140°C' }
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    soundFx.playClick();
    const ans = omniscientKnowledgeEngine.findInstantAnswer(searchTerm);
    if (ans) {
      setLookupResult(`➔ ${ans}`);
    } else {
      setLookupResult(`➔ Universal AI Core is ready for "${searchTerm}". Type in main prompt for deep LLM answer.`);
    }
  };

  return (
    <div className="hud-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div className="hud-card-header">
        <span className="hud-card-title">
          <Globe size={18} color="#00f0ff" /> Cosmic & Universal Knowledge Core
        </span>
        <span style={{ fontSize: '0.65rem', color: '#00ff66', fontFamily: 'Orbitron' }}>
          OMNISCIENT ACTIVE
        </span>
      </div>

      {/* Universal Search Lookup Input */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.4rem' }}>
        <input
          type="text"
          className="input-hud"
          placeholder="Lookup formula, physics, astronomy, history..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 1, fontSize: '0.8rem' }}
        />
        <button type="submit" className="btn-hud" style={{ padding: '0.4rem 0.8rem' }}>
          <Search size={14} /> Search
        </button>
      </form>

      {lookupResult && (
        <div style={{ padding: '0.55rem', background: 'rgba(0, 240, 255, 0.08)', border: '1px solid #00f0ff', borderRadius: '6px', fontSize: '0.8rem', color: '#00f0ff', fontFamily: 'Orbitron' }}>
          {lookupResult}
        </div>
      )}

      {/* Solar System Telemetry Cards */}
      <div style={{ fontSize: '0.75rem', color: 'var(--cyan-bright)', fontFamily: 'Orbitron', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
        <Atom size={14} /> SOLAR SYSTEM PLANETARY TELEMETRY
      </div>

      <div className="messages-list" style={{ flex: 1, maxHeight: '200px', overflowY: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
        {planets.map((p, idx) => (
          <div key={idx} style={{ padding: '0.45rem', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(0, 240, 255, 0.15)', borderRadius: '6px' }}>
            <div style={{ color: '#00f0ff', fontWeight: 'bold', fontSize: '0.78rem' }}>{p.name}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
              Dist: {p.distance}<br />
              Moons: {p.moons} • Temp: {p.temp}
            </div>
          </div>
        ))}
      </div>

      {/* Fundamental Physics & Chemistry Constants */}
      <div style={{ padding: '0.5rem', background: 'rgba(139, 92, 246, 0.05)', border: '1px dashed #8b5cf6', borderRadius: '6px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
        <div style={{ color: '#8b5cf6', fontFamily: 'Orbitron', fontWeight: 'bold', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <Zap size={12} /> FUNDAMENTAL SCIENCE CONSTANTS
        </div>
        • Water: H₂O | Speed of Light: 299,792,458 m/s<br />
        • Energy: E = mc² | Force: F = ma | Gravity: 9.81 m/s²
      </div>
    </div>
  );
}
