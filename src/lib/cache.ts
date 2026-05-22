// Simple in-memory LRU cache for demonstration purposes.
// In a production environment, use Upstash Redis as specified in the PRD.

class LRUCache<K, V> {
  private capacity: number;
  private cache: Map<K, V>;

  constructor(capacity: number = 100) {
    this.capacity = capacity;
    this.cache = new Map<K, V>();
  }

  get(key: K): V | undefined {
    if (!this.cache.has(key)) return undefined;
    
    // Refresh position to mark as recently used
    const val = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, val);
    return val;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      // Evict least recently used (first item in Map)
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, value);
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }
}

// Global cache instance for the server runtime
export const recommendationCache = new LRUCache<string, any>(200);

export const SYSTEM_PROMPTS = {
  // Highly optimized prompt to minimize Gemini Flash token cost (Phase 5 goal)
  EXTRACTION: `Extract from the following input: genres, emotional tone, pacing, themes. Return JSON only.`,
  
  // Constrained to short response to keep response times low
  EXPLANATION: `Explain why this book matches the user in 2 sentences. Focus on emotional resonance.`,
};
