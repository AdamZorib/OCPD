'use client';

import { forwardRef, HTMLAttributes, ThHTMLAttributes, TdHTMLAttributes } from 'react';
import clsx from 'clsx';
import styles from './Table.module.css';

export interface TableProps extends HTMLAttributes<HTMLTableElement> {
    striped?: boolean;
}

export const Table = forwardRef<HTMLTableElement, TableProps>(
    ({ children, striped = false, className, ...props }, ref) => {
        return (
            <div className={styles.wrapper}>
                <table
                    ref={ref}
                    className={clsx(styles.table, striped && styles.striped, className)}
                    {...props}
                >
                    {children}
                </table>
            </div>
        );
    }
);

Table.displayName = 'Table';

export const TableHeader = forwardRef<
    HTMLTableSectionElement,
    HTMLAttributes<HTMLTableSectionElement>
>(({ children, className, ...props }, ref) => {
    return (
        <thead ref={ref} className={clsx(styles.thead, className)} {...props}>
            {children}
        </thead>
    );
});

TableHeader.displayName = 'TableHeader';

export const TableBody = forwardRef<
    HTMLTableSectionElement,
    HTMLAttributes<HTMLTableSectionElement>
>(({ children, className, ...props }, ref) => {
    return (
        <tbody ref={ref} className={clsx(styles.tbody, className)} {...props}>
            {children}
        </tbody>
    );
});

TableBody.displayName = 'TableBody';

export const TableRow = forwardRef<
    HTMLTableRowElement,
    HTMLAttributes<HTMLTableRowElement>
>(({ children, className, ...props }, ref) => {
    return (
        <tr ref={ref} className={clsx(styles.tr, className)} {...props}>
            {children}
        </tr>
    );
});

TableRow.displayName = 'TableRow';

export interface TableHeadProps extends ThHTMLAttributes<HTMLTableCellElement> {
    sortable?: boolean;
    sorted?: 'asc' | 'desc' | null;
}

export const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(
    ({ children, sortable = false, sorted = null, className, ...props }, ref) => {
        return (
            <th
                ref={ref}
                className={clsx(
                    styles.th,
                    sortable && styles.sortable,
                    sorted && styles.sorted,
                    className
                )}
                {...props}
            >
                <span className={styles.thContent}>
                    {children}
                    {sortable && (
                        <span className={styles.sortIcon}>
                            {sorted === 'asc' && '↑'}
                            {sorted === 'desc' && '↓'}
                            {!sorted && '↕'}
                        </span>
                    )}
                </span>
            </th>
        );
    }
);

TableHead.displayName = 'TableHead';

export const TableCell = forwardRef<
    HTMLTableCellElement,
    TdHTMLAttributes<HTMLTableCellElement>
>(({ children, className, ...props }, ref) => {
    return (
        <td ref={ref} className={clsx(styles.td, className)} {...props}>
            {children}
        </td>
    );
});

TableCell.displayName = 'TableCell';
