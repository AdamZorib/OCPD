'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import {
    LayoutDashboard,
    Users,
    FileText,
    Calculator,
    AlertTriangle,
    Award,
    Settings,
    ChevronLeft,
    ChevronRight,
    Shield,
    LogOut,
    Code2,
} from 'lucide-react';
import styles from './Sidebar.module.css';

interface NavItem {
    label: string;
    href: string;
    icon: React.ReactNode;
    badge?: string;
}

const mainNavItems: NavItem[] = [
    { label: 'Dashboard', href: '/', icon: <LayoutDashboard size={20} /> },
    { label: 'Klienci', href: '/clients', icon: <Users size={20} /> },
    { label: 'Polisy', href: '/policies', icon: <FileText size={20} /> },
    { label: 'Wyceny', href: '/quotes', icon: <Calculator size={20} />, badge: '3' },
    { label: 'Szkody', href: '/claims', icon: <AlertTriangle size={20} /> },
    { label: 'Certyfikaty', href: '/certificates', icon: <Award size={20} /> },
];

const bottomNavItems: NavItem[] = [
    { label: 'API Docs', href: '/api-docs', icon: <Code2 size={20} /> },
    { label: 'Ustawienia', href: '/settings', icon: <Settings size={20} /> },
];

export function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const pathname = usePathname();

    return (
        <aside className={clsx(styles.sidebar, collapsed && styles.collapsed)}>
            {/* Logo */}
            <div className={styles.logo}>
                <div className={styles.logoIcon}>
                    <Shield size={28} />
                </div>
                {!collapsed && (
                    <div className={styles.logoText}>
                        <span className={styles.logoTitle}>OCPD</span>
                        <span className={styles.logoSubtitle}>Insurance Platform</span>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className={styles.nav}>
                <ul className={styles.navList}>
                    {mainNavItems.map((item) => (
                        <li key={item.href}>
                            <Link
                                href={item.href}
                                className={clsx(
                                    styles.navItem,
                                    pathname === item.href && styles.active
                                )}
                                title={collapsed ? item.label : undefined}
                            >
                                <span className={styles.navIcon}>{item.icon}</span>
                                {!collapsed && (
                                    <>
                                        <span className={styles.navLabel}>{item.label}</span>
                                        {item.badge && (
                                            <span className={styles.navBadge}>{item.badge}</span>
                                        )}
                                    </>
                                )}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Bottom section */}
            <div className={styles.bottom}>
                <ul className={styles.navList}>
                    {bottomNavItems.map((item) => (
                        <li key={item.href}>
                            <Link
                                href={item.href}
                                className={clsx(
                                    styles.navItem,
                                    pathname === item.href && styles.active
                                )}
                                title={collapsed ? item.label : undefined}
                            >
                                <span className={styles.navIcon}>{item.icon}</span>
                                {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
                            </Link>
                        </li>
                    ))}
                </ul>

                {/* User */}
                <div className={styles.user}>
                    <div className={styles.userAvatar}>JK</div>
                    {!collapsed && (
                        <div className={styles.userInfo}>
                            <span className={styles.userName}>Jan Kowalski</span>
                            <span className={styles.userRole}>Broker</span>
                        </div>
                    )}
                    {!collapsed && (
                        <button className={styles.logoutBtn} title="Wyloguj">
                            <LogOut size={18} />
                        </button>
                    )}
                </div>

                {/* Collapse toggle */}
                <button
                    className={styles.collapseBtn}
                    onClick={() => setCollapsed(!collapsed)}
                    title={collapsed ? 'Rozwiń' : 'Zwiń'}
                >
                    {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
            </div>
        </aside>
    );
}
