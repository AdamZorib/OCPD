'use client';

import { forwardRef, HTMLAttributes } from 'react';
import clsx from 'clsx';
import styles from './Card.module.css';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'elevated' | 'glass' | 'bordered';
    padding?: 'none' | 'sm' | 'md' | 'lg';
    hoverable?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ children, variant = 'default', padding = 'md', hoverable = false, className, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={clsx(
                    styles.card,
                    styles[variant],
                    styles[`padding-${padding}`],
                    hoverable && styles.hoverable,
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Card.displayName = 'Card';

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> { }

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
    ({ children, className, ...props }, ref) => {
        return (
            <div ref={ref} className={clsx(styles.header, className)} {...props}>
                {children}
            </div>
        );
    }
);

CardHeader.displayName = 'CardHeader';

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
    ({ children, as: Component = 'h3', className, ...props }, ref) => {
        return (
            <Component ref={ref} className={clsx(styles.title, className)} {...props}>
                {children}
            </Component>
        );
    }
);

CardTitle.displayName = 'CardTitle';

export interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> { }

export const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
    ({ children, className, ...props }, ref) => {
        return (
            <p ref={ref} className={clsx(styles.description, className)} {...props}>
                {children}
            </p>
        );
    }
);

CardDescription.displayName = 'CardDescription';

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> { }

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
    ({ children, className, ...props }, ref) => {
        return (
            <div ref={ref} className={clsx(styles.content, className)} {...props}>
                {children}
            </div>
        );
    }
);

CardContent.displayName = 'CardContent';

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> { }

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
    ({ children, className, ...props }, ref) => {
        return (
            <div ref={ref} className={clsx(styles.footer, className)} {...props}>
                {children}
            </div>
        );
    }
);

CardFooter.displayName = 'CardFooter';
