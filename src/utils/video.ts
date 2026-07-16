import type { VideoMetadata } from '../types'

export async function readVideoMetadata(file: File): Promise<VideoMetadata> {
  const objectUrl = URL.createObjectURL(file)

  try {
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.muted = true
    video.src = objectUrl

    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve()
      video.onerror = () => reject(new Error('Could not read video metadata.'))
    })

    return {
      duration: video.duration,
      frameRate: inferFrameRate(video),
      height: video.videoHeight,
      name: file.name,
      width: video.videoWidth,
    }
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

export function parseFrameRate(value: string) {
  const lines = value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  for (const key of ['avg_frame_rate=', 'r_frame_rate=']) {
    const match = lines.find((line) => line.startsWith(key))

    if (!match) {
      continue
    }

    const parsed = parseFrameRateToken(match.slice(key.length))

    if (parsed) {
      return parsed
    }
  }

  return null
}

function inferFrameRate(video: HTMLVideoElement) {
  const quality = video.getVideoPlaybackQuality?.()
  const totalFrames = quality?.totalVideoFrames

  if (!totalFrames || !video.duration) {
    return null
  }

  const value = totalFrames / video.duration
  return Number.isFinite(value) ? Number(value.toFixed(2)) : null
}

function parseFrameRateToken(value: string) {
  if (!value || value === '0/0') {
    return null
  }

  const parts = value.split('/')

  if (parts.length === 2) {
    const numerator = Number(parts[0])
    const denominator = Number(parts[1])

    if (!numerator || !denominator) {
      return null
    }

    return Number((numerator / denominator).toFixed(2))
  }

  const numeric = Number(value)
  return Number.isFinite(numeric) && numeric > 0
    ? Number(numeric.toFixed(2))
    : null
}
