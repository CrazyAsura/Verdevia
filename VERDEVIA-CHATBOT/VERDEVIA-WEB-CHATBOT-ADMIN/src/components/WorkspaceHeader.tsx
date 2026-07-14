'use client';

import React from 'react';

type WorkspaceHeaderProps = {
  title: string;
  subtitle: string;
};

export function WorkspaceHeader({ title, subtitle }: WorkspaceHeaderProps) {
  return (
    <header className="flex flex-col gap-1 p-6 border-b border-white/5 bg-zinc-950/20 backdrop-blur-md sticky top-0 z-40">
      <h1 className="text-lg font-black uppercase tracking-wider text-white">
        {title}
      </h1>
      <p className="text-xs text-zinc-400 font-medium">
        {subtitle}
      </p>
    </header>
  );
}
