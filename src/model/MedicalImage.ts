export interface MedicalImage {
  id: string
  modality: 'CT' | 'MRI' | 'US'
  width: number
  height: number
  src: string
  metadata: Record<string, unknown>
}
