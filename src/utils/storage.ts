import type { ExtractionSettings } from '../types'

const STORAGE_KEY = 'motionsplit:settings'

const DEFAULT_SETTINGS: ExtractionSettings = {
  endTime: 0,
  format: 'png',
  fps: 15,
  mode: 'custom-fps',
  padding: 4,
  quality: 88,
  startTime: 0,
}

export function loadSettings() {
  const raw = localStorage.getItem(STORAGE_KEY)

  if (!raw) {
    return DEFAULT_SETTINGS
  }

  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } as ExtractionSettings
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(settings: ExtractionSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}
