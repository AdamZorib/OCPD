/**
 * Claim status constants to avoid magic strings throughout codebase
 */

export const ClaimStatus = {
    REPORTED: 'REPORTED',
    UNDER_REVIEW: 'UNDER_REVIEW',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
    PAID: 'PAID',
    CLOSED: 'CLOSED',
} as const;

export type ClaimStatusType = typeof ClaimStatus[keyof typeof ClaimStatus];

/** Statuses that count toward aggregate claim totals */
export const ACTIVE_CLAIM_STATUSES: ClaimStatusType[] = [
    ClaimStatus.REPORTED,
    ClaimStatus.UNDER_REVIEW,
    ClaimStatus.APPROVED,
    ClaimStatus.PAID,
];

/** Statuses that are excluded from aggregate claim totals */
export const EXCLUDED_CLAIM_STATUSES: ClaimStatusType[] = [
    ClaimStatus.REJECTED,
    ClaimStatus.CLOSED,
];

/** Statuses that block client deletion */
export const OPEN_CLAIM_STATUSES: ClaimStatusType[] = [
    ClaimStatus.REPORTED,
    ClaimStatus.UNDER_REVIEW,
];

/**
 * Policy status constants
 */
export const PolicyStatus = {
    DRAFT: 'DRAFT',
    QUOTED: 'QUOTED',
    ACTIVE: 'ACTIVE',
    EXPIRED: 'EXPIRED',
    CANCELLED: 'CANCELLED',
} as const;

export type PolicyStatusType = typeof PolicyStatus[keyof typeof PolicyStatus];

/** Statuses that block client deletion */
export const ACTIVE_POLICY_STATUSES: PolicyStatusType[] = [
    PolicyStatus.ACTIVE,
    PolicyStatus.QUOTED,
];

export const ALL_POLICY_STATUSES: PolicyStatusType[] = Object.values(PolicyStatus);
