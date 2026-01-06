'use client';

import { useState, useEffect, useMemo, use } from 'react';
import Link from 'next/link';
import {
    ArrowLeft,
    FileText,
    Printer,
    Shield,
    Calendar,
    MapPin,
    Building2,
    CheckCircle,
    Clock,
    PenTool,
    CheckCircle2,
} from 'lucide-react';
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    Button,
    Badge,
} from '@/components/ui';
import { CLAUSE_DEFINITIONS } from '@/lib/clauses/definitions';
import { DownloadPolicyButton } from '@/components/documents/DownloadPolicyButton';
import { SignatureModal } from '@/components/documents/SignatureModal';
import { createSignatureProcess, simulateSigning, AutentiProcess } from '@/lib/autenti';
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
        default: return 'default';
    }
};

const scopeLabels: Record<string, string> = {
    POLAND: 'Polska',
    EUROPE: 'Europa',
    WORLD: 'Świat',
};

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pl-PL', {
        style: 'currency',
        currency: 'PLN',
        minimumFractionDigits: 0,
    }).format(value);
};

const formatDate = (date: Date | undefined) => {
    if (!date) return '—';
    return new Intl.DateTimeFormat('pl-PL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(date);
};

interface PolicyData {
    id: string;
    policyNumber: string;
    clientId: string;
    status: string;
    sumInsured: number;
    totalPremium: number;
    territorialScope: string;
    validFrom: Date;
    validTo: Date;
    issuedAt: Date;
    clauses: Array<{ type: string; sublimit: number; premium: number }>;
    signatureStatus?: string;
    signedAt?: Date;
    client?: {
        name: string;
        nip: string;
        email: string;
        phone: string;
    };
}

export default function PolicyDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [policy, setPolicy] = useState<PolicyData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showSignatureModal, setShowSignatureModal] = useState(false);
    const [signatureProcess, setSignatureProcess] = useState<AutentiProcess | null>(null);
    const [isStartingSignature, setIsStartingSignature] = useState(false);

    useEffect(() => {
        const fetchPolicy = async () => {
            try {
                const res = await fetch(`/api/policies/${id}`);
                if (!res.ok) throw new Error('Policy not found');
                const data = await res.json();

                // Convert date strings to Date objects
                setPolicy({
                    ...data,
                    validFrom: new Date(data.validFrom),
                    validTo: new Date(data.validTo),
                    issuedAt: new Date(data.issuedAt),
                    signedAt: data.signedAt ? new Date(data.signedAt) : undefined,
                    signatureStatus: data.signatureStatus || 'PENDING'
                });
            } catch (err) {
                console.error('Failed to fetch policy:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPolicy();
    }, [id]);

    if (isLoading) {
        return (
            <div className={styles.page}>
                <header className={styles.header}>
                    <h1 className={styles.title}>Wczytywanie...</h1>
                </header>
            </div>
        );
    }

    if (!policy) {
        return (
            <div className={styles.page}>
                <Card className={styles.notFound}>
                    <h2>Polisa nie znaleziona</h2>
                    <p>Polisa o podanym ID nie istnieje.</p>
                    <Link href="/policies">
                        <Button variant="secondary" leftIcon={<ArrowLeft size={18} />}>
                            Powrót do listy
                        </Button>
                    </Link>
                </Card>
            </div>
        );
    }

    const handleStartSignature = async () => {
        setIsStartingSignature(true);
        try {
            const process = await createSignatureProcess(policy.id, `Polisa ${policy.policyNumber}`);
            setSignatureProcess(process);
            setShowSignatureModal(true);
        } catch (error) {
            console.error('Failed to start signature process:', error);
            alert('Wystąpił błąd podczas komunikacji z Autenti.');
        } finally {
            setIsStartingSignature(false);
        }
    };

    const handleSigned = async () => {
        if (!signatureProcess) return;

        const success = await simulateSigning(signatureProcess.id);
        if (success) {
            setPolicy({
                ...policy,
                status: 'ACTIVE',
                signatureStatus: 'SIGNED',
                signedAt: new Date()
            });
        }
    };

    const daysUntilExpiry = Math.ceil((policy.validTo.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    const isExpiring = policy.status === 'ACTIVE' && daysUntilExpiry <= 30 && daysUntilExpiry > 0;

    const policyPdfData = {
        policyNumber: policy.policyNumber,
        issueDate: formatDate(policy.issuedAt),
        validFrom: formatDate(policy.validFrom),
        validTo: formatDate(policy.validTo),
        insurer: {
            name: 'OCPD Insurance Group S.A.',
            address: 'ul. Asekuracyjna 1, 00-999 Warszawa'
        },
        insured: {
            name: policy.client?.name || '',
            nip: policy.client?.nip || '',
            address: 'ul. Transportowa 10', // Mock data as it's not in PolicyData model yet
            city: '00-100 Warszawa'
        },
        coverage: {
            sumInsured: formatCurrency(policy.sumInsured),
            scope: scopeLabels[policy.territorialScope] || policy.territorialScope,
            cargoType: 'Uniwersalny'
        },
        premium: formatCurrency(policy.totalPremium)
    };

    return (
        <div className={styles.page}>
            {/* Header */}
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <Link href="/policies" className={styles.backLink}>
                        <ArrowLeft size={20} />
                        <span>Polisy</span>
                    </Link>
                    <div className={styles.headerInfo}>
                        <div className={styles.headerIcon}>
                            <FileText size={32} />
                        </div>
                        <div>
                            <h1 className={styles.title}>{policy.policyNumber}</h1>
                            <span className={styles.clientName}>{policy.client?.name}</span>
                        </div>
                    </div>
                </div>
                <div className={styles.headerActions}>
                    {policy.signatureStatus === 'SIGNED' ? (
                        <Badge variant="success" size="md">Podpisana</Badge>
                    ) : (
                        <Badge variant={statusVariant(policy.status)} size="md">
                            {statusLabels[policy.status]}
                        </Badge>
                    )}
                    <DownloadPolicyButton data={policyPdfData} />
                </div>
            </header>

            {showSignatureModal && signatureProcess && (
                <SignatureModal
                    documentTitle={`Polisa ${policy.policyNumber}`}
                    signingUrl={signatureProcess.signingUrl}
                    onClose={() => setShowSignatureModal(false)}
                    onSigned={handleSigned}
                />
            )}

            {/* Alert for expiring */}
            {isExpiring && (
                <Card className={styles.alertCard}>
                    <Clock size={20} />
                    <span>Polisa wygasa za <strong>{daysUntilExpiry} dni</strong>. Rozważ odnowienie.</span>
                    <Button size="sm">Odnów polisę</Button>
                </Card>
            )}

            {/* Main Content */}
            <div className={styles.contentGrid}>
                {/* Left Column */}
                <div className={styles.leftColumn}>
                    {/* Key Figures */}
                    <div className={styles.keyFigures}>
                        <Card className={styles.figureCard}>
                            <div className={styles.figureIcon} style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--color-accent-primary)' }}>
                                <Shield size={24} />
                            </div>
                            <div className={styles.figureContent}>
                                <span className={styles.figureLabel}>Suma ubezpieczenia</span>
                                <span className={styles.figureValue}>{formatCurrency(policy.sumInsured)}</span>
                            </div>
                        </Card>
                        <Card className={styles.figureCard}>
                            <div className={styles.figureIcon} style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--color-success)' }}>
                                <CheckCircle size={24} />
                            </div>
                            <div className={styles.figureContent}>
                                <span className={styles.figureLabel}>Składka roczna</span>
                                <span className={styles.figureValue}>{formatCurrency(policy.totalPremium)}</span>
                            </div>
                        </Card>
                    </div>

                    {/* Policy Details */}
                    <Card padding="lg">
                        <CardHeader>
                            <CardTitle>Szczegóły polisy</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className={styles.detailsGrid}>
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>Zakres terytorialny</span>
                                    <Badge variant="accent">{scopeLabels[policy.territorialScope]}</Badge>
                                </div>
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>Data wystawienia</span>
                                    <span className={styles.detailValue}>{formatDate(policy.issuedAt)}</span>
                                </div>
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>Początek ochrony</span>
                                    <span className={styles.detailValue}>{formatDate(policy.validFrom)}</span>
                                </div>
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>Koniec ochrony</span>
                                    <span className={styles.detailValue}>{formatDate(policy.validTo)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Clauses */}
                    {policy.clauses.length > 0 && (
                        <Card padding="lg">
                            <CardHeader>
                                <CardTitle>Klauzule dodatkowe ({policy.clauses.length})</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className={styles.clausesList}>
                                    {policy.clauses.map((clause) => {
                                        const definition = CLAUSE_DEFINITIONS.find(d => d.type === clause.type);
                                        return (
                                            <div key={clause.type} className={styles.clauseItem}>
                                                <div className={styles.clauseInfo}>
                                                    <span className={styles.clauseName}>{definition?.namePL || clause.type}</span>
                                                    <span className={styles.clauseDesc}>{definition?.descriptionPL}</span>
                                                </div>
                                                <div className={styles.clauseMeta}>
                                                    <span>Sublimit: {clause.sublimit}%</span>
                                                    <span className={styles.clausePremium}>+{formatCurrency(clause.premium)}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Right Column */}
                <div className={styles.rightColumn}>
                    {/* Client Info */}
                    <Card padding="lg">
                        <CardHeader>
                            <CardTitle>Ubezpieczający</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className={styles.clientInfo}>
                                <div className={styles.clientAvatar}>
                                    <Building2 size={24} />
                                </div>
                                <div>
                                    <h3 className={styles.clientTitle}>{policy.client?.name}</h3>
                                    <span className={styles.clientNip}>NIP: {policy.client?.nip}</span>
                                </div>
                            </div>
                            <div className={styles.clientDetails}>
                                <div className={styles.clientDetail}>
                                    <span className={styles.detailLabel}>Email</span>
                                    <span>{policy.client?.email}</span>
                                </div>
                                <div className={styles.clientDetail}>
                                    <span className={styles.detailLabel}>Telefon</span>
                                    <span>{policy.client?.phone}</span>
                                </div>
                            </div>
                            <Link href={`/clients/${policy.clientId}`}>
                                <Button variant="ghost" size="sm" className={styles.viewClientBtn}>
                                    Zobacz profil klienta
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card padding="lg">
                        <CardHeader>
                            <CardTitle>Akcje</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className={styles.actionsList}>
                                {policy.signatureStatus !== 'SIGNED' && (
                                    <Button
                                        variant="primary"
                                        leftIcon={<PenTool size={18} />}
                                        className={styles.actionBtn}
                                        onClick={handleStartSignature}
                                        isLoading={isStartingSignature}
                                    >
                                        Podpisz przez Autenti
                                    </Button>
                                )}
                                {policy.signatureStatus === 'SIGNED' && (
                                    <div className={styles.signedStatusInfo}>
                                        <CheckCircle2 color="var(--color-success)" size={20} />
                                        <span>Dokument został podpisany cyfrowo.</span>
                                    </div>
                                )}
                                <DownloadPolicyButton data={policyPdfData} />
                                <Link href="/certificates">
                                    <Button variant="secondary" leftIcon={<FileText size={18} />} className={styles.actionBtn}>
                                        Wystaw certyfikat
                                    </Button>
                                </Link>
                                <Link href="/claims">
                                    <Button variant="ghost" leftIcon={<Shield size={18} />} className={styles.actionBtn}>
                                        Zgłoś szkodę
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
