'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft,
    Bell,
    Mail,
    Smartphone,
    Save,
    Check,
} from 'lucide-react';
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    Button,
    Badge,
} from '@/components/ui';
import {
    NotificationPreference,
    CATEGORY_LABELS,
    getEventsByCategory,
    getDefaultPreferences,
} from '@/lib/notifications';
import styles from './page.module.css';

export default function NotificationSettingsPage() {
    const [preferences, setPreferences] = useState<NotificationPreference[]>(getDefaultPreferences());
    const [saved, setSaved] = useState(false);

    const eventsByCategory = getEventsByCategory();

    const updatePreference = (event: string, channel: 'email' | 'sms' | 'push', value: boolean) => {
        setPreferences(prev =>
            prev.map(p =>
                p.event === event ? { ...p, [channel]: value } : p
            )
        );
        setSaved(false);
    };

    const getPreference = (event: string): NotificationPreference | undefined => {
        return preferences.find(p => p.event === event);
    };

    const handleSave = () => {
        // Mock save - in real app would call API
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const enableAllEmail = () => {
        setPreferences(prev => prev.map(p => ({ ...p, email: true })));
        setSaved(false);
    };

    const disableAllSms = () => {
        setPreferences(prev => prev.map(p => ({ ...p, sms: false })));
        setSaved(false);
    };

    return (
        <div className={styles.page}>
            {/* Header */}
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <Link href="/settings" className={styles.backLink}>
                        <ArrowLeft size={20} />
                        <span>Ustawienia</span>
                    </Link>
                    <div className={styles.headerInfo}>
                        <Bell size={28} />
                        <div>
                            <h1 className={styles.title}>Powiadomienia</h1>
                            <p className={styles.subtitle}>Zarządzaj preferencjami powiadomień email i SMS</p>
                        </div>
                    </div>
                </div>
                <Button
                    onClick={handleSave}
                    leftIcon={saved ? <Check size={18} /> : <Save size={18} />}
                    variant={saved ? 'secondary' : 'primary'}
                >
                    {saved ? 'Zapisano!' : 'Zapisz zmiany'}
                </Button>
            </header>

            {/* Quick Actions */}
            <Card padding="md" className={styles.quickActions}>
                <span>Szybkie akcje:</span>
                <Button variant="ghost" size="sm" onClick={enableAllEmail}>
                    Włącz wszystkie email
                </Button>
                <Button variant="ghost" size="sm" onClick={disableAllSms}>
                    Wyłącz wszystkie SMS
                </Button>
            </Card>

            {/* Channel Legend */}
            <div className={styles.legend}>
                <div className={styles.legendItem}>
                    <Mail size={16} />
                    <span>Email</span>
                </div>
                <div className={styles.legendItem}>
                    <Smartphone size={16} />
                    <span>SMS</span>
                </div>
            </div>

            {/* Notification Categories */}
            <div className={styles.categories}>
                {Object.entries(eventsByCategory).map(([category, events]) => (
                    <Card key={category} padding="lg">
                        <CardHeader>
                            <CardTitle>
                                <span>{CATEGORY_LABELS[category]}</span>
                                <Badge variant="default" size="sm">{events.length}</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className={styles.eventsList}>
                                {events.map((event) => {
                                    const pref = getPreference(event.event);
                                    return (
                                        <div key={event.event} className={styles.eventRow}>
                                            <div className={styles.eventInfo}>
                                                <span className={styles.eventLabel}>{event.labelPL}</span>
                                                <span className={styles.eventDesc}>{event.descriptionPL}</span>
                                            </div>
                                            <div className={styles.eventToggles}>
                                                <label className={styles.toggle}>
                                                    <input
                                                        type="checkbox"
                                                        checked={pref?.email || false}
                                                        onChange={(e) => updatePreference(event.event, 'email', e.target.checked)}
                                                    />
                                                    <Mail size={16} />
                                                </label>
                                                <label className={styles.toggle}>
                                                    <input
                                                        type="checkbox"
                                                        checked={pref?.sms || false}
                                                        onChange={(e) => updatePreference(event.event, 'sms', e.target.checked)}
                                                    />
                                                    <Smartphone size={16} />
                                                </label>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* SMS Notice */}
            <Card padding="md" className={styles.smsNotice}>
                <Smartphone size={20} />
                <div>
                    <strong>Powiadomienia SMS</strong>
                    <p>
                        Powiadomienia SMS są wysyłane tylko dla krytycznych zdarzeń.
                        Mogą być naliczane dodatkowe opłaty przez operatora.
                    </p>
                </div>
            </Card>
        </div>
    );
}
