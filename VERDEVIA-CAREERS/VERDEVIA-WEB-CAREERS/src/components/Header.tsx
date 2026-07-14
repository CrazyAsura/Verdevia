'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';

const links = [
  { href: '/', label: 'Vagas' },
  { href: '/cultura', label: 'Cultura e times' },
  { href: '/processo', label: 'Processo seletivo' },
  { href: '/privacidade', label: 'Privacidade' },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/92 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <Image src="/logo.svg" alt="VERDEVIA" width={34} height={34} className="h-8 w-8" priority />
          <div className="leading-none">
            <span className="block text-sm font-black tracking-tight">VERDEVIA</span>
            <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">Carreiras</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Navegação principal">
          {links.map((link) => {
            const active = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
            return (
              <Link key={link.href} href={link.href} className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button type="button" className="rounded-lg border border-border p-2 md:hidden" onClick={() => setOpen(!open)} aria-label="Abrir menu" aria-expanded={open}>
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="border-t border-border bg-background p-3 md:hidden">
          {links.map((link) => <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="block rounded-lg px-4 py-3 text-sm font-semibold hover:bg-muted">{link.label}</Link>)}
        </nav>
      )}
    </header>
  );
}
