/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';

// Font registration passed from OfferPdf (global ideally, but works per file in client)
// We re-register to be safe if independently loaded
Font.register({
    family: 'Roboto',
    fonts: [
        { src: '/fonts/Roboto-Regular.ttf' },
        { src: '/fonts/Roboto-Bold.ttf', fontWeight: 'bold' },
        { src: '/fonts/Roboto-Italic.ttf', fontStyle: 'italic' },
    ],
});

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        fontFamily: 'Roboto',
        padding: 40,
        fontSize: 10,
        lineHeight: 1.5,
    },
    header: {
        marginBottom: 30,
        borderBottomWidth: 2,
        borderBottomColor: '#1F2937',
        paddingBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    logo: {
        fontSize: 28,
        fontFamily: 'Roboto',
        fontWeight: 'bold',
        color: '#1F2937',
    },
    docTitle: {
        fontSize: 20,
        fontFamily: 'Roboto',
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 4,
    },
    docSubtitle: {
        fontSize: 12,
        color: '#6B7280',
    },
    grid: {
        flexDirection: 'row',
        marginTop: 20,
        marginBottom: 30,
        gap: 40,
    },
    column: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: 11,
        fontFamily: 'Roboto',
        fontWeight: 'bold',
        color: '#6B7280',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        paddingBottom: 4,
    },
    field: {
        marginBottom: 8,
    },
    label: {
        color: '#6B7280',
        fontSize: 9,
    },
    value: {
        color: '#111827',
        fontSize: 11,
        fontFamily: 'Roboto',
        fontWeight: 'bold',
    },
    coverageBox: {
        backgroundColor: '#F3F4F6',
        padding: 15,
        borderRadius: 4,
        marginBottom: 30,
    },
    coverageRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        paddingBottom: 4,
    },
    coverageLabel: {
        fontFamily: 'Roboto',
        fontWeight: 'bold',
        color: '#374151',
    },
    coverageValue: {
        color: '#111827',
    },
    legalText: {
        fontSize: 8,
        textAlign: 'justify',
        color: '#4B5563',
        marginBottom: 10,
    },
    signatures: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 60,
    },
    signatureBox: {
        width: '40%',
        borderTopWidth: 1,
        borderTopColor: '#9CA3AF',
        paddingTop: 8,
        alignItems: 'center',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        fontSize: 8,
        color: '#9CA3AF',
        textAlign: 'center',
    }
});

interface PolicyPdfProps {
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
}

export const PolicyPdf = ({ policyNumber, issueDate, validFrom, validTo, insurer, insured, coverage, premium }: PolicyPdfProps) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.logo}>OCPD</Text>
                    <Text style={{ fontSize: 10, color: '#6B7280' }}>Platforma Ubezpieczeniowa</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.docTitle}>POLISA UBEZPIECZENIOWA</Text>
                    <Text style={styles.docSubtitle}>Nr: {policyNumber}</Text>
                </View>
            </View>

            <View style={styles.grid}>
                <View style={styles.column}>
                    <Text style={styles.sectionTitle}>Ubezpieczyciel</Text>
                    <View style={styles.field}>
                        <Text style={styles.value}>{insurer.name}</Text>
                        <Text style={styles.value}>{insurer.address}</Text>
                    </View>
                </View>
                <View style={styles.column}>
                    <Text style={styles.sectionTitle}>Ubezpieczający</Text>
                    <View style={styles.field}>
                        <Text style={styles.label}>Nazwa / Imię i Nazwisko</Text>
                        <Text style={styles.value}>{insured.name}</Text>
                    </View>
                    <View style={styles.field}>
                        <Text style={styles.label}>NIP</Text>
                        <Text style={styles.value}>{insured.nip}</Text>
                    </View>
                    <View style={styles.field}>
                        <Text style={styles.label}>Adres</Text>
                        <Text style={styles.value}>{insured.address}</Text>
                        <Text style={styles.value}>{insured.city}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.column}>
                <Text style={styles.sectionTitle}>Okres ubezpieczenia</Text>
                <View style={{ flexDirection: 'row', gap: 40 }}>
                    <View style={styles.field}>
                        <Text style={styles.label}>Od dnia</Text>
                        <Text style={styles.value}>{validFrom}</Text>
                    </View>
                    <View style={styles.field}>
                        <Text style={styles.label}>Do dnia</Text>
                        <Text style={styles.value}>{validTo}</Text>
                    </View>
                </View>
            </View>

            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Zakres Ubezpieczenia</Text>
            <View style={styles.coverageBox}>
                <View style={styles.coverageRow}>
                    <Text style={styles.coverageLabel}>Przedmiot ubezpieczenia</Text>
                    <Text style={styles.coverageValue}>Odpowiedzialność Cywilna Przewoźnika Drogowego</Text>
                </View>
                <View style={styles.coverageRow}>
                    <Text style={styles.coverageLabel}>Suma gwarancyjna</Text>
                    <Text style={styles.coverageValue}>{coverage.sumInsured}</Text>
                </View>
                <View style={styles.coverageRow}>
                    <Text style={styles.coverageLabel}>Zakres terytorialny</Text>
                    <Text style={styles.coverageValue}>{coverage.scope}</Text>
                </View>
                <View style={styles.coverageRow}>
                    <Text style={styles.coverageLabel}>Rodzaj przewożonego mienia</Text>
                    <Text style={styles.coverageValue}>{coverage.cargoType}</Text>
                </View>
                <View style={[styles.coverageRow, { borderBottomWidth: 0 }]}>
                    <Text style={styles.coverageLabel}>Składka łączna</Text>
                    <Text style={[styles.coverageValue, { fontFamily: 'Roboto', fontWeight: 'bold', color: '#2563EB' }]}>{premium}</Text>
                </View>
            </View>

            <View>
                <Text style={styles.sectionTitle}>Oświadczenia</Text>
                <Text style={styles.legalText}>
                    1. Ubezpieczający oświadcza, że dane podane we wniosku o ubezpieczenie są zgodne ze stanem faktycznym.
                </Text>
                <Text style={styles.legalText}>
                    2. Ubezpieczyciel potwierdza objęcie ochroną ubezpieczeniową w zakresie określonym w niniejszej polisie oraz Ogólnych Warunkach Ubezpieczenia (OWU).
                </Text>
                <Text style={styles.legalText}>
                    3. Składka została opłacona jednorazowo / I rata została opłacona. Obowiązek zapłaty kolejnych rat wynika z harmonogramu płatności.
                </Text>
            </View>

            <View style={styles.signatures}>
                <View style={styles.signatureBox}>
                    <Text style={styles.label}>Podpis Ubezpieczającego</Text>
                </View>
                <View style={styles.signatureBox}>
                    <Text style={styles.label}>Podpis Ubezpieczyciela</Text>
                    <Text style={{ fontSize: 8, color: '#9CA3AF', marginTop: 4 }}>(Generowano elektronicznie)</Text>
                </View>
            </View>

            <Text style={styles.footer}>
                Dokument wygenerowany automatycznie przez system OCPD Platform w dniu {issueDate}.
            </Text>
        </Page>
    </Document>
);
