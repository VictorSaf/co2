/**
 * Suitability Assessment Component
 * Form for assessing client suitability for carbon certificate trading
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { submitSuitabilityAssessment } from '../../services/kycService';
import type { SuitabilityAssessment } from '../../types/kyc';

interface SuitabilityAssessmentProps {
  onComplete?: (assessment: SuitabilityAssessment) => void;
  initialData?: Partial<SuitabilityAssessment>;
}

export default function SuitabilityAssessment({
  onComplete,
  initialData,
}: SuitabilityAssessmentProps) {
  const { t } = useTranslation();
  const [objectives, setObjectives] = useState<'compliance' | 'hedging' | 'investment' | ''>(
    initialData?.objectives || ''
  );
  const [riskTolerance, setRiskTolerance] = useState<'conservative' | 'moderate' | 'aggressive' | ''>(
    initialData?.risk_tolerance || ''
  );
  const [experience, setExperience] = useState<'beginner' | 'intermediate' | 'advanced' | ''>(
    initialData?.experience || ''
  );
  const [knowledgeScore, setKnowledgeScore] = useState<number>(initialData?.knowledge_score || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async () => {
    if (!objectives || !riskTolerance || !experience) {
      setError(t('kyc.suitability.allFieldsRequired', 'Please fill in all fields'));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const assessment = await submitSuitabilityAssessment({
        objectives: objectives as 'compliance' | 'hedging' | 'investment',
        risk_tolerance: riskTolerance as 'conservative' | 'moderate' | 'aggressive',
        experience: experience as 'beginner' | 'intermediate' | 'advanced',
        knowledge_score: knowledgeScore,
      });

      setResult(assessment.assessment);
      onComplete?.(assessment.assessment);
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
        t('kyc.suitability.submitFailed', 'Failed to submit assessment. Please try again.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getResultIcon = () => {
    if (!result) return null;
    const level = result.assessment_result?.level;
    if (level === 'suitable') {
      return <CheckCircleIcon className="h-8 w-8 text-green-600 dark:text-green-400" />;
    } else if (level === 'suitable_with_warnings') {
      return <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />;
    } else {
      return <XCircleIcon className="h-8 w-8 text-red-600 dark:text-red-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          {t('kyc.suitability.title', 'Suitability Assessment')}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t(
            'kyc.suitability.description',
            'Please answer the following questions to assess your suitability for carbon certificate trading.'
          )}
        </p>
      </div>

      {!result ? (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('kyc.suitability.objectives', 'What are your main objectives?')} <span className="text-red-500">*</span>
            </label>
            <select
              value={objectives}
              onChange={(e) => setObjectives(e.target.value as any)}
              className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-800 dark:text-gray-100"
            >
              <option value="">{t('kyc.suitability.selectObjective', 'Select an objective')}</option>
              <option value="compliance">
                {t('kyc.suitability.objectiveCompliance', 'Compliance - Meeting regulatory requirements')}
              </option>
              <option value="hedging">
                {t('kyc.suitability.objectiveHedging', 'Hedging - Managing emissions risk')}
              </option>
              <option value="investment">
                {t('kyc.suitability.objectiveInvestment', 'Investment - Trading for profit')}
              </option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('kyc.suitability.riskTolerance', 'What is your risk tolerance?')} <span className="text-red-500">*</span>
            </label>
            <select
              value={riskTolerance}
              onChange={(e) => setRiskTolerance(e.target.value as any)}
              className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-800 dark:text-gray-100"
            >
              <option value="">{t('kyc.suitability.selectRiskTolerance', 'Select risk tolerance')}</option>
              <option value="conservative">
                {t('kyc.suitability.riskConservative', 'Conservative - Prefer low risk')}
              </option>
              <option value="moderate">
                {t('kyc.suitability.riskModerate', 'Moderate - Accept moderate risk')}
              </option>
              <option value="aggressive">
                {t('kyc.suitability.riskAggressive', 'Aggressive - Accept high risk')}
              </option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('kyc.suitability.experience', 'What is your trading experience?')} <span className="text-red-500">*</span>
            </label>
            <select
              value={experience}
              onChange={(e) => setExperience(e.target.value as any)}
              className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-800 dark:text-gray-100"
            >
              <option value="">{t('kyc.suitability.selectExperience', 'Select experience level')}</option>
              <option value="beginner">
                {t('kyc.suitability.experienceBeginner', 'Beginner - Limited or no experience')}
              </option>
              <option value="intermediate">
                {t('kyc.suitability.experienceIntermediate', 'Intermediate - Some experience')}
              </option>
              <option value="advanced">
                {t('kyc.suitability.experienceAdvanced', 'Advanced - Extensive experience')}
              </option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('kyc.suitability.knowledgeScore', 'Knowledge Score (0-100)')}
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={knowledgeScore}
              onChange={(e) => setKnowledgeScore(parseInt(e.target.value) || 0)}
              className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-800 dark:text-gray-100"
              placeholder="0-100"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {t(
                'kyc.suitability.knowledgeScoreHint',
                'Your knowledge score from the appropriateness assessment (if completed)'
              )}
            </p>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !objectives || !riskTolerance || !experience}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting
              ? t('kyc.suitability.submitting', 'Submitting...')
              : t('kyc.suitability.submit', 'Submit Assessment')}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            {getResultIcon()}
            <div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {t('kyc.suitability.assessmentComplete', 'Assessment Complete')}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('kyc.suitability.score', 'Score')}: {result.assessment_result?.score || 0}/100
              </p>
            </div>
          </div>

          {result.assessment_result?.warnings && result.assessment_result.warnings.length > 0 && (
            <div className="rounded-md bg-yellow-50 dark:bg-yellow-900/20 p-4">
              <h5 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                {t('kyc.suitability.warnings', 'Warnings')}
              </h5>
              <ul className="list-disc list-inside text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                {result.assessment_result.warnings.map((warning: string, index: number) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          )}

          {result.assessment_result?.recommendations &&
            result.assessment_result.recommendations.length > 0 && (
              <div className="rounded-md bg-blue-50 dark:bg-blue-900/20 p-4">
                <h5 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                  {t('kyc.suitability.recommendations', 'Recommendations')}
                </h5>
                <ul className="list-disc list-inside text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  {result.assessment_result.recommendations.map((rec: string, index: number) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}

          {result.product_recommendations && (
            <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-4">
              <h5 className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                {t('kyc.suitability.productRecommendations', 'Product Recommendations')}
              </h5>
              <p className="text-sm text-green-700 dark:text-green-300 mb-2">
                {result.product_recommendations.reasoning}
              </p>
              {result.product_recommendations.recommended_products &&
                result.product_recommendations.recommended_products.length > 0 && (
                  <p className="text-sm text-green-700 dark:text-green-300">
                    <strong>{t('kyc.suitability.recommended', 'Recommended')}:</strong>{' '}
                    {result.product_recommendations.recommended_products.join(', ')}
                  </p>
                )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

