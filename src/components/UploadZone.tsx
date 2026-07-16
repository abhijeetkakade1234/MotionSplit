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
        className={`flex min-h-[300px] w-full flex-col items-center justify-center rounded-[28px] border border-dashed px-6 text-center transition ${
          dragActive
            ? 'border-white/35 bg-white/8'
            : 'border-white/14 bg-gradient-to-b from-white/8 to-white/[0.03] hover:border-white/25 hover:bg-white/7'
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
        <div className="rounded-2xl border border-white/10 bg-zinc-950/80 px-4 py-2 text-xs uppercase tracking-[0.24em] text-zinc-400">
          MP4 / MOV / WebM
        </div>
        <h2 className="mt-5 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {fileName ? 'Replace current video' : 'Drop video to begin'}
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-400 sm:text-base">
          Drag a source file here or click to browse. MotionSplit extracts frames
          locally and packages them into a ZIP without leaving your device.
        </p>
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/4 px-5 py-3 text-sm font-medium text-zinc-200">
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
