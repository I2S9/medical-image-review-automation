import { useState, useEffect } from 'react'
import { WorkflowController } from '@controller/WorkflowController'
import { ViewController } from '@controller/ViewController'
import { ImageViewer } from '@view/ImageViewer'
import { AnnotationPanel } from '@view/AnnotationPanel'
import { createMockImage } from '@utils/mockData'
import { createAnnotation } from '@utils/annotationUtils'

function App() {
  const [workflowController] = useState(() => new WorkflowController())
  const [viewController] = useState(() => new ViewController())
  const [, setViewStateUpdate] = useState(0)
  const [, setWorkflowUpdate] = useState(0)

  useEffect(() => {
    const mockImage = createMockImage()
    workflowController.loadImage(mockImage)
    setWorkflowUpdate((prev) => prev + 1)
  }, [workflowController])

  const workflowState = workflowController.getState()

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
  }

  const handleAnnotationDelete = (id: string) => {
    workflowController.removeAnnotation(id)
    setWorkflowUpdate((prev) => prev + 1)
  }

  return (
    <div className="app">
      <header className="app__header">
        <h1>Medical Image Review Automation</h1>
        <div className="app__workflow-status">
          Current step: {workflowState.currentStep}
        </div>
      </header>
      <main className="app__main">
        <div className="app__viewer-section">
          <ImageViewer
            image={workflowState.currentImage}
            annotations={workflowState.annotations}
            viewController={viewController}
            onViewStateChange={handleViewStateChange}
            onAnnotationCreate={handleAnnotationCreate}
            onAnnotationSelect={(id) => {
              console.log('Selected annotation:', id)
            }}
          />
        </div>
        <div className="app__panel-section">
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
