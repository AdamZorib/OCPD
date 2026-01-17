'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Award, Plus, FileText, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { Card, Button, Badge } from '@/components/ui';
import { DownloadCertificateButton } from '@/components/documents/DownloadCertificateButton';
import styles from './page.module.css';

interface Certificate {
    id: string;
    certificateNumber: string;
    policyNumber: string;
    clientName: string;
    cargoDescription: string;
    cargoValue: string;
    route: string;
    transportDate: Date;
    createdAt: Date;
    policy?: {
        validTo: string | null;
        status: string;
    } | null;
}

interface ApiCertificate {
    id: string;
    certificateNumber: string;
    policyNumber: string;
    clientName: string;
    cargoDescription: string;
    cargoValue: string;
    route: string;
    transportDate: string;
    createdAt: string;
    policy?: {
        validTo: string | null;
        status: string;
    } | null;
}

interface PaginatedResponse {
    data: ApiCertificate[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

const formatCurrency = (value: number | string) => {
    const numberValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numberValue)) return '0,00 zł';

    return new Intl.NumberFormat('pl-PL', {
        style: 'currency',
        currency: 'PLN',
        minimumFractionDigits: 0,
    }).format(numberValue);
};

const formatDate = (date: Date | null | undefined) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        return '-';
    }
    return new Intl.DateTimeFormat('pl-PL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(date);
};

// Certificate validity status - properly handle missing policy
type CertificateStatus = 'valid' | 'invalid' | 'unknown';

const getCertificateStatus = (cert: Certificate): CertificateStatus => {
    // If no policy data, we can't verify - status is UNKNOWN, not assumed valid
    if (!cert.policy) return 'unknown';

    // Policy must be ACTIVE
    if (cert.policy.status !== 'ACTIVE') return 'invalid';

    // Check expiry date
    if (cert.policy.validTo) {
        const expiryDate = new Date(cert.policy.validTo);
        // Same-day is still valid (until end of day)
        expiryDate.setHours(23, 59, 59, 999);
        if (expiryDate < new Date()) return 'invalid';
    }

    return 'valid';
};

const getStatusBadge = (status: CertificateStatus) => {
    switch (status) {
        case 'valid':
            return <Badge variant="success">Ważny</Badge>;
        case 'invalid':
            return <Badge variant="warning">Nieważny</Badge>;
        case 'unknown':
            return <Badge variant="default">Nieznany</Badge>;
    }
};

export default function CertificatesPage() {
    const router = useRouter();
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Pagination state
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const pageSize = 20;

    const fetchCertificates = useCallback(async (pageNum: number) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/certificates?page=${pageNum}&pageSize=${pageSize}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result: PaginatedResponse = await response.json();

            if (result.data) {
                // Safe date parsing with fallbacks
                const transformed = result.data.map((item: ApiCertificate) => ({
                    ...item,
                    transportDate: item.transportDate ? new Date(item.transportDate) : new Date(),
                    createdAt: item.createdAt ? new Date(item.createdAt) : new Date()
                }));
                setCertificates(transformed);
                setTotalPages(result.totalPages || 1);
                setTotal(result.total || 0);
                setPage(result.page || 1);
            }
        } catch {
            setError('Nie udało się pobrać certyfikatów');
        } finally {
            setLoading(false);
        }
    }, [pageSize]);

    useEffect(() => {
        fetchCertificates(page);
    }, [fetchCertificates, page]);

    const handlePreviousPage = () => {
        if (page > 1) {
            setPage(page - 1);
        }
    };

    const handleNextPage = () => {
        if (page < totalPages) {
            setPage(page + 1);
        }
    };

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Certyfikaty</h1>
                    <p className={styles.subtitle}>Generuj i zarządzaj certyfikatami przewozowymi</p>
                </div>
                <Button variant="primary" size="md" onClick={() => router.push('/certificates/new')}>
                    <Plus size={18} style={{ marginRight: 8 }} />
                    Nowy certyfikat
                </Button>
            </header>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '100px', width: '100%' }}>
                    <p>Ładowanie certyfikatów...</p>
                </div>
            ) : error ? (
                <div style={{
                    padding: '100px',
                    textAlign: 'center',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '16px'
                }}>
                    <AlertCircle size={48} color="#ef4444" />
                    <p style={{ color: '#ef4444' }}>{error}</p>
                    <Button variant="secondary" onClick={() => fetchCertificates(page)}>
                        Spróbuj ponownie
                    </Button>
                </div>
            ) : certificates.length === 0 ? (
                <div style={{ padding: '100px', textAlign: 'center', width: '100%' }}>
                    <p>Brak wystawionych certyfikatów</p>
                    <Button
                        variant="primary"
                        style={{ marginTop: '16px' }}
                        onClick={() => router.push('/certificates/new')}
                    >
                        <Plus size={18} style={{ marginRight: 8 }} />
                        Wystaw pierwszy certyfikat
                    </Button>
                </div>
            ) : (
                <>
                    <div className={styles.certificatesGrid}>
                        {certificates.map((cert) => {
                            const status = getCertificateStatus(cert);
                            return (
                                <Card key={cert.id} className={styles.certCard}>
                                    <div className={styles.certHeader}>
                                        <div className={styles.certIcon}>
                                            <Award size={24} />
                                        </div>
                                        {getStatusBadge(status)}
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
                                            <FileText size={14} style={{ marginRight: 4 }} />
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
                                                generatedAt: formatDate(cert.createdAt)
                                            }}
                                            variant="ghost"
                                            size="sm"
                                        />
                                    </div>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '16px',
                            padding: '24px 0',
                            marginTop: '24px'
                        }}>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={handlePreviousPage}
                                disabled={page <= 1}
                            >
                                <ChevronLeft size={16} />
                                Poprzednia
                            </Button>

                            <span style={{
                                fontSize: '14px',
                                color: 'var(--color-text-secondary)',
                                minWidth: '120px',
                                textAlign: 'center'
                            }}>
                                Strona {page} z {totalPages} ({total} wyników)
                            </span>

                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={handleNextPage}
                                disabled={page >= totalPages}
                            >
                                Następna
                                <ChevronRight size={16} />
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
