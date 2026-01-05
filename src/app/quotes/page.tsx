'use client';

import Link from 'next/link';
import { Plus, Calculator, FileText, ChevronRight } from 'lucide-react';
import { Card, Button, Badge } from '@/components/ui';
import { mockQuotes } from '@/lib/mock-data';
import styles from './page.module.css';

const statusLabels: Record<string, string> = {
    DRAFT: 'Szkic',
    CALCULATED: 'Obliczona',
    SENT: 'Wysłana',
    ACCEPTED: 'Zaakceptowana',
    REJECTED: 'Odrzucona',
    EXPIRED: 'Wygasła',
};

const statusVariant = (status: string) => {
    switch (status) {
        case 'ACCEPTED': return 'success';
        case 'REJECTED': case 'EXPIRED': return 'danger';
        case 'SENT': return 'info';
        case 'CALCULATED': return 'warning';
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

const scopeLabels: Record<string, string> = {
    POLAND: 'Polska',
    EUROPE: 'Europa',
    WORLD: 'Świat',
};

export default function QuotesPage() {
    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Wyceny</h1>
                    <p className={styles.subtitle}>Przeglądaj i zarządzaj wycenami polis OCPD</p>
                </div>
                <Link href="/quotes/new">
                    <Button leftIcon={<Plus size={18} />}>
                        Nowa wycena
                    </Button>
                </Link>
            </header>

            <div className={styles.quotesGrid}>
                {mockQuotes.map((quote) => (
                    <Card key={quote.id} className={styles.quoteCard} hoverable>
                        <div className={styles.quoteHeader}>
                            <div className={styles.quoteIcon}>
                                <Calculator size={24} />
                            </div>
                            <Badge variant={statusVariant(quote.status)}>
                                {statusLabels[quote.status]}
                            </Badge>
                        </div>

                        <div className={styles.quoteInfo}>
                            <span className={styles.quoteNip}>NIP: {quote.clientNIP}</span>
                            <h3 className={styles.quoteAmount}>{formatCurrency(quote.requestedSumInsured)}</h3>
                            <Badge variant="accent" size="sm">{scopeLabels[quote.requestedScope]}</Badge>
                        </div>

                        <div className={styles.quoteMeta}>
                            <div className={styles.metaItem}>
                                <span className={styles.metaLabel}>Składka</span>
                                <span className={styles.metaValue}>
                                    {quote.calculatedPremium ? formatCurrency(quote.calculatedPremium) : '—'}
                                </span>
                            </div>
                            <div className={styles.metaItem}>
                                <span className={styles.metaLabel}>Klauzule</span>
                                <span className={styles.metaValue}>{quote.requestedClauses.length}</span>
                            </div>
                        </div>

                        <div className={styles.quoteFooter}>
                            <span>Zobacz szczegóły</span>
                            <ChevronRight size={16} />
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
