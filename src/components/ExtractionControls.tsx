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
    <section className="rounded-[28px] border border-white/8 bg-black/10 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] lg:p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Extraction settings</h2>
          <p className="mt-1 text-sm text-slate-400">
            Cmd/Ctrl+Enter extracts. Escape cancels mid-run.
          </p>
        </div>
        <button
          className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:border-white/20 hover:bg-white/5"
          onClick={onReset}
          type="button"
        >
          Reset
        </button>
      </div>

      <div className="mt-4 grid gap-4 lg:gap-3">
        <div className="grid gap-3 lg:grid-cols-2">
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

        <div className="grid gap-3 lg:grid-cols-2">
          <label className="grid gap-2 text-sm text-slate-300">
            Target FPS
            <select
              className="min-h-11 rounded-2xl border border-white/10 bg-[#0a101d] px-4 text-white outline-none transition focus:border-[#5080ff]"
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

          <label className="grid gap-2 text-sm text-slate-300">
            Output Format
            <select
              className="min-h-11 rounded-2xl border border-white/10 bg-[#0a101d] px-4 text-white outline-none transition focus:border-[#5080ff]"
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

        <div className="grid gap-3 lg:grid-cols-2">
          <label className="grid gap-2 text-sm text-slate-300">
            Start Time (s)
            <input
              className="min-h-11 rounded-2xl border border-white/10 bg-[#0a101d] px-4 text-white outline-none transition focus:border-[#5080ff]"
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

          <label className="grid gap-2 text-sm text-slate-300">
            End Time (s)
            <input
              className="min-h-11 rounded-2xl border border-white/10 bg-[#0a101d] px-4 text-white outline-none transition focus:border-[#5080ff]"
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

        <div className="grid gap-3 lg:grid-cols-2">
          <fieldset className="grid gap-2 text-sm text-slate-300">
            <legend className="pb-1">Padding Digits</legend>
            <div className="grid grid-cols-3 gap-2">
              {paddingOptions.map((digits) => (
                <button
                  key={digits}
                  className={`min-h-11 min-w-0 rounded-2xl border px-2 text-sm transition ${
                    settings.padding === digits
                      ? 'border-[#5a87ff] bg-[#15274d] text-white'
                      : 'border-white/10 bg-[#0a101d] text-slate-300 hover:border-white/20'
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

          {settings.format === 'jpg' ? (
            <div className="grid gap-2 text-sm text-slate-300 lg:self-end">
              <div className="flex items-center justify-between">
                <span>JPG Quality</span>
                <span className="text-slate-500">{settings.quality}%</span>
              </div>
              <input
                className="accent-[#5a87ff]"
                disabled={disabled}
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
          ) : (
            <div className="rounded-2xl border border-white/10 bg-[#0a101d] px-4 py-3 text-sm text-slate-500 lg:self-end">
              JPG quality appears only when output format is set to JPG.
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0a101d] p-4 lg:p-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Naming Pattern
              </div>
              <div className="mt-2 font-mono text-sm text-slate-100">
                frame{'0'.repeat(settings.padding - 1)}1.{settings.format}
              </div>
            </div>
            <button
              className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:border-white/20 hover:bg-white/5"
              onClick={onCopyPattern}
              type="button"
            >
              Copy Pattern
            </button>
          </div>
        </div>

        <button
          className="min-h-12 rounded-2xl bg-[linear-gradient(90deg,#6ca2ff_0%,#2e67ee_100%)] px-5 text-sm font-medium text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500"
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
      className={`rounded-2xl border p-4 text-left transition lg:min-h-[116px] lg:p-3 ${
        active
          ? 'border-[#5a87ff] bg-[#12203f]'
          : 'border-white/10 bg-[#0a101d] hover:border-white/20 hover:bg-white/6'
      }`}
      onClick={onClick}
      type="button"
    >
      <div className="text-sm font-medium text-white">{title}</div>
      <div className="mt-2 text-sm leading-6 text-slate-400 lg:leading-5">{description}</div>
    </button>
  )
}
