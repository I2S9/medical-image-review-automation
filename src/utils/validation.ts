import {
  AnnotationType,
  AnnotationCategory,
  AnnotationPriority,
} from '@model/Annotation'

export interface ValidationResult {
  isValid: boolean
  error?: string
}

export function validateAnnotationType(value: unknown): ValidationResult {
  const validTypes: AnnotationType[] = ['point', 'region']
  if (typeof value !== 'string' || !validTypes.includes(value as AnnotationType)) {
    return {
      isValid: false,
      error: `Type must be one of: ${validTypes.join(', ')}`,
    }
  }
  return { isValid: true }
}

export function validateAnnotationCategory(value: unknown): ValidationResult {
  const validCategories: AnnotationCategory[] = [
    'finding',
    'landmark',
    'measurement',
    'other',
  ]
  if (
    typeof value !== 'string' ||
    !validCategories.includes(value as AnnotationCategory)
  ) {
    return {
      isValid: false,
      error: `Category must be one of: ${validCategories.join(', ')}`,
    }
  }
  return { isValid: true }
}

export function validateAnnotationPriority(value: unknown): ValidationResult {
  const validPriorities: AnnotationPriority[] = ['low', 'medium', 'high']
  if (
    typeof value !== 'string' ||
    !validPriorities.includes(value as AnnotationPriority)
  ) {
    return {
      isValid: false,
      error: `Priority must be one of: ${validPriorities.join(', ')}`,
    }
  }
  return { isValid: true }
}

export function validateCoordinates(
  coordinates: unknown,
  imageWidth: number,
  imageHeight: number
): ValidationResult {
  if (
    !coordinates ||
    typeof coordinates !== 'object' ||
    !('x' in coordinates) ||
    !('y' in coordinates)
  ) {
    return {
      isValid: false,
      error: 'Coordinates must be an object with x and y properties',
    }
  }

  const coords = coordinates as { x: unknown; y: unknown; width?: unknown; height?: unknown }

  if (typeof coords.x !== 'number' || !isFinite(coords.x)) {
    return {
      isValid: false,
      error: 'Coordinate x must be a finite number',
    }
  }

  if (typeof coords.y !== 'number' || !isFinite(coords.y)) {
    return {
      isValid: false,
      error: 'Coordinate y must be a finite number',
    }
  }

  if (coords.x < 0 || coords.x > imageWidth) {
    return {
      isValid: false,
      error: `Coordinate x must be between 0 and ${imageWidth}`,
    }
  }

  if (coords.y < 0 || coords.y > imageHeight) {
    return {
      isValid: false,
      error: `Coordinate y must be between 0 and ${imageHeight}`,
    }
  }

  if (coords.width !== undefined) {
    if (typeof coords.width !== 'number' || !isFinite(coords.width) || coords.width < 0) {
      return {
        isValid: false,
        error: 'Width must be a non-negative finite number',
      }
    }
    if (coords.x + coords.width > imageWidth) {
      return {
        isValid: false,
        error: 'Region extends beyond image width',
      }
    }
  }

  if (coords.height !== undefined) {
    if (typeof coords.height !== 'number' || !isFinite(coords.height) || coords.height < 0) {
      return {
        isValid: false,
        error: 'Height must be a non-negative finite number',
      }
    }
    if (coords.y + coords.height > imageHeight) {
      return {
        isValid: false,
        error: 'Region extends beyond image height',
      }
    }
  }

  return { isValid: true }
}

export function validateImageId(imageId: unknown): ValidationResult {
  if (typeof imageId !== 'string' || imageId.trim().length === 0) {
    return {
      isValid: false,
      error: 'Image ID must be a non-empty string',
    }
  }

  if (imageId.length > 255) {
    return {
      isValid: false,
      error: 'Image ID must be 255 characters or less',
    }
  }

  return { isValid: true }
}

export function sanitizeString(value: unknown, maxLength = 1000): string {
  if (typeof value !== 'string') {
    return ''
  }
  return value.trim().slice(0, maxLength)
}
