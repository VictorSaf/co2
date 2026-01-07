/**
 * Onboarding Stepper Component
 * Multi-step stepper for KYC onboarding process
 */
import { Fragment } from 'react';
import { CheckIcon } from '@heroicons/react/24/outline';
import type { WorkflowStep } from '../../types/kyc';

interface Step {
  id: WorkflowStep;
  name: string;
  description: string;
}

interface OnboardingStepperProps {
  currentStep: WorkflowStep;
  steps: Step[];
  onStepClick?: (step: WorkflowStep) => void;
}

export default function OnboardingStepper({
  currentStep,
  steps,
  onStepClick,
}: OnboardingStepperProps) {
  const getStepStatus = (stepId: WorkflowStep, index: number) => {
    const currentIndex = steps.findIndex((s) => s.id === currentStep);
    
    if (index < currentIndex) {
      return 'complete';
    }
    if (index === currentIndex) {
      return 'current';
    }
    return 'upcoming';
  };

  return (
    <nav aria-label="Progress" className="w-full pb-8">
      <ol className="flex items-center justify-between">
        {steps.map((step, index) => {
          const status = getStepStatus(step.id, index);
          const isLast = index === steps.length - 1;

          return (
            <li key={step.id} className={`flex ${isLast ? '' : 'flex-1'} items-center`}>
              {status === 'complete' ? (
                <button
                  onClick={() => onStepClick?.(step.id)}
                  className="group flex w-full items-center"
                >
                  <span className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-600 group-hover:bg-primary-700">
                    <CheckIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-xs font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap px-1">
                      {step.name}
                    </span>
                  </span>
                  {!isLast && (
                    <div className="ml-4 h-0.5 w-full bg-primary-600" aria-hidden="true" />
                  )}
                </button>
              ) : status === 'current' ? (
                <button
                  onClick={() => onStepClick?.(step.id)}
                  className="group flex w-full items-center"
                  aria-current="step"
                >
                  <span className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-primary-600 bg-white dark:bg-gray-800 group-hover:border-primary-700 group-hover:bg-gray-50 dark:group-hover:bg-gray-700 transition-colors">
                    <span className="h-2.5 w-2.5 rounded-full bg-primary-600" aria-hidden="true" />
                    <span className="sr-only">{step.name} - {step.description}</span>
                    <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-xs font-medium text-primary-600 whitespace-nowrap px-1">
                      {step.name}
                    </span>
                  </span>
                  {!isLast && (
                    <div className="ml-4 h-0.5 w-full bg-gray-200 dark:bg-gray-700" aria-hidden="true" />
                  )}
                </button>
              ) : (
                <button
                  onClick={() => onStepClick?.(step.id)}
                  className="group flex w-full items-center"
                >
                  <span className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 group-hover:border-gray-400 dark:group-hover:border-gray-500 group-hover:bg-gray-50 dark:group-hover:bg-gray-700 transition-colors">
                    <span className="h-2.5 w-2.5 rounded-full bg-transparent" aria-hidden="true" />
                    <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap px-1">
                      {step.name}
                    </span>
                  </span>
                  {!isLast && (
                    <div className="ml-4 h-0.5 w-full bg-gray-200 dark:bg-gray-700" aria-hidden="true" />
                  )}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

