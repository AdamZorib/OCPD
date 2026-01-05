'use client';

import { use } from 'react';
import Link from 'next/link';
import {
    ArrowLeft,
    Building2,
    MapPin,
    Phone,
    Mail,
    Calendar,
    Truck,
    FileText,
    AlertTriangle,
    Shield,
    Award,
    Edit,
    TrendingUp,
    TrendingDown,
} from 'lucide-react';
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    Button,
    Badge,
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from '@/components/ui';
import { mockClients, mockPolicies, mockClaims } from '@/lib/mock-data';
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

export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const client = mockClients.find((c) => c.id === id);
    const clientPolicies = mockPolicies.filter((p) => p.clientId === id);
    const clientClaims = mockClaims.filter((c) => c.clientId === id);

    if (!client) {
        return (
            <div className={styles.page}>
                <Card className={styles.notFound}>
                    <h2>Klient nie znaleziony</h2>
                    <p>Klient o podanym ID nie istnieje.</p>
                    <Link href="/clients">
                        <Button variant="secondary" leftIcon={<ArrowLeft size={18} />}>
                            Powrót do listy
                        </Button>
                    </Link>
                </Card>
            </div>
        );
    }

    const activePolicies = clientPolicies.filter((p) => p.status === 'ACTIVE');
    const totalPremium = activePolicies.reduce((sum, p) => sum + p.totalPremium, 0);
    const openClaims = clientClaims.filter((c) => c.status === 'UNDER_REVIEW' || c.status === 'REPORTED');

    return (
        <div className={styles.page}>
            {/* Header */}
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <Link href="/clients" className={styles.backLink}>
                        <ArrowLeft size={20} />
                        <span>Klienci</span>
                    </Link>
                    <div className={styles.headerInfo}>
                        <div className={styles.headerAvatar}>
                            <Building2 size={32} />
                        </div>
                        <div>
                            <h1 className={styles.title}>{client.name}</h1>
                            <span className={styles.nip}>NIP: {client.nip}</span>
                        </div>
                    </div>
                </div>
                <div className={styles.headerActions}>
                    <Badge variant={riskLevelVariant(client.riskProfile.riskLevel)} size="md">
                        Ryzyko: {riskLevelLabels[client.riskProfile.riskLevel]}
                    </Badge>
                    <Button variant="secondary" leftIcon={<Edit size={18} />}>
                        Edytuj
                    </Button>
                    <Link href="/quotes/new">
                        <Button leftIcon={<FileText size={18} />}>
                            Nowa wycena
                        </Button>
                    </Link>
                </div>
            </header>

            {/* Stats */}
            <section className={styles.statsGrid}>
                <Card className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--color-accent-primary)' }}>
                        <FileText size={24} />
                    </div>
                    <div className={styles.statContent}>
                        <span className={styles.statLabel}>Aktywne polisy</span>
                        <span className={styles.statValue}>{activePolicies.length}</span>
                    </div>
                </Card>
                <Card className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--color-success)' }}>
                        <TrendingUp size={24} />
                    </div>
                    <div className={styles.statContent}>
                        <span className={styles.statLabel}>Składka roczna</span>
                        <span className={styles.statValue}>{formatCurrency(totalPremium)}</span>
                    </div>
                </Card>
                <Card className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--color-danger)' }}>
                        <AlertTriangle size={24} />
                    </div>
                    <div className={styles.statContent}>
                        <span className={styles.statLabel}>Otwarte szkody</span>
                        <span className={styles.statValue}>{openClaims.length}</span>
                    </div>
                </Card>
                <Card className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: client.riskProfile.bonusMalus <= 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: client.riskProfile.bonusMalus <= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                        {client.riskProfile.bonusMalus <= 0 ? <TrendingDown size={24} /> : <TrendingUp size={24} />}
                    </div>
                    <div className={styles.statContent}>
                        <span className={styles.statLabel}>Bonus/Malus</span>
                        <span className={styles.statValue} data-positive={client.riskProfile.bonusMalus <= 0}>
                            {client.riskProfile.bonusMalus > 0 ? '+' : ''}{client.riskProfile.bonusMalus}%
                        </span>
                    </div>
                </Card>
            </section>

            {/* Main Content */}
            <div className={styles.mainGrid}>
                {/* Left Column */}
                <div className={styles.leftColumn}>
                    {/* Company Info */}
                    <Card padding="lg">
                        <CardHeader>
                            <CardTitle>Dane firmy</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className={styles.infoGrid}>
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>Pełna nazwa</span>
                                    <span className={styles.infoValue}>{client.regonData?.name || client.name}</span>
                                </div>
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>NIP</span>
                                    <span className={styles.infoValue}>{client.nip}</span>
                                </div>
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>REGON</span>
                                    <span className={styles.infoValue}>{client.regonData?.regon || '—'}</span>
                                </div>
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>Forma prawna</span>
                                    <span className={styles.infoValue}>{client.regonData?.legalForm || '—'}</span>
                                </div>
                                {client.regonData?.address && (
                                    <div className={styles.infoItem + ' ' + styles.fullWidth}>
                                        <span className={styles.infoLabel}>Adres</span>
                                        <span className={styles.infoValue}>
                                            {client.regonData.address.street}, {client.regonData.address.postalCode} {client.regonData.address.city}
                                        </span>
                                    </div>
                                )}
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>Telefon</span>
                                    <span className={styles.infoValue}>{client.phone}</span>
                                </div>
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>Email</span>
                                    <span className={styles.infoValue}>{client.email}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Policies */}
                    <Card padding="none">
                        <div className={styles.sectionHeader}>
                            <h3>Historia polis</h3>
                            <Link href="/policies" className={styles.viewAllLink}>
                                Zobacz wszystkie
                            </Link>
                        </div>
                        {clientPolicies.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nr polisy</TableHead>
                                        <TableHead>Suma ubezp.</TableHead>
                                        <TableHead>Składka</TableHead>
                                        <TableHead>Ważność</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {clientPolicies.map((policy) => (
                                        <TableRow key={policy.id}>
                                            <TableCell>
                                                <Link href={`/policies/${policy.id}`} className={styles.policyLink}>
                                                    {policy.policyNumber}
                                                </Link>
                                            </TableCell>
                                            <TableCell>{formatCurrency(policy.sumInsured)}</TableCell>
                                            <TableCell>{formatCurrency(policy.totalPremium)}</TableCell>
                                            <TableCell>{formatDate(policy.validTo)}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={policy.status === 'ACTIVE' ? 'success' : policy.status === 'EXPIRED' ? 'danger' : 'default'}
                                                    size="sm"
                                                >
                                                    {policy.status === 'ACTIVE' ? 'Aktywna' : policy.status === 'EXPIRED' ? 'Wygasła' : policy.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className={styles.emptySection}>
                                <p>Brak polis dla tego klienta</p>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Right Column */}
                <div className={styles.rightColumn}>
                    {/* Risk Profile */}
                    <Card padding="lg">
                        <CardHeader>
                            <CardTitle>Profil ryzyka</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className={styles.riskScore}>
                                <div className={styles.scoreCircle} data-level={client.riskProfile.riskLevel.toLowerCase()}>
                                    <span className={styles.scoreValue}>{client.riskProfile.overallScore}</span>
                                    <span className={styles.scoreLabel}>/ 100</span>
                                </div>
                                <Badge variant={riskLevelVariant(client.riskProfile.riskLevel)}>
                                    {riskLevelLabels[client.riskProfile.riskLevel]}
                                </Badge>
                            </div>

                            <div className={styles.riskDetails}>
                                <div className={styles.riskItem}>
                                    <span className={styles.riskLabel}>Lata w branży</span>
                                    <span className={styles.riskValue}>{client.riskProfile.yearsInBusiness}</span>
                                </div>
                                <div className={styles.riskItem}>
                                    <span className={styles.riskLabel}>Szkodowość</span>
                                    <span className={styles.riskValue}>{(client.riskProfile.claimsRatio * 100).toFixed(0)}%</span>
                                </div>
                                <div className={styles.riskItem}>
                                    <span className={styles.riskLabel}>Zakres działania</span>
                                    <span className={styles.riskValue}>{client.riskProfile.mainRoutes.join(', ')}</span>
                                </div>
                                <div className={styles.riskItem}>
                                    <span className={styles.riskLabel}>Typy transportu</span>
                                    <span className={styles.riskValue}>{client.riskProfile.transportTypes.join(', ')}</span>
                                </div>
                            </div>

                            <div className={styles.certificates}>
                                <div className={styles.certItem} data-active={client.riskProfile.hasADRCertificate}>
                                    <Shield size={18} />
                                    <span>Certyfikat ADR</span>
                                </div>
                                <div className={styles.certItem} data-active={client.riskProfile.hasTAPACertificate}>
                                    <Award size={18} />
                                    <span>Certyfikat TAPA</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Claims */}
                    <Card padding="lg">
                        <CardHeader>
                            <CardTitle>Ostatnie szkody</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {clientClaims.length > 0 ? (
                                <div className={styles.claimsList}>
                                    {clientClaims.slice(0, 3).map((claim) => (
                                        <div key={claim.id} className={styles.claimItem}>
                                            <div className={styles.claimMain}>
                                                <span className={styles.claimNumber}>{claim.claimNumber}</span>
                                                <span className={styles.claimDesc}>{claim.description.slice(0, 60)}...</span>
                                            </div>
                                            <div className={styles.claimEnd}>
                                                <span className={styles.claimAmount}>{formatCurrency(claim.claimedAmount)}</span>
                                                <Badge
                                                    variant={claim.status === 'PAID' ? 'success' : claim.status === 'UNDER_REVIEW' ? 'warning' : 'default'}
                                                    size="sm"
                                                >
                                                    {claim.status === 'PAID' ? 'Wypłacona' : claim.status === 'UNDER_REVIEW' ? 'W trakcie' : claim.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className={styles.emptySection}>
                                    <p>Brak zgłoszonych szkód</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
