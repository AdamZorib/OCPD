'use client';

import { forwardRef, SelectHTMLAttributes, useId } from 'react';
import clsx from 'clsx';
import { ChevronDown } from 'lucide-react';
import styles from './Select.module.css';

export interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
    label?: string;
    error?: string;
    hint?: string;
    options: SelectOption[];
    placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    (
        {
            label,
            error,
            hint,
            options,
            placeholder,
            className,
            id,
            ...props
        },
        ref
    ) => {
        const generatedId = useId();
        const selectId = id || generatedId;

        return (
            <div className={clsx(styles.wrapper, className)}>
                {label && (
                    <label htmlFor={selectId} className={styles.label}>
                        {label}
                    </label>
                )}
                <div className={clsx(styles.selectWrapper, error && styles.hasError)}>
                    <select
                        ref={ref}
                        id={selectId}
                        className={styles.select}
                        {...props}
                    >
                        {placeholder && (
                            <option value="" disabled>
                                {placeholder}
                            </option>
                        )}
                        {options.map((option) => (
                            <option
                                key={option.value}
                                value={option.value}
                                disabled={option.disabled}
                            >
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <span className={styles.icon}>
                        <ChevronDown size={18} />
                    </span>
                </div>
                {hint && !error && <span className={styles.hint}>{hint}</span>}
                {error && <span className={styles.error}>{error}</span>}
            </div>
        );
    }
);

Select.displayName = 'Select';
