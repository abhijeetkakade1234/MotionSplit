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
    <section className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.02))] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.24)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Preview</h2>
          <p className="mt-1 text-sm text-slate-400">
            First extracted frames stay pinned here while the run continues.
          </p>
        </div>
        <div className="text-sm text-slate-500">
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
              className="min-w-30 overflow-hidden rounded-[22px] border border-white/10 bg-[#09111f]"
            >
              <img
                alt={frame.name}
                className="h-28 w-30 object-cover"
                loading="lazy"
                src={frame.url}
              />
              <figcaption className="truncate border-t border-white/10 px-3 py-2 text-xs text-slate-500">
                {frame.name}
              </figcaption>
            </figure>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-[24px] border border-dashed border-white/10 bg-black/12 px-4 py-10 text-sm text-slate-500">
          Extracted frames will appear here.
        </div>
      )}
    </section>
  )
}
