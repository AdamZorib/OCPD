'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Shield,
    Mail,
    Lock,
    Eye,
    EyeOff,
    AlertCircle,
    UserCircle2,
    Briefcase,
    Users,
    Settings,
} from 'lucide-react';
import { Card, CardContent, Button, Input } from '@/components/ui';
import { useAuth, RoleType, getAllRoles, MOCK_USERS } from '@/lib/auth';
import styles from './page.module.css';

export default function LoginPage() {
    const router = useRouter();
    const { login, loginAsRole, isAuthenticated } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showDemoAccounts, setShowDemoAccounts] = useState(false);

    // Redirect if already logged in
    useEffect(() => {
        if (isAuthenticated) {
            router.push('/');
        }
    }, [isAuthenticated, router]);

    // Don't render login form if authenticated
    if (isAuthenticated) {
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const result = await login(email, password);

        if (result.success) {
            router.push('/');
        } else {
            setError(result.error || 'Wystąpił błąd logowania');
        }

        setIsLoading(false);
    };

    const handleQuickLogin = (role: RoleType) => {
        loginAsRole(role);
        router.push('/');
    };

    const roles = getAllRoles();

    const roleIcons: Record<RoleType, typeof Briefcase> = {
        BROKER: Briefcase,
        UNDERWRITER: Shield,
        SUPERVISOR: Users,
        ADMIN: Settings,
        CLIENT: UserCircle2,
    };

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                {/* Logo / Header */}
                <div className={styles.header}>
                    <div className={styles.logo}>
                        <Shield size={40} />
                    </div>
                    <h1>OCPD Insurance Platform</h1>
                    <p>Zaloguj się do systemu</p>
                </div>

                {/* Login Form */}
                <Card padding="lg" className={styles.card}>
                    <CardContent>
                        <form onSubmit={handleSubmit} className={styles.form}>
                            {error && (
                                <div className={styles.error}>
                                    <AlertCircle size={18} />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className={styles.field}>
                                <label htmlFor="email">Email</label>
                                <div className={styles.inputWrapper}>
                                    <Mail size={18} className={styles.inputIcon} />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="jan.kowalski@ocpd.pl"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className={styles.field}>
                                <label htmlFor="password">Hasło</label>
                                <div className={styles.inputWrapper}>
                                    <Lock size={18} className={styles.inputIcon} />
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className={styles.passwordToggle}
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className={styles.submitButton}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Logowanie...' : 'Zaloguj się'}
                            </Button>
                        </form>

                        <div className={styles.divider}>
                            <span>lub</span>
                        </div>

                        {/* Quick Login by Role */}
                        <div className={styles.quickLogin}>
                            <h3>Szybkie logowanie (demo)</h3>
                            <div className={styles.roleGrid}>
                                {roles.filter(r => r.type !== 'CLIENT').map((role) => {
                                    const Icon = roleIcons[role.type];
                                    return (
                                        <button
                                            key={role.type}
                                            className={styles.roleButton}
                                            onClick={() => handleQuickLogin(role.type)}
                                            style={{ borderColor: role.color }}
                                        >
                                            <Icon size={24} style={{ color: role.color }} />
                                            <span className={styles.roleName}>{role.namePL}</span>
                                            <span className={styles.roleDesc}>{role.descriptionPL}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Demo Accounts */}
                        <button
                            type="button"
                            className={styles.demoToggle}
                            onClick={() => setShowDemoAccounts(!showDemoAccounts)}
                        >
                            {showDemoAccounts ? 'Ukryj konta demo' : 'Pokaż konta demo'}
                        </button>

                        {showDemoAccounts && (
                            <div className={styles.demoAccounts}>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Email</th>
                                            <th>Hasło</th>
                                            <th>Rola</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {MOCK_USERS.slice(0, 4).map((user) => (
                                            <tr key={user.id}>
                                                <td>{user.email}</td>
                                                <td>
                                                    {user.role === 'BROKER' && 'broker123'}
                                                    {user.role === 'UNDERWRITER' && 'uw123'}
                                                    {user.role === 'SUPERVISOR' && 'super123'}
                                                    {user.role === 'ADMIN' && 'admin123'}
                                                </td>
                                                <td>{user.role}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <p className={styles.footer}>
                    © 2024 OCPD Insurance Platform • <Link href="/privacy">Polityka prywatności</Link>
                </p>
            </div>
        </div>
    );
}
