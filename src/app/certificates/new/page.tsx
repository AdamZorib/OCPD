'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FileCheck, AlertTriangle } from 'lucide-react';
import { Card, Button, Input, Select } from '@/components/ui';
import styles from '../page.module.css';

interface Policy {
    id: string;
    policyNumber: string;
    clientId: string;
    clientName: string | null;
    status: string;
    sumInsured: string;
}

interface FormData {
    policyId: string;
    clientId: string;
    cargoDescription: string;
    cargoValue: string;
    route: string;
    transportDate: string;
}

// Get today's date in YYYY-MM-DD format (UTC to avoid timezone issues)
function getTodayUTC(): string {
    return new Date().toISOString().slice(0, 10);
}

// Check if form has unsaved changes
function hasFormChanges(formData: FormData): boolean {
    return !!(formData.cargoDescription || formData.cargoValue || formData.route);
}

export default function NewCertificatePage() {
    const router = useRouter();
    const [policies, setPolicies] = useState<Policy[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [formData, setFormData] = useState<FormData>({
        policyId: '',
        clientId: '',
        cargoDescription: '',
        cargoValue: '',
        route: '',
        transportDate: getTodayUTC()
    });

    // Fetch active policies on mount
    useEffect(() => {
        const fetchPolicies = async () => {
            try {
                const response = await fetch('/api/policies?status=ACTIVE');
                if (!response.ok) throw new Error('Failed to fetch policies');
                const result = await response.json();
                setPolicies(result.data || []);
                setFetchError(null);
            } catch {
                setFetchError('Nie udało się pobrać polis');
            } finally {
                setLoading(false);
            }
        };
        fetchPolicies();
    }, []);

    // Warn user before navigating away with unsaved changes
    const handleBeforeUnload = useCallback((e: BeforeUnloadEvent) => {
        if (hasFormChanges(formData)) {
            e.preventDefault();
            e.returnValue = '';
        }
    }, [formData]);

    useEffect(() => {
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [handleBeforeUnload]);

    const selectedPolicy = policies.find(p => p.id === formData.policyId);

    const handlePolicyChange = (policyId: string) => {
        const policy = policies.find(p => p.id === policyId);
        setFormData(prev => ({
            ...prev,
            policyId,
            clientId: policy?.clientId || ''
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            const response = await fetch('/api/certificates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    cargoValue: parseFloat(formData.cargoValue)
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Błąd podczas tworzenia certyfikatu');
            }

            router.push('/certificates');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Nieznany błąd');
        } finally {
            setSubmitting(false);
        }
    };

    // Handle confirmed navigation (when user wants to leave despite changes)
    const handleBack = () => {
        if (hasFormChanges(formData)) {
            const confirmed = window.confirm('Masz niezapisane zmiany. Czy na pewno chcesz wyjść?');
            if (!confirmed) return;
        }
        router.back();
    };

    // Loading state
    if (loading) {
        return (
            <div className={styles.page}>
                <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
                    <p>Ładowanie...</p>
                </div>
            </div>
        );
    }

    // Fetch error with no data
    if (fetchError && policies.length === 0) {
        return (
            <div className={styles.page}>
                <header className={styles.header}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <Button variant="ghost" size="sm" onClick={() => router.back()}>
                            <ArrowLeft size={18} />
                        </Button>
                        <div>
                            <h1 className={styles.title}>Nowy certyfikat</h1>
                            <p className={styles.subtitle}>Wystaw certyfikat przewozowy</p>
                        </div>
                    </div>
                </header>

                <Card style={{ maxWidth: '600px', padding: '48px', textAlign: 'center' }}>
                    <AlertTriangle size={48} color="#ef4444" style={{ marginBottom: '16px' }} />
                    <p style={{ color: '#ef4444', marginBottom: '16px' }}>{fetchError}</p>
                    <Button variant="secondary" onClick={() => window.location.reload()}>
                        Spróbuj ponownie
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Button variant="ghost" size="sm" onClick={handleBack}>
                        <ArrowLeft size={18} />
                    </Button>
                    <div>
                        <h1 className={styles.title}>Nowy certyfikat</h1>
                        <p className={styles.subtitle}>Wystaw certyfikat przewozowy</p>
                    </div>
                </div>
            </header>

            <Card style={{ maxWidth: '600px', padding: '24px' }}>
                {error && (
                    <div style={{
                        padding: '12px',
                        marginBottom: '16px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '8px',
                        color: '#ef4444'
                    }}>
                        {error}
                    </div>
                )}

                {policies.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '24px' }}>
                        <p style={{ marginBottom: '16px', color: 'var(--color-text-secondary)' }}>
                            Brak aktywnych polis. Aby wystawić certyfikat, najpierw utwórz aktywną polisę.
                        </p>
                        <Button variant="primary" onClick={() => router.push('/policies')}>
                            Przejdź do polis
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <Select
                                label="Polisa"
                                value={formData.policyId}
                                onChange={(e) => handlePolicyChange(e.target.value)}
                                options={[
                                    { value: '', label: 'Wybierz polisę...' },
                                    ...policies.map(p => ({
                                        value: p.id,
                                        label: `${p.policyNumber} - ${p.clientName || 'Brak nazwy'}`
                                    }))
                                ]}
                                required
                            />

                            {selectedPolicy && (
                                <div style={{
                                    padding: '12px',
                                    background: 'rgba(99, 102, 241, 0.1)',
                                    borderRadius: '8px',
                                    fontSize: '14px'
                                }}>
                                    <strong>Suma ubezpieczenia:</strong> {Number(selectedPolicy.sumInsured).toLocaleString('pl-PL')} PLN
                                    <br />
                                    <span style={{ color: 'var(--color-text-secondary)', fontSize: '12px' }}>
                                        Wartość ładunku nie może przekroczyć tej kwoty
                                    </span>
                                </div>
                            )}

                            <Input
                                label="Opis ładunku"
                                value={formData.cargoDescription}
                                onChange={(e) => setFormData(prev => ({ ...prev, cargoDescription: e.target.value }))}
                                placeholder="np. Elektronika - telewizory LCD"
                                required
                                minLength={3}
                            />

                            <Input
                                label="Wartość ładunku (PLN)"
                                type="number"
                                value={formData.cargoValue}
                                onChange={(e) => setFormData(prev => ({ ...prev, cargoValue: e.target.value }))}
                                placeholder="50000"
                                required
                                min={1}
                                max={50000000}
                            />

                            <Input
                                label="Trasa"
                                value={formData.route}
                                onChange={(e) => setFormData(prev => ({ ...prev, route: e.target.value }))}
                                placeholder="np. Warszawa -> Berlin"
                                required
                                minLength={3}
                            />

                            <Input
                                label="Data transportu"
                                type="date"
                                value={formData.transportDate}
                                onChange={(e) => setFormData(prev => ({ ...prev, transportDate: e.target.value }))}
                                required
                            />

                            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={handleBack}
                                >
                                    Anuluj
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    disabled={submitting || !formData.policyId}
                                >
                                    <FileCheck size={18} style={{ marginRight: 8 }} />
                                    {submitting ? 'Tworzenie...' : 'Wystaw certyfikat'}
                                </Button>
                            </div>
                        </div>
                    </form>
                )}
            </Card>
        </div>
    );
}
