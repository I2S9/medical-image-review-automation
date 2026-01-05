import { MedicalImage } from '@model/MedicalImage'
import { Annotation } from '@model/Annotation'

export enum ReviewStep {
  Overview = 'overview',
  FocusAreas = 'focus',
  DetailedReview = 'detail',
  Summary = 'summary',
}

export interface WorkflowState {
  currentStep: ReviewStep
  currentImage: MedicalImage | null
  annotations: Annotation[]
  isComplete: boolean
  stepHistory: ReviewStep[]
}

export class WorkflowController {
  private state: WorkflowState

  constructor() {
    this.state = {
      currentStep: ReviewStep.Overview,
      currentImage: null,
      annotations: [],
      isComplete: false,
      stepHistory: [ReviewStep.Overview],
    }
  }

  getState(): WorkflowState {
    return { ...this.state }
  }

  loadImage(image: MedicalImage): void {
    this.state.currentImage = image
    this.state.currentStep = ReviewStep.Overview
    this.state.stepHistory = [ReviewStep.Overview]
  }

  addAnnotation(annotation: Annotation): void {
    this.state.annotations.push(annotation)
  }

  removeAnnotation(annotationId: string): void {
    this.state.annotations = this.state.annotations.filter(
      (ann) => ann.id !== annotationId
    )
  }

  goToStep(step: ReviewStep): boolean {
    if (this.canGoToStep(step)) {
      this.state.currentStep = step
      if (!this.state.stepHistory.includes(step)) {
        this.state.stepHistory.push(step)
      }
      return true
    }
    return false
  }

  nextStep(): boolean {
    const steps = [
      ReviewStep.Overview,
      ReviewStep.FocusAreas,
      ReviewStep.DetailedReview,
      ReviewStep.Summary,
    ]
    const currentIndex = steps.indexOf(this.state.currentStep)
    if (currentIndex < steps.length - 1) {
      return this.goToStep(steps[currentIndex + 1])
    }
    return false
  }

  previousStep(): boolean {
    const steps = [
      ReviewStep.Overview,
      ReviewStep.FocusAreas,
      ReviewStep.DetailedReview,
      ReviewStep.Summary,
    ]
    const currentIndex = steps.indexOf(this.state.currentStep)
    if (currentIndex > 0) {
      return this.goToStep(steps[currentIndex - 1])
    }
    return false
  }

  canGoToStep(step: ReviewStep): boolean {
    if (this.state.isComplete) return false

    const steps = [
      ReviewStep.Overview,
      ReviewStep.FocusAreas,
      ReviewStep.DetailedReview,
      ReviewStep.Summary,
    ]

    const targetIndex = steps.indexOf(step)
    const currentIndex = steps.indexOf(this.state.currentStep)

    if (targetIndex === -1) return false

    if (step === ReviewStep.Overview) return true

    if (this.state.stepHistory.includes(step)) return true

    if (targetIndex <= currentIndex) return true

    if (targetIndex === currentIndex + 1) {
      return this.canProceedToNextStep(step)
    }

    return false
  }

  private canProceedToNextStep(step: ReviewStep): boolean {
    switch (step) {
      case ReviewStep.FocusAreas:
        return this.state.currentImage !== null
      case ReviewStep.DetailedReview:
        return this.state.annotations.length > 0
      case ReviewStep.Summary:
        return this.state.annotations.length > 0
      default:
        return true
    }
  }

  complete(): void {
    this.state.currentStep = ReviewStep.Summary
    this.state.isComplete = true
  }

  getStepDescription(step: ReviewStep): string {
    switch (step) {
      case ReviewStep.Overview:
        return 'Initial image overview and orientation'
      case ReviewStep.FocusAreas:
        return 'Identify and mark areas of interest'
      case ReviewStep.DetailedReview:
        return 'Detailed examination and annotation'
      case ReviewStep.Summary:
        return 'Review summary and findings'
      default:
        return ''
    }
  }
}
