'use client';

import { forwardRef, HTMLAttributes } from 'react';
import clsx from 'clsx';
import styles from './Badge.module.css';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'accent';
    size?: 'sm' | 'md';
    dot?: boolean;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
    ({ children, variant = 'default', size = 'md', dot = false, className, ...props }, ref) => {
        return (
            <span
                ref={ref}
                className={clsx(
                    styles.badge,
                    styles[variant],
                    styles[size],
                    dot && styles.withDot,
                    className
                )}
                {...props}
            >
                {dot && <span className={styles.dot} />}
                {children}
            </span>
        );
    }
);

Badge.displayName = 'Badge';
