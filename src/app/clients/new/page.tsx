'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Building2,
    User,
    Phone,
    Mail,
    MapPin,
    Calendar,
    Truck,
    Save,
    Loader2,
} from 'lucide-react';
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    Button,
    Input,
    Select,
} from '@/components/ui';
import styles from './page.module.css';

const scopeOptions = [
    { value: 'POLAND', label: 'Polska' },
    { value: 'EUROPE', label: 'Europa' },
    { value: 'WORLD', label: 'Świat' },
];

export default function NewClientPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        nip: '',
        name: '',
        email: '',
        phone: '',
        city: '',
        street: '',
        postalCode: '',
        yearsInBusiness: '',
        fleetSize: '',
        mainScope: 'POLAND',
    });

    const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }));
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.nip || !formData.name || !formData.email) {
            setError('NIP, nazwa firmy i email są wymagane.');
            return;
        }

        if (formData.nip.length !== 10 || !/^\d+$/.test(formData.nip)) {
            setError('NIP musi składać się z 10 cyfr.');
            return;
        }

        if (!formData.email.includes('@')) {
            setError('Podaj prawidłowy adres email.');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const response = await fetch('/api/clients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nip: formData.nip,
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    yearsInBusiness: parseInt(formData.yearsInBusiness) || 1,
                    regonData: {
                        address: {
                            city: formData.city,
                            street: formData.street,
                            postalCode: formData.postalCode,
                        },
                    },
                    riskProfile: {
                        mainRoutes: [formData.mainScope],
                        yearsInBusiness: parseInt(formData.yearsInBusiness) || 1,
                    },
                    fleet: [],
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Błąd podczas zapisywania');
            }

            // Success - redirect to clients list
            router.push('/clients');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Wystąpił błąd');
        } finally {
            setIsSubmitting(false);
        }
    };

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
                        <div className={styles.headerIcon}>
                            <Building2 size={32} />
                        </div>
                        <div>
                            <h1 className={styles.title}>Nowy klient</h1>
                            <p className={styles.subtitle}>Dodaj nowego przewoźnika do systemu</p>
                        </div>
                    </div>
                </div>
            </header>

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGrid}>
                    {/* Company Data */}
                    <Card padding="lg">
                        <CardHeader>
                            <CardTitle>
                                <Building2 size={20} /> Dane firmy
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className={styles.fieldGrid}>
                                <Input
                                    label="NIP *"
                                    placeholder="1234567890"
                                    value={formData.nip}
                                    onChange={handleChange('nip')}
                                    maxLength={10}
                                />
                                <Input
                                    label="Nazwa firmy *"
                                    placeholder="Transport Sp. z o.o."
                                    value={formData.name}
                                    onChange={handleChange('name')}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contact */}
                    <Card padding="lg">
                        <CardHeader>
                            <CardTitle>
                                <User size={20} /> Kontakt
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className={styles.fieldGrid}>
                                <Input
                                    label="Email *"
                                    type="email"
                                    placeholder="kontakt@firma.pl"
                                    value={formData.email}
                                    onChange={handleChange('email')}
                                    leftIcon={<Mail size={16} />}
                                />
                                <Input
                                    label="Telefon"
                                    placeholder="+48 600 123 456"
                                    value={formData.phone}
                                    onChange={handleChange('phone')}
                                    leftIcon={<Phone size={16} />}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Address */}
                    <Card padding="lg">
                        <CardHeader>
                            <CardTitle>
                                <MapPin size={20} /> Adres
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className={styles.fieldGrid}>
                                <Input
                                    label="Miasto"
                                    placeholder="Warszawa"
                                    value={formData.city}
                                    onChange={handleChange('city')}
                                />
                                <Input
                                    label="Ulica"
                                    placeholder="ul. Transportowa 1"
                                    value={formData.street}
                                    onChange={handleChange('street')}
                                />
                                <Input
                                    label="Kod pocztowy"
                                    placeholder="00-001"
                                    value={formData.postalCode}
                                    onChange={handleChange('postalCode')}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Business Info */}
                    <Card padding="lg">
                        <CardHeader>
                            <CardTitle>
                                <Truck size={20} /> Informacje o działalności
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className={styles.fieldGrid}>
                                <Input
                                    label="Lata w branży"
                                    type="number"
                                    min="0"
                                    placeholder="5"
                                    value={formData.yearsInBusiness}
                                    onChange={handleChange('yearsInBusiness')}
                                    leftIcon={<Calendar size={16} />}
                                />
                                <Input
                                    label="Wielkość floty"
                                    type="number"
                                    min="1"
                                    placeholder="10"
                                    value={formData.fleetSize}
                                    onChange={handleChange('fleetSize')}
                                    leftIcon={<Truck size={16} />}
                                />
                                <Select
                                    label="Główny zakres terytorialny"
                                    options={scopeOptions}
                                    value={formData.mainScope}
                                    onChange={handleChange('mainScope')}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Error */}
                {error && (
                    <div className={styles.error}>
                        {error}
                    </div>
                )}

                {/* Actions */}
                <div className={styles.actions}>
                    <Link href="/clients">
                        <Button type="button" variant="ghost">
                            Anuluj
                        </Button>
                    </Link>
                    <Button
                        type="submit"
                        leftIcon={isSubmitting ? <Loader2 size={18} className={styles.spinner} /> : <Save size={18} />}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Zapisywanie...' : 'Zapisz klienta'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
