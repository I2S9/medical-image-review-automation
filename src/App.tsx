import { useState, useEffect } from 'react'
import { WorkflowController } from '@controller/WorkflowController'
import { ViewController } from '@controller/ViewController'
import { ImageViewer } from '@view/ImageViewer'
import { AnnotationPanel } from '@view/AnnotationPanel'
import { createMockImage } from '@utils/mockData'

function App() {
  const [workflowController] = useState(() => new WorkflowController())
  const [viewController] = useState(() => new ViewController())
  const [, setViewStateUpdate] = useState(0)

  useEffect(() => {
    const mockImage = createMockImage()
    workflowController.loadImage(mockImage)
  }, [workflowController])

  const workflowState = workflowController.getState()

  const handleViewStateChange = () => {
    setViewStateUpdate((prev) => prev + 1)
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
            viewController={viewController}
            onViewStateChange={handleViewStateChange}
          />
        </div>
        <div className="app__panel-section">
          <AnnotationPanel
            annotations={workflowState.annotations}
            onAnnotationSelect={(id) => {
              console.log('Selected annotation:', id)
            }}
            onAnnotationDelete={(id) => {
              workflowController.removeAnnotation(id)
            }}
          />
        </div>
      </main>
    </div>
  )
}

export default App
