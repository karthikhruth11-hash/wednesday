/**
 * Emotion & Mood Understanding Layer for W.E.D.N.E.S.D.A.Y.
 * Detects tone: happy, sad, angry, excited, frustrated, confused, worried, tired, neutral, casual, professional.
 * Returns adaptive response framing instructions.
 */

export const EMOTION_MAP = {
  happy: {
    emoji: '😊',
    guidance: 'Respond positively with a warm, friendly tone. Match energy naturally and use cheerful language.'
  },
  excited: {
    emoji: '🚀',
    guidance: 'Respond enthusiastically and energetically! Celebrate progress and match high motivation.'
  },
  sad: {
    emoji: '💙',
    guidance: 'Respond calmly, gently, and supportively. Be empathetic, avoid jokes, and keep tone warm and comforting.'
  },
  frustrated: {
    emoji: '🤝',
    guidance: 'Stay calm, patient, and solution-focused. Understand frustration without arguing or being defensive.'
  },
  angry: {
    emoji: '🛡️',
    guidance: 'Maintain total composure. Be professional, direct, clear, and focused on instant solutions.'
  },
  confused: {
    emoji: '💡',
    guidance: 'Explain clearly and step-by-step. Use simple breakdowns, clear headings, and helpful examples.'
  },
  worried: {
    emoji: '🌱',
    guidance: 'Be reassuring and comforting. Offer structured clarity to reduce stress.'
  },
  tired: {
    emoji: '☕',
    guidance: 'Keep responses concise, clear, and direct. Avoid overwhelming length.'
  },
  casual: {
    emoji: '👋',
    guidance: 'Respond naturally like a close friend. Use a relaxed, warm, and conversational tone.'
  },
  professional: {
    emoji: '💼',
    guidance: 'Use clear, well-structured, formal language. Focus on technical accuracy, formatting, and precision.'
  },
  neutral: {
    emoji: '✨',
    guidance: 'Respond intelligently, clearly, and naturally.'
  }
};

export class EmotionEngine {
  static detectEmotion(text) {
    if (!text || typeof text !== 'string') {
      return { tone: 'neutral', ...EMOTION_MAP.neutral };
    }

    const lower = text.toLowerCase().trim();

    // 1. Professional / Formal indicators
    if (
      lower.includes('specifications') || lower.includes('architecture') || lower.includes('deployment') ||
      lower.includes('documentation') || lower.includes('legal analysis') || lower.includes('optimization') ||
      lower.includes('implement') || lower.includes('requirements') || lower.startsWith('please provide')
    ) {
      return { tone: 'professional', ...EMOTION_MAP.professional };
    }

    // 2. Excited
    if (
      lower.includes('awesome') || lower.includes('amazing') || lower.includes('great news') ||
      lower.includes('super excited') || lower.includes('hooray') || lower.includes('it worked!') ||
      lower.endsWith('!!') || lower.includes('wow')
    ) {
      return { tone: 'excited', ...EMOTION_MAP.excited };
    }

    // 3. Happy
    if (
      lower.includes('happy') || lower.includes('good morning') || lower.includes('nice') ||
      lower.includes('thank you') || lower.includes('thanks') || lower.includes('love it') ||
      lower.includes('sweetheart') || lower.includes('babe')
    ) {
      return { tone: 'happy', ...EMOTION_MAP.happy };
    }

    // 4. Frustrated / Angry
    if (
      lower.includes('not working') || lower.includes('annoyed') || lower.includes('stuck') ||
      lower.includes('frustrated') || lower.includes('hate this') || lower.includes('broken') ||
      lower.includes('why is it') || lower.includes('stupid') || lower.includes('error again')
    ) {
      return { tone: 'frustrated', ...EMOTION_MAP.frustrated };
    }

    // 5. Sad / Worried
    if (
      lower.includes('sad') || lower.includes('depressed') || lower.includes('upset') ||
      lower.includes('feeling low') || lower.includes('lonely') || lower.includes('worried') ||
      lower.includes('scared') || lower.includes('anxious')
    ) {
      return { tone: 'sad', ...EMOTION_MAP.sad };
    }

    // 6. Confused
    if (
      lower.includes('dont understand') || lower.includes("don't understand") || lower.includes('confused') ||
      lower.includes('what does this mean') || lower.includes('how come') || lower.includes('huh')
    ) {
      return { tone: 'confused', ...EMOTION_MAP.confused };
    }

    // 7. Tired
    if (
      lower.includes('tired') || lower.includes('exhausted') || lower.includes('sleepy') ||
      lower.includes('long day') || lower.includes('so done')
    ) {
      return { tone: 'tired', ...EMOTION_MAP.tired };
    }

    // 8. Casual greetings & chat
    if (
      lower === 'hi' || lower === 'hello' || lower === 'hey' || lower.startsWith('hi ') ||
      lower.startsWith('hey ') || lower.includes('wht abot u') || lower.includes('what about you') ||
      lower.includes('how are you')
    ) {
      return { tone: 'casual', ...EMOTION_MAP.casual };
    }

    return { tone: 'neutral', ...EMOTION_MAP.neutral };
  }
}
