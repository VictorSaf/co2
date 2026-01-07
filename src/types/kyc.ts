/**
 * TypeScript types for KYC system
 */

export type KYCStatus = 'pending' | 'in_review' | 'approved' | 'rejected' | 'needs_update';

export type RiskLevel = 'low' | 'medium' | 'high';

export type DocumentType = 
  | 'company_registration'
  | 'financial_statement'
  | 'tax_certificate'
  | 'eu_ets_proof'
  | 'power_of_attorney'
  | 'id_document'
  | 'address_proof'
  | 'beneficial_ownership';

export type VerificationStatus = 'pending' | 'verified' | 'rejected';

export type WorkflowStep = 
  | 'document_collection'
  | 'identity_verification'
  | 'sanctions_check'
  | 'eu_ets_verification'
  | 'suitability_assessment'
  | 'appropriateness_assessment'
  | 'final_review'
  | 'approved'
  | 'rejected';

export type WorkflowStatus = 'in_progress' | 'completed' | 'rejected' | 'on_hold';

export type SanctionsCheckStatus = 'pending' | 'cleared' | 'flagged';

export interface KYCDocument {
  id: string;
  user_id: string;
  document_type: DocumentType;
  file_path: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  verification_status: VerificationStatus;
  verification_notes?: string;
  verified_by?: string;
  uploaded_at: string;
  verified_at?: string;
}

export interface KYCWorkflow {
  id: string;
  user_id: string;
  current_step: WorkflowStep;
  status: WorkflowStatus;
  assigned_reviewer?: string;
  workflow_data: Record<string, any>;
  notes?: string;
  started_at: string;
  completed_at?: string;
}

export interface UserKYC {
  id: string;
  username: string;
  email: string;
  company_name?: string;
  address?: string;
  contact_person?: string;
  phone?: string;
  kyc_status: KYCStatus;
  risk_level: RiskLevel;
  kyc_submitted_at?: string;
  kyc_approved_at?: string;
  kyc_reviewed_by?: string;
  kyc_rejection_reason?: string;
  kyc_documents: Array<{
    document_id: string;
    document_type: string;
    file_name: string;
    uploaded_at: string;
  }>;
  eu_ets_registry_account?: string;
  eu_ets_registry_country?: string;
  eu_ets_registry_verified: boolean;
  eu_ets_registry_verified_at?: string;
  suitability_assessment?: SuitabilityAssessment;
  appropriateness_assessment?: AppropriatenessAssessment;
  beneficial_owners: Array<any>;
  pep_status: boolean;
  sanctions_check_status: SanctionsCheckStatus;
  sanctions_check_date?: string;
  last_kyc_review?: string;
  created_at: string;
  updated_at: string;
}

export interface SuitabilityAssessment {
  objectives: 'compliance' | 'hedging' | 'investment';
  risk_tolerance: 'conservative' | 'moderate' | 'aggressive';
  experience: 'beginner' | 'intermediate' | 'advanced';
  knowledge_score: number;
  submitted_at: string;
}

export interface AppropriatenessAssessment {
  knowledge_test: {
    correct_answers: number;
    total_questions: number;
  };
  experience_declaration: {
    has_traded_carbon_certificates: boolean;
    has_traded_similar_products: boolean;
    has_financial_experience: boolean;
  };
  submitted_at: string;
}

export interface EUETSAccount {
  account_number: string;
  country: string;
}

export interface EUETSVerificationResult {
  verified: boolean;
  account_number: string;
  country: string;
  status: 'active' | 'inactive' | 'suspended' | 'unknown';
  verified_at: string;
  verification_method: 'api' | 'manual' | 'mock';
  error?: string;
}

export interface OnboardingData {
  company_name: string;
  address: string;
  contact_person: string;
  phone: string;
}

