export type Language = 'en' | 'hi' | 'mr';

export type TabId = 'find' | 'voice' | 'admin' | 'funding';

export type BenefitCategory =
  | 'income_support'
  | 'irrigation'
  | 'crop_insurance'
  | 'equipment_subsidy'
  | 'solar_pump'
  | 'credit_loan'
  | 'organic_farming'
  | 'soil_health';

export type GovernmentLevel = 'central' | 'state' | 'joint';
export type GenderEligibility = 'all' | 'female_only' | 'female_priority';
export type FarmerGender = 'female' | 'male' | 'other' | 'unspecified';
export type FarmerCategory = 'marginal' | 'small' | 'medium' | 'large' | 'unspecified';
export type LandUnit = 'acre' | 'hectare' | 'guntha' | 'bigha' | 'unknown';

export interface Scheme {
  id: string;
  slug: string;
  officialUrl: string;
  lastVerified: string; // YYYY-MM-DD
  verifiedBy: string;
  governmentLevel: GovernmentLevel;
  states: string[]; // ['ALL'] or ['Maharashtra', ...]
  categories: BenefitCategory[];
  minLandHectares: number; // 0 = no min
  maxLandHectares: number; // 0 = no cap
  maxIncomeINR: number; // 0 = no cap
  genderEligibility: GenderEligibility;
  titleEn: string;
  titleHi: string;
  titleMr: string;
  benefitEn: string;
  benefitHi: string;
  benefitMr: string;
  summaryEn: string;
  summaryHi: string;
  summaryMr: string;
  documentsEn: string[];
  documentsHi: string[];
  documentsMr: string[];
  helpline: string;
  isActive: boolean;
  createdByUid: string;
  source?: 'firestore' | 'verified_catalog';
}

export interface FarmerProfile {
  landAreaRaw: string;
  landUnit: LandUnit;
  landAreaAcres: number | null;
  landAreaHectares: number | null;
  annualIncomeINR: number | null;
  state: string;
  gender: FarmerGender;
  farmerCategory: FarmerCategory;
  needs: BenefitCategory[];
  cropOrContext: string;
  summaryInLanguage: string;
  piiRedacted: boolean;
}

export interface RuleCheck {
  id: string;
  labelEn: string;
  labelHi: string;
  labelMr: string;
  status: 'matched' | 'priority' | 'verify_on_portal';
}

export interface SchemeMatchResult {
  scheme: Scheme;
  relevanceScore: number;
  rules: RuleCheck[];
  isLikelyEligible: boolean;
  priorityNote?: {
    en: string;
    hi: string;
    mr: string;
  };
}

export interface ApplicationGuideStep {
  stepNumber: number;
  title: string;
  detail: string;
}

export interface ApplicationGuideResponse {
  headline: string;
  likelyEligibleNote: string;
  estimatedTimeline: string;
  whereToApply: string;
  steps: ApplicationGuideStep[];
  zeroPiiReminder: string;
  fraudPreventionTip: string;
}

export interface LiveTranscriptTurn {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface AdminRoleRecord {
  uid: string;
  role: 'kvk_admin';
  organization: string;
  grantedByUid: string;
}
