import type { OutputFormat } from '../types'

export function buildFrameName(
  index: number,
  padding: number,
  format: OutputFormat,
) {
  return `frame${String(index).padStart(padding, '0')}.${format}`
}
