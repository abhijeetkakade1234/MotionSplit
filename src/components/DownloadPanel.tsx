import type { ArchiveInfo } from '../types'
import { formatBytes } from '../utils/format'
import { AnimatedActionButton } from './AnimatedActionButton'

type DownloadPanelProps = {
  archiveInfo: ArchiveInfo | null
}

export function DownloadPanel({ archiveInfo }: DownloadPanelProps) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-zinc-900/75 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.26)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Download</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Your archive stays local and is generated entirely in the browser.
          </p>
        </div>
      </div>

      {archiveInfo ? (
        <div className="mt-4 space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <MetricCard label="Frames" value={String(archiveInfo.frameCount)} />
            <MetricCard
              label="ZIP Size"
              value={formatBytes(archiveInfo.sizeBytes)}
            />
            <MetricCard label="Format" value={archiveInfo.format.toUpperCase()} />
          </div>

          <div>
            <AnimatedActionButton
              download={archiveInfo.fileName}
              href={archiveInfo.downloadUrl}
              label="Download ZIP"
              variant="download"
            />
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-white/10 bg-white/3 px-4 py-6 text-sm text-zinc-500">
          Your ZIP appears here when extraction finishes.
        </div>
      )}
    </section>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/4 px-4 py-3">
      <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">{label}</div>
      <div className="mt-2 text-xl font-semibold text-white">{value}</div>
    </div>
  )
}
