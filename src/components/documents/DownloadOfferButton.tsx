'use client';

import React, { useEffect, useState } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { OfferPdf } from './pdf/OfferPdf';
import { Button } from '@/components/ui';
import { FileDown, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import btnStyles from '../ui/Button.module.css';

interface DownloadOfferButtonProps {
    data: {
        quoteNumber: string;
        date: string;
        client: {
            name: string;
            nip: string;
            address: string;
            city: string;
        };
        policy: {
            scope: string;
            sumInsured: string;
            duration: string;
            cargoType: string;
        };
        clauses: string[];
        premium: string;
    };
}

export const DownloadOfferButton = ({ data }: DownloadOfferButtonProps) => {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return (
            <div className={clsx(btnStyles.button, btnStyles.secondary, btnStyles.md, btnStyles.disabled)}>
                <Loader2 size={16} className="animate-spin" style={{ marginRight: 8 }} />
                <span>Przygotowywanie PDF...</span>
            </div>
        );
    }

    return (
        <PDFDownloadLink
            document={<OfferPdf {...data} />}
            fileName={`oferta_${data.quoteNumber || 'szkic'}.pdf`}
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
                    <span>{loading ? 'Generowanie...' : 'Pobierz Ofertę (PDF)'}</span>
                </div>
            )}
        </PDFDownloadLink>
    );
};
