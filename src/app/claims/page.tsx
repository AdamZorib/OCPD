'use client';

import { AlertTriangle, Search, Filter } from 'lucide-react';
import { Card, Badge, Input, Select } from '@/components/ui';
import { mockClaims } from '@/lib/mock-data';
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

const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pl-PL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(date);
};

export default function ClaimsPage() {
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
                />
            </Card>

            <div className={styles.claimsGrid}>
                {mockClaims.map((claim) => (
                    <Card key={claim.id} className={styles.claimCard} hoverable>
                        <div className={styles.claimHeader}>
                            <div className={styles.claimIcon}>
                                <AlertTriangle size={24} />
                            </div>
                            <Badge variant={statusVariant(claim.status)}>
                                {statusLabels[claim.status]}
                            </Badge>
                        </div>

                        <div className={styles.claimInfo}>
                            <span className={styles.claimNumber}>{claim.claimNumber}</span>
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
        </div>
    );
}
