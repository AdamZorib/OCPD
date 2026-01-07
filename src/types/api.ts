/**
 * API Response Types
 * Proper TypeScript types to replace `any[]` usage in frontend
 */

// ============ Client Types ============

export interface ClientAddress {
    street?: string;
    houseNumber?: string;
    apartmentNumber?: string;
    city?: string;
    postalCode?: string;
    voivodeship?: string;
}

export interface RiskProfile {
    overallScore: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
    yearsInBusiness: number;
    claimsRatio: number;
    bonusMalus: number;
    transportTypes: string[];
    mainRoutes: string[];
    hasADRCertificate: boolean;
    hasTAPACertificate: boolean;
}

export interface FleetVehicle {
    registrationNumber: string;
    brand: string;
    model: string;
    year: number;
    vin: string;
    type?: string;
}

export interface ClaimHistoryItem {
    id: string;
    date: string;
    amount: number;
    description: string;
    status: string;
}

export interface ClientResponse {
    id: string;
    nip: string;
    name: string;
    email?: string | null;
    phone?: string | null;
    street?: string | null;
    houseNumber?: string | null;
    apartmentNumber?: string | null;
    city?: string | null;
    postalCode?: string | null;
    voivodeship?: string | null;
    regonData?: Record<string, unknown> | null;
    riskProfile?: RiskProfile | null;
    fleet?: FleetVehicle[];
    claimsHistory?: ClaimHistoryItem[];
    brokerId?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface ClientListResponse {
    data: ClientResponse[];
    total: number;
}

// ============ Policy Types ============

export type PolicyStatus = 'DRAFT' | 'QUOTED' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
export type TerritorialScope = 'POLAND' | 'EUROPE' | 'WORLD';
export type PolicyType = 'OCPD' | 'OCP' | 'OCS';

export interface PolicyClause {
    type: string;
    name: string;
    premium: number;
}

export interface PolicyClient {
    id: string;
    name?: string | null;
    nip: string;
}

export interface PolicyResponse {
    id: string;
    policyNumber: string;
    clientId: string;
    clientNIP: string;
    clientName?: string | null;
    client?: PolicyClient;
    type: string; // PolicyType in DB but string at runtime
    status: string; // PolicyStatus in DB but string at runtime
    sumInsured: number;
    territorialScope: string; // TerritorialScope in DB but string at runtime
    basePremium?: number | null;
    clausesPremium?: number | null;
    totalPremium?: number | null;
    clauses?: PolicyClause[];
    validFrom?: string | null;
    validTo?: string | null;
    issuedAt?: string | null;
    apkCompleted: boolean;
    ipidGenerated: boolean;
    signatureStatus?: string | null;
    signatureId?: string | null;
    signedAt?: string | null;
    brokerId?: string | null;
    underwriterId?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface PolicyStats {
    active: number;
    expired: number;
    totalPremium: number;
}

export interface PolicyListResponse {
    data: PolicyResponse[];
    total: number;
    stats: PolicyStats;
}

// ============ Quote Types ============

export type QuoteStatus = 'DRAFT' | 'CALCULATED' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';

export interface CalculationBreakdown {
    basePremium: number;
    scopeModifier: number;
    riskModifier: number;
    bonusMalusModifier: number;
    clausesPremium: Record<string, number>;
    totalPremium: number;
    cargoTypeModifier?: number;
    subcontractorModifier?: number;
    deductibleModifier?: number;
    countrySurcharge?: number;
    installmentSurcharge?: number;
}

export interface CalculationResult {
    breakdown: CalculationBreakdown;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
    isAutoApproved: boolean;
    referralReasons: string[];
    minimumPremium: number;
}

export interface QuoteResponse {
    id: string;
    clientNIP: string;
    clientName?: string | null;
    clientEmail?: string | null;
    clientPhone?: string | null;
    clientStreet?: string | null;
    clientCity?: string | null;
    clientPostalCode?: string | null;
    yearsInBusiness?: number | null;
    fleetSize?: number | null;
    sumInsured: number;
    territorialScope: string; // TerritorialScope
    policyDuration?: number | null;
    cargoType?: string | null;
    subcontractorPercent?: number | null;
    paymentInstallments?: number | null;
    deductibleLevel?: string | null;
    apkData?: Record<string, unknown> | null;
    selectedClauses?: string[];
    selectedVariant?: string | null;
    calculationResult?: CalculationResult | null;
    vehicles?: FleetVehicle[];
    status: string; // QuoteStatus
    brokerId?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface QuoteListResponse {
    data: QuoteResponse[];
    total: number;
}

// ============ Claim Types ============

export type ClaimStatus = 'REPORTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'PAID' | 'CLOSED';

export interface ClaimDocument {
    id: string;
    name: string;
    type: string;
    url: string;
    uploadedAt: string;
}

export interface ClaimResponse {
    id: string;
    claimNumber: string;
    policyId: string;
    clientId: string;
    incidentDate: string;
    reportedDate: string;
    description: string;
    location?: string | null;
    claimedAmount: number;
    reservedAmount?: number | null;
    paidAmount?: number | null;
    status: string; // ClaimStatus
    policyNumber?: string;
    clientName?: string;
    clientNIP?: string;
    documents?: ClaimDocument[];
    createdAt: string;
    updatedAt: string;
}

export interface ClaimListResponse {
    data: ClaimResponse[];
    total: number;
}

// ============ Dashboard Types ============

export interface DashboardTopClient {
    name: string;
    premium: number;
}

export interface DashboardRecentPolicy {
    id: string;
    policyNumber: string;
    clientName?: string | null;
    premium?: number | null;
    validTo?: string | null;
    status: string; // PolicyStatus
    date?: string | null;
}

export interface DashboardOpenClaim {
    id: string;
    claimNumber: string;
    description: string;
    amount: number;
    status: string; // ClaimStatus
    date: string;
}

export interface DashboardPendingQuote {
    id: string;
    clientNIP: string;
    sumInsured: number;
    premium?: number | null;
    status: string; // QuoteStatus
}

export interface DashboardStats {
    activePolicies: number;
    expiringPolicies30Days: number;
    expiringPolicies60Days: number;
    totalPremium: number;
    pendingQuotes: number;
    openClaims: number;
    claimsRatio: number;
    topClients: DashboardTopClient[];
    recentActivity: {
        newPolicies: DashboardRecentPolicy[];
        openClaimsList: DashboardOpenClaim[];
        pendingQuotesList: DashboardPendingQuote[];
    };
}

// ============ Error Types ============

export interface ApiError {
    error: string;
    details?: { path: string; message: string }[];
}

export interface ApiValidationError {
    error: string;
    validationErrors: { path: string; message: string }[];
}
