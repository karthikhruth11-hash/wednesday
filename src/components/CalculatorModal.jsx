import React, { useState, useEffect } from 'react';
import { Cpu, X, Copy, Delete, RefreshCw, Check } from 'lucide-react';
import { soundFx } from '../services/soundFx';

export default function CalculatorModal({ isOpen, onClose }) {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [isScientific, setIsScientific] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (['0','1','2','3','4','5','6','7','8','9','.','+','-','*','/','(',')','^'].includes(e.key)) {
        e.preventDefault();
        handleInput(e.key);
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        calculateResult();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, display, equation]);

  if (!isOpen) return null;

  const handleInput = (val) => {
    soundFx.playClick();
    if (display === '0' || display === 'Error') {
      setDisplay(val);
    } else {
      setDisplay(prev => prev + val);
    }
  };

  const handleClear = () => {
    soundFx.playClick();
    setDisplay('0');
    setEquation('');
  };

  const handleBackspace = () => {
    soundFx.playClick();
    if (display.length <= 1 || display === 'Error') {
      setDisplay('0');
    } else {
      setDisplay(prev => prev.slice(0, -1));
    }
  };

  const calculateResult = () => {
    soundFx.playClick();
    try {
      setEquation(display);
      let expr = display
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/π/g, 'Math.PI')
        .replace(/e/g, 'Math.E')
        .replace(/sin\(/g, 'Math.sin(')
        .replace(/cos\(/g, 'Math.cos(')
        .replace(/tan\(/g, 'Math.tan(')
        .replace(/log\(/g, 'Math.log10(')
        .replace(/ln\(/g, 'Math.log(')
        .replace(/√\(/g, 'Math.sqrt(')
        .replace(/\^/g, '**');

      // Safe evaluation using Function
      const evalFn = new Function(`return (${expr})`);
      const res = evalFn();
      if (typeof res === 'number' && !isNaN(res)) {
        const formatted = Number.isInteger(res) ? res.toString() : parseFloat(res.toFixed(8)).toString();
        setDisplay(formatted);
      } else {
        setDisplay('Error');
      }
    } catch {
      setDisplay('Error');
    }
  };

  const handleFunc = (funcName) => {
    soundFx.playClick();
    if (funcName === 'sqrt') {
      setDisplay(prev => (prev === '0' ? '√(' : prev + '√('));
    } else if (funcName === 'sq') {
      setDisplay(prev => prev + '^2');
    } else if (funcName === 'pow') {
      setDisplay(prev => prev + '^');
    } else if (['sin', 'cos', 'tan', 'log', 'ln'].includes(funcName)) {
      setDisplay(prev => (prev === '0' ? `${funcName}(` : prev + `${funcName}(`));
    }
  };

  const copyToClipboard = () => {
    soundFx.playClick();
    navigator.clipboard.writeText(display);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div className="hud-card" style={{
        width: isScientific ? '420px' : '340px',
        background: 'rgba(4, 15, 32, 0.96)',
        border: '1px solid var(--cyan-bright)',
        boxShadow: '0 0 30px rgba(0, 240, 255, 0.3)',
        borderRadius: '12px',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div className="hud-card-header" style={{ borderBottom: '1px solid rgba(0, 240, 255, 0.2)', padding: '0.6rem 1rem' }}>
          <span className="hud-card-title" style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Cpu size={16} color="#00f0ff" /> QUANTUM CALCULATOR
          </span>
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            <button
              className="btn-hud"
              onClick={() => { soundFx.playClick(); setIsScientific(!isScientific); }}
              style={{ fontSize: '0.65rem', padding: '0.2rem 0.5rem' }}
            >
              {isScientific ? 'Standard' : 'Scientific'}
            </button>
            <button
              className="btn-hud"
              onClick={() => { soundFx.playClick(); onClose(); }}
              style={{ padding: '0.2rem 0.4rem', color: '#ff4d4d' }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Display Screen */}
        <div style={{
          padding: '1rem',
          background: 'rgba(0, 0, 0, 0.6)',
          borderBottom: '1px solid rgba(0, 240, 255, 0.15)',
          textAlign: 'right'
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', height: '1.2rem', fontFamily: 'Fira Code' }}>
            {equation || ' '}
          </div>
          <div style={{
            fontSize: '1.8rem',
            fontFamily: 'Orbitron',
            fontWeight: '700',
            color: 'var(--cyan-bright)',
            overflowX: 'auto',
            whiteSpace: 'nowrap',
            wordBreak: 'break-all'
          }}>
            {display}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem', fontSize: '0.7rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>HUD CORE CALC v2.5</span>
            <button
              onClick={copyToClipboard}
              style={{ background: 'none', border: 'none', color: copied ? '#00ff88' : 'var(--cyan-bright)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Keypad Grid */}
        <div style={{ padding: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {/* Scientific Buttons Row (if active) */}
          {isScientific && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.35rem' }}>
              <button className="btn-hud" onClick={() => handleFunc('sin')} style={{ fontSize: '0.7rem', padding: '0.5rem 0' }}>sin</button>
              <button className="btn-hud" onClick={() => handleFunc('cos')} style={{ fontSize: '0.7rem', padding: '0.5rem 0' }}>cos</button>
              <button className="btn-hud" onClick={() => handleFunc('tan')} style={{ fontSize: '0.7rem', padding: '0.5rem 0' }}>tan</button>
              <button className="btn-hud" onClick={() => handleFunc('log')} style={{ fontSize: '0.7rem', padding: '0.5rem 0' }}>log</button>
              <button className="btn-hud" onClick={() => handleFunc('ln')} style={{ fontSize: '0.7rem', padding: '0.5rem 0' }}>ln</button>
              <button className="btn-hud" onClick={() => handleFunc('sqrt')} style={{ fontSize: '0.7rem', padding: '0.5rem 0' }}>√</button>
              <button className="btn-hud" onClick={() => handleFunc('pow')} style={{ fontSize: '0.7rem', padding: '0.5rem 0' }}>^</button>
              <button className="btn-hud" onClick={() => handleInput('π')} style={{ fontSize: '0.7rem', padding: '0.5rem 0' }}>π</button>
              <button className="btn-hud" onClick={() => handleInput('e')} style={{ fontSize: '0.7rem', padding: '0.5rem 0' }}>e</button>
              <button className="btn-hud" onClick={() => handleFunc('sq')} style={{ fontSize: '0.7rem', padding: '0.5rem 0' }}>x²</button>
            </div>
          )}

          {/* Standard Keypad Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem' }}>
            <button className="btn-hud" onClick={handleClear} style={{ background: 'rgba(255, 77, 77, 0.2)', color: '#ff4d4d', fontWeight: 'bold' }}>AC</button>
            <button className="btn-hud" onClick={handleBackspace} style={{ color: '#ffaa00' }}><Delete size={16} /></button>
            <button className="btn-hud" onClick={() => handleInput('(')}>(</button>
            <button className="btn-hud" onClick={() => handleInput(')')}>)</button>

            <button className="btn-hud" onClick={() => handleInput('7')}>7</button>
            <button className="btn-hud" onClick={() => handleInput('8')}>8</button>
            <button className="btn-hud" onClick={() => handleInput('9')}>9</button>
            <button className="btn-hud" onClick={() => handleInput('÷')} style={{ color: 'var(--cyan-bright)', fontSize: '1.1rem' }}>÷</button>

            <button className="btn-hud" onClick={() => handleInput('4')}>4</button>
            <button className="btn-hud" onClick={() => handleInput('5')}>5</button>
            <button className="btn-hud" onClick={() => handleInput('6')}>6</button>
            <button className="btn-hud" onClick={() => handleInput('×')} style={{ color: 'var(--cyan-bright)', fontSize: '1.1rem' }}>×</button>

            <button className="btn-hud" onClick={() => handleInput('1')}>1</button>
            <button className="btn-hud" onClick={() => handleInput('2')}>2</button>
            <button className="btn-hud" onClick={() => handleInput('3')}>3</button>
            <button className="btn-hud" onClick={() => handleInput('-')} style={{ color: 'var(--cyan-bright)', fontSize: '1.1rem' }}>-</button>

            <button className="btn-hud" onClick={() => handleInput('0')}>0</button>
            <button className="btn-hud" onClick={() => handleInput('.')}>.</button>
            <button className="btn-hud" onClick={() => handleInput('%')}>%</button>
            <button className="btn-hud" onClick={() => handleInput('+')} style={{ color: 'var(--cyan-bright)', fontSize: '1.1rem' }}>+</button>
          </div>

          {/* Equal Button */}
          <button
            className="btn-stark-submit"
            onClick={calculateResult}
            style={{ width: '100%', padding: '0.6rem', fontSize: '1.1rem', marginTop: '0.2rem' }}
          >
            =
          </button>
        </div>
      </div>
    </div>
  );
}
