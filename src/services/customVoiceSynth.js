/**
 * Custom Recorded Voice Audio Replacement Synthesizer for W.E.D.N.E.S.D.A.Y.
 * Replaces the AI's default speaking voice with the user's own recorded voice sample!
 */

export class CustomVoiceSynth {
  constructor() {
    this.audioCtx = null;
  }

  getAudioContext() {
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioCtx();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  hasCustomVoice() {
    const activeData = localStorage.getItem('wednesday_active_custom_voice');
    return Boolean(activeData && activeData.startsWith('data:audio'));
  }

  async speakCustomVoice(text, onStart, onEnd) {
    const activeData = localStorage.getItem('wednesday_active_custom_voice');
    if (!activeData || !activeData.startsWith('data:audio')) {
      if (onEnd) onEnd();
      return false;
    }

    try {
      if (onStart) onStart();

      const audio = new Audio(activeData);
      const savedRate = parseFloat(localStorage.getItem('wednesday_speech_rate')) || 1.0;
      audio.playbackRate = savedRate;

      audio.onended = () => {
        if (onEnd) onEnd();
      };

      audio.onerror = () => {
        if (onEnd) onEnd();
      };

      await audio.play();
      return true;
    } catch (err) {
      console.warn('Custom voice playback error:', err);
      if (onEnd) onEnd();
      return false;
    }
  }
}

export const customVoiceSynth = new CustomVoiceSynth();
