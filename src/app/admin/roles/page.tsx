'use client';

import { useState, Fragment } from 'react';
import { Check, X, Shield, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
import {
    getAllRoles,
    RoleDefinition,
    PERMISSION_METADATA,
    PermissionMeta,
    Permission,
    CATEGORY_LABELS,
} from '@/lib/auth';
import styles from './page.module.css';

export default function RolesPage() {
    const roles = getAllRoles();
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['QUOTES', 'POLICIES']));

    // Group permissions by category
    const permissionsByCategory: Record<string, PermissionMeta[]> = {};
    PERMISSION_METADATA.forEach(p => {
        if (!permissionsByCategory[p.category]) {
            permissionsByCategory[p.category] = [];
        }
        permissionsByCategory[p.category].push(p);
    });

    const toggleCategory = (category: string) => {
        setExpandedCategories(prev => {
            const newSet = new Set(prev);
            if (newSet.has(category)) {
                newSet.delete(category);
            } else {
                newSet.add(category);
            }
            return newSet;
        });
    };

    const hasPermission = (role: RoleDefinition, permission: Permission): boolean => {
        return role.permissions.includes(permission);
    };

    const getPermissionCount = (role: RoleDefinition): number => {
        return role.permissions.length;
    };

    return (
        <div className={styles.page}>
            {/* Roles Overview */}
            <div className={styles.rolesGrid}>
                {roles.map((role) => (
                    <Card key={role.type} padding="lg" className={styles.roleCard}>
                        <div className={styles.roleHeader}>
                            <div
                                className={styles.roleIcon}
                                style={{ backgroundColor: role.color }}
                            >
                                <Shield size={20} />
                            </div>
                            <div>
                                <h3>{role.namePL}</h3>
                                <p>{role.descriptionPL}</p>
                            </div>
                        </div>
                        <div className={styles.roleStats}>
                            <div className={styles.roleStat}>
                                <span className={styles.roleStatValue}>{getPermissionCount(role)}</span>
                                <span className={styles.roleStatLabel}>Uprawnień</span>
                            </div>
                            <Badge
                                variant={role.isSystemRole ? 'default' : 'warning'}
                                size="sm"
                            >
                                {role.isSystemRole ? 'Rola systemowa' : 'Rola niestandardowa'}
                            </Badge>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Permissions Matrix */}
            <Card>
                <CardHeader>
                    <CardTitle>Macierz uprawnień</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className={styles.matrixContainer}>
                        <table className={styles.matrix}>
                            <thead>
                                <tr>
                                    <th className={styles.permissionHeader}>Uprawnienie</th>
                                    {roles.map((role) => (
                                        <th
                                            key={role.type}
                                            className={styles.roleHeader}
                                            style={{ borderTopColor: role.color }}
                                        >
                                            {role.namePL}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(permissionsByCategory).map(([category, permissions]) => (
                                    <Fragment key={category}>
                                        {/* Category Header */}
                                        <tr
                                            className={styles.categoryRow}
                                            onClick={() => toggleCategory(category)}
                                        >
                                            <td colSpan={roles.length + 1}>
                                                <div className={styles.categoryHeader}>
                                                    {expandedCategories.has(category)
                                                        ? <ChevronUp size={16} />
                                                        : <ChevronDown size={16} />
                                                    }
                                                    <span>{CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}</span>
                                                    <Badge variant="default" size="sm">
                                                        {permissions.length}
                                                    </Badge>
                                                </div>
                                            </td>
                                        </tr>

                                        {/* Permission Rows */}
                                        {expandedCategories.has(category) && permissions.map((perm) => (
                                            <tr key={perm.permission}>
                                                <td className={styles.permissionCell}>
                                                    <div className={styles.permissionInfo}>
                                                        <span className={styles.permissionName}>{perm.namePL}</span>
                                                        <span className={styles.permissionCode}>{perm.permission}</span>
                                                    </div>
                                                </td>
                                                {roles.map((role) => (
                                                    <td key={`${perm.permission}-${role.type}`} className={styles.checkCell}>
                                                        {hasPermission(role, perm.permission) ? (
                                                            <div className={styles.checkIcon}>
                                                                <Check size={16} />
                                                            </div>
                                                        ) : (
                                                            <div className={styles.xIcon}>
                                                                <X size={16} />
                                                            </div>
                                                        )}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Legend */}

            <div className={styles.legend}>
                <div className={styles.legendItem}>
                    <div className={styles.checkIcon}><Check size={14} /></div>
                    <span>Uprawnienie przyznane</span>
                </div>
                <div className={styles.legendItem}>
                    <div className={styles.xIcon}><X size={14} /></div>
                    <span>Brak uprawnienia</span>
                </div>
                <div className={styles.legendItem}>
                    <Info size={14} />
                    <span>Role systemowe nie mogą być modyfikowane</span>
                </div>
            </div>
        </div>
    );
}
