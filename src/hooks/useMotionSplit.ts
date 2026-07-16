import { startTransition, useEffect, useMemo, useRef, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import JSZip from 'jszip'
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
import {
  MAX_UPLOAD_BYTES,
  MAX_VIDEO_DURATION_SECONDS,
} from '../utils/limits'

const INPUT_NAME = 'input-video'
const PREVIEW_LIMIT = 18
const CHUNK_SECONDS = 2
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

  useEffect(() => {
    saveSettings(settings)
  }, [settings])

  useEffect(() => {
    return () => {
      revokePreviewUrls(previewUrlsRef.current)
      if (archiveUrlRef.current) {
        URL.revokeObjectURL(archiveUrlRef.current)
      }
      dropFFmpeg()
    }
  }, [])

  const canExtract = useMemo(() => {
    if (!videoFile || !metadata) {
      return false
    }

    return settings.endTime > settings.startTime
  }, [metadata, settings.endTime, settings.startTime, videoFile])

  async function handleFileSelection(file: File) {
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
    setPhase('loading')
    setStatusText('Reading video metadata...')
    setProgress(INITIAL_PROGRESS)
    setVideoFile(file)

    try {
      const parsedMetadata = await readVideoMetadata(file)

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
      setPhase('error')
      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to inspect the selected video.',
      )
    }
  }

  async function startExtraction() {
    if (!videoFile || !metadata) {
      return
    }

    cancelledRef.current = false
    clearArchive()
    clearPreviews()
    setErrorMessage(null)
    setPhase('loading')
    setStatusText('Loading FFmpeg...')
    setProgress(INITIAL_PROGRESS)

    const ffmpeg = await getFFmpeg()
    setFfmpegReady(true)
    setPhase('extracting')
    setStatusText('Extracting frames...')
    runStartRef.current = performance.now()

    await ffmpeg.writeFile(INPUT_NAME, new Uint8Array(await videoFile.arrayBuffer()))

    const sourceFrameRate =
      settings.mode === 'every-frame'
        ? await resolveSourceFrameRate(ffmpeg, metadata, setMetadata)
        : metadata.frameRate

    const zip = new JSZip()
    const fps =
      settings.mode === 'every-frame' ? sourceFrameRate ?? 30 : settings.fps
    const totalFrames = Math.max(
      1,
      Math.round((settings.endTime - settings.startTime) * fps),
    )
    const filterArgs =
      settings.mode === 'every-frame' ? [] : ['-vf', `fps=${settings.fps}`]
    const codecArgs =
      settings.format === 'png'
        ? ['-c:v', 'png']
        : ['-q:v', mapJpegQuality(settings.quality).toString()]

    setProgress((current) => ({ ...current, totalFrames }))

    try {
      let globalFrame = 1
      let outputBytes = 0

      for (
        let chunkStart = settings.startTime;
        chunkStart < settings.endTime;
        chunkStart += CHUNK_SECONDS
      ) {
        if (cancelledRef.current) {
          throw new Error('Extraction cancelled.')
        }

        const chunkDuration = Math.min(CHUNK_SECONDS, settings.endTime - chunkStart)
        const chunkPrefix = `chunk-${globalFrame}`
        const outputPattern = `${chunkPrefix}-%05d.${settings.format}`
        let lastChunkProgress = 0

        const onProgress = ({ progress: chunkProgress }: { progress: number }) => {
          lastChunkProgress = chunkProgress
          const processedSeconds =
            chunkStart - settings.startTime + chunkDuration * chunkProgress
          const completedFrames = Math.min(
            totalFrames,
            Math.round(processedSeconds * fps),
          )
          const percent =
            (processedSeconds / (settings.endTime - settings.startTime)) * 100
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

        try {
          await ffmpeg.exec([
            '-ss',
            chunkStart.toFixed(3),
            '-t',
            chunkDuration.toFixed(3),
            '-i',
            INPUT_NAME,
            ...filterArgs,
            ...codecArgs,
            outputPattern,
          ])
        } finally {
          ffmpeg.off('progress', onProgress)
        }

        const files = await listChunkFiles(ffmpeg, chunkPrefix, settings.format)

        for (const fileName of files) {
          const fileData = await ffmpeg.readFile(fileName)
          const bytes = normalizeFileData(fileData)
          const blob = new Blob([bytes], {
            type: settings.format === 'png' ? 'image/png' : 'image/jpeg',
          })
          const outputName = buildFrameName(globalFrame, settings.padding, settings.format)

          zip.file(outputName, blob)
          outputBytes += blob.size

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

        setProgress((current) => ({
          ...current,
          currentFrame: globalFrame - 1,
          estimatedZipBytes:
            globalFrame > 1
              ? Math.round((outputBytes / (globalFrame - 1)) * totalFrames)
              : current.estimatedZipBytes,
          extractedFrames: globalFrame - 1,
          percent:
            ((chunkStart - settings.startTime + chunkDuration * Math.max(lastChunkProgress, 1)) /
              (settings.endTime - settings.startTime)) *
            100,
          processedSeconds: chunkStart - settings.startTime + chunkDuration,
        }))
      }

      setStatusText('Creating ZIP archive...')
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      const downloadUrl = URL.createObjectURL(zipBlob)
      archiveUrlRef.current = downloadUrl

      setArchiveInfo({
        downloadUrl,
        fileName: `${sanitizeFileName(metadata.name)}-frames.zip`,
        format: settings.format,
        frameCount: globalFrame - 1,
        sizeBytes: zipBlob.size,
      })

      setProgress((current) => ({
        ...current,
        currentFrame: globalFrame - 1,
        estimatedZipBytes: zipBlob.size,
        extractedFrames: globalFrame - 1,
        percent: 100,
      }))
      setStatusText('Frames ready for download.')
      setPhase('done')
    } catch (error) {
      if (archiveUrlRef.current) {
        URL.revokeObjectURL(archiveUrlRef.current)
        archiveUrlRef.current = null
      }

      setPhase(cancelledRef.current ? 'ready' : 'error')
      setStatusText(
        cancelledRef.current ? 'Extraction cancelled.' : 'Extraction failed.',
      )
      setErrorMessage(error instanceof Error ? error.message : 'Frame extraction failed.')
    } finally {
      ffmpeg.deleteFile(INPUT_NAME).catch(() => undefined)
    }
  }

  function cancelExtraction() {
    if (phase !== 'extracting') {
      return
    }

    cancelledRef.current = true
    dropFFmpeg()
    setFfmpegReady(false)
    setStatusText('Cancelling extraction...')
  }

  function resetAll() {
    cancelledRef.current = false
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
    await navigator.clipboard.writeText(sample)
  }

  return {
    archiveInfo,
    canExtract,
    cancelExtraction,
    copyNamingPattern,
    errorMessage,
    ffmpegReady,
    handleFileSelection,
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
    await ffmpeg.ffprobe([
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
    ])

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
