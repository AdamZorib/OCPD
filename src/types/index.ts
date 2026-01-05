// Core Types for OCPD Insurance Platform

// ============ ENUMS ============

export type PolicyStatus = 'DRAFT' | 'QUOTED' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
export type ClauseType = 'GROSS_NEGLIGENCE' | 'PARKING' | 'UNAUTHORIZED_RELEASE' | 'DOCUMENTS' | 'SUBCONTRACTORS' | 'REFRIGERATED' | 'ADR';
export type TerritorialScope = 'POLAND' | 'EUROPE' | 'WORLD';
export type VehicleType = 'TRUCK' | 'SEMI_TRAILER' | 'VAN' | 'REFRIGERATED' | 'TANKER' | 'FLATBED';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';

// ============ CLIENT & COMPANY ============

export interface RegonData {
  nip: string;
  regon: string;
  name: string;
  shortName?: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
    voivodeship: string;
  };
  pkdCodes: string[];
  registrationDate: string;
  employeeCount?: string;
  legalForm: string;
}

export interface Client {
  id: string;
  nip: string;
  name: string;
  email: string;
  phone: string;
  regonData?: RegonData;
  fleet: Vehicle[];
  riskProfile: RiskProfile;
  claimsHistory: Claim[];
  createdAt: Date;
  updatedAt: Date;
  brokerId: string;
}

export interface RiskProfile {
  overallScore: number; // 1-100
  riskLevel: RiskLevel;
  yearsInBusiness: number;
  claimsRatio: number; // claims / premium ratio
  bonusMalus: number; // -50% to +100%
  transportTypes: string[];
  mainRoutes: TerritorialScope[];
  hasADRCertificate: boolean;
  hasTAPACertificate: boolean;
}

// ============ VEHICLES ============

export interface Vehicle {
  id: string;
  registrationNumber: string;
  vin?: string;
  type: VehicleType;
  brand: string;
  model: string;
  year: number;
  maxLoadCapacity: number; // kg
  ownerNIP: string;
  technicalInspectionValid: boolean;
  technicalInspectionDate?: Date;
  ocpValidTo?: Date;
}

export interface CEPiKData {
  registrationNumber: string;
  vin: string;
  brand: string;
  model: string;
  productionYear: number;
  engineCapacity: number;
  fuelType: string;
  maxWeight: number;
  ownWeight: number;
  technicalInspectionValidTo: Date;
  insuranceOCValidTo?: Date;
  ownerData?: {
    name: string;
    address: string;
  };
}

// ============ POLICIES ============

export interface Policy {
  id: string;
  policyNumber: string;
  clientId: string;
  client?: Client;
  type: 'OCPD' | 'OCP_KABOTAZ' | 'CARGO';
  status: PolicyStatus;
  
  // Coverage
  sumInsured: number;
  territorialScope: TerritorialScope;
  clauses: PolicyClause[];
  
  // Pricing
  basePremium: number;
  clausesPremium: number;
  totalPremium: number;
  
  // Dates
  validFrom: Date;
  validTo: Date;
  issuedAt?: Date;
  
  // APK
  apkCompleted: boolean;
  apkData?: APKData;
  
  // Documents
  ipidGenerated: boolean;
  policyCertificateUrl?: string;
  
  // Metadata
  brokerId: string;
  underwriterId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PolicyClause {
  id: string;
  type: ClauseType;
  name: string;
  description: string;
  sublimit?: number;
  sublimitPercentage?: number;
  premium: number;
  isActive: boolean;
}

// ============ APK (Analiza Potrzeb Klienta) ============

export interface APKData {
  id: string;
  policyId: string;
  completedAt: Date;
  
  // Transport characteristics
  mainCargoTypes: string[];
  averageCargoValue: number;
  maxSingleShipmentValue: number;
  monthlyShipments: number;
  
  // Routes
  domesticTransport: boolean;
  internationalTransport: boolean;
  mainDestinations: string[];
  
  // Risks
  highValueGoods: boolean;
  dangerousGoods: boolean;
  temperatureControlled: boolean;
  
  // History
  claimsLast3Years: number;
  biggestClaimAmount?: number;
  
  // Special requirements
  requiresGrossNegligence: boolean;
  requiresParkingCoverage: boolean;
  requiresSubcontractorsCoverage: boolean;
  
  // Client declaration
  clientSignature?: string;
  clientSignatureDate?: Date;
}

// ============ CLAIMS ============

export interface Claim {
  id: string;
  claimNumber: string;
  policyId: string;
  clientId: string;
  
  // Incident
  incidentDate: Date;
  reportedDate: Date;
  description: string;
  location?: string;
  
  // Financials
  claimedAmount: number;
  reservedAmount?: number;
  paidAmount?: number;
  
  // Status
  status: 'REPORTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'PAID' | 'CLOSED';
  
  // Documents
  documents: ClaimDocument[];
  
  createdAt: Date;
  updatedAt: Date;
}

export interface ClaimDocument {
  id: string;
  name: string;
  type: 'CMR' | 'PHOTO' | 'INVOICE' | 'POLICE_REPORT' | 'OTHER';
  url: string;
  uploadedAt: Date;
}

// ============ CERTIFICATES ============

export interface Certificate {
  id: string;
  certificateNumber: string;
  policyId: string;
  policy?: Policy;
  
  // Transport details
  cargoDescription: string;
  cargoValue: number;
  loadingPlace: string;
  unloadingPlace: string;
  transportDate: Date;
  vehicleRegistration: string;
  
  // Generated
  generatedAt: Date;
  generatedBy: string;
  pdfUrl?: string;
  
  isValid: boolean;
}

// ============ USERS ============

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'CLIENT' | 'BROKER' | 'UNDERWRITER' | 'ADMIN';
  phone?: string;
  
  // For brokers
  brokerLicense?: string;
  brokerId?: string;
  
  // For clients
  clientId?: string;
  
  createdAt: Date;
  lastLoginAt?: Date;
}

export interface Broker {
  id: string;
  userId: string;
  companyName: string;
  nip: string;
  licenseNumber: string;
  email: string;
  phone: string;
  
  // Portfolio stats
  activeClients: number;
  activePolicies: number;
  totalPremium: number;
  
  createdAt: Date;
}

// ============ QUOTES ============

export interface QuoteRequest {
  id: string;
  clientNIP: string;
  clientData?: RegonData;
  
  // Coverage request
  requestedSumInsured: number;
  requestedScope: TerritorialScope;
  requestedClauses: ClauseType[];
  
  // APK answers
  apkData: Partial<APKData>;
  
  // Calculated
  calculatedPremium?: number;
  premiumBreakdown?: PremiumBreakdown;
  
  // Status
  status: 'DRAFT' | 'CALCULATED' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  
  validUntil?: Date;
  createdAt: Date;
  brokerId: string;
}

export interface PremiumBreakdown {
  basePremium: number;
  scopeModifier: number;
  riskModifier: number;
  bonusMalusModifier: number;
  clausesPremium: { [key in ClauseType]?: number };
  totalPremium: number;
}

// ============ DASHBOARD STATS ============

export interface DashboardStats {
  activePolicies: number;
  expiringPolicies30Days: number;
  expiringPolicies60Days: number;
  totalPremium: number;
  pendingQuotes: number;
  openClaims: number;
  claimsRatio: number;
  topClients: { name: string; premium: number }[];
}
