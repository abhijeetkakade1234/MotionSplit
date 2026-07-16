import type { PreviewFrame } from '../types'

type PreviewStripProps = {
  previewFrames: PreviewFrame[]
  totalFrames: number | null
}

export function PreviewStrip({
  previewFrames,
  totalFrames,
}: PreviewStripProps) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-zinc-900/75 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.26)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Preview Strip</h2>
          <p className="mt-1 text-sm text-zinc-400">
            First frames stay visible as extraction progresses.
          </p>
        </div>
        <div className="text-sm text-zinc-500">
          {totalFrames
            ? `${previewFrames.length}/${totalFrames} visible`
            : `${previewFrames.length} visible`}
        </div>
      </div>

      {previewFrames.length ? (
        <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
          {previewFrames.map((frame) => (
            <figure
              key={frame.name}
              className="min-w-28 overflow-hidden rounded-2xl border border-white/10 bg-zinc-950"
            >
              <img
                alt={frame.name}
                className="h-24 w-28 object-cover"
                loading="lazy"
                src={frame.url}
              />
              <figcaption className="truncate border-t border-white/10 px-3 py-2 text-xs text-zinc-500">
                {frame.name}
              </figcaption>
            </figure>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-white/10 bg-white/3 px-4 py-8 text-sm text-zinc-500">
          Extracted frames will appear here.
        </div>
      )}
    </section>
  )
}
