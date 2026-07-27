import React, { useState, useEffect, useRef } from 'react';
import { Terminal, X, Minimize2, Maximize2, Trash2, Send, Play } from 'lucide-react';
import { soundFx } from '../services/soundFx';
import { aiAgent } from '../services/aiAgent';
import { systemApi } from '../services/systemApi';

export default function TerminalModal({ isOpen, onClose, onOpenCalculator }) {
  const [history, setHistory] = useState([
    { type: 'sys', text: 'W.E.D.N.E.S.D.A.Y. PRO TERMINAL CORE v3.6 [ONLINE]' },
    { type: 'sys', text: 'Type "help" to view interactive commands or type any query.' }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isMaximized, setIsMaximized] = useState(false);
  const terminalEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  if (!isOpen) return null;

  const handleCommand = async (cmd) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    soundFx.playClick();
    setHistory(prev => [...prev, { type: 'user', text: `C:\\WEDNESDAY\\JARVIS> ${trimmed}` }]);
    setCommandHistory(prev => [trimmed, ...prev]);
    setHistoryIndex(-1);
    setInputVal('');

    const lower = trimmed.toLowerCase();

    // 1. Internal CLI Commands
    if (lower === 'clear' || lower === 'cls') {
      setHistory([]);
      return;
    }

    if (lower === 'help') {
      setHistory(prev => [
        ...prev,
        { type: 'out', text: 'AVAILABLE TERMINAL COMMANDS:' },
        { type: 'out', text: '  calc / calculator   - Launch Quantum Calculator' },
        { type: 'out', text: '  open <site/app>     - Open website or app (e.g. open youtube)' },
        { type: 'out', text: '  play <song>         - Play music on YouTube/Spotify' },
        { type: 'out', text: '  date / time         - Show current system timestamp' },
        { type: 'out', text: '  sys / status        - Display W.E.D.N.E.S.D.A.Y. core telemetry' },
        { type: 'out', text: '  cls / clear         - Clear terminal console' },
        { type: 'out', text: '  eval <code>         - Execute JS code snippet' },
        { type: 'out', text: '  native              - Launch Windows Native CMD Prompt' },
        { type: 'out', text: '  <any text>          - Query AI Core agent directly' }
      ]);
      return;
    }

    if (lower === 'calc' || lower === 'calculator') {
      setHistory(prev => [...prev, { type: 'sys', text: 'Launching Quantum Calculator...' }]);
      if (onOpenCalculator) onOpenCalculator();
      return;
    }

    if (lower === 'date' || lower === 'time') {
      setHistory(prev => [...prev, { type: 'out', text: `System Timestamp: ${new Date().toLocaleString()}` }]);
      return;
    }

    if (lower === 'sys' || lower === 'status') {
      setHistory(prev => [
        ...prev,
        { type: 'out', text: '----------------------------------------' },
        { type: 'out', text: 'SYSTEM ENGINE STATUS: 100% OPTIMAL' },
        { type: 'out', text: 'CORE: SIGMA Arc Reactor (Deep Llama 70B / GPT-4o)' },
        { type: 'out', text: 'LATENCY: 12ms | MEMORY: 64MB Allocation' },
        { type: 'out', text: 'AUDIO SPEECH ENGINE: Active' },
        { type: 'out', text: '----------------------------------------' }
      ]);
      return;
    }

    if (lower === 'native') {
      setHistory(prev => [...prev, { type: 'sys', text: 'Attempting to launch Windows Native CMD prompt...' }]);
      const res = await systemApi.launchApp('cmd');
      setHistory(prev => [...prev, { type: res.success ? 'out' : 'err', text: res.message || res.error }]);
      return;
    }

    if (lower.startsWith('eval ')) {
      const codeToRun = trimmed.substring(5);
      try {
        const evalFn = new Function(`return (${codeToRun})`);
        const result = evalFn();
        setHistory(prev => [...prev, { type: 'out', text: `=> ${typeof result === 'object' ? JSON.stringify(result) : result}` }]);
      } catch (err) {
        setHistory(prev => [...prev, { type: 'err', text: `Runtime Error: ${err.message}` }]);
      }
      return;
    }

    // 2. Query AI Agent
    try {
      const res = await aiAgent.processQuery(trimmed, 'jarvis');
      setHistory(prev => [...prev, { type: 'out', text: res.reply }]);
    } catch (err) {
      setHistory(prev => [...prev, { type: 'err', text: `Error processing command: ${err.message}` }]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleCommand(inputVal);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0 && historyIndex < commandHistory.length - 1) {
        const nextIdx = historyIndex + 1;
        setHistoryIndex(nextIdx);
        setInputVal(commandHistory[nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        setInputVal(commandHistory[nextIdx]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInputVal('');
      }
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(2, 7, 18, 0.75)',
      backdropFilter: 'blur(10px)',
      zIndex: 9998,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: isMaximized ? '0' : '1.5rem'
    }}>
      <div className="hud-card" style={{
        width: isMaximized ? '100vw' : '720px',
        height: isMaximized ? '100vh' : '480px',
        maxWidth: isMaximized ? '100vw' : '90vw',
        maxHeight: isMaximized ? '100vh' : '85vh',
        background: 'rgba(2, 10, 22, 0.98)',
        border: '1px solid var(--cyan-bright)',
        boxShadow: '0 0 35px rgba(0, 240, 255, 0.35)',
        borderRadius: isMaximized ? '0' : '12px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header Bar */}
        <div className="hud-card-header" style={{
          borderBottom: '1px solid rgba(0, 240, 255, 0.25)',
          padding: '0.6rem 1rem',
          background: 'rgba(0, 240, 255, 0.05)'
        }}>
          <span className="hud-card-title" style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Terminal size={16} color="#00f0ff" /> W.E.D.N.E.S.D.A.Y. HUD TERMINAL / CMD
          </span>

          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            <button
              className="btn-hud"
              onClick={() => { soundFx.playClick(); setHistory([]); }}
              style={{ fontSize: '0.65rem', padding: '0.2rem 0.5rem' }}
              title="Clear Console"
            >
              <Trash2 size={12} /> Clear
            </button>

            <button
              className="btn-hud"
              onClick={() => { soundFx.playClick(); setIsMaximized(!isMaximized); }}
              style={{ padding: '0.2rem 0.4rem' }}
              title={isMaximized ? 'Restore Window' : 'Maximize Window'}
            >
              {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>

            <button
              className="btn-hud"
              onClick={() => { soundFx.playClick(); onClose(); }}
              style={{ padding: '0.2rem 0.4rem', color: '#ff4d4d' }}
              title="Close Terminal"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Output Screen */}
        <div
          onClick={() => inputRef.current?.focus()}
          style={{
            flex: 1,
            padding: '1rem',
            overflowY: 'auto',
            fontFamily: 'Fira Code, monospace',
            fontSize: '0.85rem',
            lineHeight: '1.5',
            background: '#010610',
            color: '#00f0ff',
            cursor: 'text'
          }}
        >
          {history.map((item, idx) => (
            <div
              key={idx}
              style={{
                color: item.type === 'user' ? '#ffffff' : item.type === 'sys' ? '#00f0ff' : item.type === 'err' ? '#ff4d4d' : '#a0aec0',
                marginBottom: '0.3rem',
                wordBreak: 'break-word',
                fontWeight: item.type === 'user' ? 'bold' : 'normal'
              }}
            >
              {item.text}
            </div>
          ))}
          <div ref={terminalEndRef} />
        </div>

        {/* Input Prompt Row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.6rem 1rem',
          background: 'rgba(0, 0, 0, 0.8)',
          borderTop: '1px solid rgba(0, 240, 255, 0.2)'
        }}>
          <span style={{ color: 'var(--cyan-bright)', fontFamily: 'Fira Code', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
            C:\WEDNESDAY\JARVIS&gt;
          </span>
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type command or query..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#ffffff',
              fontFamily: 'Fira Code',
              fontSize: '0.85rem'
            }}
          />
          <button
            className="btn-hud"
            onClick={() => handleCommand(inputVal)}
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
          >
            <Send size={12} /> Run
          </button>
        </div>
      </div>
    </div>
  );
}
