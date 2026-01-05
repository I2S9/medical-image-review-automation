import { MedicalImage } from '@model/MedicalImage'
import { Annotation } from '@model/Annotation'
import { ViewOrientation } from '@controller/ViewController'

export interface ViewRecommendation {
  orientation: ViewOrientation
  reason: string
}

export interface AnnotationRecommendation {
  suggestedCategory: Annotation['category']
  suggestedPriority: Annotation['priority']
  reason: string
}

export class ContextAnalyzer {
  analyzeRecommendedView(
    image: MedicalImage,
    existingAnnotations: Annotation[]
  ): ViewRecommendation {
    if (existingAnnotations.length === 0) {
      return {
        orientation: 'axial',
        reason: 'Default view for initial review',
      }
    }

    const hasFindings = existingAnnotations.some(
      (ann) => ann.category === 'finding'
    )
    if (hasFindings) {
      return {
        orientation: 'sagittal',
        reason: 'Sagittal view recommended for detailed finding review',
      }
    }

    return {
      orientation: 'axial',
      reason: 'Axial view suitable for current context',
    }
  }

  analyzeAnnotationContext(
    image: MedicalImage,
    coordinates: Annotation['coordinates']
  ): AnnotationRecommendation {
    const isCentralRegion =
      coordinates.x > image.width * 0.25 &&
      coordinates.x < image.width * 0.75 &&
      coordinates.y > image.height * 0.25 &&
      coordinates.y < image.height * 0.75

    return {
      suggestedCategory: isCentralRegion ? 'finding' : 'landmark',
      suggestedPriority: isCentralRegion ? 'high' : 'medium',
      reason: isCentralRegion
        ? 'Central region often contains significant findings'
        : 'Peripheral region typically contains landmarks',
    }
  }

  groupAnnotations(annotations: Annotation[]): Annotation[][] {
    const grouped: Record<string, Annotation[]> = {}

    annotations.forEach((annotation) => {
      const key = `${annotation.category}-${annotation.priority}`
      if (!grouped[key]) {
        grouped[key] = []
      }
      grouped[key].push(annotation)
    })

    return Object.values(grouped)
  }
}
