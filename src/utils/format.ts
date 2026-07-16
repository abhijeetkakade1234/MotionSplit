export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function formatDuration(totalSeconds: number) {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) {
    return '0s'
  }

  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  if (!minutes) {
    return `${seconds.toFixed(seconds >= 10 ? 0 : 1)}s`
  }

  return `${minutes}m ${seconds.toFixed(0)}s`
}

export function formatFrameRate(frameRate: number | null) {
  if (!frameRate) {
    return 'Unavailable'
  }

  return `${frameRate.toFixed(frameRate % 1 === 0 ? 0 : 2)} FPS`
}

export function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return '0 B'
  }

  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex += 1
  }

  return `${size.toFixed(size >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`
}

export function formatEta(seconds: number | null) {
  if (!seconds || seconds < 1) {
    return 'Estimating'
  }

  return formatDuration(seconds)
}
