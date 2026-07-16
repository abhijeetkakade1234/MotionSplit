import { useRef, useState } from 'react'

type UploadZoneProps = {
  busy: boolean
  fileName: string | null
  onSelectFile: (file: File) => void
}

export function UploadZone({
  busy,
  fileName,
  onSelectFile,
}: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [dragActive, setDragActive] = useState(false)

  function takeFile(file: File | null) {
    if (!file) {
      return
    }

    onSelectFile(file)
  }

  return (
    <>
      <button
        className={`flex min-h-[180px] w-full flex-1 flex-col items-center justify-center rounded-[28px] border border-dashed px-4 py-5 text-center transition sm:min-h-[220px] sm:px-6 sm:py-6 lg:min-h-[240px] ${
          dragActive
            ? 'border-[#5f8fff] bg-[#0d1832]'
            : 'border-[#4b79ef]/60 bg-[linear-gradient(180deg,rgba(14,22,42,0.92),rgba(8,13,26,0.98))] hover:border-[#7aa4ff] hover:bg-[#0d1730]'
        }`}
        onClick={() => inputRef.current?.click()}
        onDragLeave={() => setDragActive(false)}
        onDragOver={(event) => {
          event.preventDefault()
          setDragActive(true)
        }}
        onDrop={(event) => {
          event.preventDefault()
          setDragActive(false)
          takeFile(event.dataTransfer.files.item(0))
        }}
        type="button"
      >
        <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-slate-400">
          MP4 / MOV / WebM
        </div>
        <h2 className="mt-4 text-[1.75rem] font-semibold leading-tight tracking-tight text-white sm:text-[2rem] lg:text-[2.4rem]">
          {fileName ? 'Replace current video' : 'Drop video to begin'}
        </h2>
        <p className="mt-2.5 max-w-[18rem] text-sm leading-6 text-slate-400 sm:max-w-[38rem] sm:text-[15px] sm:leading-7">
          Drag a source file here or click to browse. MotionSplit extracts frames
          locally and packages them into a ZIP without leaving your device.
        </p>
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/4 px-5 py-3 text-sm font-medium text-slate-100">
          {busy ? 'Extraction running' : fileName ?? 'Choose a video file'}
        </div>
      </button>

      <input
        accept="video/mp4,video/quicktime,video/webm"
        className="hidden"
        disabled={busy}
        onChange={(event) => takeFile(event.target.files?.item(0) ?? null)}
        ref={inputRef}
        type="file"
      />
    </>
  )
}
