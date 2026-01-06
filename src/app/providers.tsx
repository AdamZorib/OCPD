'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/lib/auth';

interface ProvidersProps {
    children: ReactNode;
}

/**
 * Client-side providers wrapper
 * Wraps the app with all necessary context providers
 */
export default function Providers({ children }: ProvidersProps) {
    return (
        <AuthProvider>
            {children}
        </AuthProvider>
    );
}
