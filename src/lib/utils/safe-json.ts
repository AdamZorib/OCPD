/**
 * Safe JSON parsing utilities to prevent crashes from malformed data
 */

/**
 * Safely parse a JSON string with a fallback value
 * 
 * SECURITY FIX: Previously logged only the error. Now logs:
 * - A preview of the malformed data (truncated for safety)
 * - Context about where the parsing failed
 * 
 * @param json - The JSON string to parse (can be null/undefined)
 * @param fallback - The fallback value if parsing fails
 * @param context - Optional context string for better debugging
 * @returns Parsed value or fallback
 */
export function safeJsonParse<T>(
    json: string | null | undefined,
    fallback: T,
    context?: string
): T {
    if (!json) return fallback;

    try {
        return JSON.parse(json) as T;
    } catch (error) {
        // Log more context for debugging without exposing full data
        const preview = json.length > 100 ? json.substring(0, 100) + '...' : json;
        console.error(
            `[SAFE_JSON] Parse failed${context ? ` (${context})` : ''}:`,
            {
                error: error instanceof Error ? error.message : 'Unknown error',
                dataLength: json.length,
                preview: preview.replace(/[\n\r]/g, ' '),
            }
        );
        return fallback;
    }
}

/**
 * Safely stringify a value to JSON
 * @param value - The value to stringify
 * @param fallback - Fallback string if stringify fails
 * @returns JSON string or fallback
 */
export function safeJsonStringify(value: unknown, fallback: string = 'null'): string {
    try {
        return JSON.stringify(value);
    } catch (error) {
        console.warn('Failed to stringify JSON:', error);
        return fallback;
    }
}

/**
 * Parse JSON with type validation
 * @param json - The JSON string to parse
 * @param validator - Function to validate the parsed value
 * @param fallback - Fallback if parsing or validation fails
 */
export function safeJsonParseWithValidation<T>(
    json: string | null | undefined,
    validator: (value: unknown) => value is T,
    fallback: T
): T {
    if (!json) return fallback;

    try {
        const parsed = JSON.parse(json);
        if (validator(parsed)) {
            return parsed;
        }
        console.warn('JSON validation failed');
        return fallback;
    } catch (error) {
        console.warn('Failed to parse JSON:', error);
        return fallback;
    }
}
