import coreURL from '@ffmpeg/core?url'
import wasmURL from '@ffmpeg/core/wasm?url'
import { FFmpeg } from '@ffmpeg/ffmpeg'

let ffmpegInstance: FFmpeg | null = null
let loadingPromise: Promise<FFmpeg> | null = null

export async function getFFmpeg() {
  if (ffmpegInstance) {
    return ffmpegInstance
  }

  if (!loadingPromise) {
    loadingPromise = (async () => {
      const ffmpeg = new FFmpeg()
      await ffmpeg.load({
        coreURL,
        wasmURL,
      })
      ffmpegInstance = ffmpeg
      return ffmpeg
    })()
  }

  return loadingPromise
}

export function dropFFmpeg() {
  ffmpegInstance?.terminate()
  ffmpegInstance = null
  loadingPromise = null
}
