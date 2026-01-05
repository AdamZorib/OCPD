'use client';

import { Settings, User, Bell, Shield, Database, Globe } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Select } from '@/components/ui';
import styles from './page.module.css';

export default function SettingsPage() {
    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <h1 className={styles.title}>Ustawienia</h1>
                <p className={styles.subtitle}>Zarządzaj ustawieniami konta i aplikacji</p>
            </header>

            <div className={styles.settingsGrid}>
                {/* Profile */}
                <Card padding="lg">
                    <CardHeader>
                        <CardTitle>
                            <User size={20} /> Profil użytkownika
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={styles.formGrid}>
                            <Input label="Imię i nazwisko" defaultValue="Jan Kowalski" />
                            <Input label="Email" type="email" defaultValue="jan.kowalski@broker.pl" />
                            <Input label="Telefon" defaultValue="+48 600 123 456" />
                            <Input label="Numer licencji brokera" defaultValue="PL-BRK-123456" />
                        </div>
                        <div className={styles.formActions}>
                            <Button>Zapisz zmiany</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Notifications */}
                <Card padding="lg">
                    <CardHeader>
                        <CardTitle>
                            <Bell size={20} /> Powiadomienia
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={styles.settingsList}>
                            <label className={styles.settingItem}>
                                <div>
                                    <span className={styles.settingLabel}>Wygasające polisy</span>
                                    <span className={styles.settingDesc}>Powiadomienia o polisach wygasających w ciągu 30 dni</span>
                                </div>
                                <input type="checkbox" defaultChecked />
                            </label>
                            <label className={styles.settingItem}>
                                <div>
                                    <span className={styles.settingLabel}>Nowe szkody</span>
                                    <span className={styles.settingDesc}>Powiadomienia o nowych zgłoszeniach szkód</span>
                                </div>
                                <input type="checkbox" defaultChecked />
                            </label>
                            <label className={styles.settingItem}>
                                <div>
                                    <span className={styles.settingLabel}>Status wycen</span>
                                    <span className={styles.settingDesc}>Aktualizacje statusu wysłanych wycen</span>
                                </div>
                                <input type="checkbox" defaultChecked />
                            </label>
                            <label className={styles.settingItem}>
                                <div>
                                    <span className={styles.settingLabel}>Newsletter</span>
                                    <span className={styles.settingDesc}>Informacje o nowych funkcjach i aktualizacjach</span>
                                </div>
                                <input type="checkbox" />
                            </label>
                        </div>
                    </CardContent>
                </Card>

                {/* Security */}
                <Card padding="lg">
                    <CardHeader>
                        <CardTitle>
                            <Shield size={20} /> Bezpieczeństwo
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={styles.formGrid}>
                            <Input label="Obecne hasło" type="password" />
                            <Input label="Nowe hasło" type="password" />
                            <Input label="Potwierdź nowe hasło" type="password" />
                        </div>
                        <div className={styles.formActions}>
                            <Button variant="secondary">Zmień hasło</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Preferences */}
                <Card padding="lg">
                    <CardHeader>
                        <CardTitle>
                            <Globe size={20} /> Preferencje
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={styles.formGrid}>
                            <Select
                                label="Język"
                                options={[
                                    { value: 'pl', label: 'Polski' },
                                    { value: 'en', label: 'English' },
                                ]}
                                defaultValue="pl"
                            />
                            <Select
                                label="Strefa czasowa"
                                options={[
                                    { value: 'Europe/Warsaw', label: 'Europa/Warszawa (CET)' },
                                    { value: 'UTC', label: 'UTC' },
                                ]}
                                defaultValue="Europe/Warsaw"
                            />
                            <Select
                                label="Format daty"
                                options={[
                                    { value: 'dd.MM.yyyy', label: 'DD.MM.RRRR' },
                                    { value: 'yyyy-MM-dd', label: 'RRRR-MM-DD' },
                                ]}
                                defaultValue="dd.MM.yyyy"
                            />
                            <Select
                                label="Waluta domyślna"
                                options={[
                                    { value: 'PLN', label: 'PLN (złoty)' },
                                    { value: 'EUR', label: 'EUR (euro)' },
                                ]}
                                defaultValue="PLN"
                            />
                        </div>
                        <div className={styles.formActions}>
                            <Button>Zapisz preferencje</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
