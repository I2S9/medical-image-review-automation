import { Annotation, AnnotationType, AnnotationCategory, AnnotationPriority } from '@model/Annotation'
import { validateImageId, validateCoordinates, validateAnnotationType, validateAnnotationCategory, validateAnnotationPriority } from './validation'
import { AppError, handleError, logError } from './errorHandling'

export function createAnnotation(
  imageId: string,
  coordinates: { x: number; y: number; width?: number; height?: number },
  type: AnnotationType,
  category: AnnotationCategory,
  priority: AnnotationPriority,
  imageWidth: number = 10000,
  imageHeight: number = 10000
): Annotation {
  const imageIdValidation = validateImageId(imageId)
  if (!imageIdValidation.isValid) {
    const error = new AppError(
      imageIdValidation.error || 'Invalid image ID',
      'VALIDATION_ERROR'
    )
    logError(error, 'createAnnotation')
    throw error
  }

  const coordinatesValidation = validateCoordinates(
    coordinates,
    imageWidth,
    imageHeight
  )
  if (!coordinatesValidation.isValid) {
    const error = new AppError(
      coordinatesValidation.error || 'Invalid coordinates',
      'VALIDATION_ERROR'
    )
    logError(error, 'createAnnotation')
    throw error
  }

  const typeValidation = validateAnnotationType(type)
  if (!typeValidation.isValid) {
    const error = new AppError(
      typeValidation.error || 'Invalid annotation type',
      'VALIDATION_ERROR'
    )
    logError(error, 'createAnnotation')
    throw error
  }

  const categoryValidation = validateAnnotationCategory(category)
  if (!categoryValidation.isValid) {
    const error = new AppError(
      categoryValidation.error || 'Invalid annotation category',
      'VALIDATION_ERROR'
    )
    logError(error, 'createAnnotation')
    throw error
  }

  const priorityValidation = validateAnnotationPriority(priority)
  if (!priorityValidation.isValid) {
    const error = new AppError(
      priorityValidation.error || 'Invalid annotation priority',
      'VALIDATION_ERROR'
    )
    logError(error, 'createAnnotation')
    throw error
  }

  try {
    const id = `ann-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
    const now = new Date()

    return {
      id,
      imageId: imageId.trim(),
      type,
      category,
      priority,
      coordinates: {
        x: Math.max(0, Math.min(imageWidth, coordinates.x)),
        y: Math.max(0, Math.min(imageHeight, coordinates.y)),
        width: coordinates.width !== undefined ? Math.max(0, coordinates.width) : undefined,
        height: coordinates.height !== undefined ? Math.max(0, coordinates.height) : undefined,
      },
      metadata: {},
      createdAt: now,
      updatedAt: now,
    }
  } catch (error) {
    const appError = handleError(error, 'createAnnotation')
    logError(appError, 'createAnnotation')
    throw appError
  }
}
