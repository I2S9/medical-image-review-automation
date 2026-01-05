import { useRef, useState } from 'react'
import { MedicalImage } from '@model/MedicalImage'
import { Annotation } from '@model/Annotation'
import { ViewController, ViewState } from '@controller/ViewController'
import { AnnotationRecommendation } from '@ai/ContextAnalyzer'
import { AnnotationForm } from './AnnotationForm'
import './ImageViewer.css'

interface ImageViewerProps {
  image: MedicalImage | null
  annotations: Annotation[]
  viewController: ViewController
  onViewStateChange?: (state: ViewState) => void
  onAnnotationCreate?: (data: {
    coordinates: { x: number; y: number }
    type: 'point' | 'region'
    category: 'finding' | 'landmark' | 'measurement' | 'other'
    priority: 'low' | 'medium' | 'high'
  }) => void
  onAnnotationSelect?: (annotationId: string) => void
  getAnnotationRecommendation?: (
    coordinates: { x: number; y: number }
  ) => AnnotationRecommendation | undefined
}

export function ImageViewer({
  image,
  annotations,
  viewController,
  onViewStateChange,
  onAnnotationCreate,
  onAnnotationSelect,
  getAnnotationRecommendation,
}: ImageViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, clientX: 0, clientY: 0 })
  const [updateTrigger, setUpdateTrigger] = useState(0)
  const [pendingAnnotation, setPendingAnnotation] = useState<{
    imageCoords: { x: number; y: number }
    screenCoords: { x: number; y: number }
  } | null>(null)
  const viewState = viewController.getState()

  const triggerUpdate = () => {
    setUpdateTrigger((prev) => prev + 1)
    if (onViewStateChange) {
      onViewStateChange(viewController.getState())
    }
  }

  const getImageCoordinates = (
    clientX: number,
    clientY: number
  ): { x: number; y: number } | null => {
    if (!containerRef.current || !imageRef.current) return null

    const rect = containerRef.current.getBoundingClientRect()
    const containerX = clientX - rect.left
    const containerY = clientY - rect.top

    const containerCenterX = rect.width / 2
    const containerCenterY = rect.height / 2

    const imageX = (containerX - containerCenterX - viewState.pan.x) / viewState.zoom + image.width / 2
    const imageY = (containerY - containerCenterY - viewState.pan.y) / viewState.zoom + image.height / 2

    return {
      x: Math.max(0, Math.min(image.width, imageX)),
      y: Math.max(0, Math.min(image.height, imageY)),
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
      clientX: e.clientX,
      clientY: e.clientY,
    })
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return
    viewController.setPan(e.clientX - dragStart.x, e.clientY - dragStart.y)
    triggerUpdate()
  }

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) {
      setIsDragging(false)
      return
    }

    const dragDistance = Math.sqrt(
      Math.pow(e.clientX - dragStart.clientX, 2) +
        Math.pow(e.clientY - dragStart.clientY, 2)
    )

    if (dragDistance < 5 && image) {
      const imageCoords = getImageCoordinates(e.clientX, e.clientY)
      if (imageCoords && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setPendingAnnotation({
          imageCoords,
          screenCoords: {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
          },
        })
      }
    }

    setIsDragging(false)
  }

  const handleDoubleClick = () => {
    viewController.reset()
    triggerUpdate()
  }

  const handleAnnotationFormSave = (data: {
    type: 'point' | 'region'
    category: 'finding' | 'landmark' | 'measurement' | 'other'
    priority: 'low' | 'medium' | 'high'
  }) => {
    if (pendingAnnotation && onAnnotationCreate) {
      onAnnotationCreate({
        coordinates: pendingAnnotation.imageCoords,
        ...data,
      })
    }
    setPendingAnnotation(null)
  }

  const handleAnnotationFormCancel = () => {
    setPendingAnnotation(null)
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

  const getAnnotationScreenPosition = (annotation: Annotation) => {
    if (!containerRef.current || !imageRef.current) return null

    const rect = containerRef.current.getBoundingClientRect()
    const containerCenterX = rect.width / 2
    const containerCenterY = rect.height / 2

    const screenX =
      (annotation.coordinates.x - image.width / 2) * viewState.zoom +
      containerCenterX +
      viewState.pan.x
    const screenY =
      (annotation.coordinates.y - image.height / 2) * viewState.zoom +
      containerCenterY +
      viewState.pan.y

    return { x: screenX, y: screenY }
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
        <div className="image-viewer__image-wrapper" style={imageStyle}>
          <img
            ref={imageRef}
            src={image.src}
            alt={`Medical scan - ${image.modality}`}
            className="image-viewer__image"
            draggable={false}
          />
          {annotations.map((annotation) => {
            const screenPos = getAnnotationScreenPosition(annotation)
            if (!screenPos) return null

            return (
              <div
                key={annotation.id}
                className={`image-viewer__annotation annotation--${annotation.type} annotation--priority-${annotation.priority}`}
                style={{
                  left: `${screenPos.x}px`,
                  top: `${screenPos.y}px`,
                  transform: 'translate(-50%, -50%)',
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  onAnnotationSelect?.(annotation.id)
                }}
                title={`${annotation.category} - ${annotation.priority}`}
              >
                <div className="image-viewer__annotation-marker"></div>
              </div>
            )
          })}
        </div>
        {pendingAnnotation && (
          <div
            className="image-viewer__form-overlay"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setPendingAnnotation(null)
              }
            }}
          >
            <div
              className="image-viewer__form-container"
              style={{
                left: `${pendingAnnotation.screenCoords.x}px`,
                top: `${pendingAnnotation.screenCoords.y}px`,
              }}
            >
              <AnnotationForm
                coordinates={pendingAnnotation.imageCoords}
                recommendation={
                  getAnnotationRecommendation
                    ? getAnnotationRecommendation(pendingAnnotation.imageCoords)
                    : undefined
                }
                onSave={handleAnnotationFormSave}
                onCancel={handleAnnotationFormCancel}
              />
            </div>
          </div>
        )}
      </div>
      <div className="image-viewer__hint">
        <p>Click to annotate • Double-click to reset • Scroll to zoom • Drag to pan</p>
      </div>
    </div>
  )
}
