import { useEffect } from 'react'
import { DownloadPanel } from './DownloadPanel'
import { ExtractionControls } from './ExtractionControls'
import { PreviewStrip } from './PreviewStrip'
import { ProgressPanel } from './ProgressPanel'
import { UploadZone } from './UploadZone'
import { VideoDetailsCard } from './VideoDetailsCard'
import { useMotionSplit } from '../hooks/useMotionSplit'
import { formatBytes, formatDuration } from '../utils/format'
import {
  MAX_UPLOAD_BYTES,
  MAX_VIDEO_DURATION_SECONDS,
} from '../utils/limits'

type ToolWorkspaceProps = {
  onBack: () => void
}

export function ToolWorkspace({ onBack }: ToolWorkspaceProps) {
  const motionSplit = useMotionSplit()

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const isSubmit =
        (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'enter'
      const isEscape = event.key === 'Escape'

      if (isSubmit && motionSplit.canExtract) {
        event.preventDefault()
        void motionSplit.startExtraction()
      }

      if (isEscape && motionSplit.phase === 'extracting') {
        event.preventDefault()
        motionSplit.cancelExtraction()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [motionSplit])

  return (
    <div className="min-h-screen bg-[#050816] text-slate-50">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(12,18,36,0.96),rgba(8,12,24,0.82))] px-5 py-5 shadow-[0_20px_80px_rgba(2,6,15,0.5)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <button
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs uppercase tracking-[0.22em] text-slate-300 transition hover:bg-white/[0.08]"
                onClick={onBack}
                type="button"
              >
                Back to landing
              </button>
              <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
                MotionSplit tool
              </h1>
            </div>

            <div className="grid gap-2 rounded-[24px] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
              <div>Hard cap: {formatBytes(MAX_UPLOAD_BYTES)}</div>
              <div>Hard cap: {formatDuration(MAX_VIDEO_DURATION_SECONDS)}</div>
              <div>Modes: every frame or target FPS</div>
            </div>
          </div>

          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-300">
            Extract frames locally for scroll narratives, image planes, product storytelling,
            and motion-heavy web builds. Files stay on-device from upload to ZIP.
          </p>
        </header>

        <main className="grid flex-1 gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(380px,0.9fr)]">
          <section className="space-y-6">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.035] p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur sm:p-6">
              <UploadZone
                busy={motionSplit.phase === 'extracting'}
                fileName={motionSplit.videoFile?.name ?? null}
                onSelectFile={motionSplit.handleFileSelection}
              />

              <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-400">
                <span>Supported: MP4, MOV, WebM</span>
                <span>Up to {formatBytes(MAX_UPLOAD_BYTES)}</span>
                <span>Up to {formatDuration(MAX_VIDEO_DURATION_SECONDS)}</span>
              </div>
            </div>

            <VideoDetailsCard
              ffmpegReady={motionSplit.ffmpegReady}
              metadata={motionSplit.metadata}
            />

            <PreviewStrip
              previewFrames={motionSplit.previewFrames}
              totalFrames={motionSplit.progress.totalFrames}
            />
          </section>

          <section className="space-y-6">
            <ExtractionControls
              canExtract={motionSplit.canExtract}
              disabled={motionSplit.phase === 'extracting'}
              onCopyPattern={motionSplit.copyNamingPattern}
              onReset={motionSplit.resetAll}
              onStart={() => void motionSplit.startExtraction()}
              settings={motionSplit.settings}
              setSettings={motionSplit.setSettings}
              videoDuration={motionSplit.metadata?.duration ?? 0}
            />

            <ProgressPanel
              phase={motionSplit.phase}
              progress={motionSplit.progress}
              onCancel={motionSplit.cancelExtraction}
              statusText={motionSplit.statusText}
            />

            <DownloadPanel
              archiveInfo={motionSplit.archiveInfo}
              errorMessage={motionSplit.errorMessage}
            />

            <div className="rounded-[28px] border border-white/10 bg-white/[0.025] p-5">
              <div className="text-xs uppercase tracking-[0.22em] text-[#93a4d7]">
                Workflow notes
              </div>
              <ul className="mt-4 grid gap-3 text-sm leading-7 text-slate-300">
                <li>Everything runs in-browser with ffmpeg.wasm.</li>
                <li>No frames or clips are uploaded to any server.</li>
                <li>JPG quality only affects JPG output. PNG stays lossless.</li>
                <li>Source FPS is probed before every-frame extraction when needed.</li>
              </ul>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
