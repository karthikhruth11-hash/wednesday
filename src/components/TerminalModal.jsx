import React, { useState, useEffect, useRef } from 'react';
import { Terminal, X, Minimize2, Maximize2, Trash2, Send, ExternalLink, Cpu } from 'lucide-react';
import { soundFx } from '../services/soundFx';
import { aiAgent } from '../services/aiAgent';
import { systemApi } from '../services/systemApi';

export default function TerminalModal({ isOpen, onClose, onOpenCalculator }) {
  const [currentCwd, setCurrentCwd] = useState('C:\\WEDNESDAY\\JARVIS');
  const [history, setHistory] = useState([
    { type: 'sys', text: 'W.E.D.N.E.S.D.A.Y. SYSTEM TERMINAL CORE v3.6 [ONLINE]' },
    { type: 'sys', text: 'Real OS Shell Execution & Desktop Integration Active.' },
    { type: 'sys', text: 'Type system commands (python -V, dir, node -v, npm, etc.) or click "Open Original CMD" for native terminal.' }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const terminalEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      systemApi.getTelemetry().then(data => {
        if (data && data.userHome) {
          setCurrentCwd(data.userHome);
        }
      }).catch(() => {});
    }
  }, [isOpen]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  if (!isOpen) return null;

  const handleLaunchNative = async () => {
    soundFx.playClick();
    setHistory(prev => [...prev, { type: 'sys', text: 'Launching Original Windows Native CMD Terminal on Desktop...' }]);
    const res = await systemApi.launchApp('cmd');
    if (res && res.success) {
      setHistory(prev => [...prev, { type: 'out', text: `⚡ Native CMD Window opened: ${res.message}` }]);
    } else {
      setHistory(prev => [...prev, { type: 'err', text: `Failed to launch native terminal: ${res?.error || 'Unknown error'}` }]);
    }
  };

  const handleCommand = async (cmd) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    soundFx.playClick();
    const promptPath = currentCwd || 'C:\\WEDNESDAY\\JARVIS';
    setHistory(prev => [...prev, { type: 'user', text: `${promptPath}> ${trimmed}` }]);
    setCommandHistory(prev => [trimmed, ...prev]);
    setHistoryIndex(-1);
    setInputVal('');

    const lower = trimmed.toLowerCase();

    // 1. Clear Screen
    if (lower === 'clear' || lower === 'cls') {
      setHistory([]);
      return;
    }

    // 2. Launch Native Terminal Commands
    if (lower === 'native' || lower === 'cmd' || lower === 'terminal' || lower === 'powershell' || lower === 'wt' || lower === 'original') {
      await handleLaunchNative();
      return;
    }

    // 3. Help Command
    if (lower === 'help') {
      setHistory(prev => [
        ...prev,
        { type: 'sys', text: '==================== W.E.D.N.E.S.D.A.Y. TERMINAL HELP ====================' },
        { type: 'out', text: '  original / cmd / native  - Launch real Windows Command Prompt window' },
        { type: 'out', text: '  python -V / node -v / dir- Execute real system commands directly' },
        { type: 'out', text: '  cd <path>               - Navigate directories' },
        { type: 'out', text: '  calc / calculator       - Launch Quantum Calculator' },
        { type: 'out', text: '  date / time             - Display current system timestamp' },
        { type: 'out', text: '  sys / status            - Display core telemetry status' },
        { type: 'out', text: '  clear / cls             - Clear terminal console history' },
        { type: 'out', text: '  eval <code>             - Execute client JavaScript snippet' },
        { type: 'out', text: '  ai <question>           - Query AI Assistant directly' },
        { type: 'sys', text: '========================================================================' }
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
        { type: 'out', text: `WORKING DIRECTORY: ${promptPath}` },
        { type: 'out', text: 'EXECUTION MODE: Real OS Shell & Subprocess Bridge' },
        { type: 'out', text: '----------------------------------------' }
      ]);
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

    if (lower.startsWith('ai ') || lower.startsWith('ask ')) {
      const aiPrompt = trimmed.replace(/^(ai|ask)\s+/i, '');
      try {
        const res = await aiAgent.processQuery(aiPrompt, 'jarvis');
        setHistory(prev => [...prev, { type: 'out', text: res.reply }]);
      } catch (err) {
        setHistory(prev => [...prev, { type: 'err', text: `AI Error: ${err.message}` }]);
      }
      return;
    }

    // 4. Execute Real System OS Command
    setIsExecuting(true);
    try {
      const res = await systemApi.execCommand(trimmed, currentCwd);
      setIsExecuting(false);

      if (res) {
        if (res.cwd) {
          setCurrentCwd(res.cwd);
        }

        if (res.stdout) {
          const lines = res.stdout.trimEnd().split('\n');
          lines.forEach(line => {
            setHistory(prev => [...prev, { type: 'out', text: line }]);
          });
        }

        if (res.stderr) {
          const lines = res.stderr.trimEnd().split('\n');
          lines.forEach(line => {
            setHistory(prev => [...prev, { type: 'err', text: line }]);
          });
        }

        if (!res.stdout && !res.stderr && res.error) {
          setHistory(prev => [...prev, { type: 'err', text: res.error }]);
        }

        if (!res.stdout && !res.stderr && res.success && !trimmed.toLowerCase().startsWith('cd')) {
          setHistory(prev => [...prev, { type: 'sys', text: 'Command executed successfully.' }]);
        }
      } else {
        // Fallback to AI Agent if system API call is null
        const aiRes = await aiAgent.processQuery(trimmed, 'jarvis');
        setHistory(prev => [...prev, { type: 'out', text: aiRes.reply }]);
      }
    } catch (err) {
      setIsExecuting(false);
      setHistory(prev => [...prev, { type: 'err', text: `Execution Failure: ${err.message}` }]);
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
        width: isMaximized ? '100vw' : '780px',
        height: isMaximized ? '100vh' : '520px',
        maxWidth: isMaximized ? '100vw' : '92vw',
        maxHeight: isMaximized ? '100vh' : '88vh',
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
          background: 'rgba(0, 240, 255, 0.05)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span className="hud-card-title" style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Terminal size={16} color="#00f0ff" /> W.E.D.N.E.S.D.A.Y. SYSTEM TERMINAL / CMD
          </span>

          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            <button
              className="btn-hud"
              onClick={handleLaunchNative}
              style={{ fontSize: '0.68rem', padding: '0.2rem 0.6rem', display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#00f0ff', borderColor: '#00f0ff' }}
              title="Open Original Windows CMD Terminal Window on Desktop"
            >
              <ExternalLink size={12} /> Open Original CMD
            </button>

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
            fontFamily: 'Fira Code, Consolas, monospace',
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
                color: item.type === 'user'
                  ? '#ffffff'
                  : item.type === 'sys'
                    ? '#00f0ff'
                    : item.type === 'err'
                      ? '#ff5555'
                      : '#cbd5e0',
                marginBottom: '0.25rem',
                wordBreak: 'break-word',
                fontWeight: item.type === 'user' ? 'bold' : 'normal',
                whiteSpace: 'pre-wrap'
              }}
            >
              {item.text}
            </div>
          ))}
          {isExecuting && (
            <div style={{ color: '#00f0ff', opacity: 0.8, fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Cpu size={14} className="spin-anim" /> Executing command in system shell...
            </div>
          )}
          <div ref={terminalEndRef} />
        </div>

        {/* Input Prompt Row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.6rem 1rem',
          background: 'rgba(0, 0, 0, 0.85)',
          borderTop: '1px solid rgba(0, 240, 255, 0.2)'
        }}>
          <span
            style={{
              color: 'var(--cyan-bright)',
              fontFamily: 'Fira Code, Consolas, monospace',
              fontSize: '0.8rem',
              whiteSpace: 'nowrap',
              maxWidth: '320px',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
            title={currentCwd}
          >
            {currentCwd}&gt;
          </span>
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isExecuting}
            placeholder="Type command (python -V, dir, npm...) or type 'cmd' for original terminal..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#ffffff',
              fontFamily: 'Fira Code, Consolas, monospace',
              fontSize: '0.85rem'
            }}
          />
          <button
            className="btn-hud"
            onClick={() => handleCommand(inputVal)}
            disabled={isExecuting}
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
          >
            <Send size={12} /> Run
          </button>
        </div>
      </div>
    </div>
  );
}
