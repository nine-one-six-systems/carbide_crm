import { ReactNode } from 'react';

import { useScrollToTop } from '@/hooks/useScrollToTop';

import { Header } from './Header';
import { DesktopSidebar } from './Sidebar';
import { SkipLinks } from './SkipLinks';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  useScrollToTop();

  return (
    <div className="flex min-h-screen flex-col safe-top safe-bottom">
      <SkipLinks />
      <div className="flex flex-1 overflow-hidden">
        <DesktopSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex flex-1 flex-col overflow-hidden" id="main-content">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

