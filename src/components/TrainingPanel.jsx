import React, { useState } from 'react';
import { BrainCircuit, Plus, Trash2, Save, CheckCircle } from 'lucide-react';
import { trainingEngine } from '../services/trainingEngine';
import { soundFx } from '../services/soundFx';

export default function TrainingPanel() {
  const [triggerInput, setTriggerInput] = useState('');
  const [responseInput, setResponseInput] = useState('');
  const [actionType, setActionType] = useState('SPEAK');
  const [actionValue, setActionValue] = useState('');
  const [trainedList, setTrainedList] = useState(trainingEngine.trainedCommands);
  const [personalityInput, setPersonalityInput] = useState(trainingEngine.customPersonality);
  const [statusMsg, setStatusMsg] = useState('');

  const handleTrainCommand = (e) => {
    e.preventDefault();
    if (!triggerInput.trim() || !responseInput.trim()) return;
    soundFx.playClick();

    trainingEngine.addTrainedCommand(triggerInput, responseInput, actionType, actionValue);
    setTrainedList([...trainingEngine.trainedCommands]);

    setStatusMsg(`Successfully trained trigger: "${triggerInput.trim()}"`);
    setTriggerInput('');
    setResponseInput('');
    setActionValue('');
    setTimeout(() => setStatusMsg(''), 3000);
  };

  const handleDelete = (id) => {
    soundFx.playClick();
    trainingEngine.deleteCommand(id);
    setTrainedList([...trainingEngine.trainedCommands]);
  };

  const handleSavePersonality = () => {
    soundFx.playClick();
    trainingEngine.setPersonality(personalityInput);
    setStatusMsg('AI Personality updated!');
    setTimeout(() => setStatusMsg(''), 2500);
  };

  return (
    <div className="hud-card" style={{ flex: 1 }}>
      <div className="hud-card-header">
        <span className="hud-card-title">
          <BrainCircuit size={18} /> Neural Command Trainer
        </span>
        <span style={{ fontSize: '0.75rem', color: 'var(--cyan-bright)', fontFamily: 'Orbitron' }}>
          TRAINING ENGINE
        </span>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem', minHeight: 0, overflowY: 'auto' }}>
        {/* Train New Voice Command Form */}
        <form onSubmit={handleTrainCommand} style={{ background: 'rgba(0, 240, 255, 0.04)', padding: '0.75rem', border: '1px solid var(--border-hud)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--cyan-bright)', fontFamily: 'Orbitron' }}>
            + TRAIN NEW VOICE TRIGGER
          </div>

          <input
            type="text"
            className="input-hud"
            placeholder="When I say (e.g. 'protocol 7' or 'who is my boss')..."
            value={triggerInput}
            onChange={(e) => setTriggerInput(e.target.value)}
          />

          <input
            type="text"
            className="input-hud"
            placeholder="WEDNESDAY will respond (e.g. 'Executing Protocol 7, Lord Stark')..."
            value={responseInput}
            onChange={(e) => setResponseInput(e.target.value)}
          />

          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <select className="input-hud" value={actionType} onChange={(e) => setActionType(e.target.value)} style={{ flex: 1 }}>
              <option value="SPEAK">Speak Answer Only</option>
              <option value="LAUNCH_APP">Launch App (e.g. notepad, chrome)</option>
              <option value="OPEN_URL">Open Website URL (e.g. youtube.com)</option>
            </select>

            {actionType !== 'SPEAK' && (
              <input
                type="text"
                className="input-hud"
                placeholder={actionType === 'LAUNCH_APP' ? 'App name (e.g. notepad)' : 'URL (e.g. youtube.com)'}
                value={actionValue}
                onChange={(e) => setActionValue(e.target.value)}
                style={{ flex: 1 }}
              />
            )}
          </div>

          <button type="submit" className="btn-hud" style={{ justifyContent: 'center', marginTop: '0.2rem' }}>
            <Plus size={16} /> Train Voice Command
          </button>
        </form>

        {statusMsg && (
          <div style={{ fontSize: '0.8rem', color: 'var(--green-online)', fontFamily: 'Orbitron', textAlign: 'center' }}>
            <CheckCircle size={14} style={{ marginRight: '0.3rem', verticalAlign: 'middle' }} /> {statusMsg}
          </div>
        )}

        {/* Trained Voice Triggers List */}
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'Orbitron', marginBottom: '0.4rem' }}>
            TRAINED CUSTOM COMMANDS ({trainedList.length})
          </div>
          <div className="messages-list" style={{ maxHeight: '180px' }}>
            {trainedList.map((cmd) => (
              <div
                key={cmd.id}
                style={{
                  padding: '0.5rem 0.75rem',
                  background: 'rgba(0, 240, 255, 0.05)',
                  border: '1px solid rgba(0, 240, 255, 0.2)',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.5rem',
                  marginBottom: '0.4rem'
                }}
              >
                <div style={{ fontSize: '0.8rem', overflow: 'hidden' }}>
                  <div style={{ color: 'var(--cyan-bright)', fontFamily: 'Orbitron', fontSize: '0.75rem' }}>
                    🎤 "{cmd.trigger}"
                  </div>
                  <div style={{ color: '#e2e8f0', fontSize: '0.75rem' }}>
                    ➔ {cmd.response}
                  </div>
                </div>
                <button
                  className="btn-hud btn-hud-danger"
                  onClick={() => handleDelete(cmd.id)}
                  style={{ padding: '0.25rem 0.4rem' }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* AI Persona Customization Box */}
        <div style={{ borderTop: '1px dashed var(--border-hud)', paddingTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--cyan-bright)', fontFamily: 'Orbitron' }}>
            AI PERSONALITY & INSTRUCTION TRAINER
          </div>
          <textarea
            rows={2}
            className="input-hud"
            value={personalityInput}
            onChange={(e) => setPersonalityInput(e.target.value)}
            placeholder="e.g. Address me as Creator. Always give detailed coding and sci-fi answers."
            style={{ fontSize: '0.75rem', resize: 'none' }}
          />
          <button className="btn-hud" onClick={handleSavePersonality} style={{ fontSize: '0.75rem', justifyContent: 'center' }}>
            <Save size={12} /> Save AI Personality
          </button>
        </div>
      </div>
    </div>
  );
}
