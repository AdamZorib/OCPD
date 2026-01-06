'use client';

import { FileText, X, Download, ExternalLink } from 'lucide-react';
import { Button, Badge } from '@/components/ui';
import styles from './OWUModal.module.css';

interface OWUModalProps {
    onClose: () => void;
    onConfirm: () => void;
}

export default function OWUModal({ onClose, onConfirm }: OWUModalProps) {
    const handleDownload = () => {
        // In production, this would download a real PDF
        alert('Pobieranie OWU... (demo - w produkcji pobierze plik PDF)');
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.headerContent}>
                        <Badge variant="accent" size="md">OWU</Badge>
                        <h2 className={styles.title}>Ogólne Warunki Ubezpieczenia</h2>
                        <p className={styles.subtitle}>OCP Przewoźnika Drogowego</p>
                    </div>
                    <button className={styles.closeButton} onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className={styles.content}>
                    {/* Summary */}
                    <section className={styles.section}>
                        <h3>Podsumowanie dokumentu</h3>
                        <p>
                            Ogólne Warunki Ubezpieczenia (OWU) określają szczegółowe zasady
                            ubezpieczenia odpowiedzialności cywilnej przewoźnika drogowego.
                            Dokument ten jest prawnie wiążący i stanowi integralną część umowy ubezpieczenia.
                        </p>
                    </section>

                    {/* Key sections */}
                    <section className={styles.section}>
                        <h3>Kluczowe sekcje dokumentu</h3>
                        <div className={styles.sectionsGrid}>
                            <div className={styles.sectionCard}>
                                <strong>§1-3</strong>
                                <span>Postanowienia ogólne i definicje</span>
                            </div>
                            <div className={styles.sectionCard}>
                                <strong>§4-8</strong>
                                <span>Przedmiot i zakres ubezpieczenia</span>
                            </div>
                            <div className={styles.sectionCard}>
                                <strong>§9-12</strong>
                                <span>Wyłączenia odpowiedzialności</span>
                            </div>
                            <div className={styles.sectionCard}>
                                <strong>§13-16</strong>
                                <span>Suma ubezpieczenia i składka</span>
                            </div>
                            <div className={styles.sectionCard}>
                                <strong>§17-22</strong>
                                <span>Zawarcie i rozwiązanie umowy</span>
                            </div>
                            <div className={styles.sectionCard}>
                                <strong>§23-30</strong>
                                <span>Postępowanie w razie szkody</span>
                            </div>
                            <div className={styles.sectionCard}>
                                <strong>§31-35</strong>
                                <span>Wypłata odszkodowania</span>
                            </div>
                            <div className={styles.sectionCard}>
                                <strong>§36-40</strong>
                                <span>Postanowienia końcowe</span>
                            </div>
                        </div>
                    </section>

                    {/* Important notices */}
                    <section className={styles.section}>
                        <h3>Ważne informacje</h3>
                        <div className={styles.notices}>
                            <div className={styles.notice}>
                                <span className={styles.noticeIcon}>⚠️</span>
                                <p>
                                    Prosimy o uważne zapoznanie się z wyłączeniami odpowiedzialności
                                    zawartymi w §9-12 OWU.
                                </p>
                            </div>
                            <div className={styles.notice}>
                                <span className={styles.noticeIcon}>📋</span>
                                <p>
                                    Obowiązki ubezpieczonego w przypadku szkody są szczegółowo
                                    opisane w §23-30.
                                </p>
                            </div>
                            <div className={styles.notice}>
                                <span className={styles.noticeIcon}>🔒</span>
                                <p>
                                    Wymogi dotyczące zabezpieczenia ładunku i postoju pojazdu
                                    znajdują się w załączniku nr 1.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Attachments */}
                    <section className={styles.section}>
                        <h3>Załączniki do OWU</h3>
                        <ul className={styles.attachmentsList}>
                            <li>
                                <FileText size={16} />
                                <span>Załącznik 1: Wymogi bezpieczeństwa dla przewozu towarów</span>
                            </li>
                            <li>
                                <FileText size={16} />
                                <span>Załącznik 2: Tabela klauzul dodatkowych i sublimitów</span>
                            </li>
                            <li>
                                <FileText size={16} />
                                <span>Załącznik 3: Formularz zgłoszenia szkody</span>
                            </li>
                        </ul>
                    </section>
                </div>

                {/* Footer */}
                <div className={styles.footer}>
                    <Button
                        variant="secondary"
                        leftIcon={<Download size={18} />}
                        onClick={handleDownload}
                    >
                        Pobierz OWU (PDF)
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                    >
                        Potwierdzam otrzymanie OWU
                    </Button>
                </div>
            </div>
        </div>
    );
}
