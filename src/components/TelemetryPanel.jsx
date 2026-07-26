import React, { useState, useEffect } from 'react';
import { Activity, Cpu, HardDrive, Shield, Volume2, VolumeX, Monitor } from 'lucide-react';
import { systemApi } from '../services/systemApi';
import { soundFx } from '../services/soundFx';

export default function TelemetryPanel({ soundMuted, onToggleSound, onOpenSettings }) {
  const [telemetry, setTelemetry] = useState({
    cpuPercent: 18,
    ramPercent: 44,
    ramUsedGB: '3.6',
    ramTotalGB: '8.0',
    hostname: 'STARK-RIG',
    platform: 'win32',
    cpuModel: 'Intel Core / Ryzen'
  });

  // Poll real OS telemetry every 3 seconds
  useEffect(() => {
    const fetchStats = async () => {
      const data = await systemApi.getTelemetry();
      if (data) {
        setTelemetry(data);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="telemetry-column">
      <div className="hud-card">
        <div className="hud-card-header">
          <span className="hud-card-title">
            <Activity size={16} /> Hardware Telemetry
          </span>
          <span style={{ fontSize: '0.75rem', color: '#00ff66', fontFamily: 'Orbitron' }}>
            REAL OS
          </span>
        </div>

        <div className="telemetry-grid">
          {/* Hostname info */}
          <div style={{ fontSize: '0.75rem', color: 'var(--cyan-bright)', fontFamily: 'Orbitron', display: 'flex', justifyContent: 'space-between' }}>
            <span>HOST: {telemetry.hostname}</span>
            <span>OS: {telemetry.platform}</span>
          </div>

          {/* CPU Meter */}
          <div className="stat-item">
            <div className="stat-label-row">
              <span><Cpu size={14} /> Real CPU Load</span>
              <span>{telemetry.cpuPercent}%</span>
            </div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${telemetry.cpuPercent}%` }} />
            </div>
          </div>

          {/* RAM Meter */}
          <div className="stat-item">
            <div className="stat-label-row">
              <span><HardDrive size={14} /> Physical RAM</span>
              <span>{telemetry.ramPercent}% ({telemetry.ramUsedGB} / {telemetry.ramTotalGB} GB)</span>
            </div>
            <div className="progress-bar-bg">
              <div
                className="progress-bar-fill"
                style={{
                  width: `${telemetry.ramPercent}%`,
                  background: 'linear-gradient(90deg, #a855f7, #00f0ff)'
                }}
              />
            </div>
          </div>

          {/* Security Protocols */}
          <div style={{ padding: '0.75rem', background: 'rgba(0,240,255,0.05)', borderRadius: '6px', border: '1px solid rgba(0,240,255,0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#00f0ff', marginBottom: '0.3rem', fontFamily: 'Orbitron' }}>
              <Shield size={14} /> System Bridge Active
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              • Node OS Control: Port 3001<br />
              • Windows App Launcher: Active<br />
              • ChatGPT Reasoning Engine: Ready
            </div>
          </div>

          {/* Settings & Sound Controls */}
          <button
            className="btn-hud"
            onClick={() => { soundFx.playClick(); onOpenSettings(); }}
            style={{ width: '100%', justifyContent: 'center', marginTop: '0.2rem' }}
          >
            <Monitor size={14} /> AI & System Settings
          </button>

          <button
            className={`btn-hud ${soundMuted ? 'btn-hud-danger' : ''}`}
            onClick={() => { soundFx.playClick(); onToggleSound(); }}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {soundMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            {soundMuted ? 'Audio FX Muted' : 'Audio FX Enabled'}
          </button>
        </div>
      </div>
    </div>
  );
}
