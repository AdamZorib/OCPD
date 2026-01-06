'use client';

import { useState } from 'react';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Check,
    X,
    UserPlus,
    MoreVertical,
} from 'lucide-react';
import { Card, CardContent, Button, Input, Badge } from '@/components/ui';
import { MOCK_USERS, User, RoleType, getRole } from '@/lib/auth';
import styles from './page.module.css';

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>(MOCK_USERS);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRole, setSelectedRole] = useState<RoleType | 'ALL'>('ALL');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    // Filter users
    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = selectedRole === 'ALL' || user.role === selectedRole;
        return matchesSearch && matchesRole;
    });

    const toggleUserStatus = (userId: string) => {
        setUsers(prev => prev.map(u =>
            u.id === userId ? { ...u, isActive: !u.isActive } : u
        ));
    };

    const formatDate = (date: Date | undefined) => {
        if (!date) return '—';
        return new Intl.DateTimeFormat('pl-PL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    const roles: (RoleType | 'ALL')[] = ['ALL', 'BROKER', 'UNDERWRITER', 'SUPERVISOR', 'ADMIN', 'CLIENT'];

    return (
        <div className={styles.page}>
            {/* Toolbar */}
            <div className={styles.toolbar}>
                <div className={styles.search}>
                    <Search size={18} />
                    <Input
                        placeholder="Szukaj użytkownika..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className={styles.filters}>
                    <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value as RoleType | 'ALL')}
                        className={styles.roleFilter}
                    >
                        <option value="ALL">Wszystkie role</option>
                        <option value="BROKER">Broker</option>
                        <option value="UNDERWRITER">Underwriter</option>
                        <option value="SUPERVISOR">Supervisor</option>
                        <option value="ADMIN">Administrator</option>
                        <option value="CLIENT">Klient</option>
                    </select>
                </div>

                <Button leftIcon={<UserPlus size={18} />} onClick={() => setShowAddModal(true)}>
                    Dodaj użytkownika
                </Button>
            </div>

            {/* Stats */}
            <div className={styles.stats}>
                <div className={styles.stat}>
                    <span className={styles.statValue}>{users.length}</span>
                    <span className={styles.statLabel}>Wszystkich</span>
                </div>
                <div className={styles.stat}>
                    <span className={styles.statValue}>{users.filter(u => u.isActive).length}</span>
                    <span className={styles.statLabel}>Aktywnych</span>
                </div>
                <div className={styles.stat}>
                    <span className={styles.statValue}>{users.filter(u => u.role === 'BROKER').length}</span>
                    <span className={styles.statLabel}>Brokerów</span>
                </div>
                <div className={styles.stat}>
                    <span className={styles.statValue}>{users.filter(u => u.role === 'UNDERWRITER').length}</span>
                    <span className={styles.statLabel}>Underwriterów</span>
                </div>
            </div>

            {/* Users Table */}
            <Card>
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Użytkownik</th>
                                <th>Rola</th>
                                <th>Status</th>
                                <th>Ostatnie logowanie</th>
                                <th>Utworzony</th>
                                <th>Akcje</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => {
                                const role = getRole(user.role);
                                return (
                                    <tr key={user.id}>
                                        <td>
                                            <div className={styles.userCell}>
                                                <div
                                                    className={styles.avatar}
                                                    style={{ backgroundColor: role.color }}
                                                >
                                                    {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                </div>
                                                <div className={styles.userInfo}>
                                                    <span className={styles.userName}>{user.name}</span>
                                                    <span className={styles.userEmail}>{user.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <Badge
                                                variant="default"
                                                style={{
                                                    backgroundColor: `${role.color}20`,
                                                    color: role.color,
                                                    borderColor: role.color,
                                                }}
                                            >
                                                {role.namePL}
                                            </Badge>
                                        </td>
                                        <td>
                                            <Badge variant={user.isActive ? 'success' : 'danger'}>
                                                {user.isActive ? 'Aktywny' : 'Nieaktywny'}
                                            </Badge>
                                        </td>
                                        <td className={styles.dateCell}>
                                            {formatDate(user.lastLoginAt)}
                                        </td>
                                        <td className={styles.dateCell}>
                                            {formatDate(user.createdAt)}
                                        </td>
                                        <td>
                                            <div className={styles.actions}>
                                                <button
                                                    className={styles.actionBtn}
                                                    title="Edytuj"
                                                    onClick={() => setEditingUser(user)}
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    className={`${styles.actionBtn} ${user.isActive ? styles.danger : styles.success}`}
                                                    title={user.isActive ? 'Dezaktywuj' : 'Aktywuj'}
                                                    onClick={() => toggleUserStatus(user.id)}
                                                >
                                                    {user.isActive ? <X size={16} /> : <Check size={16} />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>

            {filteredUsers.length === 0 && (
                <div className={styles.emptyState}>
                    <p>Nie znaleziono użytkowników spełniających kryteria.</p>
                </div>
            )}
        </div>
    );
}
