import { startTransition, useEffect, useMemo, useRef, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { dropFFmpeg, getFFmpeg } from '../ffmpeg/client'
import type {
  ArchiveInfo,
  ExtractionSettings,
  Phase,
  PreviewFrame,
  ProgressState,
  VideoMetadata,
} from '../types'
import { buildFrameName } from '../utils/naming'
import { loadSettings, saveSettings } from '../utils/storage'
import { parseFrameRate } from '../utils/video'
import { readVideoMetadata } from '../utils/video'
import { createFrameArchive, finalizeFrameArchive } from '../zip/frameArchive'
import {
  MAX_ARCHIVE_BYTES,
  MAX_OUTPUT_FRAMES,
  MAX_OUTPUT_PIXELS,
  MAX_UPLOAD_BYTES,
  MAX_VIDEO_DURATION_SECONDS,
} from '../utils/limits'

const INPUT_NAME = 'input-video'
const PREVIEW_LIMIT = 18
const CHUNK_SECONDS = 1
const FFMPEG_LOAD_TIMEOUT_MS = 45_000
const FFMPEG_COMMAND_TIMEOUT_MS = 120_000
const FFPROBE_TIMEOUT_MS = 30_000
const INITIAL_PROGRESS: ProgressState = {
  currentFrame: 0,
  etaSeconds: null,
  estimatedZipBytes: null,
  extractedFrames: 0,
  percent: 0,
  processedSeconds: 0,
  totalFrames: null,
}

export function useMotionSplit() {
  const [settings, setSettings] = useState<ExtractionSettings>(() => loadSettings())
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null)
  const [phase, setPhase] = useState<Phase>('idle')
  const [statusText, setStatusText] = useState('Load a source file to begin.')
  const [progress, setProgress] = useState<ProgressState>(INITIAL_PROGRESS)
  const [previewFrames, setPreviewFrames] = useState<PreviewFrame[]>([])
  const [archiveInfo, setArchiveInfo] = useState<ArchiveInfo | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [ffmpegReady, setFfmpegReady] = useState(false)
  const previewUrlsRef = useRef<string[]>([])
  const archiveUrlRef = useRef<string | null>(null)
  const runStartRef = useRef<number>(0)
  const cancelledRef = useRef(false)
  const activeRunRef = useRef(false)
  const selectionIdRef = useRef(0)

  useEffect(() => {
    saveSettings(settings)
  }, [settings])

  useEffect(() => {
    return () => {
      cancelledRef.current = true
      selectionIdRef.current += 1
      revokePreviewUrls(previewUrlsRef.current)
      if (archiveUrlRef.current) {
        URL.revokeObjectURL(archiveUrlRef.current)
      }
      dropFFmpeg()
    }
  }, [])

  const isBusy = [
    'inspecting',
    'loading',
    'extracting',
    'packaging',
    'cancelling',
  ].includes(phase)
  const isProcessing = ['loading', 'extracting', 'packaging', 'cancelling'].includes(phase)

  const canExtract = useMemo(() => {
    if (!videoFile || !metadata || isBusy) {
      return false
    }

    return settings.endTime > settings.startTime
  }, [isBusy, metadata, settings.endTime, settings.startTime, videoFile])

  async function handleFileSelection(file: File) {
    if (activeRunRef.current) {
      return
    }

    const selectionId = ++selectionIdRef.current

    if (!isSupportedFile(file)) {
      rejectFile('Unsupported file type. Use MP4, MOV, or WebM.')
      return
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      rejectFile(
        `This file is larger than the ${Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)} MB safety cap.`,
      )
      return
    }

    clearArchive()
    clearPreviews()
    cancelledRef.current = false
    setErrorMessage(null)
    setPhase('inspecting')
    setStatusText('Reading video metadata...')
    setProgress(INITIAL_PROGRESS)
    setVideoFile(file)

    try {
      const parsedMetadata = await readVideoMetadata(file)

      if (selectionId !== selectionIdRef.current) {
        return
      }

      if (
        !Number.isFinite(parsedMetadata.duration) ||
        parsedMetadata.duration <= 0 ||
        parsedMetadata.width <= 0 ||
        parsedMetadata.height <= 0
      ) {
        rejectFile('The browser could not find a valid video track in this file.')
        return
      }

      if (parsedMetadata.duration > MAX_VIDEO_DURATION_SECONDS) {
        rejectFile(
          `This video is longer than the ${Math.round(MAX_VIDEO_DURATION_SECONDS / 60)} minute safety cap.`,
        )
        return
      }

      setMetadata(parsedMetadata)
      setSettings((current) => ({
        ...current,
        startTime: 0,
        endTime: Number(parsedMetadata.duration.toFixed(2)),
      }))
      setStatusText('Metadata ready. FFmpeg will load on first extraction.')
      setPhase('ready')
    } catch (error) {
      if (selectionId !== selectionIdRef.current) {
        return
      }

      setPhase('error')
      setStatusText('Select a different source file to continue.')
      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to inspect the selected video.',
      )
    }
  }

  async function startExtraction() {
    if (!videoFile || !metadata || activeRunRef.current) {
      return
    }

    activeRunRef.current = true
    cancelledRef.current = false
    const sourceFile = videoFile
    const sourceMetadata = metadata
    const runSettings = settings
    clearArchive()
    clearPreviews()
    setErrorMessage(null)
    setPhase('loading')
    setStatusText('Loading FFmpeg...')
    setProgress(INITIAL_PROGRESS)

    let ffmpeg: Awaited<ReturnType<typeof getFFmpeg>> | null = null
    let stage: 'loading' | 'extracting' | 'packaging' = 'loading'

    try {
      ffmpeg = await getFFmpeg(AbortSignal.timeout(FFMPEG_LOAD_TIMEOUT_MS))
      throwIfCancelled(cancelledRef.current)
      setFfmpegReady(true)
      setStatusText('Preparing the source video...')

      const sourceBytes = new Uint8Array(await sourceFile.arrayBuffer())
      throwIfCancelled(cancelledRef.current)
      await ffmpeg.writeFile(INPUT_NAME, sourceBytes)
      throwIfCancelled(cancelledRef.current)

      stage = 'extracting'
      setPhase('extracting')
      setStatusText('Extracting frames...')
      runStartRef.current = performance.now()

      const sourceFrameRate =
        runSettings.mode === 'every-frame'
          ? await resolveSourceFrameRate(ffmpeg, sourceMetadata, setMetadata)
          : sourceMetadata.frameRate
      throwIfCancelled(cancelledRef.current)

      const zip = createFrameArchive()
      const fps =
        runSettings.mode === 'every-frame' ? sourceFrameRate ?? 60 : runSettings.fps
      const totalFrames = Math.max(
        1,
        Math.round((runSettings.endTime - runSettings.startTime) * fps),
      )
      assertSafeExtraction(totalFrames, sourceMetadata)

      const filterArgs =
        runSettings.mode === 'every-frame' ? [] : ['-vf', `fps=${runSettings.fps}`]
      const codecArgs =
        runSettings.format === 'png'
          ? ['-c:v', 'png']
          : ['-q:v', mapJpegQuality(runSettings.quality).toString()]

      setProgress((current) => ({ ...current, totalFrames }))

      let globalFrame = 1
      let outputBytes = 0

      for (
        let chunkStart = runSettings.startTime;
        chunkStart < runSettings.endTime;
        chunkStart += CHUNK_SECONDS
      ) {
        throwIfCancelled(cancelledRef.current)

        const chunkDuration = Math.min(CHUNK_SECONDS, runSettings.endTime - chunkStart)
        const chunkPrefix = `chunk-${globalFrame}`
        const outputPattern = `${chunkPrefix}-%05d.${runSettings.format}`
        let lastChunkProgress = 0

        const onProgress = ({ progress: chunkProgress }: { progress: number }) => {
          if (cancelledRef.current) {
            return
          }

          lastChunkProgress = chunkProgress
          const processedSeconds =
            chunkStart - runSettings.startTime + chunkDuration * chunkProgress
          const completedFrames = Math.min(
            totalFrames,
            Math.round(processedSeconds * fps),
          )
          const percent =
            (processedSeconds / (runSettings.endTime - runSettings.startTime)) * 100
          const elapsedSeconds = (performance.now() - runStartRef.current) / 1000
          const etaSeconds =
            percent > 0 ? elapsedSeconds * ((100 - percent) / percent) : null

          setProgress((current) => ({
            ...current,
            currentFrame: Math.max(current.currentFrame, completedFrames),
            etaSeconds,
            estimatedZipBytes:
              outputBytes && completedFrames
                ? Math.round((outputBytes / completedFrames) * totalFrames)
                : current.estimatedZipBytes,
            extractedFrames: Math.max(current.extractedFrames, completedFrames),
            percent,
            processedSeconds,
          }))
        }

        ffmpeg.on('progress', onProgress)

        let exitCode: number
        try {
          exitCode = await ffmpeg.exec([
            '-ss',
            chunkStart.toFixed(3),
            '-t',
            chunkDuration.toFixed(3),
            '-i',
            INPUT_NAME,
            ...filterArgs,
            ...codecArgs,
            outputPattern,
          ], FFMPEG_COMMAND_TIMEOUT_MS)
        } finally {
          ffmpeg.off('progress', onProgress)
        }

        throwIfCancelled(cancelledRef.current)
        if (exitCode !== 0) {
          throw new Error('FFmpeg could not decode this part of the video.')
        }

        const files = await listChunkFiles(ffmpeg, chunkPrefix, runSettings.format)
        if (!files.length) {
          throw new Error('FFmpeg produced no frames for the selected range.')
        }

        for (const fileName of files) {
          throwIfCancelled(cancelledRef.current)
          const fileData = await ffmpeg.readFile(fileName)
          const bytes = normalizeFileData(fileData)
          const blob = new Blob([bytes], {
            type: runSettings.format === 'png' ? 'image/png' : 'image/jpeg',
          })
          const outputName = buildFrameName(
            globalFrame,
            runSettings.padding,
            runSettings.format,
          )

          zip.file(outputName, blob)
          outputBytes += blob.size
          if (globalFrame > MAX_OUTPUT_FRAMES || outputBytes > MAX_ARCHIVE_BYTES) {
            throw new Error('The generated frames exceeded the browser safety limit.')
          }

          if (previewUrlsRef.current.length < PREVIEW_LIMIT) {
            const previewUrl = URL.createObjectURL(blob)
            previewUrlsRef.current.push(previewUrl)
            startTransition(() => {
              setPreviewFrames((current) => [
                ...current,
                { name: outputName, url: previewUrl },
              ])
            })
          }

          await ffmpeg.deleteFile(fileName)
          globalFrame += 1
        }

        const projectedArchiveBytes = Math.round(
          (outputBytes / Math.max(globalFrame - 1, 1)) * totalFrames,
        )
        if (projectedArchiveBytes > MAX_ARCHIVE_BYTES) {
          throw new Error(
            `The estimated ZIP is larger than the ${Math.round(MAX_ARCHIVE_BYTES / 1024 / 1024)} MB browser safety limit. Use JPG, lower FPS, or a shorter range.`,
          )
        }

        setProgress((current) => ({
          ...current,
          currentFrame: globalFrame - 1,
          estimatedZipBytes:
            globalFrame > 1
              ? projectedArchiveBytes
              : current.estimatedZipBytes,
          extractedFrames: globalFrame - 1,
          percent:
            ((chunkStart - runSettings.startTime + chunkDuration * Math.max(lastChunkProgress, 1)) /
              (runSettings.endTime - runSettings.startTime)) *
            100,
          processedSeconds: chunkStart - runSettings.startTime + chunkDuration,
        }))
      }

      stage = 'packaging'
      setPhase('packaging')
      setStatusText('Creating ZIP archive...')
      const zipBlob = await finalizeFrameArchive(zip, () => cancelledRef.current)
      throwIfCancelled(cancelledRef.current)
      if (zipBlob.size > MAX_ARCHIVE_BYTES) {
        throw new Error('The ZIP exceeded the browser safety limit.')
      }

      const downloadUrl = URL.createObjectURL(zipBlob)
      archiveUrlRef.current = downloadUrl

      setArchiveInfo({
        downloadUrl,
        fileName: `${sanitizeFileName(sourceMetadata.name)}-frames.zip`,
        format: runSettings.format,
        frameCount: globalFrame - 1,
        sizeBytes: zipBlob.size,
      })

      setProgress((current) => ({
        ...current,
        currentFrame: globalFrame - 1,
        estimatedZipBytes: zipBlob.size,
        extractedFrames: globalFrame - 1,
        percent: 100,
        totalFrames: globalFrame - 1,
      }))
      setStatusText('Frames ready for download.')
      setPhase('done')
    } catch (error) {
      dropFFmpeg()
      setFfmpegReady(false)
      clearArchive()
      clearPreviews()

      if (cancelledRef.current) {
        setPhase('ready')
        setStatusText('Extraction cancelled. Your source is ready to retry.')
        setProgress(INITIAL_PROGRESS)
        setErrorMessage(null)
      } else {
        setPhase('error')
        setStatusText('Extraction failed. Fix the issue below and retry.')
        setErrorMessage(formatExtractionError(error, stage))
      }
    } finally {
      activeRunRef.current = false
      ffmpeg?.deleteFile(INPUT_NAME).catch(() => undefined)
    }
  }

  function cancelExtraction() {
    if (!activeRunRef.current || cancelledRef.current) {
      return
    }

    cancelledRef.current = true
    clearArchive()
    clearPreviews()
    dropFFmpeg()
    setFfmpegReady(false)
    setPhase('cancelling')
    setStatusText('Cancelling extraction...')
  }

  function resetAll() {
    if (activeRunRef.current) {
      return
    }

    selectionIdRef.current += 1
    cancelledRef.current = false
    dropFFmpeg()
    clearArchive()
    clearPreviews()
    setVideoFile(null)
    setMetadata(null)
    setFfmpegReady(false)
    setProgress(INITIAL_PROGRESS)
    setErrorMessage(null)
    setPhase('idle')
    setStatusText('Load a source file to begin.')
    setSettings(loadSettings())
  }

  async function copyNamingPattern() {
    const sample = buildFrameName(1, settings.padding, settings.format)
    try {
      await navigator.clipboard.writeText(sample)
    } catch {
      setErrorMessage('The browser blocked clipboard access. Copy the pattern manually.')
    }
  }

  return {
    archiveInfo,
    canExtract,
    cancelExtraction,
    copyNamingPattern,
    errorMessage,
    ffmpegReady,
    handleFileSelection,
    isBusy,
    isProcessing,
    metadata,
    phase,
    previewFrames,
    progress,
    resetAll,
    settings,
    setSettings,
    startExtraction,
    statusText,
    videoFile,
  }

  function clearArchive() {
    if (archiveUrlRef.current) {
      URL.revokeObjectURL(archiveUrlRef.current)
      archiveUrlRef.current = null
    }
    setArchiveInfo(null)
  }

  function clearPreviews() {
    revokePreviewUrls(previewUrlsRef.current)
    previewUrlsRef.current = []
    setPreviewFrames([])
  }

  function rejectFile(message: string) {
    clearArchive()
    clearPreviews()
    setVideoFile(null)
    setMetadata(null)
    setPhase('error')
    setStatusText('Select a different source file to continue.')
    setProgress(INITIAL_PROGRESS)
    setErrorMessage(message)
  }
}

async function listChunkFiles(
  ffmpeg: Awaited<ReturnType<typeof getFFmpeg>>,
  prefix: string,
  format: ExtractionSettings['format'],
) {
  const files = await ffmpeg.listDir('.')
  return files
    .filter((entry) => entry.name.startsWith(prefix) && entry.name.endsWith(`.${format}`))
    .map((entry) => entry.name)
    .toSorted()
}

function revokePreviewUrls(urls: string[]) {
  for (const url of urls) {
    URL.revokeObjectURL(url)
  }
}

function sanitizeFileName(name: string) {
  return name.replace(/\.[^.]+$/, '').replace(/[^a-z0-9-_]+/gi, '-').toLowerCase()
}

function normalizeFileData(fileData: Uint8Array | string) {
  if (typeof fileData === 'string') {
    return new TextEncoder().encode(fileData)
  }

  return new Uint8Array(fileData)
}

function mapJpegQuality(quality: number) {
  return Math.max(2, Math.round(((100 - quality) / 100) * 29))
}

function isSupportedFile(file: File) {
  if (['video/mp4', 'video/quicktime', 'video/webm'].includes(file.type)) {
    return true
  }

  return /\.(mp4|mov|webm)$/i.test(file.name)
}

async function resolveSourceFrameRate(
  ffmpeg: Awaited<ReturnType<typeof getFFmpeg>>,
  metadata: VideoMetadata,
  setMetadata: Dispatch<SetStateAction<VideoMetadata | null>>,
) {
  if (metadata.frameRate) {
    return metadata.frameRate
  }

  const probeOutputName = `${INPUT_NAME}.fps.txt`

  try {
    const exitCode = await ffmpeg.ffprobe([
      '-v',
      'error',
      '-select_streams',
      'v:0',
      '-show_entries',
      'stream=avg_frame_rate,r_frame_rate',
      '-of',
      'default=noprint_wrappers=1',
      INPUT_NAME,
      '-o',
      probeOutputName,
    ], FFPROBE_TIMEOUT_MS)

    if (exitCode !== 0) {
      return null
    }

    const probeText = await ffmpeg.readFile(probeOutputName, 'utf8')
    const parsedFrameRate = parseFrameRate(String(probeText))

    if (parsedFrameRate) {
      setMetadata((current) =>
        current ? { ...current, frameRate: parsedFrameRate } : current,
      )
      return parsedFrameRate
    }

    return null
  } finally {
    ffmpeg.deleteFile(probeOutputName).catch(() => undefined)
  }
}

function throwIfCancelled(cancelled: boolean) {
  if (cancelled) {
    throw new Error('Extraction cancelled.')
  }
}

function assertSafeExtraction(totalFrames: number, metadata: VideoMetadata) {
  if (totalFrames > MAX_OUTPUT_FRAMES) {
    throw new Error(
      `This extraction would create about ${totalFrames.toLocaleString()} frames. Keep it under ${MAX_OUTPUT_FRAMES.toLocaleString()} by lowering FPS or shortening the range.`,
    )
  }

  if (totalFrames * metadata.width * metadata.height > MAX_OUTPUT_PIXELS) {
    throw new Error(
      'This resolution and frame count are too large for safe in-browser processing. Lower FPS, shorten the range, or resize the video.',
    )
  }
}

function formatExtractionError(
  error: unknown,
  stage: 'loading' | 'extracting' | 'packaging',
) {
  const message = error instanceof Error ? error.message : ''

  if (stage === 'loading') {
    return navigator.onLine
      ? 'MotionSplit could not start FFmpeg. Check your connection and available browser memory, then retry.'
      : 'FFmpeg is not available in the offline cache yet. Reconnect once, reload MotionSplit, then retry.'
  }

  if (/memory|allocation|out of bounds|too large|safety limit/i.test(message)) {
    return message || 'The browser ran out of memory. Use a shorter range or lower FPS.'
  }

  if (stage === 'packaging') {
    return message || 'MotionSplit could not create the ZIP. Use a shorter range and retry.'
  }

  return message || 'Frame extraction failed. The video may use an unsupported codec.'
}
