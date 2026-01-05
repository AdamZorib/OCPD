'use client';

import { useEffect, useRef, HTMLAttributes } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import { X } from 'lucide-react';
import styles from './Modal.module.css';

export interface ModalProps extends HTMLAttributes<HTMLDivElement> {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    showCloseButton?: boolean;
    closeOnOverlayClick?: boolean;
    closeOnEscape?: boolean;
}

export function Modal({
    isOpen,
    onClose,
    title,
    description,
    size = 'md',
    showCloseButton = true,
    closeOnOverlayClick = true,
    closeOnEscape = true,
    children,
    className,
    ...props
}: ModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && closeOnEscape) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose, closeOnEscape]);

    useEffect(() => {
        if (isOpen && modalRef.current) {
            modalRef.current.focus();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget && closeOnOverlayClick) {
            onClose();
        }
    };

    const modalContent = (
        <div className={styles.overlay} onClick={handleOverlayClick}>
            <div
                ref={modalRef}
                className={clsx(styles.modal, styles[size], className)}
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? 'modal-title' : undefined}
                aria-describedby={description ? 'modal-description' : undefined}
                tabIndex={-1}
                {...props}
            >
                {(title || showCloseButton) && (
                    <div className={styles.header}>
                        <div className={styles.headerContent}>
                            {title && (
                                <h2 id="modal-title" className={styles.title}>
                                    {title}
                                </h2>
                            )}
                            {description && (
                                <p id="modal-description" className={styles.description}>
                                    {description}
                                </p>
                            )}
                        </div>
                        {showCloseButton && (
                            <button
                                className={styles.closeBtn}
                                onClick={onClose}
                                aria-label="Zamknij"
                            >
                                <X size={20} />
                            </button>
                        )}
                    </div>
                )}
                <div className={styles.content}>{children}</div>
            </div>
        </div>
    );

    if (typeof window === 'undefined') return null;

    return createPortal(modalContent, document.body);
}

export interface ModalFooterProps extends HTMLAttributes<HTMLDivElement> { }

export function ModalFooter({ children, className, ...props }: ModalFooterProps) {
    return (
        <div className={clsx(styles.footer, className)} {...props}>
            {children}
        </div>
    );
}
