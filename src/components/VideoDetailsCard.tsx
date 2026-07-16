import type { VideoMetadata } from '../types'
import { formatDuration, formatFrameRate } from '../utils/format'

type VideoDetailsCardProps = {
  ffmpegReady: boolean
  metadata: VideoMetadata | null
}

export function VideoDetailsCard({
  ffmpegReady,
  metadata,
}: VideoDetailsCardProps) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-zinc-900/75 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.26)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Source Details</h2>
          <p className="mt-1 text-sm text-zinc-400">
            File metadata is parsed locally before extraction.
          </p>
        </div>

        <div
          className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.2em] ${
            ffmpegReady
              ? 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-200'
              : 'border border-white/10 bg-white/4 text-zinc-400'
          }`}
        >
          {ffmpegReady ? 'FFmpeg Ready' : 'FFmpeg Lazy'}
        </div>
      </div>

      {metadata ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Filename" value={metadata.name} />
          <Metric label="Duration" value={formatDuration(metadata.duration)} />
          <Metric label="Resolution" value={`${metadata.width} x ${metadata.height}`} />
          <Metric label="FPS" value={formatFrameRate(metadata.frameRate)} />
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-white/10 bg-white/3 px-4 py-8 text-sm text-zinc-500">
          Upload a video to inspect its metadata.
        </div>
      )}
    </section>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/4 px-4 py-3">
      <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">{label}</div>
      <div className="mt-2 truncate text-sm font-medium text-white sm:text-base">
        {value}
      </div>
    </div>
  )
}
