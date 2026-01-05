import { MedicalImage } from '@model/MedicalImage'
import { Annotation } from '@model/Annotation'

export type WorkflowStep = 'load' | 'review' | 'annotate' | 'complete'

export interface WorkflowState {
  currentStep: WorkflowStep
  currentImage: MedicalImage | null
  annotations: Annotation[]
  isComplete: boolean
}

export class WorkflowController {
  private state: WorkflowState

  constructor() {
    this.state = {
      currentStep: 'load',
      currentImage: null,
      annotations: [],
      isComplete: false,
    }
  }

  getState(): WorkflowState {
    return { ...this.state }
  }

  loadImage(image: MedicalImage): void {
    this.state.currentImage = image
    this.state.currentStep = 'review'
  }

  addAnnotation(annotation: Annotation): void {
    this.state.annotations.push(annotation)
    this.state.currentStep = 'annotate'
  }

  removeAnnotation(annotationId: string): void {
    this.state.annotations = this.state.annotations.filter(
      (ann) => ann.id !== annotationId
    )
  }

  nextStep(): void {
    const steps: WorkflowStep[] = ['load', 'review', 'annotate', 'complete']
    const currentIndex = steps.indexOf(this.state.currentStep)
    if (currentIndex < steps.length - 1) {
      this.state.currentStep = steps[currentIndex + 1]
    }
  }

  complete(): void {
    this.state.currentStep = 'complete'
    this.state.isComplete = true
  }
}
