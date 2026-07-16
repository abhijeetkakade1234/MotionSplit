import type { Phase, ProgressState } from '../types'
import { formatBytes, formatDuration, formatEta } from '../utils/format'

type ProgressPanelProps = {
  phase: Phase
  progress: ProgressState
  onCancel: () => void
  statusText: string
}

export function ProgressPanel({
  phase,
  progress,
  onCancel,
  statusText,
}: ProgressPanelProps) {
  const busy = phase === 'loading' || phase === 'extracting'

  return (
    <section className="rounded-[28px] border border-white/10 bg-zinc-900/75 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.26)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Progress</h2>
          <p className="mt-1 text-sm text-zinc-400">{statusText}</p>
        </div>

        {phase === 'extracting' ? (
          <button
            className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-200 transition hover:bg-red-500/20"
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
        ) : null}
      </div>

      <div className="mt-5 overflow-hidden rounded-full bg-white/8">
        <div
          className="h-3 rounded-full bg-white transition-[width] duration-300"
          style={{ width: `${Math.min(progress.percent, 100)}%` }}
        />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric title="Percent" value={`${progress.percent.toFixed(0)}%`} />
        <Metric
          title="Current Frame"
          value={progress.currentFrame ? String(progress.currentFrame) : '0'}
        />
        <Metric
          title="Remaining"
          value={busy ? formatEta(progress.etaSeconds) : 'Ready'}
        />
        <Metric
          title="ZIP Estimate"
          value={
            progress.estimatedZipBytes
              ? formatBytes(progress.estimatedZipBytes)
              : 'Pending'
          }
        />
      </div>

      <div className="mt-4 grid gap-2 text-sm text-zinc-400">
        <div className="flex items-center justify-between gap-3">
          <span>Frames Extracted</span>
          <span className="text-zinc-200">
            {progress.extractedFrames}
            {progress.totalFrames ? ` / ${progress.totalFrames}` : ''}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span>Processed Range</span>
          <span className="text-zinc-200">
            {formatDuration(progress.processedSeconds)}
          </span>
        </div>
      </div>
    </section>
  )
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/4 px-4 py-3">
      <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">{title}</div>
      <div className="mt-2 text-xl font-semibold text-white">{value}</div>
    </div>
  )
}
