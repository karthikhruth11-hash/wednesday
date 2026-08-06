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

  setRecognitionLanguage(langCode) {
    const code = langCode || localStorage.getItem('wednesday_mic_lang') || 'te-IN';
    localStorage.setItem('wednesday_mic_lang', code);
    if (this.recognition) {
      this.recognition.lang = code;
    }
  }

  getRecognitionLanguage() {
    return (this.recognition && this.recognition.lang) || localStorage.getItem('wednesday_mic_lang') || 'te-IN';
  }

  initRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      const savedMicLang = localStorage.getItem('wednesday_mic_lang') || 'te-IN';
      this.recognition.lang = savedMicLang;

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

    // Auto-detect non-English native script if langCode not explicitly passed
    let effectiveLang = langCode;
    if (!effectiveLang) {
      if (/[\u0C00-\u0C7F]/.test(text)) effectiveLang = 'te-IN'; // Telugu
      else if (/[\u0900-\u097F]/.test(text)) effectiveLang = 'hi-IN'; // Hindi
      else if (/[\u0B80-\u0BFF]/.test(text)) effectiveLang = 'ta-IN'; // Tamil
      else if (/[\u0C80-\u0CFF]/.test(text)) effectiveLang = 'kn-IN'; // Kannada
      else if (/[\u0D00-\u0D7F]/.test(text)) effectiveLang = 'ml-IN'; // Malayalam
      else if (/[\u0980-\u09FF]/.test(text)) effectiveLang = 'bn-IN'; // Bengali
      else if (/[\u4E00-\u9FFF]/.test(text)) effectiveLang = 'zh-CN'; // Chinese
      else if (/[\u3040-\u30FF]/.test(text)) effectiveLang = 'ja-JP'; // Japanese
      else if (/[\uAC00-\uD7AF]/.test(text)) effectiveLang = 'ko-KR'; // Korean
      else if (/[\u0600-\u06FF]/.test(text)) effectiveLang = 'ar-SA'; // Arabic
      else if (/[\u0400-\u04FF]/.test(text)) effectiveLang = 'ru-RU'; // Russian
    }

    // Clean raw markdown syntax for smooth speech synthesis (removes image tags, URLs, asterisks)
    const cleanText = text
      .replace(/!\[([^\]]*)\]\([^)]*\)/g, '')
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      .replace(/https?:\/\/[^\s)]+/g, '')
      .replace(/[*#_`~]/g, '')
      .trim();

    const spokenChunk = cleanText.length > 300 ? cleanText.substring(0, 300) + '...' : cleanText;
    const utterance = new SpeechSynthesisUtterance(spokenChunk || 'Information ready');
    if (effectiveLang) {
      utterance.lang = effectiveLang;
      const voices = this.getAvailableVoices();
      const matchVoice = voices.find(v => v.lang.toLowerCase().startsWith(effectiveLang.toLowerCase().slice(0, 2)));
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

    try {
      this.synthesis.cancel();
      this.synthesis.resume();
    } catch {}

    utterance.onstart = () => {
      this.isSpeaking = true;
      if (onStart) onStart();
    };

    let speechTimer = null;
    let finished = false;

    const handleSpeechFinished = () => {
      if (finished) return;
      finished = true;
      if (speechTimer) clearTimeout(speechTimer);
      this.isSpeaking = false;
      if (onEnd) onEnd();
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

    // Safety timeout (10s) in case browser SpeechSynthesis freezes or doesn't fire events
    speechTimer = setTimeout(() => {
      handleSpeechFinished();
    }, 10000);

    try {
      this.synthesis.speak(utterance);
    } catch {
      handleSpeechFinished();
    }
  }

  stopSpeaking() {
    if (this.synthesis) {
      this.synthesis.cancel();
      this.isSpeaking = false;
    }
  }
}

export const speechEngine = new SpeechEngine();
