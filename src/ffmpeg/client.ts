import coreURL from '@ffmpeg/core?url'
import wasmURL from '@ffmpeg/core/wasm?url'
import { FFmpeg } from '@ffmpeg/ffmpeg'

let ffmpegInstance: FFmpeg | null = null
let loadingPromise: Promise<FFmpeg> | null = null
let loadingInstance: FFmpeg | null = null

export async function getFFmpeg(signal?: AbortSignal) {
  if (ffmpegInstance) {
    return ffmpegInstance
  }

  if (!loadingPromise) {
    const ffmpeg = new FFmpeg()
    loadingInstance = ffmpeg
    loadingPromise = ffmpeg
      .load({
        coreURL,
        wasmURL,
      }, signal ? { signal } : undefined)
      .then(() => {
        loadingInstance = null
        ffmpegInstance = ffmpeg
        return ffmpeg
      })
      .catch((error: unknown) => {
        ffmpeg.terminate()
        loadingInstance = null
        loadingPromise = null
        throw error
      })
  }

  return loadingPromise
}

export function dropFFmpeg() {
  loadingInstance?.terminate()
  ffmpegInstance?.terminate()
  loadingInstance = null
  ffmpegInstance = null
  loadingPromise = null
}
