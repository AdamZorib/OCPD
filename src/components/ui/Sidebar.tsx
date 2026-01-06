'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
    UserCheck,
    LogIn,
} from 'lucide-react';
import styles from './Sidebar.module.css';
import { useAuth, useRole } from '@/lib/auth';

interface NavItem {
    label: string;
    href: string;
    icon: React.ReactNode;
    badge?: string;
    permission?: string;
}

const mainNavItems: NavItem[] = [
    { label: 'Dashboard', href: '/', icon: <LayoutDashboard size={20} /> },
    { label: 'Klienci', href: '/clients', icon: <Users size={20} /> },
    { label: 'Polisy', href: '/policies', icon: <FileText size={20} /> },
    { label: 'Wyceny', href: '/quotes', icon: <Calculator size={20} />, badge: '3' },
    { label: 'Szkody', href: '/claims', icon: <AlertTriangle size={20} /> },
    { label: 'Certyfikaty', href: '/certificates', icon: <Award size={20} /> },
    { label: 'Underwriting', href: '/underwriting', icon: <UserCheck size={20} />, permission: 'underwriting:view' },
    { label: 'Admin', href: '/admin', icon: <Shield size={20} />, permission: 'admin:users' },
];

const bottomNavItems: NavItem[] = [
    { label: 'API Docs', href: '/api-docs', icon: <Code2 size={20} /> },
    { label: 'Ustawienia', href: '/settings', icon: <Settings size={20} /> },
];

export function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const { user, isAuthenticated, logout, hasPermission } = useAuth();
    const role = useRole();

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    const handleLogin = () => {
        router.push('/login');
    };

    // Filter nav items based on permissions
    const filteredMainNavItems = mainNavItems.filter(item => {
        if (!item.permission) return true;
        return hasPermission(item.permission as never);
    });

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
                    {filteredMainNavItems.map((item) => (
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
                {isAuthenticated && user ? (
                    <div className={styles.user}>
                        <div
                            className={styles.userAvatar}
                            style={{ backgroundColor: role?.color }}
                        >
                            {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        {!collapsed && (
                            <div className={styles.userInfo}>
                                <span className={styles.userName}>{user.name}</span>
                                <span className={styles.userRole} style={{ color: role?.color }}>
                                    {role?.namePL}
                                </span>
                            </div>
                        )}
                        <button
                            className={styles.logoutBtn}
                            title="Wyloguj"
                            onClick={handleLogout}
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                ) : (
                    <button
                        className={styles.loginBtn}
                        onClick={handleLogin}
                        title={collapsed ? 'Zaloguj się' : undefined}
                    >
                        <LogIn size={18} />
                        {!collapsed && <span>Zaloguj się</span>}
                    </button>
                )}

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

