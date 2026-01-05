import { MedicalImage } from '@model/MedicalImage'

interface ImageViewerProps {
  image: MedicalImage | null
  onImageLoad?: () => void
}

export function ImageViewer({ image, onImageLoad }: ImageViewerProps) {
  if (!image) {
    return (
      <div className="image-viewer image-viewer--empty">
        <p>No image loaded</p>
      </div>
    )
  }

  return (
    <div className="image-viewer">
      <div className="image-viewer__container">
        <div className="image-viewer__info">
          <span>Modality: {image.modality}</span>
          <span>Dimensions: {image.width} × {image.height}</span>
        </div>
        <div className="image-viewer__canvas">
          <p>Image visualization area ({image.id})</p>
        </div>
      </div>
    </div>
  )
}
