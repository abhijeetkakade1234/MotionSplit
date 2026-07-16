import type { Dispatch, SetStateAction } from 'react'
import type { ExtractionSettings } from '../types'
import { clamp } from '../utils/format'

const fpsPresets = [5, 10, 15, 24, 30, 60]
const paddingOptions = [3, 4, 5] as const

type ExtractionControlsProps = {
  canExtract: boolean
  disabled: boolean
  onCopyPattern: () => void
  onReset: () => void
  onStart: () => void
  settings: ExtractionSettings
  setSettings: Dispatch<SetStateAction<ExtractionSettings>>
  videoDuration: number
}

export function ExtractionControls({
  canExtract,
  disabled,
  onCopyPattern,
  onReset,
  onStart,
  settings,
  setSettings,
  videoDuration,
}: ExtractionControlsProps) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-zinc-900/75 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.26)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Extraction Options</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Cmd/Ctrl+Enter extracts. Escape cancels mid-run.
          </p>
        </div>
        <button
          className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-zinc-300 transition hover:border-white/20 hover:bg-white/5"
          onClick={onReset}
          type="button"
        >
          Reset
        </button>
      </div>

      <div className="mt-5 grid gap-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <ModeCard
            active={settings.mode === 'every-frame'}
            description="Use the source cadence for maximum fidelity."
            onClick={() =>
              setSettings((current) => ({ ...current, mode: 'every-frame' }))
            }
            title="Extract Every Frame"
          />
          <ModeCard
            active={settings.mode === 'custom-fps'}
            description="Keep output lighter for scroll and sequence work."
            onClick={() =>
              setSettings((current) => ({ ...current, mode: 'custom-fps' }))
            }
            title="Custom FPS"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm text-zinc-300">
            Target FPS
            <select
              className="min-h-11 rounded-2xl border border-white/10 bg-zinc-950 px-4 text-white outline-none transition focus:border-white/25"
              disabled={disabled || settings.mode !== 'custom-fps'}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  fps: Number(event.target.value),
                }))
              }
              value={settings.fps}
            >
              {fpsPresets.map((fps) => (
                <option key={fps} value={fps}>
                  {fps} FPS
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm text-zinc-300">
            Output Format
            <select
              className="min-h-11 rounded-2xl border border-white/10 bg-zinc-950 px-4 text-white outline-none transition focus:border-white/25"
              disabled={disabled}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  format: event.target.value as 'png' | 'jpg',
                }))
              }
              value={settings.format}
            >
              <option value="png">PNG</option>
              <option value="jpg">JPG</option>
            </select>
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm text-zinc-300">
            Start Time (s)
            <input
              className="min-h-11 rounded-2xl border border-white/10 bg-zinc-950 px-4 text-white outline-none transition focus:border-white/25"
              disabled={disabled}
              max={videoDuration || undefined}
              min={0}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  startTime: clamp(Number(event.target.value), 0, current.endTime),
                }))
              }
              step="0.1"
              type="number"
              value={settings.startTime}
            />
          </label>

          <label className="grid gap-2 text-sm text-zinc-300">
            End Time (s)
            <input
              className="min-h-11 rounded-2xl border border-white/10 bg-zinc-950 px-4 text-white outline-none transition focus:border-white/25"
              disabled={disabled}
              max={videoDuration || undefined}
              min={settings.startTime}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  endTime: clamp(
                    Number(event.target.value),
                    current.startTime,
                    videoDuration || Number(event.target.value),
                  ),
                }))
              }
              step="0.1"
              type="number"
              value={settings.endTime}
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <fieldset className="grid gap-2 text-sm text-zinc-300">
            <legend className="pb-1">Padding Digits</legend>
            <div className="flex gap-2">
              {paddingOptions.map((digits) => (
                <button
                  key={digits}
                  className={`min-h-11 flex-1 rounded-2xl border px-4 text-sm transition ${
                    settings.padding === digits
                      ? 'border-white bg-white text-zinc-950'
                      : 'border-white/10 bg-zinc-950 text-zinc-300 hover:border-white/20'
                  }`}
                  disabled={disabled}
                  onClick={() =>
                    setSettings((current) => ({ ...current, padding: digits }))
                  }
                  type="button"
                >
                  {digits} digits
                </button>
              ))}
            </div>
          </fieldset>

          <div className="grid gap-2 text-sm text-zinc-300">
            <div className="flex items-center justify-between">
              <span>JPG Quality</span>
              <span className="text-zinc-500">{settings.quality}%</span>
            </div>
            <input
              className="accent-white"
              disabled={disabled || settings.format !== 'jpg'}
              max={100}
              min={40}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  quality: Number(event.target.value),
                }))
              }
              type="range"
              value={settings.quality}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-950/80 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                Naming Pattern
              </div>
              <div className="mt-2 font-mono text-sm text-zinc-200">
                frame{'0'.repeat(settings.padding - 1)}1.{settings.format}
              </div>
            </div>
            <button
              className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-zinc-300 transition hover:border-white/20 hover:bg-white/5"
              onClick={onCopyPattern}
              type="button"
            >
              Copy Pattern
            </button>
          </div>
        </div>

        <button
          className="min-h-12 rounded-2xl bg-white px-5 text-sm font-medium text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
          disabled={!canExtract || disabled}
          onClick={onStart}
          type="button"
        >
          Extract Frames
        </button>
      </div>
    </section>
  )
}

type ModeCardProps = {
  active: boolean
  description: string
  onClick: () => void
  title: string
}

function ModeCard({ active, description, onClick, title }: ModeCardProps) {
  return (
    <button
      className={`rounded-2xl border p-4 text-left transition ${
        active
          ? 'border-white/30 bg-white/9'
          : 'border-white/10 bg-white/4 hover:border-white/20 hover:bg-white/6'
      }`}
      onClick={onClick}
      type="button"
    >
      <div className="text-sm font-medium text-white">{title}</div>
      <div className="mt-2 text-sm leading-6 text-zinc-400">{description}</div>
    </button>
  )
}
