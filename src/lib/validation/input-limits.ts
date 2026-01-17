/**
 * Input size limits to prevent DoS attacks and database bloat
 * 
 * These limits should be enforced at the API route level before
 * processing any data to prevent excessive memory usage.
 */

// ============ Size Limits ============

/** Maximum number of vehicles in a fleet */
export const MAX_FLEET_SIZE = 500;

/** Maximum length of JSON payload in characters */
export const MAX_JSON_PAYLOAD_SIZE = 1_000_000; // 1MB

/** Maximum length of description/text fields */
export const MAX_TEXT_FIELD_LENGTH = 10_000;

/** Maximum number of clauses that can be selected */
export const MAX_SELECTED_CLAUSES = 20;

/** Maximum number of items in a list/array field */
export const MAX_ARRAY_ITEMS = 100;

// ============ Validators ============

export interface LimitCheckResult {
    valid: boolean;
    error?: string;
}

/**
 * Check if fleet size is within limits
 */
export function checkFleetSizeLimit(fleetSize: number | undefined): LimitCheckResult {
    if (fleetSize === undefined) return { valid: true };

    if (fleetSize > MAX_FLEET_SIZE) {
        return {
            valid: false,
            error: `Flota nie może przekraczać ${MAX_FLEET_SIZE} pojazdów (podano: ${fleetSize})`
        };
    }
    return { valid: true };
}

/**
 * Check if JSON payload is within size limits
 */
export function checkPayloadSizeLimit(payload: string | object): LimitCheckResult {
    const size = typeof payload === 'string'
        ? payload.length
        : JSON.stringify(payload).length;

    if (size > MAX_JSON_PAYLOAD_SIZE) {
        return {
            valid: false,
            error: `Rozmiar danych przekracza limit (${(size / 1_000_000).toFixed(2)}MB > ${MAX_JSON_PAYLOAD_SIZE / 1_000_000}MB)`
        };
    }
    return { valid: true };
}

/**
 * Check if array length is within limits
 */
export function checkArrayLengthLimit(array: unknown[] | undefined, fieldName: string): LimitCheckResult {
    if (!array) return { valid: true };

    if (array.length > MAX_ARRAY_ITEMS) {
        return {
            valid: false,
            error: `Liczba elementów w ${fieldName} przekracza limit (${array.length} > ${MAX_ARRAY_ITEMS})`
        };
    }
    return { valid: true };
}

/**
 * Check multiple limits at once
 */
export function checkAllLimits(data: {
    fleetSize?: number;
    vehicles?: unknown[];
    clauses?: string[];
    payload?: string | object;
}): LimitCheckResult {
    const checks = [
        checkFleetSizeLimit(data.fleetSize),
        checkArrayLengthLimit(data.vehicles, 'pojazdów'),
        checkArrayLengthLimit(data.clauses, 'klauzul'),
        data.payload ? checkPayloadSizeLimit(data.payload) : { valid: true },
    ];

    for (const check of checks) {
        if (!check.valid) return check;
    }

    return { valid: true };
}
