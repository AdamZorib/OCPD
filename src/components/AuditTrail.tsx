'use client';

import {
    PlusCircle,
    Edit,
    Trash,
    Calculator,
    Send,
    CheckCircle,
    XCircle,
    AlertCircle,
    FileText,
    RefreshCw,
    X,
    UserCheck,
    CreditCard,
    File,
    Mail,
    Check,
} from 'lucide-react';
import { Badge } from '@/components/ui';
import { AuditEntry, AUDIT_ACTION_CONFIG, formatAuditTimestamp } from '@/lib/audit';
import styles from './AuditTrail.module.css';

interface AuditTrailProps {
    entries: AuditEntry[];
    showEntityInfo?: boolean;
}

// Map action to icon component
const actionIcons: Record<string, typeof PlusCircle> = {
    'plus-circle': PlusCircle,
    'edit': Edit,
    'trash': Trash,
    'calculator': Calculator,
    'send': Send,
    'check-circle': CheckCircle,
    'x-circle': XCircle,
    'alert-circle': AlertCircle,
    'file-text': FileText,
    'refresh-cw': RefreshCw,
    'x': X,
    'user-check': UserCheck,
    'credit-card': CreditCard,
    'file': File,
    'mail': Mail,
    'check': Check,
};

const roleLabels: Record<string, string> = {
    BROKER: 'Broker',
    UNDERWRITER: 'Underwriter',
    ADMIN: 'Administrator',
    SYSTEM: 'System',
};

export default function AuditTrail({ entries, showEntityInfo = false }: AuditTrailProps) {
    if (entries.length === 0) {
        return (
            <div className={styles.emptyState}>
                <AlertCircle size={32} />
                <p>Brak wpisów w historii zmian.</p>
            </div>
        );
    }

    return (
        <div className={styles.timeline}>
            {entries.map((entry, index) => {
                const config = AUDIT_ACTION_CONFIG[entry.action];
                const IconComponent = actionIcons[config.icon] || AlertCircle;
                const isLast = index === entries.length - 1;

                return (
                    <div key={entry.id} className={styles.timelineItem}>
                        <div className={styles.timelineLine}>
                            <div
                                className={styles.timelineIcon}
                                style={{ backgroundColor: config.color }}
                            >
                                <IconComponent size={14} />
                            </div>
                            {!isLast && <div className={styles.timelineConnector} />}
                        </div>

                        <div className={styles.timelineContent}>
                            <div className={styles.timelineHeader}>
                                <span className={styles.timelineAction} style={{ color: config.color }}>
                                    {config.labelPL}
                                </span>
                                <span className={styles.timelineDate}>
                                    {formatAuditTimestamp(entry.timestamp)}
                                </span>
                            </div>

                            <p className={styles.timelineDescription}>
                                {entry.description}
                            </p>

                            <div className={styles.timelineMeta}>
                                <span className={styles.timelineUser}>
                                    {entry.userName}
                                </span>
                                <Badge variant="default" size="sm">
                                    {roleLabels[entry.userRole]}
                                </Badge>
                            </div>

                            {entry.details && (
                                <div className={styles.timelineDetails}>
                                    {Object.entries(entry.details).map(([key, value]) => (
                                        <span key={key} className={styles.detailItem}>
                                            <strong>{key}:</strong> {String(value)}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {(entry.previousValue || entry.newValue) && (
                                <div className={styles.timelineChanges}>
                                    {entry.previousValue && (
                                        <span className={styles.oldValue}>
                                            ← {entry.previousValue}
                                        </span>
                                    )}
                                    {entry.newValue && (
                                        <span className={styles.newValue}>
                                            → {entry.newValue}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
