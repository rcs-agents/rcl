/**
 * TypeScript declarations for in-file testing with Bun
 */

declare global {
  namespace ImportMeta {
    /**
     * When true, includes in-file tests. Set via --define import.meta.TEST=true
     * When false or undefined, test code is eliminated via dead code elimination
     */
    const TEST: boolean;
  }
}

export {}; 