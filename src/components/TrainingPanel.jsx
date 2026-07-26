import React, { useState, useEffect } from 'react';
import { BrainCircuit, Cpu, Sparkles, RefreshCw, CheckCircle } from 'lucide-react';
import { autoMlEngine } from '../services/autoMlEngine';
import { soundFx } from '../services/soundFx';

export default function TrainingPanel() {
  const [metrics, setMetrics] = useState(autoMlEngine.getMetrics());

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(autoMlEngine.getMetrics());
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    soundFx.playClick();
    setMetrics(autoMlEngine.getMetrics());
  };

  return (
    <div className="hud-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div className="hud-card-header">
        <span className="hud-card-title">
          <BrainCircuit size={18} color="#06b6d4" /> Autonomous Self-Learning ML Monitor
        </span>
        <button className="btn-hud" onClick={handleRefresh} style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}>
          <RefreshCw size={12} /> Sync ML
        </button>
      </div>

      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
        No manual training required! W.E.D.N.E.S.D.A.Y. continuously analyzes your prompts, intent vectors, and command frequency to learn and adapt automatically in real-time.
      </div>

      {/* Autonomous ML Status Banner */}
      <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <CheckCircle size={18} color="#10b981" />
        <div>
          <div style={{ fontSize: '0.8rem', color: '#10b981', fontFamily: 'Orbitron', fontWeight: 'bold' }}>
            AUTONOMOUS SELF-LEARNING ENGINE: ACTIVE
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            Continuously optimizing neural parameters from active interactions.
          </div>
        </div>
      </div>

      {/* Real-time ML Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
        <div style={{ padding: '0.5rem', background: 'rgba(6, 182, 212, 0.05)', border: '1px solid rgba(6, 182, 212, 0.2)', borderRadius: '6px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontFamily: 'Orbitron' }}>CONFIDENCE</div>
          <div style={{ fontSize: '1.1rem', color: '#06b6d4', fontWeight: 'bold' }}>{metrics.confidenceScore}%</div>
        </div>

        <div style={{ padding: '0.5rem', background: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: '6px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontFamily: 'Orbitron' }}>PARAMETERS</div>
          <div style={{ fontSize: '1.1rem', color: '#8b5cf6', fontWeight: 'bold' }}>{metrics.parametersCount}</div>
        </div>

        <div style={{ padding: '0.5rem', background: 'rgba(244, 63, 94, 0.05)', border: '1px solid rgba(244, 63, 94, 0.2)', borderRadius: '6px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontFamily: 'Orbitron' }}>INTERACTIONS</div>
          <div style={{ fontSize: '1.1rem', color: '#f43f5e', fontWeight: 'bold' }}>{metrics.totalInteractions}</div>
        </div>
      </div>

      {/* Learned Intent Clusters & Pattern Weights */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem', minHeight: 0 }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontFamily: 'Orbitron', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Cpu size={14} /> SELF-LEARNED INTENT PATTERN CLUSTERS ({metrics.learnedIntents.length})
        </div>

        <div className="messages-list" style={{ flex: 1, maxHeight: '180px', overflowY: 'auto' }}>
          {metrics.learnedIntents.map((cluster, idx) => (
            <div
              key={idx}
              style={{
                padding: '0.45rem 0.6rem',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '6px',
                marginBottom: '0.35rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.2rem' }}>
                <span style={{ color: '#fff', fontWeight: 'bold' }}>{cluster.intent}</span>
                <span style={{ color: '#10b981', fontFamily: 'Orbitron' }}>{(cluster.weight * 100).toFixed(0)}% Weight</span>
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>
                Keywords: {cluster.keywords.join(', ')} • Usage: {cluster.count}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Self-Learned Interactions */}
      {metrics.recentHistory.length > 0 && (
        <div style={{ borderTop: '1px dashed var(--border-subtle)', paddingTop: '0.5rem', fontSize: '0.72rem' }}>
          <div style={{ fontFamily: 'Orbitron', color: 'var(--text-muted)', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Sparkles size={12} color="#f59e0b" /> RECENTLY LEARNED CONVERSATIONAL PROMPTS:
          </div>
          {metrics.recentHistory.slice(0, 3).map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-dim)', padding: '0.15rem 0' }}>
              <span>"{item.query}"</span>
              <span>{item.timestamp}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
