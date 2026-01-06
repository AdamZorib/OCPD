'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
    Search,
    Plus,
    Filter,
    FileText,
    Calendar,
    ChevronRight,
    Download,
} from 'lucide-react';
import {
    Card,
    Button,
    Input,
    Badge,
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
    Select,
} from '@/components/ui';
import styles from './page.module.css';

const statusLabels: Record<string, string> = {
    DRAFT: 'Szkic',
    QUOTED: 'Wyceniona',
    ACTIVE: 'Aktywna',
    EXPIRED: 'Wygasła',
    CANCELLED: 'Anulowana',
};

const statusVariant = (status: string) => {
    switch (status) {
        case 'ACTIVE': return 'success';
        case 'EXPIRED': return 'danger';
        case 'CANCELLED': return 'danger';
        case 'QUOTED': return 'info';
        case 'DRAFT': return 'default';
        default: return 'default';
    }
};

const scopeLabels: Record<string, string> = {
    POLAND: 'Polska',
    EUROPE: 'Europa',
    WORLD: 'Świat',
};

const statusOptions = [
    { value: '', label: 'Wszystkie statusy' },
    { value: 'ACTIVE', label: 'Aktywne' },
    { value: 'EXPIRED', label: 'Wygasłe' },
    { value: 'DRAFT', label: 'Szkice' },
    { value: 'QUOTED', label: 'Wycenione' },
    { value: 'CANCELLED', label: 'Anulowane' },
];

const scopeOptions = [
    { value: '', label: 'Wszystkie zakresy' },
    { value: 'POLAND', label: 'Polska' },
    { value: 'EUROPE', label: 'Europa' },
    { value: 'WORLD', label: 'Świat' },
];

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pl-PL', {
        style: 'currency',
        currency: 'PLN',
        minimumFractionDigits: 0,
    }).format(value);
};

const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pl-PL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(date);
};

const daysUntilExpiry = (date: Date) => {
    return Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
};

export default function PoliciesPage() {
    const [policies, setPolicies] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [scopeFilter, setScopeFilter] = useState('');

    useEffect(() => {
        const fetchPolicies = async () => {
            try {
                const res = await fetch('/api/policies');
                const data = await res.json();
                setPolicies(data.data || []);
            } catch (err) {
                console.error('Failed to fetch policies:', err);
                setPolicies([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPolicies();
    }, []);

    const filteredPolicies = useMemo(() => {
        if (!Array.isArray(policies)) return [];
        return policies.filter((policy) => {
            const searchLower = search.toLowerCase();
            const matchesSearch =
                policy.policyNumber.toLowerCase().includes(searchLower) ||
                (policy.clientName && policy.clientName.toLowerCase().includes(searchLower)) ||
                (policy.clientNIP && policy.clientNIP.includes(search));

            const matchesStatus = !statusFilter || policy.status === statusFilter;
            const matchesScope = !scopeFilter || policy.territorialScope === scopeFilter;

            return matchesSearch && matchesStatus && matchesScope;
        });
    }, [policies, search, statusFilter, scopeFilter]);

    const activeCount = useMemo(() => policies.filter(p => p.status === 'ACTIVE').length, [policies]);
    const expiringCount = useMemo(() => policies.filter(p => {
        if (!p.validTo) return false;
        const days = daysUntilExpiry(new Date(p.validTo));
        return p.status === 'ACTIVE' && days <= 30 && days > 0;
    }).length, [policies]);
    const totalPremium = useMemo(() => policies
        .filter(p => p.status === 'ACTIVE')
        .reduce((sum, p) => sum + (p.totalPremium || 0), 0), [policies]);

    if (isLoading) {
        return (
            <div className={styles.page}>
                <header className={styles.header}>
                    <h1 className={styles.title}>Polisy</h1>
                    <p className={styles.subtitle}>Ładowanie danych...</p>
                </header>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            {/* Header */}
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Polisy</h1>
                    <p className={styles.subtitle}>Zarządzaj polisami OCPD</p>
                </div>
                <div className={styles.headerActions}>
                    <Button variant="secondary" leftIcon={<Download size={18} />}>
                        Eksport
                    </Button>
                    <Link href="/quotes/new">
                        <Button leftIcon={<Plus size={18} />}>
                            Nowa polisa
                        </Button>
                    </Link>
                </div>
            </header>

            {/* Stats */}
            <section className={styles.statsRow}>
                <div className={styles.statItem}>
                    <span className={styles.statValue}>{activeCount}</span>
                    <span className={styles.statLabel}>Aktywne</span>
                </div>
                <div className={styles.statDivider} />
                <div className={styles.statItem}>
                    <span className={styles.statValue} data-warning={expiringCount > 0}>{expiringCount}</span>
                    <span className={styles.statLabel}>Wygasające (30 dni)</span>
                </div>
                <div className={styles.statDivider} />
                <div className={styles.statItem}>
                    <span className={styles.statValue}>{formatCurrency(totalPremium)}</span>
                    <span className={styles.statLabel}>Składka łączna</span>
                </div>
            </section>

            {/* Filters */}
            <Card className={styles.filters}>
                <div className={styles.filtersRow}>
                    <div className={styles.searchWrapper}>
                        <Input
                            placeholder="Szukaj po numerze polisy, kliencie..."
                            leftIcon={<Search size={18} />}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className={styles.filterGroup}>
                        <Select
                            options={statusOptions}
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        />
                        <Select
                            options={scopeOptions}
                            value={scopeFilter}
                            onChange={(e) => setScopeFilter(e.target.value)}
                        />
                    </div>
                </div>
            </Card>

            {/* Table */}
            <Card padding="none">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nr polisy</TableHead>
                            <TableHead>Klient</TableHead>
                            <TableHead>Suma ubezp.</TableHead>
                            <TableHead>Zakres</TableHead>
                            <TableHead>Składka</TableHead>
                            <TableHead>Ważność od</TableHead>
                            <TableHead>Ważność do</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredPolicies.map((policy) => {
                            const days = policy.validTo ? daysUntilExpiry(new Date(policy.validTo)) : 0;
                            const isExpiring = policy.status === 'ACTIVE' && days <= 30 && days > 0;

                            return (
                                <TableRow key={policy.id}>
                                    <TableCell>
                                        <Link href={`/policies/${policy.id}`} className={styles.policyLink}>
                                            <FileText size={16} />
                                            {policy.policyNumber}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <div className={styles.clientCell}>
                                            <span className={styles.clientName}>{policy.clientName}</span>
                                            <span className={styles.clientNip}>NIP: {policy.clientNIP}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{formatCurrency(policy.sumInsured)}</TableCell>
                                    <TableCell>
                                        <Badge variant="accent" size="sm">
                                            {scopeLabels[policy.territorialScope]}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className={styles.premiumCell}>
                                        {formatCurrency(policy.totalPremium)}
                                    </TableCell>
                                    <TableCell>{policy.validFrom ? formatDate(new Date(policy.validFrom)) : '-'}</TableCell>
                                    <TableCell>
                                        <span className={isExpiring ? styles.expiringDate : ''}>
                                            {policy.validTo ? formatDate(new Date(policy.validTo)) : '-'}
                                            {isExpiring && <span className={styles.expiringBadge}>{days} dni</span>}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={statusVariant(policy.status)} dot>
                                            {statusLabels[policy.status]}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Link href={`/policies/${policy.id}`} className={styles.viewLink}>
                                            <ChevronRight size={18} />
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>

                {filteredPolicies.length === 0 && (
                    <div className={styles.emptyState}>
                        <Search size={48} />
                        <h3>Nie znaleziono polis</h3>
                        <p>Spróbuj zmienić kryteria wyszukiwania</p>
                    </div>
                )}
            </Card>
        </div>
    );
}
