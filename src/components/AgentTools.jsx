import React, { useState } from 'react';
import { Terminal, Code, CheckSquare, Search, Play, Trash2, Plus, FolderPlus, Globe, Cpu, Folder, Music } from 'lucide-react';
import { aiAgent } from '../services/aiAgent';
import { soundFx } from '../services/soundFx';

export default function AgentTools({ onRunCommand }) {
  const [activeTab, setActiveTab] = useState('code'); // 'code', 'tasks', 'search'
  const [codeSnippet, setCodeSnippet] = useState('// W.E.D.N.E.S.D.A.Y. PRO JS Sandbox\nconst items = ["System Online", "Jarvis Neural Core Active", "GPT-4o Connected"];\nitems.forEach((item, i) => console.log(`[${i+1}] ${item}`));');
  const [codeOutput, setCodeOutput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState('');

  const [newTaskInput, setNewTaskInput] = useState('');
  const [tasksList, setTasksList] = useState(aiAgent.tasks);

  const handleExecuteCode = () => {
    soundFx.playClick();
    const res = aiAgent.executeCode(codeSnippet);
    setCodeOutput(res.output);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    soundFx.playClick();
    const res = await aiAgent.processQuery(`search ${searchQuery}`);
    setSearchResult(res.reply);
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskInput.trim()) return;
    soundFx.playClick();
    aiAgent.addTask(newTaskInput.trim());
    setTasksList([...aiAgent.tasks]);
    setNewTaskInput('');
  };

  const handleToggleTask = (id) => {
    soundFx.playClick();
    aiAgent.toggleTask(id);
    setTasksList([...aiAgent.tasks]);
  };

  const handleClearTasks = () => {
    soundFx.playClick();
    aiAgent.clearTasks();
    setTasksList([]);
  };

  return (
    <div className="hud-card" style={{ flex: 1 }}>
      <div className="hud-card-header">
        <span className="hud-card-title">
          <Terminal size={16} /> Subsystems & PRO Actions
        </span>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button
            className={`btn-hud ${activeTab === 'code' ? 'active' : ''}`}
            onClick={() => { soundFx.playClick(); setActiveTab('code'); }}
            style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
          >
            <Code size={12} /> Sandbox
          </button>
          <button
            className={`btn-hud ${activeTab === 'tasks' ? 'active' : ''}`}
            onClick={() => { soundFx.playClick(); setActiveTab('tasks'); }}
            style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
          >
            <CheckSquare size={12} /> Tasks
          </button>
          <button
            className={`btn-hud ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => { soundFx.playClick(); setActiveTab('search'); }}
            style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
          >
            <Search size={12} /> Search
          </button>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, gap: '0.75rem' }}>
        {/* Code Sandbox Tab */}
        {activeTab === 'code' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', height: '100%' }}>
            <textarea
              rows={5}
              value={codeSnippet}
              onChange={(e) => setCodeSnippet(e.target.value)}
              className="input-hud"
              style={{ fontFamily: 'var(--font-code)', fontSize: '0.8rem', resize: 'none' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button className="btn-hud" onClick={handleExecuteCode}>
                <Play size={14} /> Execute Code Payload
              </button>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>JS Sandbox</span>
            </div>
            {codeOutput && (
              <div className="code-output">
                {codeOutput}
              </div>
            )}
          </div>
        )}

        {/* Tasks & Memory Tab */}
        {activeTab === 'tasks' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', height: '100%' }}>
            <form onSubmit={handleAddTask} style={{ display: 'flex', gap: '0.4rem' }}>
              <input
                type="text"
                className="input-hud"
                placeholder="Add memory / reminder task..."
                value={newTaskInput}
                onChange={(e) => setNewTaskInput(e.target.value)}
              />
              <button type="submit" className="btn-hud" style={{ padding: '0.6rem' }}>
                <Plus size={16} />
              </button>
            </form>

            <div className="messages-list" style={{ flex: 1 }}>
              {tasksList.length === 0 ? (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '1rem' }}>
                  No active memory tasks logged.
                </div>
              ) : (
                tasksList.map(t => (
                  <div
                    key={t.id}
                    onClick={() => handleToggleTask(t.id)}
                    style={{
                      padding: '0.5rem 0.75rem',
                      background: t.completed ? 'rgba(0,0,0,0.3)' : 'rgba(0, 240, 255, 0.06)',
                      border: '1px solid rgba(0, 240, 255, 0.2)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      textDecoration: t.completed ? 'line-through' : 'none',
                      opacity: t.completed ? 0.6 : 1
                    }}
                  >
                    <span style={{ fontSize: '0.85rem' }}>{t.title}</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--cyan-bright)' }}>{t.time}</span>
                  </div>
                ))
              )}
            </div>

            {tasksList.length > 0 && (
              <button className="btn-hud btn-hud-danger" onClick={handleClearTasks} style={{ width: '100%', justifyContent: 'center' }}>
                <Trash2 size={14} /> Clear All Tasks
              </button>
            )}
          </div>
        )}

        {/* Knowledge Search Tab */}
        {activeTab === 'search' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', height: '100%' }}>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.4rem' }}>
              <input
                type="text"
                className="input-hud"
                placeholder="Search global knowledge stream..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="btn-hud" style={{ padding: '0.6rem' }}>
                <Search size={16} />
              </button>
            </form>

            {searchResult && (
              <div style={{ padding: '0.75rem', background: 'rgba(0,240,255,0.06)', border: '1px solid rgba(0,240,255,0.2)', borderRadius: '6px', fontSize: '0.85rem', lineHeight: '1.4' }}>
                {searchResult}
              </div>
            )}
          </div>
        )}

        {/* JARVIS PRO Instant Action Presets Grid */}
        <div style={{ borderTop: '1px dashed var(--border-hud)', paddingTop: '0.5rem' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--cyan-bright)', fontFamily: 'Orbitron', marginBottom: '0.3rem' }}>
            JARVIS PRO INSTANT VOICE COMMAND PRESETS
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.35rem' }}>
            <button className="btn-hud" style={{ fontSize: '0.7rem', padding: '0.3rem 0.5rem' }} onClick={() => onRunCommand('play believer')}>
              <Music size={12} /> Play Song
            </button>
            <button className="btn-hud" style={{ fontSize: '0.7rem', padding: '0.3rem 0.5rem' }} onClick={() => onRunCommand('open cmd')}>
              <Terminal size={12} /> Open CMD
            </button>
            <button className="btn-hud" style={{ fontSize: '0.7rem', padding: '0.3rem 0.5rem' }} onClick={() => onRunCommand('open my file manager')}>
              <Folder size={12} /> File Manager
            </button>
            <button className="btn-hud" style={{ fontSize: '0.7rem', padding: '0.3rem 0.5rem' }} onClick={() => onRunCommand('Open YouTube')}>
              <Globe size={12} /> Open YouTube
            </button>
            <button className="btn-hud" style={{ fontSize: '0.7rem', padding: '0.3rem 0.5rem' }} onClick={() => onRunCommand('Create folder Stark_Projects')}>
              <FolderPlus size={12} /> Create Folder
            </button>
            <button className="btn-hud" style={{ fontSize: '0.7rem', padding: '0.3rem 0.5rem' }} onClick={() => onRunCommand('open calculator')}>
              <Cpu size={12} /> Calculator
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
