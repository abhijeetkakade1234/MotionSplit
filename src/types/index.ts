export type ExtractionMode = 'every-frame' | 'custom-fps'
export type OutputFormat = 'png' | 'jpg'
export type Phase = 'idle' | 'loading' | 'ready' | 'extracting' | 'done' | 'error'

export type VideoMetadata = {
  duration: number
  frameRate: number | null
  height: number
  name: string
  width: number
}

export type ExtractionSettings = {
  endTime: number
  format: OutputFormat
  fps: number
  mode: ExtractionMode
  padding: 3 | 4 | 5
  quality: number
  startTime: number
}

export type ProgressState = {
  currentFrame: number
  etaSeconds: number | null
  estimatedZipBytes: number | null
  extractedFrames: number
  percent: number
  processedSeconds: number
  totalFrames: number | null
}

export type PreviewFrame = {
  name: string
  url: string
}

export type ArchiveInfo = {
  downloadUrl: string
  fileName: string
  format: OutputFormat
  frameCount: number
  sizeBytes: number
}

export type AppView = 'landing' | 'tool'
