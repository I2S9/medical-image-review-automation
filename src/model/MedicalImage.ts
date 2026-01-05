export interface MedicalImage {
  id: string
  modality: 'CT' | 'MRI' | 'US'
  width: number
  height: number
  metadata: Record<string, unknown>
}
