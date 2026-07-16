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
  const extracting = motionSplit.phase === 'extracting'

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

  useEffect(() => {
    if (!extracting) {
      return
    }

    function onBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [extracting])

  function handleBack() {
    if (extracting && !window.confirm('Extraction is still running. Leave the tool?')) {
      return
    }

    onBack()
  }

  return (
    <div className="min-h-screen bg-[#050816] text-slate-50">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(78,117,255,0.22),transparent_24%),radial-gradient(circle_at_75%_0%,rgba(255,255,255,0.08),transparent_22%),linear-gradient(180deg,#08101d_0%,#050816_42%,#050816_100%)]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-[1540px] flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="mb-6 flex items-center justify-between gap-4 border-b border-white/8 pb-5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.14),rgba(255,255,255,0.04))] text-sm font-semibold text-white shadow-[0_8px_32px_rgba(18,35,88,0.28)]">
              MS
            </div>
            <div>
              <div className="text-[1.7rem] font-semibold tracking-[-0.04em] text-white">
                MotionSplit
              </div>
              <div className="text-sm text-slate-400">
                Local frame extraction for scroll, sequence, and motion builds.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-slate-300 md:block">
              Hard caps: {formatBytes(MAX_UPLOAD_BYTES)} / {formatDuration(MAX_VIDEO_DURATION_SECONDS)}
            </div>
            <button
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-200 transition hover:bg-white/[0.08]"
              onClick={handleBack}
              type="button"
            >
              Back
            </button>
          </div>
        </header>

        <main className="grid flex-1 gap-6 xl:grid-cols-[320px_minmax(0,1fr)_390px]">
          <section className="space-y-5">
            <div className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-4 shadow-[0_24px_80px_rgba(2,6,15,0.34)] backdrop-blur sm:p-5">
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

            <InfoPanel
              items={[
                ['Max file size', formatBytes(MAX_UPLOAD_BYTES)],
                ['Max video length', formatDuration(MAX_VIDEO_DURATION_SECONDS)],
              ]}
              note="Files past these limits are rejected before extraction starts."
              title="Safety caps"
            />

            <InfoPanel
              items={[
                ['Private processing', 'Runs in your browser'],
                ['JPG quality', 'Only affects JPG output'],
                ['Every-frame mode', 'Uses source cadence'],
              ]}
              note="Best results come from clips with stable frame cadence and shorter time ranges."
              title="Workflow notes"
            />
          </section>

          <section className="space-y-5">
            <PreviewStrip
              previewFrames={motionSplit.previewFrames}
              totalFrames={motionSplit.progress.totalFrames}
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
          </section>

          <aside className="space-y-5 xl:sticky xl:top-5 xl:h-fit">
            <div className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(12,18,36,0.86),rgba(7,11,22,0.92))] p-5 shadow-[0_30px_90px_rgba(3,7,17,0.4)]">
              <div className="mb-4">
                <div className="text-sm font-medium text-white">Extraction workspace</div>
                <p className="mt-1 text-sm leading-6 text-slate-400">
                  Configure the range, output, cadence, and naming. Extraction stays fully local.
                </p>
              </div>
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
            </div>
          </aside>
        </main>
      </div>
    </div>
  )
}

function InfoPanel({
  items,
  note,
  title,
}: {
  items: [string, string][]
  note: string
  title: string
}) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-white/[0.025] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.22)]">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <div className="mt-4 space-y-3">
        {items.map(([label, value]) => (
          <div
            className="flex items-center justify-between gap-4 rounded-2xl border border-white/8 bg-black/10 px-4 py-3"
            key={label}
          >
            <span className="text-sm text-slate-400">{label}</span>
            <span className="text-sm font-medium text-white">{value}</span>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-400">{note}</p>
    </section>
  )
}
