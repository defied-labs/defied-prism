// Vite's import.meta.glob, used by the contract harness to discover fixtures
interface ImportMeta {
  glob<T>(pattern: string, options: { eager: true }): Record<string, T>;
}
