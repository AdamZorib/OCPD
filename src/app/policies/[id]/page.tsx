'use client';

import { use } from 'react';
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
} from 'lucide-react';
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    Button,
    Badge,
} from '@/components/ui';
import { mockPolicies } from '@/lib/mock-data';
import { CLAUSE_DEFINITIONS } from '@/lib/clauses/definitions';
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

const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pl-PL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(date);
};

interface PolicyData {
    id: string;
    policyNumber: string;
    status: string;
    sumInsured: number;
    totalPremium: number;
    territorialScope: string;
    validFrom: Date;
    validTo: Date;
    issuedAt: Date;
    clauses: Array<{ type: string; sublimit: number; premium: number }>;
    client?: {
        name: string;
        nip: string;
        email: string;
        phone: string;
    };
}

const generatePolicyPDF = (policy: PolicyData) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert('Proszę włączyć wyskakujące okienka dla tej strony.');
        return;
    }

    const clausesList = policy.clauses.map(c => {
        const def = CLAUSE_DEFINITIONS.find(d => d.type === c.type);
        return `<tr>
      <td>${def?.namePL || c.type}</td>
      <td>${c.sublimit}%</td>
      <td>${formatCurrency(c.premium)}</td>
    </tr>`;
    }).join('');

    const html = `
<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <title>Polisa ${policy.policyNumber}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Arial, sans-serif; 
            padding: 40px; 
            color: #1a1a1a;
            background: #fff;
            font-size: 14px;
            line-height: 1.5;
        }
        .policy { 
            max-width: 800px; 
            margin: 0 auto; 
        }
        .header { 
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #1e3a5f;
        }
        .logo { 
            font-size: 24px; 
            font-weight: bold; 
            color: #1e3a5f;
        }
        .logo-subtitle {
            font-size: 12px;
            color: #666;
            margin-top: 4px;
        }
        .policy-info {
            text-align: right;
        }
        .policy-number { 
            font-size: 20px; 
            font-weight: bold;
            color: #1e3a5f;
            font-family: monospace;
        }
        .policy-status {
            display: inline-block;
            padding: 4px 12px;
            background: ${policy.status === 'ACTIVE' ? '#10b981' : '#666'};
            color: white;
            border-radius: 4px;
            font-size: 12px;
            margin-top: 8px;
        }
        .title { 
            font-size: 28px; 
            color: #1e3a5f;
            text-align: center;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin: 30px 0;
        }
        .section { 
            margin: 25px 0;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
        }
        .section-title { 
            font-size: 16px; 
            font-weight: bold;
            color: #1e3a5f;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid #ddd;
        }
        .grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 15px;
        }
        .field {
            margin-bottom: 10px;
        }
        .field-label { 
            font-size: 11px; 
            color: #666; 
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
        }
        .field-value { 
            font-size: 15px; 
            color: #1a1a1a;
            font-weight: 500;
        }
        .highlight-box {
            background: #1e3a5f;
            color: white;
            padding: 25px;
            border-radius: 8px;
            margin: 25px 0;
        }
        .highlight-box .grid {
            gap: 30px;
        }
        .highlight-box .field-label {
            color: rgba(255,255,255,0.7);
        }
        .highlight-box .field-value {
            color: white;
            font-size: 24px;
            font-weight: bold;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        th, td {
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background: #e9ecef;
            font-weight: 600;
            font-size: 12px;
            text-transform: uppercase;
        }
        .footer { 
            margin-top: 40px; 
            padding-top: 20px;
            border-top: 2px solid #1e3a5f;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
        }
        .signature-box {
            text-align: center;
        }
        .signature-line {
            border-top: 1px solid #1a1a1a;
            margin-top: 60px;
            padding-top: 10px;
        }
        .signature-label {
            font-size: 12px;
            color: #666;
        }
        .legal-note {
            font-size: 10px;
            color: #666;
            margin-top: 30px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 4px;
        }
        @media print {
            body { padding: 20px; }
            .section { break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="policy">
        <div class="header">
            <div>
                <div class="logo">🛡️ OCPD Insurance Platform</div>
                <div class="logo-subtitle">Ubezpieczenie Odpowiedzialności Cywilnej Przewoźnika Drogowego</div>
            </div>
            <div class="policy-info">
                <div class="policy-number">${policy.policyNumber}</div>
                <div class="policy-status">${statusLabels[policy.status] || policy.status}</div>
            </div>
        </div>

        <h1 class="title">Polisa Ubezpieczeniowa OCPD</h1>

        <div class="section">
            <div class="section-title">Ubezpieczający / Przewoźnik</div>
            <div class="grid">
                <div class="field">
                    <div class="field-label">Nazwa firmy</div>
                    <div class="field-value">${policy.client?.name || '—'}</div>
                </div>
                <div class="field">
                    <div class="field-label">NIP</div>
                    <div class="field-value">${policy.client?.nip || '—'}</div>
                </div>
                <div class="field">
                    <div class="field-label">Email</div>
                    <div class="field-value">${policy.client?.email || '—'}</div>
                </div>
                <div class="field">
                    <div class="field-label">Telefon</div>
                    <div class="field-value">${policy.client?.phone || '—'}</div>
                </div>
            </div>
        </div>

        <div class="highlight-box">
            <div class="grid">
                <div class="field">
                    <div class="field-label">Suma ubezpieczenia</div>
                    <div class="field-value">${formatCurrency(policy.sumInsured)}</div>
                </div>
                <div class="field">
                    <div class="field-label">Składka roczna</div>
                    <div class="field-value">${formatCurrency(policy.totalPremium)}</div>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Okres i zakres ubezpieczenia</div>
            <div class="grid">
                <div class="field">
                    <div class="field-label">Zakres terytorialny</div>
                    <div class="field-value">${scopeLabels[policy.territorialScope] || policy.territorialScope}</div>
                </div>
                <div class="field">
                    <div class="field-label">Data wystawienia</div>
                    <div class="field-value">${formatDate(policy.issuedAt)}</div>
                </div>
                <div class="field">
                    <div class="field-label">Początek ochrony</div>
                    <div class="field-value">${formatDate(policy.validFrom)}</div>
                </div>
                <div class="field">
                    <div class="field-label">Koniec ochrony</div>
                    <div class="field-value">${formatDate(policy.validTo)}</div>
                </div>
            </div>
        </div>

        ${policy.clauses.length > 0 ? `
        <div class="section">
            <div class="section-title">Klauzule dodatkowe</div>
            <table>
                <thead>
                    <tr>
                        <th>Klauzula</th>
                        <th>Sublimit</th>
                        <th>Składka</th>
                    </tr>
                </thead>
                <tbody>
                    ${clausesList}
                </tbody>
            </table>
        </div>
        ` : ''}

        <div class="footer">
            <div class="signature-box">
                <div class="signature-line">Ubezpieczający</div>
            </div>
            <div class="signature-box">
                <div class="signature-line">Ubezpieczyciel</div>
            </div>
        </div>

        <div class="legal-note">
            Niniejsza polisa stanowi potwierdzenie zawarcia umowy ubezpieczenia odpowiedzialności cywilnej 
            przewoźnika drogowego w ruchu krajowym i międzynarodowym. Szczegółowe warunki ubezpieczenia 
            określone są w Ogólnych Warunkach Ubezpieczenia (OWU) stanowiących integralną część umowy.
        </div>
    </div>

    <script>
        window.onload = function() {
            window.print();
        }
    </script>
</body>
</html>`;

    printWindow.document.write(html);
    printWindow.document.close();
};

export default function PolicyDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const policy = mockPolicies.find((p) => p.id === id);

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

    const daysUntilExpiry = Math.ceil((policy.validTo.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    const isExpiring = policy.status === 'ACTIVE' && daysUntilExpiry <= 30 && daysUntilExpiry > 0;

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
                    <Badge variant={statusVariant(policy.status)} size="md">
                        {statusLabels[policy.status]}
                    </Badge>
                    <Button
                        variant="secondary"
                        leftIcon={<Printer size={18} />}
                        onClick={() => generatePolicyPDF(policy as PolicyData)}
                    >
                        Drukuj polisę
                    </Button>
                </div>
            </header>

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
                                <Button
                                    variant="secondary"
                                    leftIcon={<Printer size={18} />}
                                    className={styles.actionBtn}
                                    onClick={() => generatePolicyPDF(policy as PolicyData)}
                                >
                                    Drukuj polisę
                                </Button>
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
