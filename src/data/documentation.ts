/**
 * Document category types for organizing documentation.
 */
export type DocumentCategory = 'Policy' | 'Procedure' | 'Form' | 'Compliance';

/**
 * Document metadata structure for company policies, procedures, and compliance documents.
 * 
 * @property id - Unique identifier for the document (e.g., 'doc-01', 'doc-kyc')
 * @property filename - PDF filename (e.g., 'Nihao_Carbon_01_Client_Agreement_Terms_of_Business.pdf')
 * @property titleKey - i18n translation key for the document title (e.g., 'doc01Title')
 * @property descriptionKey - i18n translation key for the document description (e.g., 'doc01Description')
 * @property category - Document category for filtering (Policy, Procedure, Form, Compliance)
 * @property number - Optional sequential number for numbered documents (1-18)
 * @property path - Relative path from public folder (e.g., '/documentation/filename.pdf')
 */
export interface Document {
  id: string;
  filename: string;
  titleKey: string; // i18n key for title
  descriptionKey: string; // i18n key for description
  category: DocumentCategory;
  number?: number; // For numbered documents (01-18)
  path: string; // Relative path from public folder
}

/**
 * Array of all company documentation PDFs.
 * Contains 19 documents: 18 numbered documents (01-18) and 1 KYC/AML compliance document.
 * All documents are served from the public/documentation/ directory as static assets.
 */
export const documents: Document[] = [
  {
    id: 'doc-01',
    filename: 'Nihao_Carbon_01_Client_Agreement_Terms_of_Business.pdf',
    titleKey: 'doc01Title',
    descriptionKey: 'doc01Description',
    category: 'Policy',
    number: 1,
    path: '/documentation/Nihao_Carbon_01_Client_Agreement_Terms_of_Business.pdf'
  },
  {
    id: 'doc-02',
    filename: 'Nihao_Carbon_02_Best_Execution_Policy.pdf',
    titleKey: 'doc02Title',
    descriptionKey: 'doc02Description',
    category: 'Policy',
    number: 2,
    path: '/documentation/Nihao_Carbon_02_Best_Execution_Policy.pdf'
  },
  {
    id: 'doc-03',
    filename: 'Nihao_Carbon_03_Conflicts_of_Interest_Policy.pdf',
    titleKey: 'doc03Title',
    descriptionKey: 'doc03Description',
    category: 'Policy',
    number: 3,
    path: '/documentation/Nihao_Carbon_03_Conflicts_of_Interest_Policy.pdf'
  },
  {
    id: 'doc-04',
    filename: 'Nihao_Carbon_04_Complaints_Handling_Procedure.pdf',
    titleKey: 'doc04Title',
    descriptionKey: 'doc04Description',
    category: 'Procedure',
    number: 4,
    path: '/documentation/Nihao_Carbon_04_Complaints_Handling_Procedure.pdf'
  },
  {
    id: 'doc-05',
    filename: 'Nihao_Carbon_05_Risk_Disclosure_Statement.pdf',
    titleKey: 'doc05Title',
    descriptionKey: 'doc05Description',
    category: 'Policy',
    number: 5,
    path: '/documentation/Nihao_Carbon_05_Risk_Disclosure_Statement.pdf'
  },
  {
    id: 'doc-06',
    filename: 'Nihao_Carbon_06_Privacy_Policy_GDPR.pdf',
    titleKey: 'doc06Title',
    descriptionKey: 'doc06Description',
    category: 'Policy',
    number: 6,
    path: '/documentation/Nihao_Carbon_06_Privacy_Policy_GDPR.pdf'
  },
  {
    id: 'doc-07',
    filename: 'Nihao_Carbon_07_Business_Continuity_Plan.pdf',
    titleKey: 'doc07Title',
    descriptionKey: 'doc07Description',
    category: 'Policy',
    number: 7,
    path: '/documentation/Nihao_Carbon_07_Business_Continuity_Plan.pdf'
  },
  {
    id: 'doc-08',
    filename: 'Nihao_Carbon_08_Client_Onboarding_Form.pdf',
    titleKey: 'doc08Title',
    descriptionKey: 'doc08Description',
    category: 'Form',
    number: 8,
    path: '/documentation/Nihao_Carbon_08_Client_Onboarding_Form.pdf'
  },
  {
    id: 'doc-09',
    filename: 'Nihao_Carbon_09_Order_Execution_Policy.pdf',
    titleKey: 'doc09Title',
    descriptionKey: 'doc09Description',
    category: 'Policy',
    number: 9,
    path: '/documentation/Nihao_Carbon_09_Order_Execution_Policy.pdf'
  },
  {
    id: 'doc-10',
    filename: 'Nihao_Carbon_10_Market_Abuse_Policy.pdf',
    titleKey: 'doc10Title',
    descriptionKey: 'doc10Description',
    category: 'Policy',
    number: 10,
    path: '/documentation/Nihao_Carbon_10_Market_Abuse_Policy.pdf'
  },
  {
    id: 'doc-11',
    filename: 'Nihao_Carbon_11_Remuneration_Policy.pdf',
    titleKey: 'doc11Title',
    descriptionKey: 'doc11Description',
    category: 'Policy',
    number: 11,
    path: '/documentation/Nihao_Carbon_11_Remuneration_Policy.pdf'
  },
  {
    id: 'doc-12',
    filename: 'Nihao_Carbon_12_Product_Governance_Policy.pdf',
    titleKey: 'doc12Title',
    descriptionKey: 'doc12Description',
    category: 'Policy',
    number: 12,
    path: '/documentation/Nihao_Carbon_12_Product_Governance_Policy.pdf'
  },
  {
    id: 'doc-13',
    filename: 'Nihao_Carbon_13_Suitability_Appropriateness_Policy.pdf',
    titleKey: 'doc13Title',
    descriptionKey: 'doc13Description',
    category: 'Policy',
    number: 13,
    path: '/documentation/Nihao_Carbon_13_Suitability_Appropriateness_Policy.pdf'
  },
  {
    id: 'doc-14',
    filename: 'Nihao_Carbon_14_Outsourcing_Policy.pdf',
    titleKey: 'doc14Title',
    descriptionKey: 'doc14Description',
    category: 'Policy',
    number: 14,
    path: '/documentation/Nihao_Carbon_14_Outsourcing_Policy.pdf'
  },
  {
    id: 'doc-15',
    filename: 'Nihao_Carbon_15_Code_of_Ethics.pdf',
    titleKey: 'doc15Title',
    descriptionKey: 'doc15Description',
    category: 'Policy',
    number: 15,
    path: '/documentation/Nihao_Carbon_15_Code_of_Ethics.pdf'
  },
  {
    id: 'doc-16',
    filename: 'Nihao_Carbon_16_Record_Keeping_Policy.pdf',
    titleKey: 'doc16Title',
    descriptionKey: 'doc16Description',
    category: 'Policy',
    number: 16,
    path: '/documentation/Nihao_Carbon_16_Record_Keeping_Policy.pdf'
  },
  {
    id: 'doc-17',
    filename: 'Nihao_Carbon_17_Information_Security_Policy.pdf',
    titleKey: 'doc17Title',
    descriptionKey: 'doc17Description',
    category: 'Policy',
    number: 17,
    path: '/documentation/Nihao_Carbon_17_Information_Security_Policy.pdf'
  },
  {
    id: 'doc-18',
    filename: 'Nihao_Carbon_18_Transaction_Reporting_Policy.pdf',
    titleKey: 'doc18Title',
    descriptionKey: 'doc18Description',
    category: 'Policy',
    number: 18,
    path: '/documentation/Nihao_Carbon_18_Transaction_Reporting_Policy.pdf'
  },
  {
    id: 'doc-kyc',
    filename: 'Nihao_Carbon_Certificates_KYC_AML_Compliance_Procedure.pdf',
    titleKey: 'docKycTitle',
    descriptionKey: 'docKycDescription',
    category: 'Compliance',
    path: '/documentation/Nihao_Carbon_Certificates_KYC_AML_Compliance_Procedure.pdf'
  }
];

