/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';

// Register a font that supports Polish characters
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
        padding: 30,
        fontSize: 10,
    },
    header: {
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        paddingBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    logo: {
        fontSize: 24,
        fontFamily: 'Roboto',
        fontWeight: 'bold',
        color: '#2563EB',
    },
    documentTitle: {
        fontSize: 18,
        fontFamily: 'Roboto',
        fontWeight: 'bold',
        textAlign: 'right',
        color: '#111827',
    },
    documentDate: {
        fontSize: 10,
        color: '#6B7280',
        textAlign: 'right',
        marginTop: 4,
    },
    section: {
        margin: 10,
        padding: 10,
    },
    sectionTitle: {
        fontSize: 12,
        fontFamily: 'Roboto',
        fontWeight: 'bold',
        color: '#374151',
        marginBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        paddingBottom: 4,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    label: {
        width: 120,
        color: '#6B7280',
    },
    value: {
        flex: 1,
        color: '#111827',
    },
    grid: {
        flexDirection: 'row',
        gap: 20,
        marginBottom: 20,
    },
    column: {
        flex: 1,
    },
    premiumBox: {
        marginTop: 20,
        padding: 15,
        backgroundColor: '#F9FAFB',
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'flex-end',
    },
    premiumLabel: {
        fontSize: 12,
        color: '#374151',
    },
    premiumValue: {
        fontSize: 20,
        fontFamily: 'Roboto',
        fontWeight: 'bold',
        color: '#2563EB',
        marginTop: 4,
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 30,
        right: 30,
        fontSize: 8,
        color: '#9CA3AF',
        textAlign: 'center',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingTop: 10,
    },
    disclaimer: {
        fontSize: 8,
        color: '#6B7280',
        marginTop: 20,
        fontStyle: 'italic',
    }
});

interface OfferPdfProps {
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
}

export const OfferPdf = ({ quoteNumber, date, client, policy, clauses, premium }: OfferPdfProps) => (
    <Document>
        <Page size="A4" style={styles.page}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.logo}>OCPD Platform</Text>
                <View>
                    <Text style={styles.documentTitle}>OFERTA UBEZPIECZENIA</Text>
                    <Text style={styles.documentDate}>Data: {date}</Text>
                    <Text style={styles.documentDate}>Nr: {quoteNumber}</Text>
                </View>
            </View>

            {/* Client & Broker Info */}
            <View style={styles.grid}>
                <View style={styles.column}>
                    <Text style={styles.sectionTitle}>Ubezpieczający (Klient)</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>Nazwa:</Text>
                        <Text style={styles.value}>{client.name}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>NIP:</Text>
                        <Text style={styles.value}>{client.nip}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Adres:</Text>
                        <Text style={styles.value}>{client.address}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Miejscowość:</Text>
                        <Text style={styles.value}>{client.city}</Text>
                    </View>
                </View>
                <View style={styles.column}>
                    <Text style={styles.sectionTitle}>Ubezpieczyciel</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>Towarzystwo:</Text>
                        <Text style={styles.value}>OCPD Insurance Group S.A.</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Adres:</Text>
                        <Text style={styles.value}>ul. Asekuracyjna 1, 00-999 Warszawa</Text>
                    </View>
                </View>
            </View>

            {/* Policy Scope */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Zakres ubezpieczenia</Text>
                <View style={styles.row}>
                    <Text style={styles.label}>Przedmiot:</Text>
                    <Text style={styles.value}>Odpowiedzialność Cywilna Przewoźnika Drogowego (OCPD)</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Suma gwarancyjna:</Text>
                    <Text style={styles.value}>{policy.sumInsured}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Zakres terytorialny:</Text>
                    <Text style={styles.value}>{policy.scope}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Okres ubezpieczenia:</Text>
                    <Text style={styles.value}>{policy.duration}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Rodzaj ładunków:</Text>
                    <Text style={styles.value}>{policy.cargoType}</Text>
                </View>
            </View>

            {/* Clauses */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Klauzule dodatkowe i rozszerzenia</Text>
                {clauses.map((clause, index) => (
                    <View key={index} style={styles.row}>
                        <Text style={{ width: 20 }}>•</Text>
                        <Text style={styles.value}>{clause}</Text>
                    </View>
                ))}
            </View>

            {/* Premium */}
            <View style={styles.premiumBox}>
                <Text style={styles.premiumLabel}>Składka łączna (jednorazowa)</Text>
                <Text style={styles.premiumValue}>{premium}</Text>
            </View>

            <Text style={styles.disclaimer}>
                Niniejszy dokument jest ofertą w rozumieniu Kodeksu Cywilnego. Ważność oferty: 7 dni.
                Ochrona ubezpieczeniowa rozpoczyna się od dnia wskazanego w polisie, pod warunkiem opłacenia składki.
            </Text>

            {/* Footer */}
            <Text style={styles.footer}>
                OCPD Platform - System Obsługi Ubezpieczeń Transportowych | Strona 1 z 1
            </Text>
        </Page>
    </Document>
);
