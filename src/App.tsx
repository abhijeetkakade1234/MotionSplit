import { useEffect, useMemo } from 'react'
import { AppHeader } from './components/AppHeader'
import { DownloadPanel } from './components/DownloadPanel'
import { ExtractionControls } from './components/ExtractionControls'
import { PreviewStrip } from './components/PreviewStrip'
import { ProgressPanel } from './components/ProgressPanel'
import { UploadZone } from './components/UploadZone'
import { VideoDetailsCard } from './components/VideoDetailsCard'
import { useMotionSplit } from './hooks/useMotionSplit'
import { formatDuration } from './utils/format'

function App() {
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

  const helperText = useMemo(() => {
    if (!motionSplit.videoFile) {
      return 'Everything runs in your browser. No upload. No backend. No waiting on a server.'
    }

    if (!motionSplit.metadata) {
      return 'Reading local video metadata.'
    }

    const rangeDuration =
      motionSplit.settings.endTime - motionSplit.settings.startTime

    return `Ready to extract ${formatDuration(rangeDuration)} of ${motionSplit.metadata.name}.`
  }, [
    motionSplit.metadata,
    motionSplit.settings.endTime,
    motionSplit.settings.startTime,
    motionSplit.videoFile,
  ])

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <AppHeader />

        <main className="grid flex-1 gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.9fr)]">
          <section className="space-y-6">
            <div className="rounded-[28px] border border-white/10 bg-white/4 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur sm:p-6">
              <UploadZone
                busy={motionSplit.phase === 'extracting'}
                fileName={motionSplit.videoFile?.name ?? null}
                onSelectFile={motionSplit.handleFileSelection}
              />

              <p className="mt-4 text-sm text-zinc-400">{helperText}</p>
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
          </section>
        </main>
      </div>
    </div>
  )
}

export default App
