'use client';

import { FileText, X } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@/components/ui';
import styles from './IPIDDocument.module.css';

interface IPIDDocumentProps {
    onClose?: () => void;
    isModal?: boolean;
}

export default function IPIDDocument({ onClose, isModal = false }: IPIDDocumentProps) {
    const content = (
        <div className={styles.ipidContent}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerTop}>
                    <Badge variant="accent" size="md">IPID</Badge>
                    {isModal && onClose && (
                        <button className={styles.closeButton} onClick={onClose}>
                            <X size={20} />
                        </button>
                    )}
                </div>
                <h1 className={styles.title}>Karta Produktu Ubezpieczeniowego</h1>
                <h2 className={styles.subtitle}>Insurance Product Information Document</h2>
                <p className={styles.productName}>
                    Ubezpieczenie OC Przewoźnika Drogowego (OCPD)
                </p>
            </div>

            {/* Product Description */}
            <section className={styles.section}>
                <h3 className={styles.sectionTitle}>
                    <FileText size={18} />
                    Czym jest ten produkt?
                </h3>
                <p>
                    Ubezpieczenie odpowiedzialności cywilnej przewoźnika drogowego (OCPD) chroni
                    przewoźnika przed roszczeniami klientów za szkody w powierzonym ładunku powstałe
                    podczas transportu drogowego. Pokrywa koszty odszkodowań za utratę, uszkodzenie
                    lub opóźnienie dostawy towaru.
                </p>
            </section>

            {/* What is covered */}
            <section className={styles.section}>
                <h3 className={styles.sectionTitle}>
                    <span className={styles.iconCheck}>✓</span>
                    Co jest objęte ubezpieczeniem?
                </h3>
                <ul className={styles.coveredList}>
                    <li>Uszkodzenie lub zniszczenie ładunku podczas transportu</li>
                    <li>Całkowita utrata ładunku (w tym kradzież z włamaniem)</li>
                    <li>Częściowa utrata lub ubytki towaru</li>
                    <li>Rabunek ładunku z użyciem przemocy</li>
                    <li>Rozsypanie lub wyciek towaru</li>
                    <li>Koszty ratownictwa i akcji zabezpieczającej</li>
                </ul>

                <h4 className={styles.subTitle}>Opcjonalne rozszerzenia (klauzule):</h4>
                <ul className={styles.optionalList}>
                    <li><strong>Rażące niedbalstwo</strong> – szkody z winy kierowcy</li>
                    <li><strong>Klauzula postojowa</strong> – kradzież z niestrzeżonych parkingów</li>
                    <li><strong>Podwykonawcy</strong> – ochrona przy podzlecaniu transportu</li>
                    <li><strong>Towary chłodnicze</strong> – awaria agregatu chłodniczego</li>
                    <li><strong>ADR</strong> – transport towarów niebezpiecznych</li>
                    <li><strong>Wydanie osobie nieuprawnionej</strong> – ochrona przed oszustwami</li>
                </ul>
            </section>

            {/* What is NOT covered */}
            <section className={styles.section}>
                <h3 className={styles.sectionTitle}>
                    <span className={styles.iconCross}>✗</span>
                    Co NIE jest objęte ubezpieczeniem?
                </h3>
                <ul className={styles.excludedList}>
                    <li>Szkody spowodowane siłą wyższą (powodzie, trzęsienia ziemi)</li>
                    <li>Działania wojenne, zamieszki, terroryzm</li>
                    <li>Szkody z winy nadawcy (złe opakowanie)</li>
                    <li>Naturalne właściwości towaru (samoistne psucie się)</li>
                    <li>Przewóz gotówki, dzieł sztuki, biżuterii (bez specjalnej umowy)</li>
                    <li>Kraje objęte sankcjami międzynarodowymi (Rosja, Białoruś)</li>
                    <li>Opóźnienie dostawy (bez klauzuli specjalnego interesu)</li>
                </ul>
            </section>

            {/* Restrictions */}
            <section className={styles.section}>
                <h3 className={styles.sectionTitle}>
                    <span className={styles.iconWarning}>⚠</span>
                    Ograniczenia ochrony
                </h3>
                <ul className={styles.restrictionList}>
                    <li>Franszyza redukcyjna – od każdej szkody odejmowana jest kwota udziału własnego</li>
                    <li>Sublimity klauzul – limity odpowiedzialności dla poszczególnych rozszerzeń</li>
                    <li>Wymogi bezpieczeństwa – klauzula postojowa wymaga parkowania na strzeżonych parkingach</li>
                    <li>Zgłoszenie szkody – obowiązek niezwłocznego powiadomienia ubezpieczyciela</li>
                </ul>
            </section>

            {/* Obligations */}
            <section className={styles.section}>
                <h3 className={styles.sectionTitle}>
                    <span className={styles.iconInfo}>ℹ</span>
                    Obowiązki ubezpieczonego
                </h3>
                <div className={styles.obligationsGrid}>
                    <div className={styles.obligation}>
                        <strong>Przed zawarciem:</strong>
                        <p>Podanie prawdziwych i kompletnych informacji o działalności transportowej</p>
                    </div>
                    <div className={styles.obligation}>
                        <strong>W trakcie umowy:</strong>
                        <p>Zgłaszanie zmian w działalności (np. nowe trasy, typy towarów)</p>
                    </div>
                    <div className={styles.obligation}>
                        <strong>Po szkodzie:</strong>
                        <p>Niezwłoczne powiadomienie ubezpieczyciela i udokumentowanie zdarzenia</p>
                    </div>
                    <div className={styles.obligation}>
                        <strong>Ochrona roszczeń:</strong>
                        <p>Sporządzenie protokołu szkodowego w obecności odbiorcy</p>
                    </div>
                </div>
            </section>

            {/* Payment info */}
            <section className={styles.section}>
                <h3 className={styles.sectionTitle}>
                    <span className={styles.iconMoney}>💰</span>
                    Składka i płatności
                </h3>
                <ul className={styles.paymentList}>
                    <li>Składka płatna jednorazowo lub w ratach (2 lub 4 raty)</li>
                    <li>Płatność ratalna wiąże się z dopłatą 3-5%</li>
                    <li>Brak płatności w terminie może skutkować zawieszeniem ochrony</li>
                </ul>
            </section>

            {/* Validity */}
            <section className={styles.section}>
                <h3 className={styles.sectionTitle}>
                    <span className={styles.iconCalendar}>📅</span>
                    Czas trwania i rozwiązanie
                </h3>
                <ul className={styles.validityList}>
                    <li>Standardowy okres ubezpieczenia: 12 miesięcy</li>
                    <li>Ochrona rozpoczyna się od daty wskazanej w polisie</li>
                    <li>Wypowiedzenie możliwe na 30 dni przed końcem okresu</li>
                    <li>Przedterminowe rozwiązanie – zwrot składki proporcjonalnie</li>
                </ul>
            </section>

            {/* Footer */}
            <div className={styles.footer}>
                <p>
                    Ten dokument zawiera jedynie podsumowanie głównych postanowień ubezpieczenia.
                    Szczegółowe warunki zawarte są w Ogólnych Warunkach Ubezpieczenia (OWU).
                </p>
                {isModal && (
                    <Button onClick={onClose} variant="primary">
                        Zamknij i potwierdź otrzymanie
                    </Button>
                )}
            </div>
        </div>
    );

    if (isModal) {
        return (
            <div className={styles.modalOverlay}>
                <div className={styles.modalContent}>
                    {content}
                </div>
            </div>
        );
    }

    return (
        <Card padding="lg">
            <CardHeader>
                <CardTitle>Karta Produktu (IPID)</CardTitle>
            </CardHeader>
            <CardContent>
                {content}
            </CardContent>
        </Card>
    );
}
