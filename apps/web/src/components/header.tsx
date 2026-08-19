"use client";

export default function Header() {
  return (
    <header className="flex py-4 px-10 justify-between items-center border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-50 bg-background/90 backdrop-blur-md w-full">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          Defied Prism
        </h1>
        <span className="bg-primary/20 text-primary text-xs px-2.5 py-1 rounded-full font-mono font-medium">
          v0.1.0
        </span>
      </div>
      <div className="text-sm text-neutral-500 font-medium">
        Deterministic State Machine & Dual-Engine UI Platform
      </div>
    </header>
  );
}
