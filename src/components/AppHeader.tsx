export function AppHeader() {
  return (
    <header className="mb-6 flex flex-col gap-5 rounded-[28px] border border-white/10 bg-zinc-900/75 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.28)] sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.24em] text-zinc-300">
            MotionSplit
          </div>
          <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            Split local video into clean frame sequences.
          </h1>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/8 px-4 py-3 text-sm text-emerald-100">
          PWA-ready. Browser-only. ZIP output.
        </div>
      </div>

      <p className="max-w-3xl text-sm leading-6 text-zinc-400 sm:text-base">
        Drop an MP4, MOV, or WebM file, choose every frame or a target FPS, then
        download a numbered ZIP for GSAP scroll sequences, Three.js image planes,
        canvas animations, or Lottie-free product storytelling.
      </p>
    </header>
  )
}
