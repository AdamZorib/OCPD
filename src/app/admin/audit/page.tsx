'use client';

import { useState } from 'react';
import { Search, Filter, Download, RefreshCw, Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Badge } from '@/components/ui';
import AuditTrail from '@/components/AuditTrail';
import { getAllAuditEntries, AuditAction, AUDIT_ACTION_CONFIG } from '@/lib/audit';
import styles from './page.module.css';

export default function AuditPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedAction, setSelectedAction] = useState<AuditAction | 'ALL'>('ALL');
    const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('all');

    const allEntries = getAllAuditEntries();

    // Filter entries
    const filteredEntries = allEntries.filter(entry => {
        // Search filter
        const matchesSearch = searchQuery === '' ||
            entry.entityId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            entry.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            entry.description.toLowerCase().includes(searchQuery.toLowerCase());

        // Action filter
        const matchesAction = selectedAction === 'ALL' || entry.action === selectedAction;

        // Date filter
        let matchesDate = true;
        const now = new Date();
        const entryDate = new Date(entry.timestamp);

        switch (dateRange) {
            case 'today':
                matchesDate = entryDate.toDateString() === now.toDateString();
                break;
            case 'week':
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                matchesDate = entryDate >= weekAgo;
                break;
            case 'month':
                const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                matchesDate = entryDate >= monthAgo;
                break;
        }

        return matchesSearch && matchesAction && matchesDate;
    });

    // Stats
    const todayCount = allEntries.filter(e =>
        new Date(e.timestamp).toDateString() === new Date().toDateString()
    ).length;

    const actionOptions: { value: AuditAction | 'ALL'; label: string }[] = [
        { value: 'ALL', label: 'Wszystkie akcje' },
        ...Object.entries(AUDIT_ACTION_CONFIG).map(([action, config]) => ({
            value: action as AuditAction,
            label: config.labelPL,
        })),
    ];

    return (
        <div className={styles.page}>
            {/* Stats */}
            <div className={styles.stats}>
                <div className={styles.stat}>
                    <span className={styles.statValue}>{allEntries.length}</span>
                    <span className={styles.statLabel}>Wszystkie wpisy</span>
                </div>
                <div className={styles.stat}>
                    <span className={styles.statValue}>{todayCount}</span>
                    <span className={styles.statLabel}>Dzisiaj</span>
                </div>
                <div className={styles.stat}>
                    <span className={styles.statValue}>{new Set(allEntries.map(e => e.userName)).size}</span>
                    <span className={styles.statLabel}>Użytkowników</span>
                </div>
                <div className={styles.stat}>
                    <span className={styles.statValue}>{new Set(allEntries.map(e => e.action)).size}</span>
                    <span className={styles.statLabel}>Typów akcji</span>
                </div>
            </div>

            {/* Toolbar */}
            <div className={styles.toolbar}>
                <div className={styles.search}>
                    <Search size={18} />
                    <Input
                        placeholder="Szukaj w logach..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className={styles.filters}>
                    <select
                        value={selectedAction}
                        onChange={(e) => setSelectedAction(e.target.value as AuditAction | 'ALL')}
                        className={styles.filterSelect}
                    >
                        {actionOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>

                    <div className={styles.dateButtons}>
                        {(['today', 'week', 'month', 'all'] as const).map((range) => (
                            <button
                                key={range}
                                className={`${styles.dateBtn} ${dateRange === range ? styles.active : ''}`}
                                onClick={() => setDateRange(range)}
                            >
                                {range === 'today' && 'Dziś'}
                                {range === 'week' && 'Tydzień'}
                                {range === 'month' && 'Miesiąc'}
                                {range === 'all' && 'Wszystko'}
                            </button>
                        ))}
                    </div>
                </div>

                <Button variant="secondary" leftIcon={<Download size={18} />}>
                    Eksportuj
                </Button>
            </div>

            {/* Audit Timeline */}
            <Card>
                <CardHeader>
                    <div className={styles.cardHeaderRow}>
                        <CardTitle>
                            Historia zmian
                            <Badge variant="default" size="sm" style={{ marginLeft: '8px' }}>
                                {filteredEntries.length}
                            </Badge>
                        </CardTitle>
                        <Button variant="ghost" size="sm" leftIcon={<RefreshCw size={16} />}>
                            Odśwież
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {filteredEntries.length > 0 ? (
                        <AuditTrail entries={filteredEntries} />
                    ) : (
                        <div className={styles.emptyState}>
                            <p>Nie znaleziono wpisów spełniających kryteria.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
