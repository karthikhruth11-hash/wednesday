import { customVoiceSynth } from './customVoiceSynth';

class SpeechEngine {
  constructor() {
    this.recognition = null;
    this.synthesis = window.speechSynthesis;
    this.selectedVoice = null;

    this.onTranscript = null;
    this.onSpeechStart = null;
    this.onSpeechEnd = null;
    this.onError = null;

    this.isListening = false;
    this.isSpeaking = false;
    this.continuousVoiceMode = false;

    this.initRecognition();
    this.loadVoices();

    if (this.synthesis) {
      this.synthesis.onvoiceschanged = () => this.loadVoices();
    }
  }

  setContinuousVoiceMode(enabled) {
    this.continuousVoiceMode = enabled;
  }

  initRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onstart = () => {
        this.isListening = true;
        if (this.onSpeechStart) this.onSpeechStart();
      };

      this.recognition.onresult = (event) => {
        // Mute/ignore transcript processing if assistant is currently speaking or muted
        if (this.isSpeaking) return;

        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        if (this.onTranscript && !this.isSpeaking) {
          this.onTranscript({ final, interim });
        }
      };

      this.recognition.onerror = (err) => {
        console.warn('Speech recognition error:', err);
        this.isListening = false;
        // Ignore silence timeouts or aborts when hands-free continuous voice mode is active
        if (this.continuousVoiceMode && (err.error === 'no-speech' || err.error === 'aborted')) {
          return;
        }
        if (this.onError) this.onError(err);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (this.onSpeechEnd) this.onSpeechEnd();
        // If continuous hands-free voice mode is active and not speaking, re-arm microphone after echo delay
        if (this.continuousVoiceMode && !this.isSpeaking) {
          setTimeout(() => {
            if (this.continuousVoiceMode && !this.isListening && !this.isSpeaking) {
              this.startListening();
            }
          }, 800);
        }
      };
    }
  }

  loadVoices() {
    if (!this.synthesis) return [];
    const voices = this.synthesis.getVoices();
    const savedVoiceName = localStorage.getItem('wednesday_voice_name');

    if (savedVoiceName) {
      const matched = voices.find(v => v.name === savedVoiceName);
      if (matched) {
        this.selectedVoice = matched;
        return voices;
      }
    }

    // Search for natural high-quality human voices over metallic robotic synths
    const preferredKeywords = [
      'Natural', 'Online (Natural)', 'Neural', 'Google US English',
      'Google UK English Female', 'Google UK English Male', 'Jenny',
      'Aria', 'Ava', 'Emma', 'Ana', 'Guy', 'Samantha', 'Zira', 'Victoria'
    ];

    let found = null;
    for (const keyword of preferredKeywords) {
      found = voices.find(v => v.name.includes(keyword) && v.lang.startsWith('en'));
      if (found) break;
    }

    if (!found) {
      found = voices.find(v => v.lang.startsWith('en')) || voices[0];
    }

    this.selectedVoice = found;
    return voices;
  }

  getAvailableVoices() {
    if (!this.synthesis) return [];
    return this.synthesis.getVoices();
  }

  setSelectedVoice(voiceName) {
    if (!this.synthesis) return;
    const voices = this.synthesis.getVoices();
    const found = voices.find(v => v.name === voiceName);
    if (found) {
      this.selectedVoice = found;
      localStorage.setItem('wednesday_voice_name', voiceName);
    }
  }

  startListening() {
    if (this.isSpeaking) return;
    if (this.recognition && !this.isListening) {
      try {
        this.recognition.start();
      } catch (err) {
        console.warn('Mic start exception:', err);
      }
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch { }
      this.isListening = false;
    }
  }

  async speak(text, onStart, onEnd, langCode = null) {
    // Check if recorded user voice replacement is active
    if (customVoiceSynth.hasCustomVoice()) {
      if (this.isListening) this.stopListening();
      this.isSpeaking = true;
      const success = await customVoiceSynth.speakCustomVoice(
        text,
        () => {
          if (onStart) onStart();
        },
        () => {
          this.isSpeaking = false;
          if (onEnd) onEnd();
        }
      );
      if (success) return;
    }

    if (!this.synthesis) {
      if (onEnd) onEnd();
      return;
    }

    this.isSpeaking = true;
    this.stopListening();
    this.synthesis.cancel(); // Stop ongoing speech

    const utterance = new SpeechSynthesisUtterance(text);
    if (langCode) {
      utterance.lang = langCode;
      const voices = this.getAvailableVoices();
      const matchVoice = voices.find(v => v.lang.toLowerCase().startsWith(langCode.toLowerCase().slice(0, 2)));
      if (matchVoice) {
        utterance.voice = matchVoice;
      } else if (this.selectedVoice) {
        utterance.voice = this.selectedVoice;
      }
    } else if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }

    const savedRate = parseFloat(localStorage.getItem('wednesday_speech_rate')) || 1.0;
    const savedPitch = parseFloat(localStorage.getItem('wednesday_speech_pitch')) || 1.0;

    utterance.rate = savedRate; // Natural human speech tempo
    utterance.pitch = savedPitch; // Human pitch

    utterance.onstart = () => {
      this.isSpeaking = true;
      if (onStart) onStart();
    };

    const handleSpeechFinished = () => {
      this.isSpeaking = false;
      if (onEnd) onEnd();
      // If continuous hands-free voice mode is active, re-arm listening after speaking finishes (with 800ms echo buffer)
      if (this.continuousVoiceMode) {
        setTimeout(() => {
          if (this.continuousVoiceMode && !this.isListening && !this.isSpeaking) {
            this.startListening();
          }
        }, 800);
      }
    };

    utterance.onend = handleSpeechFinished;

    utterance.onerror = (e) => {
      console.warn('Speech synthesis error:', e);
      handleSpeechFinished();
    };

    this.synthesis.speak(utterance);
  }

  stopSpeaking() {
    if (this.synthesis) {
      this.synthesis.cancel();
      this.isSpeaking = false;
    }
  }
}

export const speechEngine = new SpeechEngine();
