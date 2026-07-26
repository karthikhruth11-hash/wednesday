import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Trash2, Sparkles, CheckCircle } from 'lucide-react';
import { soundFx } from '../services/soundFx';

export default function CustomVoiceStudio() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [voiceClips, setVoiceClips] = useState(() => {
    return JSON.parse(localStorage.getItem('wednesday_custom_voices') || '[]');
  });
  const [clipTitle, setClipTitle] = useState('My Custom Voice Greeting');
  const [playbackPitch, setPlaybackPitch] = useState('1.0');
  const [playbackSpeed, setPlaybackSpeed] = useState('1.0');
  const [statusMsg, setStatusMsg] = useState('');

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  const [activeVoiceClip, setActiveVoiceClip] = useState(() => {
    return localStorage.getItem('wednesday_active_custom_voice') || '';
  });

  useEffect(() => {
    localStorage.setItem('wednesday_custom_voices', JSON.stringify(voiceClips));
  }, [voiceClips]);

  const setAsActiveVoice = (clip) => {
    soundFx.playClick();
    if (activeVoiceClip === clip.audioData) {
      localStorage.removeItem('wednesday_active_custom_voice');
      setActiveVoiceClip('');
      setStatusMsg('Custom voice deactivated. Reverted to web speech synthesis voice.');
    } else {
      localStorage.setItem('wednesday_active_custom_voice', clip.audioData);
      setActiveVoiceClip(clip.audioData);
      setStatusMsg(`Replaced AI Voice! W.E.D.N.E.S.D.A.Y. will now speak with "${clip.title}".`);
    }
    setTimeout(() => setStatusMsg(''), 4000);
  };

  const startRecording = async () => {
    soundFx.playClick();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const base64Audio = reader.result;
          const newClip = {
            id: Date.now(),
            title: clipTitle || `Voice Sample ${voiceClips.length + 1}`,
            audioData: base64Audio,
            duration: recordingTime,
            date: new Date().toLocaleDateString()
          };
          setVoiceClips(prev => [newClip, ...prev]);
          setStatusMsg(`Recorded custom voice clip "${newClip.title}" successfully!`);
          setTimeout(() => setStatusMsg(''), 4000);
        };
        stream.getTracks().forEach(t => t.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(t => t + 1);
      }, 1000);
    } catch {
      setStatusMsg('Error accessing microphone for recording.');
      setTimeout(() => setStatusMsg(''), 4000);
    }
  };

  const stopRecording = () => {
    soundFx.playClick();
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const playClip = (clip) => {
    soundFx.playClick();
    const audio = new Audio(clip.audioData);
    audio.playbackRate = parseFloat(playbackSpeed);
    audio.play();
  };

  const deleteClip = (id) => {
    soundFx.playClick();
    setVoiceClips(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="hud-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div className="hud-card-header">
        <span className="hud-card-title">
          <Sparkles size={16} color="#ff4d6d" /> Custom Voice Studio & Recorder
        </span>
        <span style={{ fontSize: '0.7rem', color: 'var(--cyan-bright)', fontFamily: 'Orbitron' }}>
          {voiceClips.length} CUSTOM CLIPS
        </span>
      </div>

      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
        Record your own human voice samples to personalize W.E.D.N.E.S.D.A.Y. responses with your exact voice profile!
      </div>

      {/* Voice Recording Control Bar */}
      <div style={{ padding: '0.75rem', background: 'rgba(255, 77, 109, 0.05)', border: '1px solid rgba(255, 77, 109, 0.3)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input
            type="text"
            className="input-hud"
            placeholder="Name your voice recording sample..."
            value={clipTitle}
            onChange={(e) => setClipTitle(e.target.value)}
            style={{ flex: 1 }}
          />

          {!isRecording ? (
            <button className="btn-start-wednesday" onClick={startRecording} style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
              <Mic size={14} /> RECORD MY VOICE
            </button>
          ) : (
            <button className="btn-hud btn-hud-danger" onClick={stopRecording} style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', animation: 'pulse 1s infinite' }}>
              <Square size={14} /> STOP RECORDING ({recordingTime}s)
            </button>
          )}
        </div>

        {isRecording && (
          <div style={{ fontSize: '0.75rem', color: '#ff4d6d', fontFamily: 'Orbitron', textAlign: 'center', animation: 'pulse 1s infinite' }}>
            🎙️ RECORDING IN PROGRESS... Speak clearly into your microphone now!
          </div>
        )}
      </div>

      {/* Pitch & Tempo Modulation Controls */}
      <div style={{ padding: '0.6rem 0.75rem', background: 'rgba(0, 240, 255, 0.03)', border: '1px solid rgba(0, 240, 255, 0.15)', borderRadius: '8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
            Playback Tempo: {playbackSpeed}x
          </div>
          <input
            type="range"
            min="0.7"
            max="1.5"
            step="0.05"
            value={playbackSpeed}
            onChange={(e) => setPlaybackSpeed(e.target.value)}
            style={{ width: '100%', accentColor: 'var(--cyan-bright)' }}
          />
        </div>

        <div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
            Custom Voice Pitch: {playbackPitch}
          </div>
          <input
            type="range"
            min="0.5"
            max="1.5"
            step="0.05"
            value={playbackPitch}
            onChange={(e) => setPlaybackPitch(e.target.value)}
            style={{ width: '100%', accentColor: 'var(--cyan-bright)' }}
          />
        </div>
      </div>

      {statusMsg && (
        <div style={{ fontSize: '0.8rem', color: 'var(--green-online)', fontFamily: 'Orbitron', textAlign: 'center' }}>
          {statusMsg}
        </div>
      )}

      {/* Saved Voice Clips Library */}
      <div className="messages-list" style={{ flex: 1, overflowY: 'auto', border: '1px solid var(--border-hud)', borderRadius: '6px', padding: '0.5rem', background: 'rgba(3,6,13,0.5)' }}>
        {voiceClips.length === 0 ? (
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', margin: '1.5rem 0' }}>
            No recorded voice clips yet. Click "RECORD MY VOICE" above!
          </div>
        ) : (
          voiceClips.map((clip) => (
            <div
              key={clip.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.5rem 0.75rem',
                marginBottom: '0.4rem',
                border: `1px solid ${activeVoiceClip === clip.audioData ? '#10b981' : 'rgba(0,240,255,0.15)'}`,
                borderRadius: '6px',
                background: activeVoiceClip === clip.audioData ? 'rgba(16,185,129,0.08)' : 'rgba(0,240,255,0.02)'
              }}
            >
              <div>
                <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  {clip.title}
                  {activeVoiceClip === clip.audioData && (
                    <span style={{ fontSize: '0.65rem', color: '#10b981', background: 'rgba(16,185,129,0.2)', padding: '0.1rem 0.4rem', borderRadius: '10px', fontFamily: 'Orbitron' }}>
                      ACTIVE AI VOICE
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                  Recorded on {clip.date} • {clip.duration}s
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.3rem' }}>
                <button className="btn-hud" onClick={() => playClip(clip)} style={{ fontSize: '0.7rem', padding: '0.3rem 0.6rem' }} title="Play Voice Clip">
                  <Play size={12} /> Listen
                </button>
                <button
                  className={`btn-hud ${activeVoiceClip === clip.audioData ? 'active' : ''}`}
                  onClick={() => setAsActiveVoice(clip)}
                  style={{ fontSize: '0.7rem', padding: '0.3rem 0.6rem', color: activeVoiceClip === clip.audioData ? '#08090d' : '#10b981', background: activeVoiceClip === clip.audioData ? '#10b981' : 'rgba(16,185,129,0.1)' }}
                  title="Use My Voice for All AI Responses"
                >
                  <CheckCircle size={12} /> {activeVoiceClip === clip.audioData ? 'AI VOICE ACTIVE' : 'USE AS AI VOICE'}
                </button>
                <button className="btn-hud btn-hud-danger" onClick={() => deleteClip(clip.id)} style={{ fontSize: '0.7rem', padding: '0.3rem 0.5rem' }}>
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
