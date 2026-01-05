import { MedicalImage } from '@model/MedicalImage'

export type ViewOrientation = 'axial' | 'sagittal' | 'coronal'

export interface ViewState {
  orientation: ViewOrientation
  zoom: number
  pan: { x: number; y: number }
  windowing: {
    level: number
    width: number
  }
}

export class ViewController {
  private state: ViewState

  constructor() {
    this.state = {
      orientation: 'axial',
      zoom: 1.0,
      pan: { x: 0, y: 0 },
      windowing: {
        level: 0,
        width: 255,
      },
    }
  }

  getState(): ViewState {
    return { ...this.state }
  }

  setOrientation(orientation: ViewOrientation): void {
    this.state.orientation = orientation
  }

  setZoom(zoom: number): void {
    this.state.zoom = Math.max(0.1, Math.min(5.0, zoom))
  }

  setPan(x: number, y: number): void {
    this.state.pan = { x, y }
  }

  setWindowing(level: number, width: number): void {
    this.state.windowing = { level, width }
  }

  reset(): void {
    this.state = {
      orientation: 'axial',
      zoom: 1.0,
      pan: { x: 0, y: 0 },
      windowing: {
        level: 0,
        width: 255,
      },
    }
  }
}
