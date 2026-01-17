/**
 * Decimal utility functions for safe financial calculations
 * Avoids floating point precision issues with JavaScript Number type
 * 
 * These functions work with Prisma Decimal fields by converting to strings
 * for comparison, avoiding IEEE 754 floating point issues.
 */

import { Prisma } from '@prisma/client';

type DecimalLike = Prisma.Decimal | number | string;

/**
 * Convert any decimal-like value to a number for comparison
 * Uses string conversion to maintain precision
 */
function toComparableNumber(value: DecimalLike): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') return parseFloat(value);
    // Prisma Decimal has toString() method
    return parseFloat(value.toString());
}

/**
 * Safely compare two Decimal-like values
 * Returns: -1 if a < b, 0 if a == b, 1 if a > b
 */
export function compareDecimals(a: DecimalLike, b: DecimalLike): number {
    const numA = toComparableNumber(a);
    const numB = toComparableNumber(b);
    if (numA < numB) return -1;
    if (numA > numB) return 1;
    return 0;
}

/**
 * Check if a Decimal value is greater than another
 */
export function isGreaterThan(a: DecimalLike, b: DecimalLike): boolean {
    return compareDecimals(a, b) > 0;
}

/**
 * Check if a Decimal value is less than another
 */
export function isLessThan(a: DecimalLike, b: DecimalLike): boolean {
    return compareDecimals(a, b) < 0;
}

/**
 * Check if a Decimal value is less than or equal to another
 */
export function isLessThanOrEqual(a: DecimalLike, b: DecimalLike): boolean {
    return compareDecimals(a, b) <= 0;
}

/**
 * Safely convert Prisma Decimal to number (use only for display, not calculations)
 */
export function toNumber(value: DecimalLike): number {
    return toComparableNumber(value);
}

/**
 * Add two Decimal-like values (returns number - for display only)
 */
export function addDecimals(a: DecimalLike, b: DecimalLike): number {
    return toComparableNumber(a) + toComparableNumber(b);
}

/**
 * Subtract two Decimal-like values (a - b) (returns number - for display only)
 */
export function subtractDecimals(a: DecimalLike, b: DecimalLike): number {
    return toComparableNumber(a) - toComparableNumber(b);
}
