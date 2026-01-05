import { useRef, useState } from 'react'
import { MedicalImage } from '@model/MedicalImage'
import { ViewController, ViewState } from '@controller/ViewController'
import './ImageViewer.css'

interface ImageViewerProps {
  image: MedicalImage | null
  viewController: ViewController
  onViewStateChange?: (state: ViewState) => void
}

export function ImageViewer({
  image,
  viewController,
  onViewStateChange,
}: ImageViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [updateTrigger, setUpdateTrigger] = useState(0)
  const viewState = viewController.getState()

  const triggerUpdate = () => {
    setUpdateTrigger((prev) => prev + 1)
    if (onViewStateChange) {
      onViewStateChange(viewController.getState())
    }
  }

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault()
    const currentState = viewController.getState()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    const newZoom = Math.max(0.5, Math.min(5.0, currentState.zoom + delta))
    viewController.setZoom(newZoom)
    triggerUpdate()
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return
    const currentState = viewController.getState()
    setIsDragging(true)
    setDragStart({
      x: e.clientX - currentState.pan.x,
      y: e.clientY - currentState.pan.y,
    })
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return
    viewController.setPan(e.clientX - dragStart.x, e.clientY - dragStart.y)
    triggerUpdate()
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleDoubleClick = () => {
    viewController.reset()
    triggerUpdate()
  }

  if (!image) {
    return (
      <div className="image-viewer image-viewer--empty">
        <p>No image loaded</p>
      </div>
    )
  }

  const imageStyle: React.CSSProperties = {
    transform: `translate(${viewState.pan.x}px, ${viewState.pan.y}px) scale(${viewState.zoom})`,
    transformOrigin: 'center center',
    transition: isDragging ? 'none' : 'transform 0.1s ease-out',
  }

  return (
    <div className="image-viewer">
      <div className="image-viewer__header">
        <div className="image-viewer__info">
          <span>Modality: {image.modality}</span>
          <span>Dimensions: {image.width} × {image.height}</span>
        </div>
        <div className="image-viewer__controls">
          <button
            className="image-viewer__control-btn"
            onClick={() => {
              const currentState = viewController.getState()
              viewController.setZoom(currentState.zoom + 0.2)
              triggerUpdate()
            }}
            disabled={viewState.zoom >= 5.0}
          >
            +
          </button>
          <span className="image-viewer__zoom-value">
            {Math.round(viewState.zoom * 100)}%
          </span>
          <button
            className="image-viewer__control-btn"
            onClick={() => {
              const currentState = viewController.getState()
              viewController.setZoom(currentState.zoom - 0.2)
              triggerUpdate()
            }}
            disabled={viewState.zoom <= 0.5}
          >
            −
          </button>
          <button
            className="image-viewer__control-btn"
            onClick={() => {
              viewController.reset()
              triggerUpdate()
            }}
          >
            Reset
          </button>
        </div>
      </div>
      <div
        ref={containerRef}
        className="image-viewer__container"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <img
          ref={imageRef}
          src={image.src}
          alt={`Medical scan - ${image.modality}`}
          className="image-viewer__image"
          style={imageStyle}
          draggable={false}
        />
      </div>
      <div className="image-viewer__hint">
        <p>Double-click to reset • Scroll to zoom • Drag to pan</p>
      </div>
    </div>
  )
}
