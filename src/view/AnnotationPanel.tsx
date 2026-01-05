import { Annotation } from '@model/Annotation'

interface AnnotationPanelProps {
  annotations: Annotation[]
  onAnnotationSelect?: (annotationId: string) => void
  onAnnotationDelete?: (annotationId: string) => void
}

export function AnnotationPanel({
  annotations,
  onAnnotationSelect,
  onAnnotationDelete,
}: AnnotationPanelProps) {
  return (
    <div className="annotation-panel">
      <div className="annotation-panel__header">
        <h3>Annotations</h3>
        <span className="annotation-panel__count">{annotations.length}</span>
      </div>
      <div className="annotation-panel__list">
        {annotations.length === 0 ? (
          <p className="annotation-panel__empty">No annotations</p>
        ) : (
          annotations.map((annotation) => (
            <div
              key={annotation.id}
              className="annotation-panel__item"
              onClick={() => onAnnotationSelect?.(annotation.id)}
            >
              <div className="annotation-panel__item-header">
                <span className="annotation-panel__item-type">
                  {annotation.type}
                </span>
                <span className={`annotation-panel__item-priority priority--${annotation.priority}`}>
                  {annotation.priority}
                </span>
              </div>
              <div className="annotation-panel__item-category">
                {annotation.category}
              </div>
              {onAnnotationDelete && (
                <button
                  className="annotation-panel__item-delete"
                  onClick={(e) => {
                    e.stopPropagation()
                    onAnnotationDelete(annotation.id)
                  }}
                >
                  Delete
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
