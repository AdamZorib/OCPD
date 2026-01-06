'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    ArrowRight,
    Check,
    Building2,
    Shield,
    FileText,
    CheckCircle2,
    ClipboardCheck,
    Calculator,
    Eye,
    Trash2,
    AlertCircle,
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
import { Loader2, Search } from 'lucide-react';
import { GusCompanyData } from '@/lib/gus/types';
import {
    calculatePremium,
    CalculationInput,
    CalculationResult,
    CargoType,
    CARGO_TYPE_MULTIPLIERS,
    PaymentInstallments,
    PAYMENT_INSTALLMENT_SURCHARGE,
    DeductibleLevel,
    DEDUCTIBLE_OPTIONS,
} from '@/lib/underwriting/calculator';
import { CLAUSE_DEFINITIONS } from '@/lib/clauses/definitions';
import {
    CONSENT_DEFINITIONS,
    ConsentState,
    getInitialConsentState,
    validateRequiredConsents,
    getRequiredConsents,
    getOptionalConsents,
} from '@/lib/consents';
import { ClauseType, TerritorialScope, APKData } from '@/types';
import { CoverageVariant, COVERAGE_VARIANTS, getStandardVariants, CUSTOM_VARIANT } from '@/lib/variants';
import { ADRClass, ADR_CLASSES, getADRClassOptions, calculateADRMultiplier, hasDeclinedClasses } from '@/lib/adr-classes';
import IPIDDocument from '@/components/documents/IPIDDocument';
import OWUModal from '@/components/documents/OWUModal';
import { DownloadOfferButton } from '@/components/documents/DownloadOfferButton';
import styles from './page.module.css';

const steps = [
    { id: 1, title: 'Dane klienta', icon: Building2 },
    { id: 2, title: 'Parametry polisy', icon: Shield },
    { id: 3, title: 'Analiza potrzeb (APK)', icon: FileText },
    { id: 4, title: 'Klauzule dodatkowe', icon: CheckCircle2 },
    { id: 5, title: 'Zgody i dokumenty', icon: ClipboardCheck },
    { id: 6, title: 'Podsumowanie', icon: Calculator },
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
    // Address
    clientStreet: string;
    clientHouseNumber: string;
    clientApartmentNumber: string;
    clientCity: string;
    clientPostalCode: string;
    clientVoivodeship: string;
    yearsInBusiness: number;
    fleetSize: number;

    // Step 2: Policy params
    sumInsured: number;
    territorialScope: TerritorialScope;
    policyDuration: number;
    // NEW: Enhanced pricing fields
    cargoType: CargoType;
    subcontractorPercent: number;
    paymentInstallments: PaymentInstallments;
    deductibleLevel: DeductibleLevel;

    // Step 3: APK
    mainCargoTypes: string;
    averageCargoValue: number;
    maxSingleShipmentValue: number;
    monthlyShipments: number;
    claimsLast3Years: number;
    highValueGoods: boolean;
    dangerousGoods: boolean;
    selectedADRClasses: ADRClass[];
    temperatureControlled: boolean;
    internationalTransport: boolean;

    // Step 4: Clauses
    selectedVariant: CoverageVariant;
    selectedClauses: ClauseType[];

    // NEW: Fleet
    vehicles: {
        registrationNumber: string;
        brand: string;
        model: string;
        year: number;
        vin: string;
    }[];
}

const initialFormData: FormData = {
    clientNip: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientStreet: '',
    clientHouseNumber: '',
    clientApartmentNumber: '',
    clientCity: '',
    clientPostalCode: '',
    clientVoivodeship: '',
    yearsInBusiness: 5,
    fleetSize: 10,
    sumInsured: 300000,
    territorialScope: 'EUROPE',
    policyDuration: 12,
    // NEW: Enhanced pricing defaults
    cargoType: 'STANDARD',
    subcontractorPercent: 0,
    paymentInstallments: 1,
    deductibleLevel: 'STANDARD',
    mainCargoTypes: '',
    averageCargoValue: 50000,
    maxSingleShipmentValue: 100000,
    monthlyShipments: 30,
    claimsLast3Years: 0,
    highValueGoods: false,
    dangerousGoods: false,
    selectedADRClasses: [],
    temperatureControlled: false,
    internationalTransport: true,
    selectedVariant: 'STANDARD',
    selectedClauses: ['GROSS_NEGLIGENCE', 'PARKING', 'SUBCONTRACTORS'],
    vehicles: [],
};

export default function NewQuotePage() {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);
    // NEW: Consent and modal state
    const [consents, setConsents] = useState<ConsentState>(getInitialConsentState());
    const [showIPIDModal, setShowIPIDModal] = useState(false);
    const [showOWUModal, setShowOWUModal] = useState(false);
    const [ipidConfirmed, setIpidConfirmed] = useState(false);
    const [owuConfirmed, setOwuConfirmed] = useState(false);
    const [isFetchingGus, setIsFetchingGus] = useState(false);
    const [isFetchingCepik, setIsFetchingCepik] = useState(false);
    const [vehicleSearchQuery, setVehicleSearchQuery] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();

    const fetchGusData = async () => {
        const nip = formData.clientNip.replace(/[^0-9]/g, '');
        if (!nip || nip.length !== 10) {
            alert('Wprowadź poprawny NIP (10 cyfr)');
            return;
        }

        setIsFetchingGus(true);
        try {
            const response = await fetch(`/api/gus/search?nip=${nip}`);
            const json = await response.json();

            if (response.ok && json.data) {
                const data: GusCompanyData = json.data;
                setFormData(prev => ({
                    ...prev,
                    clientName: data.name,
                    clientStreet: data.street || '',
                    clientHouseNumber: data.houseNumber || '',
                    clientApartmentNumber: data.apartmentNumber || '',
                    clientCity: data.city,
                    clientPostalCode: data.postalCode || '',
                    clientVoivodeship: data.voivodeship || '',
                }));
            } else {
                alert('Nie znaleziono firmy w bazie GUS.');
            }
        } catch (error) {
            console.error('Błąd pobierania danych z GUS:', error);
            alert('Wystąpił błąd podczas pobierania danych z GUS.');
        } finally {
            setIsFetchingGus(false);
        }
    };

    const fetchCepikData = async () => {
        if (!vehicleSearchQuery) return;

        setIsFetchingCepik(true);
        try {
            const response = await fetch(`/api/cepik/search?reg=${vehicleSearchQuery}`);
            const json = await response.json();

            if (response.ok && json.data) {
                const data = json.data;
                // Add to fleet if not already there
                const alreadyExists = formData.vehicles.find(v => v.registrationNumber === data.registrationNumber);
                if (alreadyExists) {
                    alert('Pojazd jest już na liście.');
                } else {
                    setFormData(prev => ({
                        ...prev,
                        vehicles: [...prev.vehicles, {
                            registrationNumber: data.registrationNumber,
                            brand: data.brand,
                            model: data.model,
                            year: data.productionYear,
                            vin: data.vin
                        }]
                    }));
                    setVehicleSearchQuery('');
                }
            } else {
                alert('Nie znaleziono pojazdu w bazie CEPiK.');
            }
        } catch (error) {
            console.error('Błąd CEPiK:', error);
            alert('Wystąpił błąd podczas pobierania danych z CEPiK.');
        } finally {
            setIsFetchingCepik(false);
        }
    };

    const removeVehicle = (reg: string) => {
        setFormData(prev => ({
            ...prev,
            vehicles: prev.vehicles.filter(v => v.registrationNumber !== reg)
        }));
    };

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

    const updateConsent = (consentType: string, value: boolean) => {
        setConsents(prev => ({ ...prev, [consentType]: value }));
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
            // NEW: Pass enhanced pricing fields
            cargoType: formData.cargoType,
            subcontractorPercent: formData.subcontractorPercent,
            paymentInstallments: formData.paymentInstallments,
            deductibleLevel: formData.deductibleLevel,
        };

        const result = calculatePremium(input);
        setCalculationResult(result);
    };

    const handleSaveQuote = async () => {
        setIsSaving(true);
        try {
            const response = await fetch('/api/quotes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    clientNIP: formData.clientNip,
                    requestedSumInsured: formData.sumInsured,
                    requestedScope: formData.territorialScope,
                    requestedClauses: formData.selectedClauses,
                    apkData: {
                        mainCargoTypes: formData.mainCargoTypes.split(',').map(s => s.trim()),
                        averageCargoValue: formData.averageCargoValue,
                        maxSingleShipmentValue: formData.maxSingleShipmentValue,
                        monthlyShipments: formData.monthlyShipments,
                        claimsLast3Years: formData.claimsLast3Years,
                        highValueGoods: formData.highValueGoods,
                        dangerousGoods: formData.dangerousGoods,
                        temperatureControlled: formData.temperatureControlled,
                        internationalTransport: formData.internationalTransport,
                    },
                    calculationResult,
                    status: 'CALCULATED',
                }),
            });

            if (response.ok) {
                alert('Wycena została pomyślnie zapisana!');
                router.push('/quotes');
            } else {
                const error = await response.json();
                alert(`Błąd podczas zapisywania: ${error.error || 'Nieznany błąd'}`);
            }
        } catch (error) {
            console.error('Save quote error:', error);
            alert('Wystąpił błąd podczas połączenia z serwerem.');
        } finally {
            setIsSaving(false);
        }
    };

    const canProceedToSummary = () => {
        const { valid } = validateRequiredConsents(consents);
        return valid && ipidConfirmed && owuConfirmed;
    };

    const handleNext = () => {
        if (currentStep < 6) {
            // Validate consents before proceeding to summary
            if (currentStep === 5 && !canProceedToSummary()) {
                alert('Proszę potwierdzić wszystkie wymagane zgody i dokumenty.');
                return;
            }
            setCurrentStep(currentStep + 1);
            if (currentStep === 5) {
                calculateQuote();
            }
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const offerPdfData = calculationResult ? {
        quoteNumber: 'DRAFT/2026/01/06',
        date: new Date().toLocaleDateString('pl-PL'),
        client: {
            name: formData.clientName,
            nip: formData.clientNip,
            address: `${formData.clientStreet} ${formData.clientHouseNumber}${formData.clientApartmentNumber ? '/' + formData.clientApartmentNumber : ''}`,
            city: `${formData.clientPostalCode} ${formData.clientCity}`
        },
        policy: {
            scope: scopeOptions.find(s => s.value === formData.territorialScope)?.label || '',
            sumInsured: formatCurrency(formData.sumInsured),
            duration: `${formData.policyDuration} miesięcy`,
            cargoType: CARGO_TYPE_MULTIPLIERS[formData.cargoType]?.namePL || formData.cargoType
        },
        clauses: formData.selectedClauses.map(c => CLAUSE_DEFINITIONS.find(def => def.type === c)?.namePL || c),
        premium: formatCurrency(calculationResult.breakdown.totalPremium)
    } : null;

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
                                <div className={styles.nipRow}>
                                    <div className={styles.nipInput}>
                                        <Input
                                            label="NIP"
                                            placeholder="Wprowadź NIP klienta"
                                            value={formData.clientNip}
                                            onChange={(e) => updateForm('clientNip', e.target.value)}
                                            hint="Dane zostaną pobrane automatycznie z GUS"
                                        />
                                    </div>
                                    <Button
                                        variant="secondary"
                                        onClick={fetchGusData}
                                        disabled={isFetchingGus || !formData.clientNip}
                                        leftIcon={isFetchingGus ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                                        style={{ marginBottom: '24px' }} // Align with input height
                                    >
                                        {isFetchingGus ? 'Pobieranie...' : 'Pobierz z GUS'}
                                    </Button>
                                </div>
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

                                <div className={styles.addressGrid}>
                                    <Input
                                        label="Ulica"
                                        value={formData.clientStreet}
                                        onChange={(e) => updateForm('clientStreet', e.target.value)}
                                    />
                                    <Input
                                        label="Nr domu"
                                        value={formData.clientHouseNumber}
                                        onChange={(e) => updateForm('clientHouseNumber', e.target.value)}
                                    />
                                    <Input
                                        label="Nr lokalu"
                                        value={formData.clientApartmentNumber}
                                        onChange={(e) => updateForm('clientApartmentNumber', e.target.value)}
                                    />
                                </div>
                                <div className={styles.cityGrid}>
                                    <Input
                                        label="Kod pocztowy"
                                        placeholder="XX-XXX"
                                        value={formData.clientPostalCode}
                                        onChange={(e) => updateForm('clientPostalCode', e.target.value)}
                                    />
                                    <Input
                                        label="Miejscowość"
                                        value={formData.clientCity}
                                        onChange={(e) => updateForm('clientCity', e.target.value)}
                                    />
                                    <Input
                                        label="Województwo"
                                        value={formData.clientVoivodeship}
                                        onChange={(e) => updateForm('clientVoivodeship', e.target.value)}
                                    />
                                </div>
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

                                {/* NEW: Enhanced pricing fields */}
                                <Select
                                    label="Typ ładunku"
                                    options={Object.entries(CARGO_TYPE_MULTIPLIERS).map(([value, info]) => ({
                                        value,
                                        label: `${info.namePL}${info.multiplier !== 1 ? ` (×${info.multiplier})` : ''}`,
                                    }))}
                                    value={formData.cargoType}
                                    onChange={(e) => updateForm('cargoType', e.target.value as CargoType)}
                                />
                                <Input
                                    label="Procent podwykonawców (%)"
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={formData.subcontractorPercent}
                                    onChange={(e) => updateForm('subcontractorPercent', Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                                    hint="Jaki % frachtu wykonują podwykonawcy?"
                                />
                                <Select
                                    label="Płatność w ratach"
                                    options={[
                                        { value: '1', label: 'Jednorazowo (brak dopłaty)' },
                                        { value: '2', label: '2 raty (+3%)' },
                                        { value: '4', label: '4 raty (+5%)' },
                                    ]}
                                    value={formData.paymentInstallments.toString()}
                                    onChange={(e) => updateForm('paymentInstallments', parseInt(e.target.value) as PaymentInstallments)}
                                />
                                <Select
                                    label="Franszyza redukcyjna"
                                    options={Object.entries(DEDUCTIBLE_OPTIONS).map(([value, info]) => ({
                                        value,
                                        label: info.labelPL,
                                    }))}
                                    value={formData.deductibleLevel}
                                    onChange={(e) => updateForm('deductibleLevel', e.target.value as DeductibleLevel)}
                                />

                                <div className={styles.fullWidth}>
                                    <div className={styles.sectionHeader}>
                                        <h3 className={styles.sectionTitle}>Flota pojazdów</h3>
                                        <p className={styles.sectionSubtitle}>Dodaj pojazdy, które mają zostać objęte ochroną</p>
                                    </div>

                                    <div className={styles.vehicleLookup}>
                                        <Input
                                            label="Nr rejestracyjny pojazdu"
                                            placeholder="np. WA12345"
                                            value={vehicleSearchQuery}
                                            onChange={(e) => setVehicleSearchQuery(e.target.value.toUpperCase())}
                                            hint="Wyszukaj pojazd w bazie CEPiK (Testuj: WA12345, KR99887, PO5566A)"
                                        />
                                        <Button
                                            variant="secondary"
                                            onClick={fetchCepikData}
                                            disabled={isFetchingCepik || !vehicleSearchQuery}
                                            leftIcon={isFetchingCepik ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                                        >
                                            Weryfikuj w CEPiK
                                        </Button>
                                    </div>

                                    {formData.vehicles.length > 0 && (
                                        <div className={styles.vehiclesList}>
                                            <table className={styles.vehicleTable}>
                                                <thead>
                                                    <tr>
                                                        <th>Nr rejestracyjny</th>
                                                        <th>Marka i model</th>
                                                        <th>Rok prod.</th>
                                                        <th>VIN</th>
                                                        <th style={{ width: '40px' }}></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {formData.vehicles.map((v) => (
                                                        <tr key={v.registrationNumber}>
                                                            <td className={styles.regCell}>{v.registrationNumber}</td>
                                                            <td>{v.brand} {v.model}</td>
                                                            <td>{v.year}</td>
                                                            <td className={styles.vinCell}>{v.vin}</td>
                                                            <td>
                                                                <button
                                                                    className={styles.removeBtn}
                                                                    onClick={() => removeVehicle(v.registrationNumber)}
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
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
                                                onChange={(e) => {
                                                    updateForm('dangerousGoods', e.target.checked);
                                                    if (!e.target.checked) {
                                                        updateForm('selectedADRClasses', []);
                                                    }
                                                }}
                                            />
                                            <span>Towary niebezpieczne (ADR)</span>
                                        </label>
                                    </div>

                                    {/* ADR Class Selector - shown when dangerousGoods is checked */}
                                    {formData.dangerousGoods && (
                                        <div className={styles.adrSection}>
                                            <h4><AlertCircle size={18} /> Wybierz klasy ADR</h4>
                                            <p className={styles.adrHint}>
                                                Zaznacz wszystkie klasy towarów niebezpiecznych, które przewozisz. Klasy 1 i 7 są automatycznie odrzucane.
                                            </p>
                                            <div className={styles.adrClassGrid}>
                                                {Object.values(ADR_CLASSES).map((adrClass) => {
                                                    const isSelected = formData.selectedADRClasses.includes(adrClass.class);
                                                    return (
                                                        <label
                                                            key={adrClass.class}
                                                            className={`${styles.adrClassItem} ${isSelected ? styles.selected : ''} ${adrClass.isDeclined ? styles.disabled : ''}`}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                disabled={adrClass.isDeclined}
                                                                onChange={(e) => {
                                                                    if (adrClass.isDeclined) return;
                                                                    const newClasses = e.target.checked
                                                                        ? [...formData.selectedADRClasses, adrClass.class]
                                                                        : formData.selectedADRClasses.filter(c => c !== adrClass.class);
                                                                    updateForm('selectedADRClasses', newClasses);
                                                                }}
                                                            />
                                                            <span>{adrClass.class}: {adrClass.namePL}</span>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                            {hasDeclinedClasses(formData.selectedADRClasses).length > 0 && (
                                                <div className={styles.adrWarning}>
                                                    <AlertCircle size={16} />
                                                    Wybrano klasy wykluczone z ubezpieczenia. Proszę usunąć klasy 1 lub 7.
                                                </div>
                                            )}
                                            {formData.selectedADRClasses.length > 0 && (
                                                <div style={{ marginTop: 'var(--spacing-md)', fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                                                    Mnożnik ryzyka ADR: <strong>×{calculateADRMultiplier(formData.selectedADRClasses)}</strong>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className={styles.checkboxGrid}>
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
                            <CardTitle>Wariant i klauzule dodatkowe</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {/* Variant Selection Cards */}
                            <div className={styles.variantSection}>
                                <h4 className={styles.sectionSubtitle}>Wybierz wariant ochrony</h4>
                                <div className={styles.variantGrid}>
                                    {getStandardVariants().map((variant) => {
                                        const isSelected = formData.selectedVariant === variant.type;
                                        return (
                                            <div
                                                key={variant.type}
                                                className={`${styles.variantCard} ${isSelected ? styles.selected : ''}`}
                                                style={{ borderColor: isSelected ? variant.color : undefined }}
                                                onClick={() => {
                                                    updateForm('selectedVariant', variant.type);
                                                    updateForm('selectedClauses', [...variant.includedClauses]);
                                                }}
                                            >
                                                {variant.recommended && (
                                                    <Badge variant="accent" size="sm" className={styles.variantBadge}>
                                                        Polecany
                                                    </Badge>
                                                )}
                                                <h3 style={{ color: variant.color }}>{variant.namePL}</h3>
                                                <p className={styles.variantDesc}>{variant.descriptionPL}</p>
                                                <div className={styles.variantClauses}>
                                                    {variant.includedClauses.map(clauseType => {
                                                        const clauseDef = CLAUSE_DEFINITIONS.find(c => c.type === clauseType);
                                                        return (
                                                            <span key={clauseType} className={styles.variantClauseTag}>
                                                                <Check size={12} /> {clauseDef?.namePL || clauseType}
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                                {variant.bundleDiscount > 0 && (
                                                    <div className={styles.variantDiscount}>
                                                        -{variant.bundleDiscount * 100}% rabat pakietowy
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                    {/* Custom option */}
                                    <div
                                        className={`${styles.variantCard} ${formData.selectedVariant === 'CUSTOM' ? styles.selected : ''}`}
                                        onClick={() => updateForm('selectedVariant', 'CUSTOM')}
                                    >
                                        <h3>{CUSTOM_VARIANT.namePL}</h3>
                                        <p className={styles.variantDesc}>{CUSTOM_VARIANT.descriptionPL}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Individual clause selection - shown when CUSTOM or for advanced users */}
                            {formData.selectedVariant === 'CUSTOM' && (
                                <>
                                    <h4 className={styles.sectionSubtitle} style={{ marginTop: '2rem' }}>
                                        Wybierz klauzule indywidualnie
                                    </h4>
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
                                </>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Step 5: Consents and Documents (NEW) */}
                {currentStep === 5 && (
                    <Card padding="lg" className={styles.formCard}>
                        <CardHeader>
                            <CardTitle>Zgody i dokumenty</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {/* IDD Documents */}
                            <div className={styles.documentsSection}>
                                <h4 className={styles.sectionSubtitle}>Dokumenty ubezpieczeniowe</h4>
                                <p className={styles.sectionHint}>
                                    Zgodnie z Dyrektywą IDD, przed zawarciem umowy należy zapoznać się z poniższymi dokumentami.
                                </p>
                                <div className={styles.documentButtons}>
                                    <Button
                                        variant={ipidConfirmed ? 'secondary' : 'primary'}
                                        leftIcon={ipidConfirmed ? <Check size={18} /> : <Eye size={18} />}
                                        onClick={() => setShowIPIDModal(true)}
                                    >
                                        {ipidConfirmed ? 'IPID potwierdzone' : 'Zobacz Kartę Produktu (IPID)'}
                                    </Button>
                                    <Button
                                        variant={owuConfirmed ? 'secondary' : 'primary'}
                                        leftIcon={owuConfirmed ? <Check size={18} /> : <Eye size={18} />}
                                        onClick={() => setShowOWUModal(true)}
                                    >
                                        {owuConfirmed ? 'OWU potwierdzone' : 'Zobacz OWU'}
                                    </Button>
                                </div>
                            </div>

                            {/* Required consents */}
                            <div className={styles.consentsSection}>
                                <h4 className={styles.sectionSubtitle}>Wymagane zgody</h4>
                                <div className={styles.consentsList}>
                                    {getRequiredConsents().map((consent) => (
                                        <label key={consent.type} className={styles.consentItem}>
                                            <input
                                                type="checkbox"
                                                checked={consents[consent.type] || false}
                                                onChange={(e) => updateConsent(consent.type, e.target.checked)}
                                            />
                                            <div className={styles.consentContent}>
                                                <span className={styles.consentLabel}>
                                                    {consent.labelPL}
                                                    <Badge variant="danger" size="sm">Wymagane</Badge>
                                                </span>
                                                <span className={styles.consentDescription}>
                                                    {consent.descriptionPL}
                                                </span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Optional consents */}
                            <div className={styles.consentsSection}>
                                <h4 className={styles.sectionSubtitle}>Zgody opcjonalne</h4>
                                <div className={styles.consentsList}>
                                    {getOptionalConsents().map((consent) => (
                                        <label key={consent.type} className={styles.consentItem}>
                                            <input
                                                type="checkbox"
                                                checked={consents[consent.type] || false}
                                                onChange={(e) => updateConsent(consent.type, e.target.checked)}
                                            />
                                            <div className={styles.consentContent}>
                                                <span className={styles.consentLabel}>{consent.labelPL}</span>
                                                <span className={styles.consentDescription}>
                                                    {consent.descriptionPL}
                                                </span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Validation message */}
                            {!canProceedToSummary() && (
                                <div className={styles.consentWarning}>
                                    <AlertCircle size={18} />
                                    <span>Aby kontynuować, należy potwierdzić wszystkie wymagane zgody i przejrzeć dokumenty IPID oraz OWU.</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Step 6: Summary (was Step 5) */}
                {currentStep === 6 && calculationResult && (
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

                {currentStep < 6 ? (
                    <Button
                        rightIcon={<ArrowRight size={18} />}
                        onClick={handleNext}
                        disabled={currentStep === 5 && !canProceedToSummary()}
                    >
                        {currentStep === 5 ? 'Przejdź do podsumowania' : 'Dalej'}
                    </Button>
                ) : (
                    <>
                        {offerPdfData && <DownloadOfferButton data={offerPdfData} />}
                        <Button
                            leftIcon={<Check size={18} />}
                            onClick={handleSaveQuote}
                            isLoading={isSaving}
                            disabled={isSaving}
                        >
                            Zapisz wycenę
                        </Button>
                    </>
                )}
            </div>

            {/* IPID Modal */}
            {showIPIDModal && (
                <IPIDDocument
                    isModal={true}
                    onClose={() => {
                        setShowIPIDModal(false);
                        setIpidConfirmed(true);
                    }}
                />
            )}

            {/* OWU Modal */}
            {showOWUModal && (
                <OWUModal
                    onClose={() => setShowOWUModal(false)}
                    onConfirm={() => setOwuConfirmed(true)}
                />
            )}
        </div>
    );
}
