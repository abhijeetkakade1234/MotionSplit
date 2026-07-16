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

function inferFrameRate(video: HTMLVideoElement) {
  const quality = video.getVideoPlaybackQuality?.()
  const totalFrames = quality?.totalVideoFrames

  if (!totalFrames || !video.duration) {
    return null
  }

  const value = totalFrames / video.duration
  return Number.isFinite(value) ? Number(value.toFixed(2)) : null
}
