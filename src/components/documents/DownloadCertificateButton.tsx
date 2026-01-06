'use client';

import React, { useEffect, useState } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { CertificatePdf } from './pdf/CertificatePdf';
import { Button } from '@/components/ui';
import { FileDown, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import btnStyles from '../ui/Button.module.css';

interface DownloadCertificateButtonProps {
    data: {
        certificateNumber: string;
        policyNumber: string;
        clientName: string;
        cargoDescription: string;
        cargoValue: string;
        route: string;
        transportDate: string;
        generatedAt: string;
    };
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
    size?: 'sm' | 'md' | 'lg';
}

export const DownloadCertificateButton = ({ data, variant = 'secondary', size = 'md' }: DownloadCertificateButtonProps) => {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return (
            <div className={clsx(btnStyles.button, btnStyles[variant], btnStyles[size], btnStyles.disabled)}>
                <Loader2 size={16} className="animate-spin" style={{ marginRight: 8 }} />
                <span>PDF...</span>
            </div>
        );
    }

    return (
        <PDFDownloadLink
            document={<CertificatePdf {...data} />}
            fileName={`certyfikat_${data.certificateNumber.replace(/\//g, '_')}.pdf`}
            style={{ textDecoration: 'none', color: 'inherit' }}
        >
            {({ blob, url, loading, error }) => (
                <div
                    className={clsx(
                        btnStyles.button,
                        btnStyles[variant],
                        btnStyles[size],
                        loading && btnStyles.disabled
                    )}
                >
                    {loading ? (
                        <Loader2 size={16} className="animate-spin" style={{ marginRight: 8 }} />
                    ) : (
                        <FileDown size={16} style={{ marginRight: 8 }} />
                    )}
                    <span>{loading ? 'Generowanie...' : 'Pobierz PDF'}</span>
                </div>
            )}
        </PDFDownloadLink>
    );
};
