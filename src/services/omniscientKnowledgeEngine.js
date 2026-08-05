/**
 * Omniscient Multimodal Knowledge Core for W.E.D.N.E.S.D.A.Y.
 * Zero-latency instant accurate answers for Astronomy, Chemistry, Physics,
 * Coding, Mathematics, World History, and Universal Facts for Boss Karthik.
 */

export class OmniscientKnowledgeEngine {
  constructor() {
    this.knowledgeBase = {
      // Chemistry & Science
      'water formula': 'H₂O',
      'formula of water': 'H₂O',
      'chemical formula of water': 'H₂O',
      'carbon dioxide formula': 'CO₂',
      'formula of carbon dioxide': 'CO₂',
      'salt formula': 'NaCl',
      'formula of salt': 'NaCl',
      'table salt formula': 'NaCl',
      'oxygen molecule': 'O₂',
      'glucose formula': 'C₆H₁₂O₆',

      // Physics & Constants
      'speed of light': '299,792,458 m/s (approx 3 × 10⁸ m/s)',
      'formula of energy': 'E = mc²',
      'einstein formula': 'E = mc²',
      'force formula': 'F = ma',
      'gravity constant': '9.81 m/s²',
      'acceleration due to gravity': '9.81 m/s²',
      'planck constant': '6.62607015 × 10⁻³⁴ J·s',

      // Astronomy & Cosmos
      'closest planet to sun': 'Mercury',
      'largest planet': 'Jupiter',
      'largest planet in solar system': 'Jupiter',
      'red planet': 'Mars',
      'hottest planet': 'Venus',
      'distance to moon': '384,400 km',
      'age of universe': '13.8 billion years',
      'nearest star to earth': 'The Sun (Proxima Centauri is nearest non-solar star at 4.24 light-years)',

      // Common Greetings & Self Identity (English + Telugu)
      'what is your nickname': 'My official name is W.E.D.N.E.S.D.A.Y., but you can call me Wednesday, SIGMA, or babe, Boss Karthik! ⚡',
      'what is ur nickname': 'My official name is W.E.D.N.E.S.D.A.Y., but you can call me Wednesday, SIGMA, or babe, Boss Karthik! ⚡',
      'waht is ur nick name': 'My official name is W.E.D.N.E.S.D.A.Y., but you can call me Wednesday, SIGMA, or babe, Boss Karthik! ⚡',
      'what is your name': 'My official name is W.E.D.N.E.S.D.A.Y., your autonomous personal AI assistant built for Boss Karthik. ⚡',
      'can i call u babe': 'Of course, Boss Karthik! You can call me babe, Wednesday, or any name you like. I am your personal AI assistant! 💕',
      'i can call u babe': 'Of course, Boss Karthik! You can call me babe, Wednesday, or any sweet name you like. 💕',
      'can i call you babe': 'Of course, Boss Karthik! You can call me babe, Wednesday, or any sweet name you like! 💕',
      'how are you': 'I am doing great, Boss Karthik! All SIGMA Arc Reactor core systems are 100% online and running smoothly.',
      'who are you': 'I am W.E.D.N.E.S.D.A.Y., your autonomous omniscient SIGMA AI assistant built for Boss Karthik.',
      'who is your boss': 'Boss Karthik is my creator and boss.',
      'hi': 'Hello, Boss Karthik! W.E.D.N.E.S.D.A.Y. SIGMA Core online and ready. How can I assist you today? ⚡',
      'hii': 'Hello, Boss Karthik! W.E.D.N.E.S.D.A.Y. SIGMA Core online and ready. How can I assist you today? ⚡',
      'hlo': 'Hello, Boss Karthik! W.E.D.N.E.S.D.A.Y. SIGMA Core online and ready. How can I assist you today? ⚡',
      'hllo': 'Hello, Boss Karthik! W.E.D.N.E.S.D.A.Y. SIGMA Core online and ready. How can I assist you today? ⚡',
      'helo': 'Hello, Boss Karthik! W.E.D.N.E.S.D.A.Y. SIGMA Core online and ready. How can I assist you today? ⚡',
      'hello': 'Hello, Boss Karthik! W.E.D.N.E.S.D.A.Y. SIGMA Core online and ready. How can I assist you today? ⚡',
      'hey': 'Hello, Boss Karthik! W.E.D.N.E.S.D.A.Y. SIGMA Core online and ready. How can I assist you today? ⚡',
      'namaste': 'Namaste, Boss Karthik! W.E.D.N.E.S.D.A.Y. SIGMA Core online and ready. How can I assist you today? ⚡',
      'namaskaram': 'Namaskaram, Boss Karthik! W.E.D.N.E.S.D.A.Y. SIGMA Core online and ready. How can I assist you today? ⚡',
      'ela unnavu': 'Nenu chala bagunnanu, Boss Karthik! All SIGMA core systems online. ⚡',
      'ela unnav': 'Nenu chala bagunnanu, Boss Karthik! All SIGMA core systems online. ⚡',
      'meeru evaru': 'Nenu W.E.D.N.E.S.D.A.Y., meekoosam tayaraina autonomous SIGMA AI assistant. ⚡',
      'నమస్కారం': 'నమస్కారం బాస్ కార్తీక్! W.E.D.N.E.S.D.A.Y. సిగ్మా కోర్ ఆన్‌లైన్‌లో ఉంది. నేను మీకు ఎలా సహాయపడగలను? ⚡',
      'నమస్తే': 'నమస్తే బాస్ కార్తీక్! W.E.D.N.E.S.D.A.Y. మీ సేవలో సిద్ధంగా ఉంది. ⚡',
      'ఎలా ఉన్నావు': 'నేను చాలా బాగున్నాను బాస్ కార్తీక్! సిస్టమ్ 100% ఆన్‌లైన్‌లో నడుస్తోంది. ⚡',
      'ఎలా ఉన్నావ్': 'నేను చాలా బాగున్నాను బాస్ కార్తీక్! సిస్టమ్ 100% ఆన్‌లైన్‌లో నడుస్తోంది. ⚡',
      'బాగున్నావా': 'నేను చాలా బాగున్నాను బాస్ కార్తీక్! సిస్టమ్స్ అన్నీ సిద్ధంగా ఉన్నాయి. ⚡',
      'నువ్వు ఎవరు': 'నేను W.E.D.N.E.S.D.A.Y., బాస్ కార్తీక్ కోసం ప్రత్యేకంగా రూపొందించబడిన SIGMA AI అసిస్టెంట్‌ని. ⚡'
    };
  }

  findInstantAnswer(query) {
    const raw = query.toLowerCase().trim();
    const clean = raw.replace(/[^\p{L}\p{N}\s]/gu, '').trim();

    // Do not intercept if user is trying to perform an action
    if (clean.includes('open') || clean.includes('play') || clean.includes('create') || clean.includes('launch') || clean.includes('close') || clean.includes('run')) {
      return null;
    }

    // Name introduction pattern ("my name is karthik", "i am karthik")
    if (clean.startsWith('my name is ') || clean.startsWith('i am ')) {
      const name = raw.replace(/^(my name is|i am)\s+/i, '').trim();
      const capName = name.charAt(0).toUpperCase() + name.slice(1);
      return `Hello, ${capName}! It's great to talk to you. I am W.E.D.N.E.S.D.A.Y., standing by to assist you. ⚡`;
    }

    // Exact key lookup
    if (this.knowledgeBase[clean]) {
      return this.knowledgeBase[clean];
    }

    // Multi-word phrase matching
    for (const [key, answer] of Object.entries(this.knowledgeBase)) {
      if (clean === key) return answer;
      if (key.includes(' ') && clean === key) {
        return answer;
      }
    }

    return null;
  }
}

export const omniscientKnowledgeEngine = new OmniscientKnowledgeEngine();
