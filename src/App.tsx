import { useState } from 'react'
import { WorkflowController } from '@controller/WorkflowController'
import { ViewController } from '@controller/ViewController'
import { ImageViewer } from '@view/ImageViewer'
import { AnnotationPanel } from '@view/AnnotationPanel'

function App() {
  const [workflowController] = useState(() => new WorkflowController())
  const [viewController] = useState(() => new ViewController())

  const workflowState = workflowController.getState()
  const viewState = viewController.getState()

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
          <ImageViewer image={workflowState.currentImage} />
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
