/**
 * Appropriateness Assessment Component
 * Knowledge test and experience declaration for appropriateness assessment
 */
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { submitAppropriatenessAssessment } from '../../services/kycService';
import type { AppropriatenessAssessment } from '../../types/kyc';

interface AppropriatenessAssessmentProps {
  onComplete?: (assessment: AppropriatenessAssessment) => void;
  initialData?: Partial<AppropriatenessAssessment>;
}

interface Question {
  id: number;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
}

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || 
  (import.meta.env.DEV ? '/api' : 'http://localhost:5000');

export default function AppropriatenessAssessment({
  onComplete,
  initialData,
}: AppropriatenessAssessmentProps) {
  const { t } = useTranslation();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [experience, setExperience] = useState({
    has_traded_carbon_certificates: initialData?.experience_declaration?.has_traded_carbon_certificates || false,
    has_traded_similar_products: initialData?.experience_declaration?.has_traded_similar_products || false,
    has_financial_experience: initialData?.experience_declaration?.has_financial_experience || false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      setIsLoading(true);
      const userId = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).id : null;
      const response = await axios.get(`${BACKEND_API_URL}/kyc/knowledge-questions`, {
        headers: userId ? { 'X-User-ID': userId } : {},
      });
      setQuestions(response.data.questions);
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
        t('kyc.appropriateness.loadQuestionsFailed', 'Failed to load questions. Please try again.')
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = (questionId: number, answerIndex: number) => {
    setAnswers({ ...answers, [questionId]: answerIndex });
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length !== questions.length) {
      setError(t('kyc.appropriateness.answerAllQuestions', 'Please answer all questions'));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const correctAnswers = questions.filter(
        (q) => answers[q.id] === q.correct_answer
      ).length;

      const assessment = await submitAppropriatenessAssessment({
        knowledge_test: {
          correct_answers: correctAnswers,
          total_questions: questions.length,
        },
        experience_declaration: experience,
      });

      setResult(assessment.assessment);
      setShowResults(true);
      onComplete?.(assessment.assessment);
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
        t('kyc.appropriateness.submitFailed', 'Failed to submit assessment. Please try again.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getScore = () => {
    if (questions.length === 0) return 0;
    const correct = questions.filter((q) => answers[q.id] === q.correct_answer).length;
    return Math.round((correct / questions.length) * 100);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (showResults && result) {
    const assessmentResult = result.assessment_result;
    const score = getScore();
    const isApproved = assessmentResult?.status === 'approved' || assessmentResult?.status === 'approved_with_education';

    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          {isApproved ? (
            <CheckCircleIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
          ) : (
            <XCircleIcon className="h-8 w-8 text-red-600 dark:text-red-400" />
          )}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {t('kyc.appropriateness.assessmentComplete', 'Assessment Complete')}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('kyc.appropriateness.score', 'Score')}: {score}% ({assessmentResult?.correct_answers}/{assessmentResult?.total_questions})
            </p>
          </div>
        </div>

        <div
          className={`rounded-md p-4 ${
            isApproved
              ? 'bg-green-50 dark:bg-green-900/20'
              : 'bg-red-50 dark:bg-red-900/20'
          }`}
        >
          <p
            className={`text-sm font-medium ${
              isApproved
                ? 'text-green-800 dark:text-green-200'
                : 'text-red-800 dark:text-red-200'
            }`}
          >
            {assessmentResult?.status === 'approved' &&
              t('kyc.appropriateness.approved', 'You have been approved for full access to carbon certificate trading.')}
            {assessmentResult?.status === 'approved_with_education' &&
              t(
                'kyc.appropriateness.approvedWithEducation',
                'You have been approved with limited access. Please complete educational materials.'
              )}
            {assessmentResult?.status === 'needs_education' &&
              t(
                'kyc.appropriateness.needsEducation',
                'You need to complete education before trading. Please review our educational resources.'
              )}
            {assessmentResult?.status === 'rejected' &&
              t(
                'kyc.appropriateness.rejected',
                'Your knowledge score is too low. Please complete comprehensive education.'
              )}
          </p>
        </div>

        {assessmentResult?.recommendations && assessmentResult.recommendations.length > 0 && (
          <div className="rounded-md bg-blue-50 dark:bg-blue-900/20 p-4">
            <h5 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
              {t('kyc.appropriateness.recommendations', 'Recommendations')}
            </h5>
            <ul className="list-disc list-inside text-sm text-blue-700 dark:text-blue-300 space-y-1">
              {assessmentResult.recommendations.map((rec: string, index: number) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 dark:text-gray-100">
            {t('kyc.appropriateness.reviewAnswers', 'Review Your Answers')}
          </h4>
          {questions.map((question) => {
            const userAnswer = answers[question.id];
            const isCorrect = userAnswer === question.correct_answer;
            return (
              <div
                key={question.id}
                className={`rounded-md p-4 border ${
                  isCorrect
                    ? 'border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-700'
                    : 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-700'
                }`}
              >
                <p className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                  {question.question}
                </p>
                <div className="space-y-1 mb-2">
                  {question.options.map((option, index) => (
                    <div
                      key={index}
                      className={`text-sm ${
                        index === question.correct_answer
                          ? 'text-green-700 dark:text-green-300 font-medium'
                          : index === userAnswer && !isCorrect
                          ? 'text-red-700 dark:text-red-300'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {index === question.correct_answer && '✓ '}
                      {index === userAnswer && !isCorrect && '✗ '}
                      {option}
                    </div>
                  ))}
                </div>
                {!isCorrect && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                    <strong>{t('kyc.appropriateness.explanation', 'Explanation')}:</strong>{' '}
                    {question.explanation}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          {t('kyc.appropriateness.title', 'Appropriateness Assessment')}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t(
            'kyc.appropriateness.description',
            'Please complete the knowledge test and declare your experience. A minimum score of 70% is required for approval.'
          )}
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4">
            {t('kyc.appropriateness.knowledgeTest', 'Knowledge Test')}
          </h4>
          <div className="space-y-6">
            {questions.map((question) => (
              <div key={question.id} className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <p className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                  {question.id}. {question.question}
                </p>
                <div className="space-y-2">
                  {question.options.map((option, index) => (
                    <label
                      key={index}
                      className="flex items-center space-x-2 cursor-pointer p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={index}
                        checked={answers[question.id] === index}
                        onChange={() => handleAnswer(question.id, index)}
                        className="text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4">
            {t('kyc.appropriateness.experienceDeclaration', 'Experience Declaration')}
          </h4>
          <div className="space-y-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={experience.has_traded_carbon_certificates}
                onChange={(e) =>
                  setExperience({ ...experience, has_traded_carbon_certificates: e.target.checked })
                }
                className="text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {t(
                  'kyc.appropriateness.hasTradedCarbon',
                  'I have previously traded carbon certificates'
                )}
              </span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={experience.has_traded_similar_products}
                onChange={(e) =>
                  setExperience({ ...experience, has_traded_similar_products: e.target.checked })
                }
                className="text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {t(
                  'kyc.appropriateness.hasTradedSimilar',
                  'I have traded similar financial products'
                )}
              </span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={experience.has_financial_experience}
                onChange={(e) =>
                  setExperience({ ...experience, has_financial_experience: e.target.checked })
                }
                className="text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {t(
                  'kyc.appropriateness.hasFinancialExperience',
                  'I have general financial trading experience'
                )}
              </span>
            </label>
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={isSubmitting || Object.keys(answers).length !== questions.length}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting
            ? t('kyc.appropriateness.submitting', 'Submitting...')
            : t('kyc.appropriateness.submit', 'Submit Assessment')}
        </button>
      </div>
    </div>
  );
}

