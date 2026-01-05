import { MedicalImage } from '@model/MedicalImage'
import { Annotation } from '@model/Annotation'
import { ViewOrientation } from '@controller/ViewController'

export interface ViewRecommendation {
  orientation: ViewOrientation
  reason: string
  confidence: 'low' | 'medium' | 'high'
}

export interface AnnotationRecommendation {
  suggestedCategory: Annotation['category']
  suggestedPriority: Annotation['priority']
  reason: string
}

export interface ContextAnalysis {
  recommendedView: ViewRecommendation
  annotationRecommendations: AnnotationRecommendation[]
  suggestedFocus: string[]
  metadataInsights: string[]
}

export class ContextAnalyzer {
  analyzeContext(
    image: MedicalImage,
    existingAnnotations: Annotation[]
  ): ContextAnalysis {
    const recommendedView = this.analyzeRecommendedView(
      image,
      existingAnnotations
    )
    const metadataInsights = this.analyzeMetadata(image)
    const suggestedFocus = this.suggestFocusAreas(image, existingAnnotations)

    return {
      recommendedView,
      annotationRecommendations: [],
      suggestedFocus,
      metadataInsights,
    }
  }

  analyzeRecommendedView(
    image: MedicalImage,
    existingAnnotations: Annotation[]
  ): ViewRecommendation {
    if (existingAnnotations.length === 0) {
      return this.getInitialViewRecommendation(image)
    }

    const hasFindings = existingAnnotations.some(
      (ann) => ann.category === 'finding'
    )
    const hasHighPriority = existingAnnotations.some(
      (ann) => ann.priority === 'high'
    )

    if (hasHighPriority) {
      return {
        orientation: 'sagittal',
        reason: 'Sagittal view recommended for high-priority findings',
        confidence: 'high',
      }
    }

    if (hasFindings) {
      return {
        orientation: 'coronal',
        reason: 'Coronal view recommended for detailed finding review',
        confidence: 'medium',
      }
    }

    return {
      orientation: 'axial',
      reason: 'Axial view suitable for current context',
      confidence: 'medium',
    }
  }

  private getInitialViewRecommendation(
    image: MedicalImage
  ): ViewRecommendation {
    switch (image.modality) {
      case 'CT':
        return {
          orientation: 'axial',
          reason: 'Axial view is standard for CT scans - provides cross-sectional anatomy',
          confidence: 'high',
        }
      case 'MRI':
        const studyType = this.getStudyTypeFromMetadata(image)
        if (studyType === 'brain' || studyType === 'spine') {
          return {
            orientation: 'sagittal',
            reason: 'Sagittal view is optimal for brain and spine MRI studies',
            confidence: 'high',
          }
        }
        return {
          orientation: 'axial',
          reason: 'Axial view is standard starting point for MRI',
          confidence: 'medium',
        }
      case 'US':
        return {
          orientation: 'axial',
          reason: 'Axial view is standard for ultrasound imaging',
          confidence: 'medium',
        }
      default:
        return {
          orientation: 'axial',
          reason: 'Default axial view for initial review',
          confidence: 'low',
        }
    }
  }

  analyzeAnnotationContext(
    image: MedicalImage,
    coordinates: Annotation['coordinates']
  ): AnnotationRecommendation {
    const normalizedX = coordinates.x / image.width
    const normalizedY = coordinates.y / image.height
    const isCentralRegion =
      normalizedX > 0.25 &&
      normalizedX < 0.75 &&
      normalizedY > 0.25 &&
      normalizedY < 0.75

    const modalityBasedPriority = this.getPriorityBasedOnModality(
      image.modality,
      coordinates,
      image.width,
      image.height
    )

    let suggestedCategory: Annotation['category'] = 'landmark'
    let suggestedPriority: Annotation['priority'] = modalityBasedPriority
    let reason = ''

    if (isCentralRegion) {
      suggestedCategory = 'finding'
      suggestedPriority = modalityBasedPriority === 'high' ? 'high' : 'medium'
      reason = `Central region (${Math.round((coordinates.x / image.width) * 100)}%, ${Math.round((coordinates.y / image.height) * 100)}%) often contains significant findings. ${this.getModalitySpecificReason(image.modality)}`
    } else {
      suggestedCategory = 'landmark'
      suggestedPriority = 'low'
      reason = `Peripheral region typically contains anatomical landmarks. Position: ${Math.round((coordinates.x / image.width) * 100)}%, ${Math.round((coordinates.y / image.height) * 100)}%`
    }

    return {
      suggestedCategory,
      suggestedPriority,
      reason,
    }
  }

  private getPriorityBasedOnModality(
    modality: MedicalImage['modality'],
    coordinates: Annotation['coordinates'],
    imageWidth: number,
    imageHeight: number
  ): Annotation['priority'] {
    const normalizedX = coordinates.x / imageWidth
    const normalizedY = coordinates.y / imageHeight
    const isCentral =
      normalizedX > 0.25 &&
      normalizedX < 0.75 &&
      normalizedY > 0.25 &&
      normalizedY < 0.75

    switch (modality) {
      case 'CT':
        return isCentral ? 'high' : 'medium'
      case 'MRI':
        return isCentral ? 'high' : 'medium'
      case 'US':
        return 'medium'
      default:
        return 'low'
    }
  }

  private getModalitySpecificReason(modality: MedicalImage['modality']): string {
    switch (modality) {
      case 'CT':
        return 'CT scans: Central regions may show pathology in organs or vessels.'
      case 'MRI':
        return 'MRI scans: Central regions often contain critical anatomical structures.'
      case 'US':
        return 'Ultrasound: Central regions typically show organ parenchyma.'
      default:
        return ''
    }
  }

  private analyzeMetadata(image: MedicalImage): string[] {
    const insights: string[] = []

    if (image.metadata.studyDate) {
      insights.push(`Study date: ${image.metadata.studyDate}`)
    }

    if (image.metadata.seriesNumber) {
      insights.push(`Series: ${image.metadata.seriesNumber}`)
    }

    if (image.metadata.sliceThickness) {
      insights.push(`Slice thickness: ${image.metadata.sliceThickness}mm`)
    }

    const studyType = this.getStudyTypeFromMetadata(image)
    if (studyType) {
      insights.push(`Study type: ${studyType}`)
    }

    if (image.width && image.height) {
      const aspectRatio = image.width / image.height
      if (aspectRatio > 1.2) {
        insights.push('Wide format image - may indicate panoramic view')
      } else if (aspectRatio < 0.8) {
        insights.push('Tall format image - may indicate sagittal/coronal view')
      }
    }

    return insights
  }

  private getStudyTypeFromMetadata(image: MedicalImage): string | null {
    if (image.metadata.studyType) {
      return String(image.metadata.studyType)
    }

    if (image.metadata.bodyPart) {
      return String(image.metadata.bodyPart)
    }

    if (image.metadata.seriesDescription) {
      const desc = String(image.metadata.seriesDescription).toLowerCase()
      if (desc.includes('brain') || desc.includes('head')) return 'brain'
      if (desc.includes('spine') || desc.includes('spinal')) return 'spine'
      if (desc.includes('chest') || desc.includes('thorax')) return 'chest'
      if (desc.includes('abdomen') || desc.includes('abdominal')) return 'abdomen'
    }

    return null
  }

  private suggestFocusAreas(
    image: MedicalImage,
    existingAnnotations: Annotation[]
  ): string[] {
    const suggestions: string[] = []

    if (existingAnnotations.length === 0) {
      switch (image.modality) {
        case 'CT':
          suggestions.push('Review central regions for organ pathology')
          suggestions.push('Check for contrast enhancement patterns')
          break
        case 'MRI':
          suggestions.push('Examine T1/T2 signal characteristics')
          suggestions.push('Look for symmetry in bilateral structures')
          break
        case 'US':
          suggestions.push('Assess echogenicity patterns')
          suggestions.push('Check for shadowing or enhancement')
          break
      }
    } else {
      const findingsCount = existingAnnotations.filter(
        (ann) => ann.category === 'finding'
      ).length

      if (findingsCount > 0) {
        suggestions.push(
          `${findingsCount} finding(s) identified - review surrounding areas`
        )
      }

      const highPriorityCount = existingAnnotations.filter(
        (ann) => ann.priority === 'high'
      ).length

      if (highPriorityCount > 0) {
        suggestions.push(
          `${highPriorityCount} high-priority annotation(s) require detailed review`
        )
      }
    }

    return suggestions
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

  getRecommendedAnnotationOrder(annotations: Annotation[]): Annotation[] {
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

    return [...annotations].sort((a, b) => {
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
      if (priorityDiff !== 0) return priorityDiff

      return categoryOrder[b.category] - categoryOrder[a.category]
    })
  }
}
