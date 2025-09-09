'use client';

import { ReactNode } from 'react';
import { useRefreshToken } from '@/hooks/useRefreshToken';

export default function ClientWrapper({ children }: { children: ReactNode }) {
  useRefreshToken();
  return <>{children}</>;
}
