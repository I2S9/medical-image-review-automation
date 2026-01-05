import { MedicalImage } from '@model/MedicalImage'

const generateMockImageDataUrl = (): string => {
  if (typeof document === 'undefined') {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMxYTFhMmUiLz48c3RvcCBvZmZzZXQ9IjUwJSIgc3RvcC1jb2xvcj0iIzE2MjEzZSIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzBmMzQ2MCIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIiBmaWxsPSJ1cmwoI2cpIi8+PGNpcmNsZSBjeD0iMjU2IiBjeT0iMjU2IiByPSIxMDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzRhOWVmZiIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+'
  }

  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')

  if (ctx) {
    const gradient = ctx.createLinearGradient(0, 0, 512, 512)
    gradient.addColorStop(0, '#1a1a2e')
    gradient.addColorStop(0.5, '#16213e')
    gradient.addColorStop(1, '#0f3460')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 512, 512)

    ctx.strokeStyle = '#4a9eff'
    ctx.lineWidth = 2
    for (let i = 0; i < 20; i++) {
      ctx.beginPath()
      ctx.arc(
        256 + Math.sin(i) * 150,
        256 + Math.cos(i) * 150,
        50 + i * 5,
        0,
        Math.PI * 2
      )
      ctx.stroke()
    }

    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.fillRect(100, 100, 312, 312)
  }

  return canvas.toDataURL('image/png')
}

export const createMockImage = (): MedicalImage => {
  return {
    id: 'mock-ct-001',
    modality: 'CT',
    width: 512,
    height: 512,
    src: generateMockImageDataUrl(),
    metadata: {
      patientId: 'MOCK-001',
      studyDate: new Date().toISOString(),
      seriesNumber: 1,
      sliceThickness: 1.0,
    },
  }
}
