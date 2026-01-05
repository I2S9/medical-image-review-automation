import { Annotation, AnnotationType, AnnotationCategory, AnnotationPriority } from '@model/Annotation'

export function createAnnotation(
  imageId: string,
  coordinates: { x: number; y: number; width?: number; height?: number },
  type: AnnotationType,
  category: AnnotationCategory,
  priority: AnnotationPriority
): Annotation {
  return {
    id: `ann-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    imageId,
    type,
    category,
    priority,
    coordinates,
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}
