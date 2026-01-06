'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, LogOut, ChevronDown, Settings, Shield } from 'lucide-react';
import { useAuth, useRole } from '@/lib/auth';
import styles from './UserMenu.module.css';

/**
 * User menu component for header/navigation
 * Shows current user info with dropdown for profile/logout
 */
export default function UserMenu() {
    const router = useRouter();
    const { user, isAuthenticated, logout } = useAuth();
    const role = useRole();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!isAuthenticated || !user) {
        return (
            <button
                className={styles.loginButton}
                onClick={() => router.push('/login')}
            >
                <User size={18} />
                <span>Zaloguj się</span>
            </button>
        );
    }

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    return (
        <div className={styles.userMenu} ref={menuRef}>
            <button
                className={styles.trigger}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className={styles.avatar} style={{ backgroundColor: role?.color }}>
                    {user.name.charAt(0).toUpperCase()}
                </div>
                <div className={styles.userInfo}>
                    <span className={styles.userName}>{user.name}</span>
                    <span className={styles.userRole} style={{ color: role?.color }}>
                        {role?.namePL}
                    </span>
                </div>
                <ChevronDown size={16} className={`${styles.chevron} ${isOpen ? styles.open : ''}`} />
            </button>

            {isOpen && (
                <div className={styles.dropdown}>
                    <div className={styles.dropdownHeader}>
                        <span className={styles.dropdownEmail}>{user.email}</span>
                    </div>

                    <div className={styles.dropdownDivider} />

                    <button
                        className={styles.dropdownItem}
                        onClick={() => {
                            setIsOpen(false);
                            router.push('/settings');
                        }}
                    >
                        <Settings size={16} />
                        <span>Ustawienia</span>
                    </button>

                    {user.role === 'ADMIN' && (
                        <button
                            className={styles.dropdownItem}
                            onClick={() => {
                                setIsOpen(false);
                                router.push('/admin/roles');
                            }}
                        >
                            <Shield size={16} />
                            <span>Zarządzanie rolami</span>
                        </button>
                    )}

                    <div className={styles.dropdownDivider} />

                    <button
                        className={`${styles.dropdownItem} ${styles.logout}`}
                        onClick={handleLogout}
                    >
                        <LogOut size={16} />
                        <span>Wyloguj się</span>
                    </button>
                </div>
            )}
        </div>
    );
}
