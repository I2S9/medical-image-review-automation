import { useState, useEffect } from 'react'
import {
  AnnotationType,
  AnnotationCategory,
  AnnotationPriority,
} from '@model/Annotation'
import { AnnotationRecommendation } from '@ai/ContextAnalyzer'
import {
  validateAnnotationType,
  validateAnnotationCategory,
  validateAnnotationPriority,
} from '@utils/validation'
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
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (recommendation) {
      const categoryValidation = validateAnnotationCategory(
        recommendation.suggestedCategory
      )
      const priorityValidation = validateAnnotationPriority(
        recommendation.suggestedPriority
      )

      if (categoryValidation.isValid && priorityValidation.isValid) {
        setCategory(recommendation.suggestedCategory)
        setPriority(recommendation.suggestedPriority)
      }
    }
  }, [recommendation])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    const typeValidation = validateAnnotationType(type)
    if (!typeValidation.isValid) {
      newErrors.type = typeValidation.error || 'Invalid type'
    }

    const categoryValidation = validateAnnotationCategory(category)
    if (!categoryValidation.isValid) {
      newErrors.category = categoryValidation.error || 'Invalid category'
    }

    const priorityValidation = validateAnnotationPriority(priority)
    if (!priorityValidation.isValid) {
      newErrors.priority = priorityValidation.error || 'Invalid priority'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleTypeChange = (value: string) => {
    const validation = validateAnnotationType(value)
    if (validation.isValid) {
      setType(value as AnnotationType)
      setErrors((prev) => {
        const next = { ...prev }
        delete next.type
        return next
      })
    } else {
      setErrors((prev) => ({
        ...prev,
        type: validation.error || 'Invalid type',
      }))
    }
  }

  const handleCategoryChange = (value: string) => {
    const validation = validateAnnotationCategory(value)
    if (validation.isValid) {
      setCategory(value as AnnotationCategory)
      setErrors((prev) => {
        const next = { ...prev }
        delete next.category
        return next
      })
    } else {
      setErrors((prev) => ({
        ...prev,
        category: validation.error || 'Invalid category',
      }))
    }
  }

  const handlePriorityChange = (value: string) => {
    const validation = validateAnnotationPriority(value)
    if (validation.isValid) {
      setPriority(value as AnnotationPriority)
      setErrors((prev) => {
        const next = { ...prev }
        delete next.priority
        return next
      })
    } else {
      setErrors((prev) => ({
        ...prev,
        priority: validation.error || 'Invalid priority',
      }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (isSubmitting) return

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      onSave({ type, category, priority })
    } catch (error) {
      setErrors({
        submit: 'Failed to create annotation. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
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
            onChange={(e) => handleTypeChange(e.target.value)}
            aria-invalid={!!errors.type}
            aria-describedby={errors.type ? 'type-error' : undefined}
          >
            <option value="point">Point</option>
            <option value="region">Region</option>
          </select>
          {errors.type && (
            <span id="type-error" className="annotation-form__error" role="alert">
              {errors.type}
            </span>
          )}
        </div>

        <div className="annotation-form__field">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            aria-invalid={!!errors.category}
            aria-describedby={errors.category ? 'category-error' : undefined}
          >
            <option value="finding">Finding</option>
            <option value="landmark">Landmark</option>
            <option value="measurement">Measurement</option>
            <option value="other">Other</option>
          </select>
          {errors.category && (
            <span
              id="category-error"
              className="annotation-form__error"
              role="alert"
            >
              {errors.category}
            </span>
          )}
        </div>

        <div className="annotation-form__field">
          <label htmlFor="priority">Priority</label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => handlePriorityChange(e.target.value)}
            aria-invalid={!!errors.priority}
            aria-describedby={errors.priority ? 'priority-error' : undefined}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          {errors.priority && (
            <span
              id="priority-error"
              className="annotation-form__error"
              role="alert"
            >
              {errors.priority}
            </span>
          )}
        </div>

        <div className="annotation-form__coordinates">
          <span>Position: ({Math.round(coordinates.x)}, {Math.round(coordinates.y)})</span>
        </div>

        {recommendation && (
          <div className="annotation-form__recommendation">
            <div className="annotation-form__recommendation-icon">i</div>
            <div className="annotation-form__recommendation-text">
              {recommendation.reason}
            </div>
          </div>
        )}

        {errors.submit && (
          <div className="annotation-form__error annotation-form__error--submit" role="alert">
            {errors.submit}
          </div>
        )}

        <div className="annotation-form__actions">
          <button
            type="submit"
            className="annotation-form__btn annotation-form__btn--primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create'}
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
