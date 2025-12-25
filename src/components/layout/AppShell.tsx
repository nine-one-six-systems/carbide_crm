import { ReactNode } from 'react';

import { useScrollToTop } from '@/hooks/useScrollToTop';

import { HeaderNav } from './HeaderNav';
import { SkipLinks } from './SkipLinks';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  useScrollToTop();

  return (
    <div className="flex min-h-screen flex-col safe-top safe-bottom">
      <SkipLinks />
      <HeaderNav />
      <main className="flex flex-1 flex-col overflow-hidden" id="main-content">
        {children}
      </main>
    </div>
  );
}

