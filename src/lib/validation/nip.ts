/**
 * Polish NIP (Tax Identification Number) validation
 * NIP consists of 10 digits with a checksum algorithm
 */

const NIP_WEIGHTS = [6, 5, 7, 2, 3, 4, 5, 6, 7];

/**
 * Validates a Polish NIP number
 * @param nip - The NIP to validate (can include dashes/spaces)
 * @returns Object with validation result and cleaned NIP
 */
export function validateNIP(nip: string): { valid: boolean; nip: string; error?: string } {
    // Remove any non-digit characters
    const cleanedNip = nip.replace(/[^0-9]/g, '');

    // Check length
    if (cleanedNip.length !== 10) {
        return {
            valid: false,
            nip: cleanedNip,
            error: 'NIP musi składać się z 10 cyfr',
        };
    }

    // Check if all zeros (invalid)
    if (cleanedNip === '0000000000') {
        return {
            valid: false,
            nip: cleanedNip,
            error: 'Nieprawidłowy NIP',
        };
    }

    // Calculate checksum
    const digits = cleanedNip.split('').map(Number);
    let sum = 0;

    for (let i = 0; i < 9; i++) {
        sum += digits[i] * NIP_WEIGHTS[i];
    }

    const checkDigit = sum % 11;

    // Check digit 10 means invalid NIP (should never happen for valid NIPs)
    if (checkDigit === 10) {
        return {
            valid: false,
            nip: cleanedNip,
            error: 'Nieprawidłowa suma kontrolna NIP',
        };
    }

    // Compare with the last digit
    if (checkDigit !== digits[9]) {
        return {
            valid: false,
            nip: cleanedNip,
            error: 'Nieprawidłowa suma kontrolna NIP',
        };
    }

    return {
        valid: true,
        nip: cleanedNip,
    };
}

/**
 * Format NIP with dashes for display: XXX-XXX-XX-XX
 */
export function formatNIP(nip: string): string {
    const cleaned = nip.replace(/[^0-9]/g, '');
    if (cleaned.length !== 10) return nip;
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6, 8)}-${cleaned.slice(8, 10)}`;
}

/**
 * Polish REGON (Statistical Number) validation
 * REGON can be 9 or 14 digits with a checksum algorithm
 */

const REGON_9_WEIGHTS = [8, 9, 2, 3, 4, 5, 6, 7];
const REGON_14_WEIGHTS = [2, 4, 8, 5, 0, 9, 7, 3, 6, 1, 2, 4, 8];

/**
 * Validates a Polish REGON number
 * @param regon - The REGON to validate (can include spaces)
 * @returns Object with validation result and cleaned REGON
 */
export function validateREGON(regon: string): { valid: boolean; regon: string; error?: string } {
    // Remove any non-digit characters
    const cleanedRegon = regon.replace(/[^0-9]/g, '');

    // Check length - REGON can be 9 or 14 digits
    if (cleanedRegon.length !== 9 && cleanedRegon.length !== 14) {
        return {
            valid: false,
            regon: cleanedRegon,
            error: 'REGON musi składać się z 9 lub 14 cyfr',
        };
    }

    // Check if all zeros (invalid)
    if (/^0+$/.test(cleanedRegon)) {
        return {
            valid: false,
            regon: cleanedRegon,
            error: 'Nieprawidłowy REGON',
        };
    }

    const digits = cleanedRegon.split('').map(Number);

    // Validate 9-digit REGON
    if (cleanedRegon.length === 9) {
        let sum = 0;
        for (let i = 0; i < 8; i++) {
            sum += digits[i] * REGON_9_WEIGHTS[i];
        }
        const checkDigit = sum % 11 === 10 ? 0 : sum % 11;

        if (checkDigit !== digits[8]) {
            return {
                valid: false,
                regon: cleanedRegon,
                error: 'Nieprawidłowa suma kontrolna REGON',
            };
        }
    }

    // Validate 14-digit REGON (first validate 9-digit part, then full)
    if (cleanedRegon.length === 14) {
        // First check the 9-digit base
        const baseResult = validateREGON(cleanedRegon.slice(0, 9));
        if (!baseResult.valid) {
            return {
                valid: false,
                regon: cleanedRegon,
                error: 'Nieprawidłowy podstawowy REGON (pierwsze 9 cyfr)',
            };
        }

        // Now check the full 14-digit checksum
        let sum = 0;
        for (let i = 0; i < 13; i++) {
            sum += digits[i] * REGON_14_WEIGHTS[i];
        }
        const checkDigit = sum % 11 === 10 ? 0 : sum % 11;

        if (checkDigit !== digits[13]) {
            return {
                valid: false,
                regon: cleanedRegon,
                error: 'Nieprawidłowa suma kontrolna REGON (14-cyfrowy)',
            };
        }
    }

    return {
        valid: true,
        regon: cleanedRegon,
    };
}

/**
 * Format REGON for display
 */
export function formatREGON(regon: string): string {
    const cleaned = regon.replace(/[^0-9]/g, '');
    if (cleaned.length === 9) {
        return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)}`;
    }
    if (cleaned.length === 14) {
        return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9, 14)}`;
    }
    return regon;
}
