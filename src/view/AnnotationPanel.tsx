import { useMemo } from 'react'
import { Annotation } from '@model/Annotation'
import './AnnotationPanel.css'

interface AnnotationPanelProps {
  annotations: Annotation[]
  onAnnotationSelect?: (annotationId: string) => void
  onAnnotationDelete?: (annotationId: string) => void
  grouped?: boolean
  prioritized?: boolean
}

export function AnnotationPanel({
  annotations,
  onAnnotationSelect,
  onAnnotationDelete,
  grouped = true,
  prioritized = true,
}: AnnotationPanelProps) {
  const organizedAnnotations = useMemo(() => {
    let result = [...annotations]

    if (prioritized) {
      const priorityOrder: Record<Annotation['priority'], number> = {
        high: 3,
        medium: 2,
        low: 1,
      }
      const categoryOrder: Record<Annotation['category'], number> = {
        finding: 4,
        measurement: 3,
        landmark: 2,
        other: 1,
      }

      result.sort((a, b) => {
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
        if (priorityDiff !== 0) return priorityDiff
        return categoryOrder[b.category] - categoryOrder[a.category]
      })
    }

    if (grouped) {
      const grouped: Record<string, Annotation[]> = {}
      result.forEach((annotation) => {
        const key = `${annotation.category}-${annotation.priority}`
        if (!grouped[key]) {
          grouped[key] = []
        }
        grouped[key].push(annotation)
      })
      return Object.values(grouped)
    }

    return [result]
  }, [annotations, grouped, prioritized])

  const totalCount = annotations.length
  const highPriorityCount = annotations.filter((a) => a.priority === 'high').length
  const findingsCount = annotations.filter((a) => a.category === 'finding').length

  return (
    <div className="annotation-panel">
      <div className="annotation-panel__header">
        <h3>Annotations</h3>
        <div className="annotation-panel__header-stats">
          <span className="annotation-panel__count">{totalCount}</span>
          {highPriorityCount > 0 && (
            <span className="annotation-panel__stat annotation-panel__stat--high">
              {highPriorityCount} high
            </span>
          )}
          {findingsCount > 0 && (
            <span className="annotation-panel__stat annotation-panel__stat--finding">
              {findingsCount} findings
            </span>
          )}
        </div>
      </div>
      <div className="annotation-panel__list">
        {annotations.length === 0 ? (
          <p className="annotation-panel__empty">No annotations</p>
        ) : (
          organizedAnnotations.map((group, groupIndex) => (
            <div key={groupIndex} className="annotation-panel__group">
              {grouped && group.length > 0 && (
                <div className="annotation-panel__group-header">
                  <span className="annotation-panel__group-label">
                    {group[0].category} - {group[0].priority}
                  </span>
                  <span className="annotation-panel__group-count">
                    {group.length}
                  </span>
                </div>
              )}
              {group.map((annotation) => (
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
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
