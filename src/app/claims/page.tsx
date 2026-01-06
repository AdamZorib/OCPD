'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Search, Filter } from 'lucide-react';
import { Card, Badge, Input, Select, Button } from '@/components/ui';
import styles from './page.module.css';

const statusLabels: Record<string, string> = {
    REPORTED: 'Zgłoszona',
    UNDER_REVIEW: 'W trakcie',
    APPROVED: 'Zatwierdzona',
    REJECTED: 'Odrzucona',
    PAID: 'Wypłacona',
    CLOSED: 'Zamknięta',
};

const statusVariant = (status: string) => {
    switch (status) {
        case 'PAID': case 'APPROVED': return 'success';
        case 'REJECTED': return 'danger';
        case 'UNDER_REVIEW': case 'REPORTED': return 'warning';
        default: return 'default';
    }
};

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pl-PL', {
        style: 'currency',
        currency: 'PLN',
        minimumFractionDigits: 0,
    }).format(value);
};

const formatDate = (date: Date | string | undefined) => {
    if (!date) return '—';
    return new Intl.DateTimeFormat('pl-PL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(new Date(date));
};

export default function ClaimsPage() {
    const [claims, setClaims] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchClaims = async () => {
            try {
                const res = await fetch('/api/claims');
                const data = await res.json();
                setClaims(Array.isArray(data.data) ? data.data : []);
            } catch (err) {
                console.error('Failed to fetch claims:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchClaims();
    }, []);

    const filteredClaims = claims.filter(claim => {
        const searchLower = search.toLowerCase();
        return (
            claim.claimNumber.toLowerCase().includes(searchLower) ||
            (claim.clientName && claim.clientName.toLowerCase().includes(searchLower)) ||
            (claim.description && claim.description.toLowerCase().includes(searchLower))
        );
    });

    if (isLoading) {
        return (
            <div className={styles.page}>
                <header className={styles.header}>
                    <h1 className={styles.title}>Szkody</h1>
                    <p className={styles.subtitle}>Ładowanie danych...</p>
                </header>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Szkody</h1>
                    <p className={styles.subtitle}>Przeglądaj i zarządzaj zgłoszeniami szkód</p>
                </div>
            </header>

            <Card className={styles.filters}>
                <Input
                    placeholder="Szukaj po numerze szkody, kliencie..."
                    leftIcon={<Search size={18} />}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </Card>

            <div className={styles.claimsGrid}>
                {filteredClaims.map((claim) => (
                    <Card key={claim.id} className={styles.claimCard} hoverable>
                        <div className={styles.claimHeader}>
                            <div className={styles.claimIcon}>
                                <AlertTriangle size={24} />
                            </div>
                            <Badge variant={statusVariant(claim.status)}>
                                {statusLabels[claim.status] || claim.status}
                            </Badge>
                        </div>

                        <div className={styles.claimInfo}>
                            <div className={styles.claimMetaHeader}>
                                <span className={styles.claimNumber}>{claim.claimNumber}</span>
                                {claim.clientName && <span className={styles.clientName}>{claim.clientName}</span>}
                            </div>
                            <p className={styles.claimDesc}>{claim.description}</p>
                        </div>

                        <div className={styles.claimMeta}>
                            <div className={styles.metaItem}>
                                <span className={styles.metaLabel}>Kwota roszczenia</span>
                                <span className={styles.metaValue}>{formatCurrency(claim.claimedAmount)}</span>
                            </div>
                            <div className={styles.metaItem}>
                                <span className={styles.metaLabel}>Data zdarzenia</span>
                                <span className={styles.metaValue}>{formatDate(claim.incidentDate)}</span>
                            </div>
                            {claim.paidAmount && (
                                <div className={styles.metaItem}>
                                    <span className={styles.metaLabel}>Wypłacono</span>
                                    <span className={styles.metaValue} style={{ color: 'var(--color-success)' }}>
                                        {formatCurrency(claim.paidAmount)}
                                    </span>
                                </div>
                            )}
                            {claim.reservedAmount && (
                                <div className={styles.metaItem}>
                                    <span className={styles.metaLabel}>Rezerwa</span>
                                    <span className={styles.metaValue}>{formatCurrency(claim.reservedAmount)}</span>
                                </div>
                            )}
                        </div>

                        {claim.location && (
                            <div className={styles.claimLocation}>
                                📍 {claim.location}
                            </div>
                        )}
                    </Card>
                ))}
            </div>

            {filteredClaims.length === 0 && (
                <Card className={styles.emptyState}>
                    <div className={styles.emptyIcon}>
                        <Search size={48} />
                    </div>
                    <h3>Nie znaleziono szkód</h3>
                    <p>Spróbuj zmienić kryteria wyszukiwania.</p>
                </Card>
            )}
        </div>
    );
}
