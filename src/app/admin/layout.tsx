'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Users, Key, FileText, Settings } from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import styles from './layout.module.css';

interface AdminLayoutProps {
    children: ReactNode;
}

const adminTabs = [
    { label: 'Użytkownicy', href: '/admin/users', icon: Users },
    { label: 'Role i uprawnienia', href: '/admin/roles', icon: Key },
    { label: 'Dziennik audytu', href: '/admin/audit', icon: FileText },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
    const pathname = usePathname();

    return (
        <ProtectedRoute roles={['ADMIN']}>
            <div className={styles.adminLayout}>
                {/* Header */}
                <header className={styles.header}>
                    <div className={styles.headerTitle}>
                        <Shield size={28} />
                        <div>
                            <h1>Panel Administratora</h1>
                            <p>Zarządzanie systemem OCPD Insurance Platform</p>
                        </div>
                    </div>
                </header>

                {/* Tabs */}
                <nav className={styles.tabs}>
                    {adminTabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/');
                        return (
                            <Link
                                key={tab.href}
                                href={tab.href}
                                className={`${styles.tab} ${isActive ? styles.active : ''}`}
                            >
                                <Icon size={18} />
                                <span>{tab.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Content */}
                <main className={styles.content}>
                    {children}
                </main>
            </div>
        </ProtectedRoute>
    );
}
