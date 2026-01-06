/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

// Register fonts (reusing registration is fine)
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
    },
    header: {
        textAlign: 'center',
        marginBottom: 30,
        borderBottomWidth: 2,
        borderBottomColor: '#2563EB',
        paddingBottom: 20,
    },
    logo: {
        fontSize: 24,
        fontFamily: 'Roboto',
        fontWeight: 'bold',
        color: '#2563EB',
        marginBottom: 8,
    },
    title: {
        fontSize: 18,
        fontFamily: 'Roboto',
        fontWeight: 'bold',
        color: '#111827',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    certNumber: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 4,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 10,
        fontFamily: 'Roboto',
        fontWeight: 'bold',
        color: '#6B7280',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    value: {
        fontSize: 12,
        color: '#111827',
        fontFamily: 'Roboto',
        fontWeight: 'bold',
    },
    grid: {
        flexDirection: 'row',
        gap: 30,
        marginBottom: 20,
    },
    column: {
        flex: 1,
    },
    highlightBox: {
        backgroundColor: '#F3F4F6',
        padding: 15,
        borderRadius: 4,
        marginBottom: 20,
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingTop: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    stamp: {
        fontSize: 8,
        color: '#2563EB',
        borderWidth: 1,
        borderColor: '#2563EB',
        borderRadius: 20,
        padding: 10,
        textAlign: 'center',
        width: 80,
    },
    signature: {
        borderTopWidth: 1,
        borderTopColor: '#1F2937',
        width: 150,
        textAlign: 'center',
        paddingTop: 4,
        fontSize: 8,
        color: '#6B7280',
    }
});

interface CertificatePdfProps {
    certificateNumber: string;
    policyNumber: string;
    clientName: string;
    cargoDescription: string;
    cargoValue: string;
    route: string;
    transportDate: string;
    generatedAt: string;
}

export const CertificatePdf = ({ certificateNumber, policyNumber, clientName, cargoDescription, cargoValue, route, transportDate, generatedAt }: CertificatePdfProps) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <View style={styles.header}>
                <Text style={styles.logo}>OCPD Platform</Text>
                <Text style={styles.title}>Certyfikat Ubezpieczenia</Text>
                <Text style={styles.certNumber}>{certificateNumber}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Ubezpieczający (Przewoźnik)</Text>
                <Text style={[styles.value, { fontSize: 14 }]}>{clientName}</Text>
            </View>

            <View style={styles.highlightBox}>
                <View style={styles.grid}>
                    <View style={styles.column}>
                        <Text style={styles.sectionTitle}>Ładunek</Text>
                        <Text style={styles.value}>{cargoDescription}</Text>
                    </View>
                    <View style={styles.column}>
                        <Text style={styles.sectionTitle}>Wartość</Text>
                        <Text style={styles.value}>{cargoValue}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.grid}>
                <View style={styles.column}>
                    <Text style={styles.sectionTitle}>Trasa Przewozu</Text>
                    <Text style={styles.value}>{route}</Text>
                </View>
                <View style={styles.column}>
                    <Text style={styles.sectionTitle}>Data Transportu</Text>
                    <Text style={styles.value}>{transportDate}</Text>
                </View>
            </View>

            <View style={styles.grid}>
                <View style={styles.column}>
                    <Text style={styles.sectionTitle}>Polisa Bazowa</Text>
                    <Text style={styles.value}>{policyNumber}</Text>
                </View>
                <View style={styles.column}>
                    <Text style={styles.sectionTitle}>Data Wystawienia</Text>
                    <Text style={styles.value}>{generatedAt}</Text>
                </View>
            </View>

            <View style={{ marginTop: 40 }}>
                <Text style={{ fontSize: 9, color: '#4B5563', textAlign: 'justify' }}>
                    Niniejszy certyfikat potwierdza objęcie ochroną ubezpieczeniową ładunku opisanego powyżej,
                    zgodnie z warunkami polisy generalnej OCPD. Odpowiedzialność ubezpieczyciela ograniczona jest
                    do sumy ubezpieczenia określonej w polisie oraz wartości zadeklarowanej w niniejszym certyfikacie.
                </Text>
            </View>

            <View style={styles.footer}>
                <View style={styles.stamp}>
                    <Text>OCPD</Text>
                    <Text>Platform</Text>
                    <Text>CONFIRMED</Text>
                </View>
                <View style={styles.signature}>
                    <Text>Podpis upoważnionej osoby</Text>
                </View>
            </View>
        </Page>
    </Document>
);
