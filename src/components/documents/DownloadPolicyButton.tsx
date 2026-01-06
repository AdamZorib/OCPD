'use client';

import React, { useEffect, useState } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { PolicyPdf } from './pdf/PolicyPdf';
import { Button } from '@/components/ui';
import { FileDown, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import btnStyles from '../ui/Button.module.css';

interface DownloadPolicyButtonProps {
    data: {
        policyNumber: string;
        issueDate: string;
        validFrom: string;
        validTo: string;
        insurer: {
            name: string;
            address: string;
        };
        insured: {
            name: string;
            nip: string;
            address: string;
            city: string;
        };
        coverage: {
            sumInsured: string;
            scope: string;
            cargoType: string;
        };
        premium: string;
    };
}

export const DownloadPolicyButton = ({ data }: DownloadPolicyButtonProps) => {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return (
            <div className={clsx(btnStyles.button, btnStyles.secondary, btnStyles.md, btnStyles.disabled)}>
                <Loader2 size={16} className="animate-spin" style={{ marginRight: 8 }} />
                <span>PDF...</span>
            </div>
        );
    }

    return (
        <PDFDownloadLink
            document={<PolicyPdf {...data} />}
            fileName={`polisa_${data.policyNumber}.pdf`}
            style={{ textDecoration: 'none', color: 'inherit' }}
        >
            {({ blob, url, loading, error }) => (
                <div
                    className={clsx(
                        btnStyles.button,
                        btnStyles.secondary,
                        btnStyles.md,
                        loading && btnStyles.disabled
                    )}
                >
                    {loading ? (
                        <Loader2 size={16} className="animate-spin" style={{ marginRight: 8 }} />
                    ) : (
                        <FileDown size={16} style={{ marginRight: 8 }} />
                    )}
                    <span>{loading ? 'Generowanie...' : 'Pobierz Polisę (PDF)'}</span>
                </div>
            )}
        </PDFDownloadLink>
    );
};
