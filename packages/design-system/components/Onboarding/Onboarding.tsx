import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../theme';
import { Button } from '../Button';
import { haptics } from '../../utils/haptics';

/**
 * Onboarding Flow Component
 *
 * Multi-step onboarding with smooth transitions and progress tracking.
 * Helps users get started and understand key features.
 *
 * Research: 50% higher retention with onboarding.
 * Users who complete onboarding are 3x more likely to remain active.
 */

export interface OnboardingStep {
  /**
   * Step ID
   */
  id: string;

  /**
   * Step title
   */
  title: string;

  /**
   * Step description
   */
  description: string;

  /**
   * Optional image/illustration
   */
  image?: string;

  /**
   * Optional emoji/icon
   */
  icon?: string;

  /**
   * Custom content (overrides default rendering)
   */
  content?: React.ReactNode;

  /**
   * Primary action button text
   */
  primaryButtonText?: string;

  /**
   * Secondary action button text
   */
  secondaryButtonText?: string;

  /**
   * Called when primary button clicked
   */
  onPrimary?: () => void | Promise<void>;

  /**
   * Called when secondary button clicked
   */
  onSecondary?: () => void | Promise<void>;

  /**
   * Whether to show skip button
   */
  canSkip?: boolean;
}

export interface OnboardingProps {
  /**
   * Onboarding steps
   */
  steps: OnboardingStep[];

  /**
   * Called when onboarding completes
   */
  onComplete?: () => void;

  /**
   * Called when onboarding is skipped
   */
  onSkip?: () => void;

  /**
   * Whether onboarding is open
   */
  isOpen?: boolean;

  /**
   * Initial step index
   */
  initialStep?: number;

  /**
   * Show progress indicator
   */
  showProgress?: boolean;

  /**
   * Show step numbers
   */
  showStepNumbers?: boolean;

  /**
   * Enable haptic feedback
   */
  enableHaptics?: boolean;

  /**
   * Custom close button text
   */
  closeButtonText?: string;

  /**
   * Allow going back
   */
  allowBack?: boolean;
}

export function Onboarding({
  steps,
  onComplete,
  onSkip,
  isOpen = true,
  initialStep = 0,
  showProgress = true,
  showStepNumbers = false,
  enableHaptics = true,
  closeButtonText = 'Get Started',
  allowBack = true,
}: OnboardingProps) {
  const theme = useTheme();
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [isLoading, setIsLoading] = useState(false);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

  const step = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  /**
   * Go to next step
   */
  const nextStep = useCallback(async () => {
    if (step.onPrimary) {
      setIsLoading(true);
      try {
        await step.onPrimary();
      } finally {
        setIsLoading(false);
      }
    }

    if (enableHaptics) haptics.light();

    if (isLastStep) {
      if (onComplete) onComplete();
    } else {
      setDirection('forward');
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  }, [step, isLastStep, enableHaptics, onComplete, steps.length]);

  /**
   * Go to previous step
   */
  const previousStep = useCallback(async () => {
    if (step.onSecondary) {
      setIsLoading(true);
      try {
        await step.onSecondary();
      } finally {
        setIsLoading(false);
      }
    }

    if (enableHaptics) haptics.light();
    setDirection('backward');
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, [step, enableHaptics]);

  /**
   * Skip onboarding
   */
  const skip = useCallback(() => {
    if (enableHaptics) haptics.light();
    if (onSkip) onSkip();
  }, [enableHaptics, onSkip]);

  /**
   * Slide variants
   */
  const slideVariants = {
    enter: (direction: 'forward' | 'backward') => ({
      x: direction === 'forward' ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: 'forward' | 'backward') => ({
      x: direction === 'forward' ? -300 : 300,
      opacity: 0,
    }),
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: theme.colors.gray[0],
        zIndex: theme.zIndex.modal + 10,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: theme.spacing.lg,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {/* Progress */}
        {showProgress && (
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: 'flex',
                gap: theme.spacing.xs,
                marginBottom: theme.spacing.xs,
              }}
            >
              {steps.map((_, index) => (
                <div
                  key={index}
                  style={{
                    flex: 1,
                    height: 4,
                    borderRadius: theme.radius.full,
                    background:
                      index <= currentStep
                        ? theme.colors.blue[500]
                        : theme.colors.gray[200],
                    transition: 'background 0.3s ease',
                  }}
                />
              ))}
            </div>
            {showStepNumbers && (
              <div
                style={{
                  fontSize: 13,
                  color: theme.colors.gray[500],
                  fontWeight: 600,
                }}
              >
                Step {currentStep + 1} of {steps.length}
              </div>
            )}
          </div>
        )}

        {/* Skip button */}
        {step.canSkip !== false && (
          <button
            onClick={skip}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 15,
              fontWeight: 600,
              color: theme.colors.gray[500],
              cursor: 'pointer',
              padding: theme.spacing.sm,
            }}
          >
            Skip
          </button>
        )}
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: theme.spacing.xl,
          overflow: 'hidden',
        }}
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{
              width: '100%',
              maxWidth: 500,
              textAlign: 'center',
            }}
          >
            {step.content ? (
              <div>{step.content}</div>
            ) : (
              <>
                {/* Icon/Image */}
                {step.icon && (
                  <div
                    style={{
                      fontSize: 80,
                      marginBottom: theme.spacing.xl,
                    }}
                  >
                    {step.icon}
                  </div>
                )}

                {step.image && (
                  <img
                    src={step.image}
                    alt={step.title}
                    style={{
                      width: '100%',
                      maxWidth: 300,
                      height: 'auto',
                      marginBottom: theme.spacing.xl,
                    }}
                  />
                )}

                {/* Title */}
                <h2
                  style={{
                    fontSize: 28,
                    fontWeight: 700,
                    marginBottom: theme.spacing.md,
                    color: theme.colors.gray[900],
                  }}
                >
                  {step.title}
                </h2>

                {/* Description */}
                <p
                  style={{
                    fontSize: 16,
                    color: theme.colors.gray[600],
                    lineHeight: 1.6,
                    marginBottom: theme.spacing.xl,
                  }}
                >
                  {step.description}
                </p>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div
        style={{
          padding: theme.spacing.xl,
          display: 'flex',
          gap: theme.spacing.md,
        }}
      >
        {/* Back button */}
        {!isFirstStep && allowBack && (
          <Button
            onClick={previousStep}
            variant="outline"
            size="lg"
            disabled={isLoading}
          >
            {step.secondaryButtonText || 'Back'}
          </Button>
        )}

        {/* Next/Complete button */}
        <Button
          onClick={nextStep}
          size="lg"
          fullWidth
          isLoading={isLoading}
        >
          {step.primaryButtonText || (isLastStep ? closeButtonText : 'Continue')}
        </Button>
      </div>
    </div>
  );
}

/**
 * Default onboarding steps for TodayPool
 */
export const defaultOnboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    icon: '👋',
    title: 'Welcome to TodayPool',
    description:
      'Create and join decision pools with friends. Vote on everything from dinner plans to weekend adventures.',
    primaryButtonText: 'Get Started',
  },
  {
    id: 'create',
    icon: '✨',
    title: 'Create Your First Pool',
    description:
      'Ask a question, add options, and invite friends to vote. It takes less than a minute.',
    primaryButtonText: 'Next',
  },
  {
    id: 'vote',
    icon: '🗳️',
    title: 'Vote on Proposals',
    description:
      'Browse active pools and vote on your favorite options. See results in real-time.',
    primaryButtonText: 'Next',
  },
  {
    id: 'notifications',
    icon: '🔔',
    title: 'Stay in the Loop',
    description:
      'Get notified when new pools are created, votes are cast, and decisions are made.',
    primaryButtonText: 'Enable Notifications',
  },
];

/**
 * Save onboarding completion state
 */
export function saveOnboardingComplete(key = 'onboarding-complete'): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, 'true');
}

/**
 * Check if onboarding was completed
 */
export function hasCompletedOnboarding(key = 'onboarding-complete'): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(key) === 'true';
}

/**
 * Clear onboarding completion state
 */
export function clearOnboardingState(key = 'onboarding-complete'): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(key);
}
