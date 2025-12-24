import { QueryClientProvider } from '@tanstack/react-query';

import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { KeyboardShortcutHelp } from '@/components/ui/keyboard-shortcut-help';
import { LiveRegionProvider } from '@/components/ui/live-region';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/features/auth/context/AuthContext';
import { queryClient } from '@/lib/queryClient';
import { AppRouter } from '@/router';
import '@/lib/i18n';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <LiveRegionProvider>
            <AppRouter />
            <Toaster />
            <KeyboardShortcutHelp />
          </LiveRegionProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
