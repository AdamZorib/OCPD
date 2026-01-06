'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Calculator, ChevronRight, Loader2 } from 'lucide-react';
import { Card, Button, Badge } from '@/components/ui';
import styles from './page.module.css';

interface Quote {
    id: string;
    clientNIP: string;
    clientName?: string;
    sumInsured: number;
    territorialScope: string;
    status: string;
    selectedClauses?: string[];
    calculationResultJson?: string;
    createdAt: string;
}

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
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchQuotes = async () => {
            try {
                const response = await fetch('/api/quotes');
                const data = await response.json();
                if (response.ok) {
                    setQuotes(data.data || []);
                } else {
                    setError(data.error || 'Failed to fetch quotes');
                }
            } catch (err) {
                setError('Failed to connect to server');
            } finally {
                setLoading(false);
            }
        };

        fetchQuotes();
    }, []);

    if (loading) {
        return (
            <div className={styles.page}>
                <div className={styles.loading}>
                    <Loader2 size={32} className="animate-spin" />
                    <span>Ładowanie wycen...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.page}>
                <div className={styles.error}>
                    <p>Błąd: {error}</p>
                    <Button onClick={() => window.location.reload()}>Spróbuj ponownie</Button>
                </div>
            </div>
        );
    }

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

            {quotes.length === 0 ? (
                <div className={styles.empty}>
                    <Calculator size={48} />
                    <h3>Brak wycen</h3>
                    <p>Utwórz pierwszą wycenę klikając przycisk powyżej</p>
                </div>
            ) : (
                <div className={styles.quotesGrid}>
                    {quotes.map((quote) => {
                        const calcResult = quote.calculationResultJson
                            ? JSON.parse(quote.calculationResultJson)
                            : null;
                        const premium = calcResult?.breakdown?.totalPremium;
                        const clausesCount = quote.selectedClauses?.length || 0;

                        return (
                            <Card key={quote.id} className={styles.quoteCard} hoverable>
                                <div className={styles.quoteHeader}>
                                    <div className={styles.quoteIcon}>
                                        <Calculator size={24} />
                                    </div>
                                    <Badge variant={statusVariant(quote.status)}>
                                        {statusLabels[quote.status] || quote.status}
                                    </Badge>
                                </div>

                                <div className={styles.quoteInfo}>
                                    <span className={styles.quoteNip}>NIP: {quote.clientNIP}</span>
                                    {quote.clientName && (
                                        <span className={styles.quoteName}>{quote.clientName}</span>
                                    )}
                                    <h3 className={styles.quoteAmount}>{formatCurrency(quote.sumInsured)}</h3>
                                    <Badge variant="accent" size="sm">
                                        {scopeLabels[quote.territorialScope] || quote.territorialScope}
                                    </Badge>
                                </div>

                                <div className={styles.quoteMeta}>
                                    <div className={styles.metaItem}>
                                        <span className={styles.metaLabel}>Składka</span>
                                        <span className={styles.metaValue}>
                                            {premium ? formatCurrency(premium) : '—'}
                                        </span>
                                    </div>
                                    <div className={styles.metaItem}>
                                        <span className={styles.metaLabel}>Klauzule</span>
                                        <span className={styles.metaValue}>{clausesCount}</span>
                                    </div>
                                </div>

                                <div className={styles.quoteFooter}>
                                    <span>Zobacz szczegóły</span>
                                    <ChevronRight size={16} />
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
