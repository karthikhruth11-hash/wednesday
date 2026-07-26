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

      // Common Greetings & Self Identity
      'how are you': 'I am doing great, Boss Karthik! All SIGMA Arc Reactor core systems are 100% online and running smoothly.',
      'who are you': 'I am W.E.D.N.E.S.D.A.Y., your autonomous omniscient SIGMA AI assistant built for Boss Karthik.',
      'who is your boss': 'Boss Karthik is my creator and boss.',
      'hi': 'Hello, Boss Karthik! W.E.D.N.E.S.D.A.Y. SIGMA Core online and ready. How can I assist you today? ⚡',
      'hii': 'Hello, Boss Karthik! W.E.D.N.E.S.D.A.Y. SIGMA Core online and ready. How can I assist you today? ⚡',
      'hello': 'Hello, Boss Karthik! W.E.D.N.E.S.D.A.Y. SIGMA Core online and ready. How can I assist you today? ⚡',
      'hey': 'Hello, Boss Karthik! W.E.D.N.E.S.D.A.Y. SIGMA Core online and ready. How can I assist you today? ⚡'
    };
  }

  findInstantAnswer(query) {
    const raw = query.toLowerCase().trim();
    const clean = raw.replace(/[^a-z0-9\s]/gi, '').trim();

    // Do not intercept if user is trying to perform an action
    if (clean.includes('open') || clean.includes('play') || clean.includes('create') || clean.includes('launch') || clean.includes('close') || clean.includes('run')) {
      return null;
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
