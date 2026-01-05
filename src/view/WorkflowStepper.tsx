import { ReviewStep } from '@controller/WorkflowController'
import './WorkflowStepper.css'

interface WorkflowStepperProps {
  currentStep: ReviewStep
  onStepClick: (step: ReviewStep) => void
  canGoToStep: (step: ReviewStep) => boolean
  getStepDescription: (step: ReviewStep) => string
}

const steps: ReviewStep[] = [
  ReviewStep.Overview,
  ReviewStep.FocusAreas,
  ReviewStep.DetailedReview,
  ReviewStep.Summary,
]

const stepLabels: Record<ReviewStep, string> = {
  [ReviewStep.Overview]: 'Overview',
  [ReviewStep.FocusAreas]: 'Focus Areas',
  [ReviewStep.DetailedReview]: 'Detailed Review',
  [ReviewStep.Summary]: 'Summary',
}

export function WorkflowStepper({
  currentStep,
  onStepClick,
  canGoToStep,
  getStepDescription,
}: WorkflowStepperProps) {
  const currentIndex = steps.indexOf(currentStep)

  return (
    <div className="workflow-stepper">
      <div className="workflow-stepper__header">
        <h3>Review Workflow</h3>
      </div>
      <div className="workflow-stepper__steps">
        {steps.map((step, index) => {
          const isActive = step === currentStep
          const isCompleted = index < currentIndex
          const isAccessible = canGoToStep(step)
          const stepNumber = index + 1

          return (
            <div
              key={step}
              className={`workflow-stepper__step ${
                isActive ? 'workflow-stepper__step--active' : ''
              } ${isCompleted ? 'workflow-stepper__step--completed' : ''} ${
                !isAccessible ? 'workflow-stepper__step--disabled' : ''
              }`}
              onClick={() => {
                if (isAccessible) {
                  onStepClick(step)
                }
              }}
            >
              <div className="workflow-stepper__step-indicator">
                {isCompleted ? (
                  <span className="workflow-stepper__step-check">✓</span>
                ) : (
                  <span className="workflow-stepper__step-number">
                    {stepNumber}
                  </span>
                )}
              </div>
              <div className="workflow-stepper__step-content">
                <div className="workflow-stepper__step-label">
                  {stepLabels[step]}
                </div>
                <div className="workflow-stepper__step-description">
                  {getStepDescription(step)}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`workflow-stepper__connector ${
                    isCompleted
                      ? 'workflow-stepper__connector--completed'
                      : ''
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
