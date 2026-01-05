import { useState, useEffect } from 'react'
import {
  AnnotationType,
  AnnotationCategory,
  AnnotationPriority,
} from '@model/Annotation'
import { AnnotationRecommendation } from '@ai/ContextAnalyzer'
import './AnnotationForm.css'

interface AnnotationFormProps {
  coordinates: { x: number; y: number }
  recommendation?: AnnotationRecommendation
  onSave: (data: {
    type: AnnotationType
    category: AnnotationCategory
    priority: AnnotationPriority
  }) => void
  onCancel: () => void
}

export function AnnotationForm({
  coordinates,
  recommendation,
  onSave,
  onCancel,
}: AnnotationFormProps) {
  const [type, setType] = useState<AnnotationType>('point')
  const [category, setCategory] = useState<AnnotationCategory>(
    recommendation?.suggestedCategory || 'finding'
  )
  const [priority, setPriority] = useState<AnnotationPriority>(
    recommendation?.suggestedPriority || 'medium'
  )

  useEffect(() => {
    if (recommendation) {
      setCategory(recommendation.suggestedCategory)
      setPriority(recommendation.suggestedPriority)
    }
  }, [recommendation])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ type, category, priority })
  }

  return (
    <div className="annotation-form">
      <div className="annotation-form__header">
        <h3>Create Annotation</h3>
        <button
          className="annotation-form__close"
          onClick={onCancel}
          type="button"
        >
          ×
        </button>
      </div>
      <form onSubmit={handleSubmit} className="annotation-form__body">
        <div className="annotation-form__field">
          <label htmlFor="type">Type</label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value as AnnotationType)}
          >
            <option value="point">Point</option>
            <option value="region">Region</option>
          </select>
        </div>

        <div className="annotation-form__field">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value as AnnotationCategory)}
          >
            <option value="finding">Finding</option>
            <option value="landmark">Landmark</option>
            <option value="measurement">Measurement</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="annotation-form__field">
          <label htmlFor="priority">Priority</label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as AnnotationPriority)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div className="annotation-form__coordinates">
          <span>Position: ({Math.round(coordinates.x)}, {Math.round(coordinates.y)})</span>
        </div>

        {recommendation && (
          <div className="annotation-form__recommendation">
            <div className="annotation-form__recommendation-icon">💡</div>
            <div className="annotation-form__recommendation-text">
              {recommendation.reason}
            </div>
          </div>
        )}

        <div className="annotation-form__actions">
          <button type="submit" className="annotation-form__btn annotation-form__btn--primary">
            Create
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="annotation-form__btn annotation-form__btn--secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
