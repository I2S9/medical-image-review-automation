export type AnnotationType = 'point' | 'region'
export type AnnotationCategory = 'finding' | 'landmark' | 'measurement' | 'other'
export type AnnotationPriority = 'low' | 'medium' | 'high'

export interface Annotation {
  id: string
  imageId: string
  type: AnnotationType
  category: AnnotationCategory
  priority: AnnotationPriority
  coordinates: {
    x: number
    y: number
    width?: number
    height?: number
  }
  metadata: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}
