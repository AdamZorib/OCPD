'use client';

import { Award, Plus, FileText, Printer } from 'lucide-react';
import { Card, Button, Badge } from '@/components/ui';
import { DownloadCertificateButton } from '@/components/documents/DownloadCertificateButton';
import styles from './page.module.css';

interface Certificate {
    id: string;
    certificateNumber: string;
    policyNumber: string;
    clientName: string;
    cargoDescription: string;
    cargoValue: number;
    route: string;
    transportDate: Date;
    generatedAt: Date;
}

// Mock certificates data
const mockCertificates: Certificate[] = [
    {
        id: 'cert-1',
        certificateNumber: 'CERT/2024/00456',
        policyNumber: 'OCPD/2024/001234',
        clientName: 'Trans-Europa Sp. z o.o.',
        cargoDescription: 'Elektronika - telewizory LCD',
        cargoValue: 85000,
        route: 'Warszawa → Berlin',
        transportDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        generatedAt: new Date(),
    },
    {
        id: 'cert-2',
        certificateNumber: 'CERT/2024/00455',
        policyNumber: 'OCPD/2024/001236',
        clientName: 'Logistyka Międzynarodowa SA',
        cargoDescription: 'Części samochodowe',
        cargoValue: 120000,
        route: 'Kraków → Amsterdam',
        transportDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        generatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
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

const generateCertificatePDF = (cert: Certificate) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert('Proszę włączyć wyskakujące okienka dla tej strony.');
        return;
    }

    const html = `
<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <title>Certyfikat ${cert.certificateNumber}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Arial, sans-serif; 
            padding: 40px; 
            color: #1a1a1a;
            background: #fff;
        }
        .certificate { 
            max-width: 800px; 
            margin: 0 auto; 
            border: 3px solid #1e3a5f;
            padding: 40px;
            position: relative;
        }
        .certificate::before {
            content: '';
            position: absolute;
            top: 10px;
            left: 10px;
            right: 10px;
            bottom: 10px;
            border: 1px solid #1e3a5f;
            pointer-events: none;
        }
        .header { 
            text-align: center; 
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #1e3a5f;
        }
        .logo { 
            font-size: 28px; 
            font-weight: bold; 
            color: #1e3a5f;
            margin-bottom: 10px;
        }
        .title { 
            font-size: 24px; 
            color: #1e3a5f;
            text-transform: uppercase;
            letter-spacing: 3px;
        }
        .cert-number { 
            font-size: 18px; 
            color: #666;
            margin-top: 10px;
            font-family: monospace;
        }
        .section { 
            margin: 25px 0; 
        }
        .section-title { 
            font-size: 14px; 
            color: #666; 
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 8px;
        }
        .section-content { 
            font-size: 16px; 
            color: #1a1a1a;
            font-weight: 500;
        }
        .grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 25px;
        }
        .highlight {
            background: #f5f7fa;
            padding: 20px;
            border-radius: 8px;
            margin: 25px 0;
        }
        .highlight .section-content {
            font-size: 20px;
            color: #1e3a5f;
        }
        .footer { 
            margin-top: 40px; 
            padding-top: 20px;
            border-top: 1px solid #ddd;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
        }
        .stamp {
            width: 120px;
            height: 120px;
            border: 2px solid #1e3a5f;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            font-size: 12px;
            color: #1e3a5f;
            padding: 10px;
        }
        .signature {
            text-align: right;
        }
        .signature-line {
            width: 200px;
            border-top: 1px solid #1a1a1a;
            margin-bottom: 5px;
        }
        .signature-label {
            font-size: 12px;
            color: #666;
        }
        .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-30deg);
            font-size: 100px;
            color: rgba(30, 58, 95, 0.05);
            font-weight: bold;
            pointer-events: none;
        }
        @media print {
            body { padding: 0; }
            .certificate { border-width: 2px; }
        }
    </style>
</head>
<body>
    <div class="certificate">
        <div class="watermark">OCPD</div>
        
        <div class="header">
            <div class="logo">🛡️ OCPD Insurance Platform</div>
            <div class="title">Certyfikat Ubezpieczenia Przewozu</div>
            <div class="cert-number">${cert.certificateNumber}</div>
        </div>

        <div class="section">
            <div class="section-title">Ubezpieczający / Przewoźnik</div>
            <div class="section-content">${cert.clientName}</div>
        </div>

        <div class="highlight">
            <div class="grid">
                <div class="section">
                    <div class="section-title">Opis ładunku</div>
                    <div class="section-content">${cert.cargoDescription}</div>
                </div>
                <div class="section">
                    <div class="section-title">Wartość ładunku</div>
                    <div class="section-content">${formatCurrency(cert.cargoValue)}</div>
                </div>
            </div>
        </div>

        <div class="grid">
            <div class="section">
                <div class="section-title">Trasa przewozu</div>
                <div class="section-content">${cert.route}</div>
            </div>
            <div class="section">
                <div class="section-title">Data transportu</div>
                <div class="section-content">${formatDate(cert.transportDate)}</div>
            </div>
        </div>

        <div class="grid">
            <div class="section">
                <div class="section-title">Numer polisy</div>
                <div class="section-content">${cert.policyNumber}</div>
            </div>
            <div class="section">
                <div class="section-title">Data wystawienia</div>
                <div class="section-content">${formatDate(cert.generatedAt)}</div>
            </div>
        </div>

        <div class="footer">
            <div class="stamp">
                OCPD<br/>
                Insurance<br/>
                Platform
            </div>
            <div class="signature">
                <div class="signature-line"></div>
                <div class="signature-label">Podpis i pieczęć</div>
            </div>
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

export default function CertificatesPage() {
    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Certyfikaty</h1>
                    <p className={styles.subtitle}>Generuj i zarządzaj certyfikatami przewozowymi</p>
                </div>
                <Button leftIcon={<Plus size={18} />}>
                    Nowy certyfikat
                </Button>
            </header>

            <div className={styles.certificatesGrid}>
                {mockCertificates.map((cert) => (
                    <Card key={cert.id} className={styles.certCard} hoverable>
                        <div className={styles.certHeader}>
                            <div className={styles.certIcon}>
                                <Award size={24} />
                            </div>
                            <Badge variant="success">Ważny</Badge>
                        </div>

                        <div className={styles.certInfo}>
                            <span className={styles.certNumber}>{cert.certificateNumber}</span>
                            <p className={styles.certClient}>{cert.clientName}</p>
                        </div>

                        <div className={styles.certDetails}>
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>Ładunek</span>
                                <span className={styles.detailValue}>{cert.cargoDescription}</span>
                            </div>
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>Wartość</span>
                                <span className={styles.detailValue}>{formatCurrency(cert.cargoValue)}</span>
                            </div>
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>Trasa</span>
                                <span className={styles.detailValue}>{cert.route}</span>
                            </div>
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>Data transportu</span>
                                <span className={styles.detailValue}>{formatDate(cert.transportDate)}</span>
                            </div>
                        </div>

                        <div className={styles.certFooter}>
                            <span className={styles.policyRef}>
                                <FileText size={14} />
                                {cert.policyNumber}
                            </span>
                            <DownloadCertificateButton
                                data={{
                                    certificateNumber: cert.certificateNumber,
                                    policyNumber: cert.policyNumber,
                                    clientName: cert.clientName,
                                    cargoDescription: cert.cargoDescription,
                                    cargoValue: formatCurrency(cert.cargoValue),
                                    route: cert.route,
                                    transportDate: formatDate(cert.transportDate),
                                    generatedAt: formatDate(cert.generatedAt)
                                }}
                                variant="ghost"
                                size="sm"
                            />
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
