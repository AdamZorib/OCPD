'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft,
    CreditCard,
    Building,
    Check,
    Clock,
    Shield,
    AlertCircle,
} from 'lucide-react';
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    Button,
    Badge,
} from '@/components/ui';
import styles from './page.module.css';

type PaymentMethod = 'PRZELEWY24' | 'PAYU' | 'BANK_TRANSFER';
type InstallmentOption = 1 | 2 | 4;

interface InstallmentDetails {
    count: InstallmentOption;
    surcharge: number;
    labelPL: string;
}

const INSTALLMENT_OPTIONS: InstallmentDetails[] = [
    { count: 1, surcharge: 0, labelPL: 'Jednorazowa płatność' },
    { count: 2, surcharge: 0.03, labelPL: '2 raty' },
    { count: 4, surcharge: 0.05, labelPL: '4 raty' },
];

const PAYMENT_METHODS: { type: PaymentMethod; name: string; logo: string; description: string }[] = [
    {
        type: 'PRZELEWY24',
        name: 'Przelewy24',
        logo: '🔵 P24',
        description: 'Szybki przelew online, BLIK, karta'
    },
    {
        type: 'PAYU',
        name: 'PayU',
        logo: '🟢 PayU',
        description: 'Przelew, karta, raty'
    },
    {
        type: 'BANK_TRANSFER',
        name: 'Przelew tradycyjny',
        logo: '🏦',
        description: 'Przelew bankowy (1-2 dni robocze)'
    },
];

// Mock quote data
const mockQuoteData = {
    quoteNumber: 'Q-2024-001234',
    clientName: 'Trans-Pol Sp. z o.o.',
    clientNIP: '1234567890',
    sumInsured: 500000,
    territorialScope: 'Europa',
    basePremium: 12500,
    policyPeriod: '01.02.2024 - 31.01.2025',
};

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pl-PL', {
        style: 'currency',
        currency: 'PLN',
        minimumFractionDigits: 0,
    }).format(value);

export default function PaymentPage() {
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
    const [selectedInstallments, setSelectedInstallments] = useState<InstallmentOption>(1);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    const installmentDetails = INSTALLMENT_OPTIONS.find(o => o.count === selectedInstallments)!;
    const surchargeAmount = Math.round(mockQuoteData.basePremium * installmentDetails.surcharge);
    const totalAmount = mockQuoteData.basePremium + surchargeAmount;
    const installmentAmount = Math.round(totalAmount / selectedInstallments);

    const handlePayment = () => {
        if (!selectedMethod) return;

        setIsProcessing(true);

        // Simulate payment processing
        setTimeout(() => {
            setIsProcessing(false);
            setPaymentSuccess(true);
        }, 2000);
    };

    if (paymentSuccess) {
        return (
            <div className={styles.page}>
                <Card padding="lg" className={styles.successCard}>
                    <div className={styles.successContent}>
                        <div className={styles.successIcon}>
                            <Check size={48} />
                        </div>
                        <h1>Płatność zakończona pomyślnie!</h1>
                        <p>Twoja polisa OCPD zostanie wystawiona w ciągu kilku minut.</p>

                        <div className={styles.successDetails}>
                            <div>
                                <span>Numer wyceny</span>
                                <strong>{mockQuoteData.quoteNumber}</strong>
                            </div>
                            <div>
                                <span>Kwota</span>
                                <strong>{formatCurrency(totalAmount)}</strong>
                            </div>
                            <div>
                                <span>Metoda</span>
                                <strong>{PAYMENT_METHODS.find(m => m.type === selectedMethod)?.name}</strong>
                            </div>
                        </div>

                        <div className={styles.successActions}>
                            <Link href="/policies">
                                <Button>Przejdź do polis</Button>
                            </Link>
                            <Link href="/">
                                <Button variant="secondary">Powrót do dashboardu</Button>
                            </Link>
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            {/* Header */}
            <header className={styles.header}>
                <Link href="/quotes" className={styles.backLink}>
                    <ArrowLeft size={20} />
                    <span>Wyceny</span>
                </Link>
                <div>
                    <h1 className={styles.title}>Płatność za polisę</h1>
                    <p className={styles.subtitle}>Wycena {mockQuoteData.quoteNumber}</p>
                </div>
            </header>

            <div className={styles.content}>
                {/* Left: Payment Options */}
                <div className={styles.paymentOptions}>
                    {/* Installments */}
                    <Card padding="lg">
                        <CardHeader>
                            <CardTitle>Opcje płatności</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className={styles.installmentGrid}>
                                {INSTALLMENT_OPTIONS.map((option) => (
                                    <div
                                        key={option.count}
                                        className={`${styles.installmentCard} ${selectedInstallments === option.count ? styles.selected : ''}`}
                                        onClick={() => setSelectedInstallments(option.count)}
                                    >
                                        <div className={styles.installmentHeader}>
                                            <span className={styles.installmentLabel}>{option.labelPL}</span>
                                            {option.surcharge > 0 && (
                                                <Badge variant="warning" size="sm">
                                                    +{option.surcharge * 100}%
                                                </Badge>
                                            )}
                                        </div>
                                        <div className={styles.installmentAmount}>
                                            {option.count === 1
                                                ? formatCurrency(mockQuoteData.basePremium)
                                                : `${option.count} × ${formatCurrency(Math.round((mockQuoteData.basePremium * (1 + option.surcharge)) / option.count))}`
                                            }
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment Methods */}
                    <Card padding="lg">
                        <CardHeader>
                            <CardTitle>Metoda płatności</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className={styles.methodsList}>
                                {PAYMENT_METHODS.map((method) => (
                                    <div
                                        key={method.type}
                                        className={`${styles.methodCard} ${selectedMethod === method.type ? styles.selected : ''}`}
                                        onClick={() => setSelectedMethod(method.type)}
                                    >
                                        <div className={styles.methodLogo}>
                                            {method.logo}
                                        </div>
                                        <div className={styles.methodInfo}>
                                            <span className={styles.methodName}>{method.name}</span>
                                            <span className={styles.methodDesc}>{method.description}</span>
                                        </div>
                                        <div className={styles.methodCheck}>
                                            {selectedMethod === method.type && <Check size={20} />}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Bank Transfer Info */}
                    {selectedMethod === 'BANK_TRANSFER' && (
                        <Card padding="lg" className={styles.bankInfo}>
                            <div className={styles.bankInfoContent}>
                                <Building size={24} />
                                <div>
                                    <h4>Dane do przelewu</h4>
                                    <p><strong>Odbiorca:</strong> InsureTech S.A.</p>
                                    <p><strong>IBAN:</strong> PL12 3456 7890 1234 5678 9012 3456</p>
                                    <p><strong>Tytuł:</strong> {mockQuoteData.quoteNumber}</p>
                                    <p><strong>Kwota:</strong> {formatCurrency(totalAmount)}</p>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>

                {/* Right: Summary */}
                <div className={styles.summary}>
                    <Card padding="lg">
                        <CardHeader>
                            <CardTitle>Podsumowanie</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className={styles.summaryDetails}>
                                <div className={styles.summaryRow}>
                                    <span>Klient</span>
                                    <strong>{mockQuoteData.clientName}</strong>
                                </div>
                                <div className={styles.summaryRow}>
                                    <span>NIP</span>
                                    <strong>{mockQuoteData.clientNIP}</strong>
                                </div>
                                <div className={styles.summaryRow}>
                                    <span>Suma ubezpieczenia</span>
                                    <strong>{formatCurrency(mockQuoteData.sumInsured)}</strong>
                                </div>
                                <div className={styles.summaryRow}>
                                    <span>Zakres</span>
                                    <strong>{mockQuoteData.territorialScope}</strong>
                                </div>
                                <div className={styles.summaryRow}>
                                    <span>Okres ochrony</span>
                                    <strong>{mockQuoteData.policyPeriod}</strong>
                                </div>
                            </div>

                            <div className={styles.summaryDivider} />

                            <div className={styles.priceBreakdown}>
                                <div className={styles.summaryRow}>
                                    <span>Składka podstawowa</span>
                                    <span>{formatCurrency(mockQuoteData.basePremium)}</span>
                                </div>
                                {surchargeAmount > 0 && (
                                    <div className={styles.summaryRow}>
                                        <span>Dopłata za raty (+{installmentDetails.surcharge * 100}%)</span>
                                        <span>+{formatCurrency(surchargeAmount)}</span>
                                    </div>
                                )}
                                <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                                    <span>Do zapłaty</span>
                                    <strong>{formatCurrency(totalAmount)}</strong>
                                </div>
                            </div>

                            <Button
                                className={styles.payButton}
                                onClick={handlePayment}
                                disabled={!selectedMethod || isProcessing}
                                leftIcon={isProcessing ? <Clock size={18} /> : <CreditCard size={18} />}
                            >
                                {isProcessing ? 'Przetwarzanie...' : `Zapłać ${formatCurrency(totalAmount)}`}
                            </Button>

                            <div className={styles.securityNote}>
                                <Shield size={16} />
                                <span>Płatność jest bezpieczna i szyfrowana SSL</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
