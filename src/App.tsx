import { useState, useEffect, useMemo } from 'react'
import { WorkflowController, ReviewStep } from '@controller/WorkflowController'
import { ViewController } from '@controller/ViewController'
import { ImageViewer } from '@view/ImageViewer'
import { AnnotationPanel } from '@view/AnnotationPanel'
import { WorkflowStepper } from '@view/WorkflowStepper'
import { ContextInsights } from '@view/ContextInsights'
import { ContextAnalyzer } from '@ai/ContextAnalyzer'
import { createMockImage } from '@utils/mockData'
import { createAnnotation } from '@utils/annotationUtils'

function App() {
  const [workflowController] = useState(() => new WorkflowController())
  const [viewController] = useState(() => new ViewController())
  const [contextAnalyzer] = useState(() => new ContextAnalyzer())
  const [, setViewStateUpdate] = useState(0)
  const [, setWorkflowUpdate] = useState(0)

  useEffect(() => {
    const mockImage = createMockImage()
    workflowController.loadImage(mockImage)
    setWorkflowUpdate((prev) => prev + 1)

    const analysis = contextAnalyzer.analyzeContext(mockImage, [])
    if (analysis.recommendedView.confidence === 'high') {
      viewController.setOrientation(analysis.recommendedView.orientation)
      setViewStateUpdate((prev) => prev + 1)
    }
  }, [workflowController, contextAnalyzer, viewController])

  const workflowState = workflowController.getState()

  const contextAnalysis = useMemo(() => {
    if (!workflowState.currentImage) return null
    return contextAnalyzer.analyzeContext(
      workflowState.currentImage,
      workflowState.annotations
    )
  }, [workflowState.currentImage, workflowState.annotations, contextAnalyzer])

  const handleViewStateChange = () => {
    setViewStateUpdate((prev) => prev + 1)
  }

  const handleAnnotationCreate = (data: {
    coordinates: { x: number; y: number }
    type: 'point' | 'region'
    category: 'finding' | 'landmark' | 'measurement' | 'other'
    priority: 'low' | 'medium' | 'high'
  }) => {
    if (!workflowState.currentImage) return

    const annotation = createAnnotation(
      workflowState.currentImage.id,
      data.coordinates,
      data.type,
      data.category,
      data.priority
    )

    workflowController.addAnnotation(annotation)
    setWorkflowUpdate((prev) => prev + 1)

    const recommendedView = contextAnalyzer.analyzeRecommendedView(
      workflowState.currentImage,
      [...workflowState.annotations, annotation]
    )

    if (recommendedView.confidence === 'high') {
      viewController.setOrientation(recommendedView.orientation)
      setViewStateUpdate((prev) => prev + 1)
    }
  }

  const handleAnnotationDelete = (id: string) => {
    workflowController.removeAnnotation(id)
    setWorkflowUpdate((prev) => prev + 1)
  }

  const handleStepClick = (step: ReviewStep) => {
    if (workflowController.goToStep(step)) {
      setWorkflowUpdate((prev) => prev + 1)
    }
  }

  const handleNextStep = () => {
    if (workflowController.nextStep()) {
      setWorkflowUpdate((prev) => prev + 1)
    }
  }

  const handlePreviousStep = () => {
    if (workflowController.previousStep()) {
      setWorkflowUpdate((prev) => prev + 1)
    }
  }

  const canCreateAnnotations = () => {
    return (
      workflowState.currentStep === ReviewStep.FocusAreas ||
      workflowState.currentStep === ReviewStep.DetailedReview
    )
  }

  return (
    <div className="app">
      <header className="app__header">
        <h1>Medical Image Review Automation</h1>
        <div className="app__workflow-controls">
          <button
            className="app__nav-btn"
            onClick={handlePreviousStep}
            disabled={workflowState.currentStep === ReviewStep.Overview}
          >
            ← Previous
          </button>
          <span className="app__current-step">
            {workflowState.currentStep === ReviewStep.Overview && 'Overview'}
            {workflowState.currentStep === ReviewStep.FocusAreas && 'Focus Areas'}
            {workflowState.currentStep === ReviewStep.DetailedReview && 'Detailed Review'}
            {workflowState.currentStep === ReviewStep.Summary && 'Summary'}
          </span>
          <button
            className="app__nav-btn app__nav-btn--primary"
            onClick={handleNextStep}
            disabled={
              workflowState.currentStep === ReviewStep.Summary ||
              workflowState.isComplete
            }
          >
            Next →
          </button>
        </div>
      </header>
      <main className="app__main">
        <div className="app__viewer-section">
          <ImageViewer
            image={workflowState.currentImage}
            annotations={workflowState.annotations}
            viewController={viewController}
            onViewStateChange={handleViewStateChange}
            onAnnotationCreate={
              canCreateAnnotations() ? handleAnnotationCreate : undefined
            }
            onAnnotationSelect={(id) => {
              console.log('Selected annotation:', id)
            }}
            getAnnotationRecommendation={(coordinates) => {
              if (!workflowState.currentImage) return undefined
              return contextAnalyzer.analyzeAnnotationContext(
                workflowState.currentImage,
                coordinates
              )
            }}
          />
        </div>
        <div className="app__panel-section">
          <WorkflowStepper
            currentStep={workflowState.currentStep}
            onStepClick={handleStepClick}
            canGoToStep={(step) => workflowController.canGoToStep(step)}
            getStepDescription={(step) =>
              workflowController.getStepDescription(step)
            }
          />
          <ContextInsights analysis={contextAnalysis} />
          <AnnotationPanel
            annotations={workflowState.annotations}
            onAnnotationSelect={(id) => {
              console.log('Selected annotation:', id)
            }}
            onAnnotationDelete={handleAnnotationDelete}
          />
        </div>
      </main>
    </div>
  )
}

export default App
