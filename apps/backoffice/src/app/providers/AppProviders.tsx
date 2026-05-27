import { ReactNode } from 'react';
import { QueryProvider } from './QueryProvider';
import { MuiThemeProvider } from './MuiThemeProvider.tsx';

type Props = {
  children: ReactNode;
};

export function AppProviders({ children }: Props) {
  return (
    <QueryProvider>
      <MuiThemeProvider>
        {children}
      </MuiThemeProvider>
    </QueryProvider>
  );
}