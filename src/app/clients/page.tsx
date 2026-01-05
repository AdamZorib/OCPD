'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
    Search,
    Plus,
    Filter,
    ChevronRight,
    Building2,
    MapPin,
    Phone,
    Mail,
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
import { mockClients } from '@/lib/mock-data';
import styles from './page.module.css';

const riskLevelLabels: Record<string, string> = {
    LOW: 'Niskie',
    MEDIUM: 'Średnie',
    HIGH: 'Wysokie',
    VERY_HIGH: 'Bardzo wysokie',
};

const riskLevelVariant = (level: string) => {
    switch (level) {
        case 'LOW': return 'success';
        case 'MEDIUM': return 'warning';
        case 'HIGH': return 'danger';
        case 'VERY_HIGH': return 'danger';
        default: return 'default';
    }
};

const scopeOptions = [
    { value: '', label: 'Wszystkie zakresy' },
    { value: 'POLAND', label: 'Polska' },
    { value: 'EUROPE', label: 'Europa' },
    { value: 'WORLD', label: 'Świat' },
];

const riskOptions = [
    { value: '', label: 'Wszystkie ryzyka' },
    { value: 'LOW', label: 'Niskie' },
    { value: 'MEDIUM', label: 'Średnie' },
    { value: 'HIGH', label: 'Wysokie' },
    { value: 'VERY_HIGH', label: 'Bardzo wysokie' },
];

export default function ClientsPage() {
    const [search, setSearch] = useState('');
    const [scopeFilter, setScopeFilter] = useState('');
    const [riskFilter, setRiskFilter] = useState('');

    const filteredClients = useMemo(() => {
        return mockClients.filter((client) => {
            // Search filter
            const searchLower = search.toLowerCase();
            const matchesSearch =
                client.name.toLowerCase().includes(searchLower) ||
                client.nip.includes(search) ||
                client.email.toLowerCase().includes(searchLower);

            // Scope filter
            const matchesScope = !scopeFilter ||
                client.riskProfile.mainRoutes.includes(scopeFilter as 'POLAND' | 'EUROPE' | 'WORLD');

            // Risk filter
            const matchesRisk = !riskFilter || client.riskProfile.riskLevel === riskFilter;

            return matchesSearch && matchesScope && matchesRisk;
        });
    }, [search, scopeFilter, riskFilter]);

    return (
        <div className={styles.page}>
            {/* Header */}
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Klienci</h1>
                    <p className={styles.subtitle}>Zarządzaj przewoźnikami i ich profilem ryzyka</p>
                </div>
                <div className={styles.headerActions}>
                    <Link href="/clients/new">
                        <Button leftIcon={<Plus size={18} />}>
                            Dodaj klienta
                        </Button>
                    </Link>
                </div>
            </header>

            {/* Filters */}
            <Card className={styles.filters}>
                <div className={styles.filtersRow}>
                    <div className={styles.searchWrapper}>
                        <Input
                            placeholder="Szukaj po nazwie, NIP lub email..."
                            leftIcon={<Search size={18} />}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className={styles.filterGroup}>
                        <Select
                            options={scopeOptions}
                            value={scopeFilter}
                            onChange={(e) => setScopeFilter(e.target.value)}
                        />
                        <Select
                            options={riskOptions}
                            value={riskFilter}
                            onChange={(e) => setRiskFilter(e.target.value)}
                        />
                    </div>
                </div>
                <div className={styles.filtersInfo}>
                    <span>Znaleziono {filteredClients.length} klientów</span>
                    {(search || scopeFilter || riskFilter) && (
                        <button
                            className={styles.clearFilters}
                            onClick={() => {
                                setSearch('');
                                setScopeFilter('');
                                setRiskFilter('');
                            }}
                        >
                            Wyczyść filtry
                        </button>
                    )}
                </div>
            </Card>

            {/* Clients Grid */}
            <div className={styles.clientsGrid}>
                {filteredClients.map((client) => (
                    <Link key={client.id} href={`/clients/${client.id}`} className={styles.clientCardLink}>
                        <Card className={styles.clientCard} hoverable>
                            <div className={styles.clientHeader}>
                                <div className={styles.clientAvatar}>
                                    <Building2 size={24} />
                                </div>
                                <Badge variant={riskLevelVariant(client.riskProfile.riskLevel)} size="sm">
                                    {riskLevelLabels[client.riskProfile.riskLevel]}
                                </Badge>
                            </div>

                            <div className={styles.clientInfo}>
                                <h3 className={styles.clientName}>{client.name}</h3>
                                <span className={styles.clientNip}>NIP: {client.nip}</span>
                            </div>

                            <div className={styles.clientDetails}>
                                {client.regonData?.address && (
                                    <div className={styles.clientDetail}>
                                        <MapPin size={14} />
                                        <span>{client.regonData.address.city}</span>
                                    </div>
                                )}
                                <div className={styles.clientDetail}>
                                    <Phone size={14} />
                                    <span>{client.phone}</span>
                                </div>
                                <div className={styles.clientDetail}>
                                    <Mail size={14} />
                                    <span>{client.email}</span>
                                </div>
                            </div>

                            <div className={styles.clientMeta}>
                                <div className={styles.metaItem}>
                                    <span className={styles.metaLabel}>Lata w branży</span>
                                    <span className={styles.metaValue}>{client.riskProfile.yearsInBusiness}</span>
                                </div>
                                <div className={styles.metaItem}>
                                    <span className={styles.metaLabel}>Zakres</span>
                                    <span className={styles.metaValue}>
                                        {client.riskProfile.mainRoutes.join(', ')}
                                    </span>
                                </div>
                                <div className={styles.metaItem}>
                                    <span className={styles.metaLabel}>Bonus/Malus</span>
                                    <span className={styles.metaValue} data-positive={client.riskProfile.bonusMalus <= 0}>
                                        {client.riskProfile.bonusMalus > 0 ? '+' : ''}{client.riskProfile.bonusMalus}%
                                    </span>
                                </div>
                            </div>

                            <div className={styles.clientFooter}>
                                <span>Zobacz szczegóły</span>
                                <ChevronRight size={16} />
                            </div>
                        </Card>
                    </Link>
                ))}
            </div>

            {filteredClients.length === 0 && (
                <Card className={styles.emptyState}>
                    <div className={styles.emptyIcon}>
                        <Search size={48} />
                    </div>
                    <h3>Nie znaleziono klientów</h3>
                    <p>Spróbuj zmienić kryteria wyszukiwania lub dodaj nowego klienta.</p>
                    <Link href="/clients/new">
                        <Button leftIcon={<Plus size={18} />}>
                            Dodaj klienta
                        </Button>
                    </Link>
                </Card>
            )}
        </div>
    );
}
