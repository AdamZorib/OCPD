'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft,
    ArrowRight,
    Check,
    Building2,
    Shield,
    FileText,
    Calculator,
    AlertCircle,
    CheckCircle2,
} from 'lucide-react';
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    Button,
    Input,
    Select,
    Badge,
} from '@/components/ui';
import { calculatePremium, CalculationInput, CalculationResult } from '@/lib/underwriting/calculator';
import { CLAUSE_DEFINITIONS } from '@/lib/clauses/definitions';
import { ClauseType, TerritorialScope, APKData } from '@/types';
import styles from './page.module.css';

const steps = [
    { id: 1, title: 'Dane klienta', icon: Building2 },
    { id: 2, title: 'Parametry polisy', icon: Shield },
    { id: 3, title: 'Analiza potrzeb (APK)', icon: FileText },
    { id: 4, title: 'Klauzule dodatkowe', icon: CheckCircle2 },
    { id: 5, title: 'Podsumowanie', icon: Calculator },
];

const scopeOptions = [
    { value: 'POLAND', label: 'Polska' },
    { value: 'EUROPE', label: 'Europa' },
    { value: 'WORLD', label: 'Świat' },
];

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pl-PL', {
        style: 'currency',
        currency: 'PLN',
        minimumFractionDigits: 0,
    }).format(value);
};

interface FormData {
    // Step 1: Client
    clientNip: string;
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    yearsInBusiness: number;
    fleetSize: number;

    // Step 2: Policy params
    sumInsured: number;
    territorialScope: TerritorialScope;
    policyDuration: number;

    // Step 3: APK
    mainCargoTypes: string;
    averageCargoValue: number;
    maxSingleShipmentValue: number;
    monthlyShipments: number;
    claimsLast3Years: number;
    highValueGoods: boolean;
    dangerousGoods: boolean;
    temperatureControlled: boolean;
    internationalTransport: boolean;

    // Step 4: Clauses
    selectedClauses: ClauseType[];
}

const initialFormData: FormData = {
    clientNip: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    yearsInBusiness: 5,
    fleetSize: 10,
    sumInsured: 300000,
    territorialScope: 'EUROPE',
    policyDuration: 12,
    mainCargoTypes: '',
    averageCargoValue: 50000,
    maxSingleShipmentValue: 100000,
    monthlyShipments: 30,
    claimsLast3Years: 0,
    highValueGoods: false,
    dangerousGoods: false,
    temperatureControlled: false,
    internationalTransport: true,
    selectedClauses: ['GROSS_NEGLIGENCE'],
};

export default function NewQuotePage() {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);

    const updateForm = <K extends keyof FormData>(key: K, value: FormData[K]) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const toggleClause = (clauseType: ClauseType) => {
        setFormData((prev) => ({
            ...prev,
            selectedClauses: prev.selectedClauses.includes(clauseType)
                ? prev.selectedClauses.filter((c) => c !== clauseType)
                : [...prev.selectedClauses, clauseType],
        }));
    };

    const calculateQuote = () => {
        const input: CalculationInput = {
            sumInsured: formData.sumInsured,
            territorialScope: formData.territorialScope,
            selectedClauses: formData.selectedClauses,
            apkData: {
                mainCargoTypes: formData.mainCargoTypes.split(',').map((s) => s.trim()),
                averageCargoValue: formData.averageCargoValue,
                maxSingleShipmentValue: formData.maxSingleShipmentValue,
                monthlyShipments: formData.monthlyShipments,
                claimsLast3Years: formData.claimsLast3Years,
                highValueGoods: formData.highValueGoods,
                dangerousGoods: formData.dangerousGoods,
                temperatureControlled: formData.temperatureControlled,
                internationalTransport: formData.internationalTransport,
            },
            yearsInBusiness: formData.yearsInBusiness,
            fleetSize: formData.fleetSize,
        };

        const result = calculatePremium(input);
        setCalculationResult(result);
    };

    const handleNext = () => {
        if (currentStep < 5) {
            setCurrentStep(currentStep + 1);
            if (currentStep === 4) {
                calculateQuote();
            }
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    return (
        <div className={styles.page}>
            {/* Header */}
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <Link href="/quotes" className={styles.backLink}>
                        <ArrowLeft size={20} />
                        <span>Wyceny</span>
                    </Link>
                    <h1 className={styles.title}>Nowa wycena OCPD</h1>
                </div>
            </header>

            {/* Steps */}
            <nav className={styles.steps}>
                {steps.map((step, index) => {
                    const Icon = step.icon;
                    const isActive = step.id === currentStep;
                    const isCompleted = step.id < currentStep;

                    return (
                        <div
                            key={step.id}
                            className={`${styles.step} ${isActive ? styles.active : ''} ${isCompleted ? styles.completed : ''}`}
                        >
                            <div className={styles.stepIcon}>
                                {isCompleted ? <Check size={18} /> : <Icon size={18} />}
                            </div>
                            <span className={styles.stepTitle}>{step.title}</span>
                            {index < steps.length - 1 && <div className={styles.stepLine} />}
                        </div>
                    );
                })}
            </nav>

            {/* Form Content */}
            <div className={styles.content}>
                {/* Step 1: Client Data */}
                {currentStep === 1 && (
                    <Card padding="lg" className={styles.formCard}>
                        <CardHeader>
                            <CardTitle>Dane klienta</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className={styles.formGrid}>
                                <Input
                                    label="NIP"
                                    placeholder="Wprowadź NIP klienta"
                                    value={formData.clientNip}
                                    onChange={(e) => updateForm('clientNip', e.target.value)}
                                    hint="Dane zostaną pobrane automatycznie z REGON"
                                />
                                <Input
                                    label="Nazwa firmy"
                                    placeholder="Nazwa klienta"
                                    value={formData.clientName}
                                    onChange={(e) => updateForm('clientName', e.target.value)}
                                />
                                <Input
                                    label="Email"
                                    type="email"
                                    placeholder="kontakt@firma.pl"
                                    value={formData.clientEmail}
                                    onChange={(e) => updateForm('clientEmail', e.target.value)}
                                />
                                <Input
                                    label="Telefon"
                                    placeholder="+48 XXX XXX XXX"
                                    value={formData.clientPhone}
                                    onChange={(e) => updateForm('clientPhone', e.target.value)}
                                />
                                <Input
                                    label="Lata w branży"
                                    type="number"
                                    min={0}
                                    value={formData.yearsInBusiness}
                                    onChange={(e) => updateForm('yearsInBusiness', parseInt(e.target.value) || 0)}
                                />
                                <Input
                                    label="Wielkość floty (pojazdy)"
                                    type="number"
                                    min={1}
                                    value={formData.fleetSize}
                                    onChange={(e) => updateForm('fleetSize', parseInt(e.target.value) || 1)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Step 2: Policy Parameters */}
                {currentStep === 2 && (
                    <Card padding="lg" className={styles.formCard}>
                        <CardHeader>
                            <CardTitle>Parametry polisy</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className={styles.formGrid}>
                                <div className={styles.fullWidth}>
                                    <label className={styles.label}>Suma ubezpieczenia</label>
                                    <div className={styles.sumOptions}>
                                        {[100000, 200000, 300000, 500000, 1000000, 2000000].map((sum) => (
                                            <button
                                                key={sum}
                                                className={`${styles.sumOption} ${formData.sumInsured === sum ? styles.selected : ''}`}
                                                onClick={() => updateForm('sumInsured', sum)}
                                            >
                                                {formatCurrency(sum)}
                                            </button>
                                        ))}
                                    </div>
                                    <Input
                                        label="Lub wpisz własną kwotę"
                                        type="number"
                                        min={50000}
                                        value={formData.sumInsured}
                                        onChange={(e) => updateForm('sumInsured', parseInt(e.target.value) || 50000)}
                                    />
                                </div>
                                <Select
                                    label="Zakres terytorialny"
                                    options={scopeOptions}
                                    value={formData.territorialScope}
                                    onChange={(e) => updateForm('territorialScope', e.target.value as TerritorialScope)}
                                />
                                <Select
                                    label="Okres ubezpieczenia"
                                    options={[
                                        { value: '12', label: '12 miesięcy' },
                                        { value: '6', label: '6 miesięcy' },
                                        { value: '3', label: '3 miesiące' },
                                    ]}
                                    value={formData.policyDuration.toString()}
                                    onChange={(e) => updateForm('policyDuration', parseInt(e.target.value))}
                                />
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Step 3: APK */}
                {currentStep === 3 && (
                    <Card padding="lg" className={styles.formCard}>
                        <CardHeader>
                            <CardTitle>Analiza Potrzeb Klienta (APK)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className={styles.formGrid}>
                                <div className={styles.fullWidth}>
                                    <Input
                                        label="Główne typy ładunków"
                                        placeholder="np. Elektronika, AGD, Żywność"
                                        value={formData.mainCargoTypes}
                                        onChange={(e) => updateForm('mainCargoTypes', e.target.value)}
                                        hint="Oddziel przecinkami"
                                    />
                                </div>
                                <Input
                                    label="Średnia wartość ładunku (PLN)"
                                    type="number"
                                    value={formData.averageCargoValue}
                                    onChange={(e) => updateForm('averageCargoValue', parseInt(e.target.value) || 0)}
                                />
                                <Input
                                    label="Maksymalna wartość pojedynczego transportu (PLN)"
                                    type="number"
                                    value={formData.maxSingleShipmentValue}
                                    onChange={(e) => updateForm('maxSingleShipmentValue', parseInt(e.target.value) || 0)}
                                />
                                <Input
                                    label="Liczba transportów miesięcznie"
                                    type="number"
                                    value={formData.monthlyShipments}
                                    onChange={(e) => updateForm('monthlyShipments', parseInt(e.target.value) || 0)}
                                />
                                <Input
                                    label="Liczba szkód w ostatnich 3 latach"
                                    type="number"
                                    min={0}
                                    value={formData.claimsLast3Years}
                                    onChange={(e) => updateForm('claimsLast3Years', parseInt(e.target.value) || 0)}
                                />

                                <div className={styles.fullWidth}>
                                    <label className={styles.label}>Charakterystyka działalności</label>
                                    <div className={styles.checkboxGrid}>
                                        <label className={styles.checkbox}>
                                            <input
                                                type="checkbox"
                                                checked={formData.highValueGoods}
                                                onChange={(e) => updateForm('highValueGoods', e.target.checked)}
                                            />
                                            <span>Towary wysokiej wartości</span>
                                        </label>
                                        <label className={styles.checkbox}>
                                            <input
                                                type="checkbox"
                                                checked={formData.dangerousGoods}
                                                onChange={(e) => updateForm('dangerousGoods', e.target.checked)}
                                            />
                                            <span>Towary niebezpieczne (ADR)</span>
                                        </label>
                                        <label className={styles.checkbox}>
                                            <input
                                                type="checkbox"
                                                checked={formData.temperatureControlled}
                                                onChange={(e) => updateForm('temperatureControlled', e.target.checked)}
                                            />
                                            <span>Transport chłodniczy</span>
                                        </label>
                                        <label className={styles.checkbox}>
                                            <input
                                                type="checkbox"
                                                checked={formData.internationalTransport}
                                                onChange={(e) => updateForm('internationalTransport', e.target.checked)}
                                            />
                                            <span>Transport międzynarodowy</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Step 4: Clauses */}
                {currentStep === 4 && (
                    <Card padding="lg" className={styles.formCard}>
                        <CardHeader>
                            <CardTitle>Klauzule dodatkowe</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className={styles.clausesGrid}>
                                {CLAUSE_DEFINITIONS.map((clause) => {
                                    const isSelected = formData.selectedClauses.includes(clause.type);
                                    return (
                                        <div
                                            key={clause.type}
                                            className={`${styles.clauseCard} ${isSelected ? styles.selected : ''}`}
                                            onClick={() => toggleClause(clause.type)}
                                        >
                                            <div className={styles.clauseHeader}>
                                                <div className={styles.clauseCheck}>
                                                    {isSelected && <Check size={16} />}
                                                </div>
                                                <Badge
                                                    variant={
                                                        clause.riskCategory === 'HIGH' ? 'danger' :
                                                            clause.riskCategory === 'ELEVATED' ? 'warning' : 'default'
                                                    }
                                                    size="sm"
                                                >
                                                    {clause.riskCategory === 'HIGH' ? 'Wysokie' :
                                                        clause.riskCategory === 'ELEVATED' ? 'Podwyższone' : 'Standardowe'}
                                                </Badge>
                                            </div>
                                            <h4 className={styles.clauseName}>{clause.namePL}</h4>
                                            <p className={styles.clauseDesc}>{clause.descriptionPL}</p>
                                            <div className={styles.clauseMeta}>
                                                <span>Sublimit: {clause.defaultSublimitPercentage}%</span>
                                                <span>+{clause.basePremiumRate}% składki</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Step 5: Summary */}
                {currentStep === 5 && calculationResult && (
                    <div className={styles.summaryGrid}>
                        <Card padding="lg">
                            <CardHeader>
                                <CardTitle>Kalkulacja składki</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className={styles.premiumDisplay}>
                                    <span className={styles.premiumLabel}>Składka roczna</span>
                                    <span className={styles.premiumValue}>
                                        {formatCurrency(calculationResult.breakdown.totalPremium)}
                                    </span>
                                </div>

                                <div className={styles.breakdownSection}>
                                    <h4>Składniki składki</h4>
                                    <div className={styles.breakdownItem}>
                                        <span>Składka bazowa</span>
                                        <span>{formatCurrency(calculationResult.breakdown.basePremium)}</span>
                                    </div>
                                    <div className={styles.breakdownItem}>
                                        <span>Modyfikator ryzyka</span>
                                        <span>×{calculationResult.breakdown.riskModifier.toFixed(2)}</span>
                                    </div>
                                    <div className={styles.breakdownItem}>
                                        <span>Bonus/Malus</span>
                                        <span>×{calculationResult.breakdown.bonusMalusModifier.toFixed(2)}</span>
                                    </div>
                                    {Object.entries(calculationResult.breakdown.clausesPremium).map(([clause, premium]) => (
                                        <div key={clause} className={styles.breakdownItem}>
                                            <span>{CLAUSE_DEFINITIONS.find(c => c.type === clause)?.namePL}</span>
                                            <span>+{formatCurrency(premium as number)}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className={styles.riskAssessment}>
                                    <h4>Ocena ryzyka</h4>
                                    <Badge
                                        variant={
                                            calculationResult.riskLevel === 'LOW' ? 'success' :
                                                calculationResult.riskLevel === 'MEDIUM' ? 'warning' :
                                                    'danger'
                                        }
                                        size="md"
                                    >
                                        {calculationResult.riskLevel === 'LOW' ? 'Niskie' :
                                            calculationResult.riskLevel === 'MEDIUM' ? 'Średnie' :
                                                calculationResult.riskLevel === 'HIGH' ? 'Wysokie' : 'Bardzo wysokie'}
                                    </Badge>
                                </div>

                                {!calculationResult.isAutoApproved && (
                                    <div className={styles.referralAlert}>
                                        <AlertCircle size={20} />
                                        <div>
                                            <strong>Wymaga akceptacji underwritera</strong>
                                            <ul>
                                                {calculationResult.referralReasons.map((reason, i) => (
                                                    <li key={i}>{reason}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card padding="lg">
                            <CardHeader>
                                <CardTitle>Podsumowanie</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className={styles.summarySection}>
                                    <h4>Klient</h4>
                                    <p>{formData.clientName || 'Nowy klient'}</p>
                                    <p className={styles.summaryMeta}>NIP: {formData.clientNip || '—'}</p>
                                </div>

                                <div className={styles.summarySection}>
                                    <h4>Parametry polisy</h4>
                                    <div className={styles.summaryRow}>
                                        <span>Suma ubezpieczenia</span>
                                        <span>{formatCurrency(formData.sumInsured)}</span>
                                    </div>
                                    <div className={styles.summaryRow}>
                                        <span>Zakres terytorialny</span>
                                        <span>{scopeOptions.find(s => s.value === formData.territorialScope)?.label}</span>
                                    </div>
                                    <div className={styles.summaryRow}>
                                        <span>Okres</span>
                                        <span>{formData.policyDuration} miesięcy</span>
                                    </div>
                                </div>

                                <div className={styles.summarySection}>
                                    <h4>Wybrane klauzule ({formData.selectedClauses.length})</h4>
                                    <div className={styles.clausesList}>
                                        {formData.selectedClauses.map((clause) => (
                                            <Badge key={clause} variant="accent" size="sm">
                                                {CLAUSE_DEFINITIONS.find(c => c.type === clause)?.namePL}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <div className={styles.navigation}>
                <Button
                    variant="secondary"
                    leftIcon={<ArrowLeft size={18} />}
                    onClick={handleBack}
                    disabled={currentStep === 1}
                >
                    Wstecz
                </Button>

                {currentStep < 5 ? (
                    <Button
                        rightIcon={<ArrowRight size={18} />}
                        onClick={handleNext}
                    >
                        Dalej
                    </Button>
                ) : (
                    <Button
                        leftIcon={<Check size={18} />}
                        onClick={() => alert('Wycena zapisana!')}
                    >
                        Zapisz wycenę
                    </Button>
                )}
            </div>
        </div>
    );
}
