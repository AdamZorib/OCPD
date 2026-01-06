'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    AlertCircle,
    Check,
    X,
    ChevronRight,
    FileText,
    User,
    Calendar,
    DollarSign,
    Shield,
    Clock,
} from 'lucide-react';
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    Button,
    Badge,
    Input,
} from '@/components/ui';
import styles from './page.module.css';

// Mock referral data
interface Referral {
    id: string;
    quoteId: string;
    clientName: string;
    clientNIP: string;
    sumInsured: number;
    territorialScope: 'POLAND' | 'EUROPE' | 'WORLD';
    calculatedPremium: number;
    referralReasons: string[];
    riskLevel: 'HIGH' | 'VERY_HIGH';
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CONDITIONALLY_APPROVED';
    submittedAt: Date;
    submittedBy: string;
    uwNote?: string;
    decidedAt?: Date;
    decidedBy?: string;
}

const mockReferrals: Referral[] = [
    {
        id: 'ref-001',
        quoteId: 'quote-123',
        clientName: 'Trans-Pol Sp. z o.o.',
        clientNIP: '1234567890',
        sumInsured: 2500000,
        territorialScope: 'EUROPE',
        calculatedPremium: 18500,
        referralReasons: [
            'Suma ubezpieczenia przekracza 2 mln PLN',
            'Transport towarów niebezpiecznych (ADR)',
        ],
        riskLevel: 'HIGH',
        status: 'PENDING',
        submittedAt: new Date('2026-01-05T10:30:00'),
        submittedBy: 'jan.kowalski@broker.pl',
    },
    {
        id: 'ref-002',
        quoteId: 'quote-456',
        clientName: 'Euro-Logistics S.A.',
        clientNIP: '9876543210',
        sumInsured: 1000000,
        territorialScope: 'WORLD',
        calculatedPremium: 28000,
        referralReasons: [
            'Bardzo wysokie ryzyko - wymagana ocena underwritera',
            'Wysoki udział podwykonawców (>50%)',
            'Towary wysokowartościowe wymagają akceptacji UW',
        ],
        riskLevel: 'VERY_HIGH',
        status: 'PENDING',
        submittedAt: new Date('2026-01-04T14:15:00'),
        submittedBy: 'anna.nowak@broker.pl',
    },
    {
        id: 'ref-003',
        quoteId: 'quote-789',
        clientName: 'Speed Transport',
        clientNIP: '5551234567',
        sumInsured: 500000,
        territorialScope: 'EUROPE',
        calculatedPremium: 8200,
        referralReasons: [
            'Kraje podwyższonego ryzyka wymagają akceptacji UW',
        ],
        riskLevel: 'HIGH',
        status: 'CONDITIONALLY_APPROVED',
        submittedAt: new Date('2026-01-03T09:00:00'),
        submittedBy: 'piotr.marek@broker.pl',
        decidedAt: new Date('2026-01-03T16:30:00'),
        decidedBy: 'uw.senior@insurer.pl',
        uwNote: 'Zaakceptowano z wyłączeniem Turcji i Bałkanów. Wymagana klauzula postojowa.',
    },
];

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pl-PL', {
        style: 'currency',
        currency: 'PLN',
        minimumFractionDigits: 0,
    }).format(value);

const formatDate = (date: Date) =>
    new Intl.DateTimeFormat('pl-PL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);

const scopeLabels = {
    POLAND: 'Polska',
    EUROPE: 'Europa',
    WORLD: 'Świat',
};

const statusConfig = {
    PENDING: { label: 'Oczekuje', variant: 'warning' as const },
    APPROVED: { label: 'Zatwierdzona', variant: 'success' as const },
    REJECTED: { label: 'Odrzucona', variant: 'danger' as const },
    CONDITIONALLY_APPROVED: { label: 'Warunkowo', variant: 'info' as const },
};

export default function UnderwritingPage() {
    const [referrals, setReferrals] = useState<Referral[]>(mockReferrals);
    const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);
    const [uwNote, setUwNote] = useState('');
    const [adjustedPremium, setAdjustedPremium] = useState<number | null>(null);

    const pendingReferrals = referrals.filter(r => r.status === 'PENDING');
    const decidedReferrals = referrals.filter(r => r.status !== 'PENDING');

    const handleApprove = (referralId: string, conditions?: string) => {
        setReferrals(prev => prev.map(r =>
            r.id === referralId
                ? {
                    ...r,
                    status: conditions ? 'CONDITIONALLY_APPROVED' : 'APPROVED',
                    uwNote: conditions || uwNote,
                    decidedAt: new Date(),
                    decidedBy: 'uw.current@insurer.pl',
                }
                : r
        ));
        setSelectedReferral(null);
        setUwNote('');
    };

    const handleReject = (referralId: string, reason: string) => {
        setReferrals(prev => prev.map(r =>
            r.id === referralId
                ? {
                    ...r,
                    status: 'REJECTED',
                    uwNote: reason,
                    decidedAt: new Date(),
                    decidedBy: 'uw.current@insurer.pl',
                }
                : r
        ));
        setSelectedReferral(null);
        setUwNote('');
    };

    return (
        <div className={styles.page}>
            {/* Header */}
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Underwriting</h1>
                    <p className={styles.subtitle}>Panel akceptacji referralów</p>
                </div>
                <div className={styles.stats}>
                    <div className={styles.statItem}>
                        <Clock size={18} />
                        <span>{pendingReferrals.length} oczekujących</span>
                    </div>
                </div>
            </header>

            <div className={styles.content}>
                {/* Pending Referrals */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <AlertCircle size={20} />
                        Oczekujące na decyzję ({pendingReferrals.length})
                    </h2>

                    {pendingReferrals.length === 0 ? (
                        <Card padding="lg">
                            <div className={styles.emptyState}>
                                <Check size={48} />
                                <h3>Brak oczekujących referralów</h3>
                                <p>Wszystkie wyceny zostały obsłużone.</p>
                            </div>
                        </Card>
                    ) : (
                        <div className={styles.referralGrid}>
                            {pendingReferrals.map(referral => (
                                <Card key={referral.id} padding="lg" className={styles.referralCard}>
                                    <div className={styles.referralHeader}>
                                        <div className={styles.referralClient}>
                                            <h3>{referral.clientName}</h3>
                                            <span>NIP: {referral.clientNIP}</span>
                                        </div>
                                        <Badge
                                            variant={referral.riskLevel === 'VERY_HIGH' ? 'danger' : 'warning'}
                                            size="md"
                                        >
                                            {referral.riskLevel === 'VERY_HIGH' ? 'Bardzo wysokie ryzyko' : 'Wysokie ryzyko'}
                                        </Badge>
                                    </div>

                                    <div className={styles.referralDetails}>
                                        <div className={styles.detailItem}>
                                            <DollarSign size={16} />
                                            <span>Suma: {formatCurrency(referral.sumInsured)}</span>
                                        </div>
                                        <div className={styles.detailItem}>
                                            <Shield size={16} />
                                            <span>Zakres: {scopeLabels[referral.territorialScope]}</span>
                                        </div>
                                        <div className={styles.detailItem}>
                                            <FileText size={16} />
                                            <span>Składka: {formatCurrency(referral.calculatedPremium)}</span>
                                        </div>
                                        <div className={styles.detailItem}>
                                            <Calendar size={16} />
                                            <span>{formatDate(referral.submittedAt)}</span>
                                        </div>
                                    </div>

                                    <div className={styles.referralReasons}>
                                        <strong>Powody skierowania:</strong>
                                        <ul>
                                            {referral.referralReasons.map((reason, i) => (
                                                <li key={i}>{reason}</li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className={styles.referralSubmitter}>
                                        <User size={14} />
                                        <span>Zgłoszone przez: {referral.submittedBy}</span>
                                    </div>

                                    <div className={styles.referralActions}>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => setSelectedReferral(referral)}
                                        >
                                            Szczegóły
                                        </Button>
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            leftIcon={<Check size={16} />}
                                            onClick={() => handleApprove(referral.id)}
                                        >
                                            Zatwierdź
                                        </Button>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            leftIcon={<X size={16} />}
                                            onClick={() => handleReject(referral.id, 'Ryzyko poza aperytem ubezpieczyciela')}
                                        >
                                            Odrzuć
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </section>

                {/* Decided Referrals */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <FileText size={20} />
                        Historia decyzji ({decidedReferrals.length})
                    </h2>

                    <Card padding="none">
                        <div className={styles.historyList}>
                            {decidedReferrals.map(referral => (
                                <div key={referral.id} className={styles.historyItem}>
                                    <div className={styles.historyMain}>
                                        <span className={styles.historyClient}>{referral.clientName}</span>
                                        <span className={styles.historyMeta}>
                                            {formatCurrency(referral.sumInsured)} • {scopeLabels[referral.territorialScope]}
                                        </span>
                                    </div>
                                    <div className={styles.historyDecision}>
                                        <Badge variant={statusConfig[referral.status].variant}>
                                            {statusConfig[referral.status].label}
                                        </Badge>
                                        {referral.uwNote && (
                                            <span className={styles.historyNote}>{referral.uwNote}</span>
                                        )}
                                    </div>
                                    <div className={styles.historyDate}>
                                        {referral.decidedAt && formatDate(referral.decidedAt)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </section>
            </div>

            {/* Detail Modal */}
            {selectedReferral && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h2>Szczegóły referrala</h2>
                            <button onClick={() => setSelectedReferral(null)}>
                                <X size={24} />
                            </button>
                        </div>

                        <div className={styles.modalContent}>
                            <div className={styles.modalSection}>
                                <h3>Klient</h3>
                                <p><strong>{selectedReferral.clientName}</strong></p>
                                <p>NIP: {selectedReferral.clientNIP}</p>
                            </div>

                            <div className={styles.modalSection}>
                                <h3>Parametry wyceny</h3>
                                <div className={styles.modalGrid}>
                                    <div>
                                        <span>Suma ubezpieczenia</span>
                                        <strong>{formatCurrency(selectedReferral.sumInsured)}</strong>
                                    </div>
                                    <div>
                                        <span>Zakres terytorialny</span>
                                        <strong>{scopeLabels[selectedReferral.territorialScope]}</strong>
                                    </div>
                                    <div>
                                        <span>Kalkulowana składka</span>
                                        <strong>{formatCurrency(selectedReferral.calculatedPremium)}</strong>
                                    </div>
                                    <div>
                                        <span>Poziom ryzyka</span>
                                        <Badge variant={selectedReferral.riskLevel === 'VERY_HIGH' ? 'danger' : 'warning'}>
                                            {selectedReferral.riskLevel}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.modalSection}>
                                <h3>Powody skierowania</h3>
                                <ul className={styles.reasonsList}>
                                    {selectedReferral.referralReasons.map((reason, i) => (
                                        <li key={i}><AlertCircle size={14} /> {reason}</li>
                                    ))}
                                </ul>
                            </div>

                            <div className={styles.modalSection}>
                                <h3>Decyzja underwritera</h3>
                                <Input
                                    label="Korekta składki (opcjonalnie)"
                                    type="number"
                                    placeholder={selectedReferral.calculatedPremium.toString()}
                                    value={adjustedPremium || ''}
                                    onChange={(e) => setAdjustedPremium(e.target.value ? parseInt(e.target.value) : null)}
                                />
                                <div className={styles.noteField}>
                                    <label>Notatka / warunki akceptacji</label>
                                    <textarea
                                        value={uwNote}
                                        onChange={(e) => setUwNote(e.target.value)}
                                        placeholder="Opcjonalne warunki lub uzasadnienie decyzji..."
                                        rows={3}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className={styles.modalFooter}>
                            <Button variant="secondary" onClick={() => setSelectedReferral(null)}>
                                Anuluj
                            </Button>
                            <Button
                                variant="danger"
                                leftIcon={<X size={16} />}
                                onClick={() => handleReject(selectedReferral.id, uwNote || 'Odrzucono przez underwritera')}
                            >
                                Odrzuć
                            </Button>
                            <Button
                                variant="primary"
                                leftIcon={<Check size={16} />}
                                onClick={() => handleApprove(selectedReferral.id, uwNote || undefined)}
                            >
                                {uwNote ? 'Zatwierdź warunkowo' : 'Zatwierdź'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
