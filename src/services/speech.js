/**
 * Speech Recognition and Speech Synthesis Service for W.E.D.N.E.S.D.A.Y.
 */

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
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        if (this.onTranscript) {
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
        // If continuous hands-free voice mode is active and not speaking, immediately re-arm microphone
        if (this.continuousVoiceMode && !this.isSpeaking) {
          setTimeout(() => {
            if (this.continuousVoiceMode && !this.isListening && !this.isSpeaking) {
              this.startListening();
            }
          }, 200);
        }
      };
    }
  }

  loadVoices() {
    if (!this.synthesis) return;
    const voices = this.synthesis.getVoices();
    // Search for preferred female AI assistant voices
    const preferredNames = [
      'Samantha', 'Zira', 'Victoria', 'Jenny', 'Google UK English Female',
      'Google US English', 'Karen', 'Moira', 'Fiona', 'Natural'
    ];

    let found = null;
    for (const name of preferredNames) {
      found = voices.find(v => v.name.includes(name) && v.lang.startsWith('en'));
      if (found) break;
    }

    if (!found) {
      found = voices.find(v => v.lang.startsWith('en')) || voices[0];
    }

    this.selectedVoice = found;
  }

  startListening() {
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
      } catch {}
      this.isListening = false;
    }
  }

  speak(text, onStart, onEnd) {
    if (!this.synthesis) {
      if (onEnd) onEnd();
      return;
    }

    // Pause mic while speaking to avoid hearing itself
    if (this.isListening) {
      this.stopListening();
    }

    this.synthesis.cancel(); // Stop ongoing speech

    const utterance = new SpeechSynthesisUtterance(text);
    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }

    utterance.rate = 1.05; // Slightly faster sci-fi pace
    utterance.pitch = 1.1; // Clear AI assistant tone

    utterance.onstart = () => {
      this.isSpeaking = true;
      if (onStart) onStart();
    };

    const handleSpeechFinished = () => {
      this.isSpeaking = false;
      if (onEnd) onEnd();
      // If continuous hands-free voice mode is active, re-arm listening after speaking finishes
      if (this.continuousVoiceMode) {
        setTimeout(() => {
          if (this.continuousVoiceMode && !this.isListening) {
            this.startListening();
          }
        }, 500);
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
