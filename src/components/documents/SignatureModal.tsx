'use client';

import React, { useState } from 'react';
import {
    X,
    ShieldCheck,
    Lock,
    Loader2,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    Button
} from '@/components/ui';
import styles from './SignatureModal.module.css';

interface SignatureModalProps {
    documentTitle: string;
    signingUrl: string;
    onClose: () => void;
    onSigned: () => void;
}

export const SignatureModal = ({ documentTitle, signingUrl, onClose, onSigned }: SignatureModalProps) => {
    const [step, setStep] = useState<'INITIAL' | 'SIGNING' | 'SUCCESS'>('INITIAL');
    const [isSimulating, setIsSimulating] = useState(false);

    const handleSign = async () => {
        setIsSimulating(true);
        // Simulate Autenti signing process delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsSimulating(false);
        setStep('SUCCESS');

        // Notify parent after a short delay
        setTimeout(() => {
            onSigned();
            onClose();
        }, 1500);
    };

    return (
        <div className={styles.overlay}>
            <Card className={styles.modal}>
                <CardHeader className={styles.header}>
                    <div className={styles.headerLeft}>
                        <ShieldCheck className={styles.logoIcon} />
                        <div>
                            <CardTitle className={styles.title}>Autenti Signature (Mock)</CardTitle>
                            <p className={styles.subtitle}>Bezpieczne podpisanie dokumentu</p>
                        </div>
                    </div>
                    <button onClick={onClose} className={styles.closeBtn}>
                        <X size={20} />
                    </button>
                </CardHeader>

                <CardContent className={styles.content}>
                    {step === 'INITIAL' && (
                        <div className={styles.body}>
                            <div className={styles.docInfo}>
                                <div className={styles.docIcon}>
                                    <Lock size={32} />
                                </div>
                                <div className={styles.docText}>
                                    <h3>{documentTitle}</h3>
                                    <p>Dokument gotowy do podpisu elektronicznego</p>
                                </div>
                            </div>

                            <div className={styles.securityInfo}>
                                <div className={styles.infoRow}>
                                    <CheckCircle2 size={16} className={styles.successIcon} />
                                    <span>Tożsamość zweryfikowana (Mock)</span>
                                </div>
                                <div className={styles.infoRow}>
                                    <CheckCircle2 size={16} className={styles.successIcon} />
                                    <span>Połączenie zaszyfrowane SSL</span>
                                </div>
                            </div>

                            <div className={styles.actions}>
                                <Button
                                    variant="primary"
                                    className={styles.signBtn}
                                    onClick={handleSign}
                                    isLoading={isSimulating}
                                    disabled={isSimulating}
                                >
                                    {isSimulating ? 'Podpisywanie...' : 'Podpisz dokument'}
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={onClose}
                                    disabled={isSimulating}
                                >
                                    Anuluj
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === 'SUCCESS' && (
                        <div className={styles.successBody}>
                            <div className={styles.successAnimation}>
                                <CheckCircle2 size={64} className={styles.finalSuccessIcon} />
                            </div>
                            <h3>Dokument podpisany!</h3>
                            <p>Proces zakończony pomyślnie. Zaraz nastąpi powrót do platformy.</p>
                        </div>
                    )}
                </CardContent>

                <footer className={styles.footer}>
                    <Lock size={12} />
                    <span>Powered by Autenti Mock Signature Service</span>
                </footer>
            </Card>
        </div>
    );
};
