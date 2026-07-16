import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  ArrowRight,
  CheckCheck,
  CloudOff,
  Code2,
  FileArchive,
  Frame,
  LockKeyhole,
  ScanSearch,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  TimerReset,
  Upload,
  UserRoundX,
} from 'lucide-react'
import { AnimatedActionButton } from './AnimatedActionButton'
import Grainient from './Grainient'
import { SparkLogo } from './SparkLogo'
import { formatBytes, formatDuration } from '../utils/format'
import {
  MAX_UPLOAD_BYTES,
  MAX_VIDEO_DURATION_SECONDS,
  RECOMMENDED_UPLOAD_BYTES,
  RECOMMENDED_VIDEO_DURATION_SECONDS,
} from '../utils/limits'

gsap.registerPlugin(ScrollTrigger)

type LandingPageProps = {
  onEnterTool: () => void
}

const workflowSteps = [
  {
    body: 'Load an MP4 locally, scrub the clip, and lock in the exact start and end points you want to split.',
    icon: Upload,
    media: UploadMock,
    step: '01',
    title: 'Drop your video',
  },
  {
    body: 'Pick FPS, JPG or PNG, and a naming pattern that keeps every output predictable before extraction begins.',
    icon: SlidersHorizontal,
    media: ConfigureMock,
    step: '02',
    title: 'Choose frame cadence',
  },
  {
    body: 'Preview the output, watch progress, then pull one ZIP with everything packed and ready to use.',
    icon: FileArchive,
    media: ExportMock,
    step: '03',
    title: 'Export one ZIP',
  },
] as const

const trustItems = [
  {
    body: 'Your video never leaves your machine. The browser does the work.',
    icon: ShieldCheck,
    title: 'Client-side only',
  },
  {
    body: 'No uploads, no queue, no waiting on somebody else’s server.',
    icon: CloudOff,
    title: 'No uploads',
  },
  {
    body: 'No sign-ups, no logins, no personal data to hand over.',
    icon: UserRoundX,
    title: 'No accounts',
  },
  {
    body: 'Inspect the code, fork it, improve it, and ship your own version.',
    icon: Code2,
    title: 'Open source',
  },
] as const

export function LandingPage({ onEnterTool }: LandingPageProps) {
  const pageRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')

    if (media.matches || !pageRef.current) {
      return
    }

    const context = gsap.context(() => {
      gsap.fromTo(
        '[data-hero-copy]',
        { autoAlpha: 0, y: 26 },
        { autoAlpha: 1, duration: 0.85, ease: 'power3.out', y: 0 },
      )

      gsap.fromTo(
        '[data-hero-proof]',
        { autoAlpha: 0, y: 18 },
        { autoAlpha: 1, delay: 0.22, duration: 0.8, ease: 'power3.out', y: 0 },
      )

      gsap.utils.toArray<HTMLElement>('[data-reveal-card]').forEach((card) => {
        gsap.fromTo(
          card,
          { autoAlpha: 0, y: 34 },
          {
            autoAlpha: 1,
            duration: 0.72,
            ease: 'power3.out',
            scrollTrigger: {
              start: 'top 84%',
              trigger: card,
            },
            y: 0,
          },
        )
      })
    }, pageRef)

    return () => context.revert()
  }, [])

  return (
    <div className="bg-[#050816] text-slate-50" ref={pageRef}>
      <section className="relative overflow-hidden border-b border-white/8">
        <div className="absolute inset-0">
          <Grainient className="opacity-95" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_12%,rgba(255,255,255,0.2),transparent_28%),linear-gradient(180deg,rgba(5,8,22,0.05),rgba(5,8,22,0.6)_58%,#050816_100%)]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-5 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between gap-5 rounded-[26px] border border-white/10 bg-white/[0.03] px-4 py-3 backdrop-blur md:px-6">
            <div className="flex items-center gap-3 text-lg font-semibold tracking-tight text-white">
              <BrandBadge className="h-9 w-9 rounded-2xl">
                <SparkLogo className="relative h-4.5 w-4.5" />
              </BrandBadge>
              MotionSplit
            </div>

            <div className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
              <a href="#workflow">Workflow</a>
              <a href="#features">Features</a>
              <a href="#privacy">Privacy</a>
              <a href="#opensource">Open Source</a>
            </div>

            <button
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 text-sm font-medium text-[#08101f] transition hover:bg-slate-100"
              onClick={onEnterTool}
              type="button"
            >
              Enter Tool
            </button>
          </nav>

          <div className="mx-auto max-w-4xl pb-12 pt-24 text-center" data-hero-copy id="top">
            <BrandBadge className="mx-auto h-20 w-20 rounded-[28px] text-xl shadow-[0_14px_40px_rgba(0,0,0,0.22)]">
              <SparkLogo className="relative h-10 w-10" />
            </BrandBadge>

            <h1 className="mx-auto mt-10 max-w-4xl text-[clamp(3.8rem,8vw,6.4rem)] font-semibold leading-[0.96] tracking-[-0.065em] text-white">
              MotionSplit
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl sm:leading-9">
              Turn video into frame sequences, locally.
            </p>

            <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-slate-400 sm:text-lg">
              Extract every frame or sample at a chosen FPS. Everything runs in your browser.
              Nothing leaves your device.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <AnimatedActionButton
                label="Enter Tool"
                onClick={onEnterTool}
                variant="upload"
              />
              <AnimatedActionButton
                href="https://github.com/abhijeetkakade1234/MotionSplit"
                label="Star on GitHub"
                variant="github"
              />
            </div>

            <div className="mt-18 text-sm font-medium text-slate-300" data-hero-proof>
              Private by design. Loved by developers.
            </div>

            <div
              className="mt-6 grid gap-0 overflow-hidden rounded-[26px] border border-white/8 bg-black/10 md:grid-cols-4"
              data-hero-proof
            >
              {['Client-side only', 'No uploads', 'No accounts', 'Open source'].map((item, index) => (
                <div
                  className={`px-6 py-5 text-sm text-slate-300 ${index < 3 ? 'border-b border-white/8 md:border-b-0 md:border-r' : ''}`}
                  key={item}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-8 pt-16 sm:px-6 lg:px-8" id="workflow">
        <div className="rounded-[36px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))] px-6 py-8 shadow-[0_30px_120px_rgba(1,4,12,0.4)] sm:px-8 lg:px-10" data-reveal-card>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="text-sm font-medium uppercase tracking-[0.24em] text-[#84b3ff]">
                Three-step workflow
              </div>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">
                From raw clip to ready ZIP without leaving the browser.
              </h2>
            </div>

            <div className="grid gap-3 text-sm text-slate-300 sm:grid-cols-3 sm:gap-4">
              {workflowSteps.map((step) => {
                const Icon = step.icon
                return (
                  <div className="rounded-[22px] border border-white/8 bg-white/[0.02] px-4 py-4" key={step.step}>
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#7aaeff]/25 bg-[#0c1730] text-[#84b3ff]">
                        <Icon className="h-4.5 w-4.5" />
                      </span>
                      <div className="text-xs uppercase tracking-[0.24em] text-slate-500">{step.step}</div>
                    </div>
                    <div className="mt-4 text-base font-medium text-white">{step.title}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8" id="features">
        <div className="space-y-10 sm:space-y-12">
          {workflowSteps.map((step, index) => {
            const Media = step.media
            const reverse = index % 2 === 1

            return (
              <article
                className={`grid items-center gap-8 lg:gap-14 ${reverse ? 'lg:grid-cols-[1.08fr_0.92fr]' : 'lg:grid-cols-[0.92fr_1.08fr]'}`}
                data-reveal-card
                key={step.step}
              >
                <div className={reverse ? 'lg:order-2' : undefined}>
                  <div className="text-sm uppercase tracking-[0.22em] text-[#84b3ff]">{step.step}</div>
                  <h3 className="mt-4 max-w-xl text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">
                    {step.title}
                  </h3>
                  <p className="mt-5 max-w-xl text-lg leading-8 text-slate-300">
                    {step.body}
                  </p>
                  <div className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-slate-200">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
                      <step.icon className="h-4.5 w-4.5 text-[#84b3ff]" />
                    </span>
                    Works entirely on your device
                  </div>
                </div>

                <div className={reverse ? 'lg:order-1' : undefined}>
                  <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(122,174,255,0.16),transparent_34%),linear-gradient(180deg,#0d1324_0%,#080d19_100%)] p-3 shadow-[0_30px_120px_rgba(2,7,20,0.55)] sm:p-4">
                    <div className="absolute inset-x-16 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(132,179,255,0.9),transparent)]" />
                    <Media />
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-4" data-reveal-card>
          {trustItems.map((item) => {
            const Icon = item.icon

            return (
              <article
                className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.022),rgba(255,255,255,0.012))] px-6 py-7"
                key={item.title}
              >
                <span className="inline-flex h-13 w-13 items-center justify-center rounded-[22px] border border-[#7aaeff]/22 bg-[#0c1730] text-[#84b3ff] shadow-[0_18px_40px_rgba(14,30,67,0.35)]">
                  <Icon className="h-5.5 w-5.5" />
                </span>
                <h3 className="mt-5 text-2xl font-semibold tracking-[-0.04em] text-white">
                  {item.title}
                </h3>
                <p className="mt-3 text-base leading-7 text-slate-300">{item.body}</p>
              </article>
            )
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8" id="privacy">
        <div className="grid gap-6 lg:grid-cols-2">
          <article
            className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.022),rgba(255,255,255,0.01))] px-6 py-8 sm:px-8"
            data-reveal-card
          >
            <div className="absolute -right-24 bottom-0 h-56 w-56 rounded-full bg-[#244da5]/18 blur-3xl" />
            <span className="inline-flex h-13 w-13 items-center justify-center rounded-[22px] border border-[#7aaeff]/22 bg-[#0c1730] text-[#84b3ff]">
              <LockKeyhole className="h-5.5 w-5.5" />
            </span>
            <div className="mt-6 text-sm uppercase tracking-[0.22em] text-[#84b3ff]">
              Privacy first
            </div>
            <h2 className="mt-4 max-w-md text-4xl font-semibold tracking-[-0.05em] text-white sm:text-[2.9rem]">
              Your data stays exactly where it belongs.
            </h2>
            <div className="mt-8 space-y-4">
              <TrustLine detail="Your video never leaves your device." text="No uploads" />
              <TrustLine detail="Everything runs locally in your browser." text="No servers" />
              <TrustLine detail="No sign-ups, logins, or personal data." text="No accounts" />
              <TrustLine detail="We do not collect. We do not store. Period." text="No tracking" />
            </div>
          </article>

          <article
            className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.022),rgba(255,255,255,0.01))] px-6 py-8 sm:px-8"
            data-reveal-card
            id="limits"
          >
            <div className="absolute -left-24 top-10 h-48 w-48 rounded-full bg-[#1b3977]/18 blur-3xl" />
            <span className="inline-flex h-13 w-13 items-center justify-center rounded-[22px] border border-[#7aaeff]/22 bg-[#0c1730] text-[#84b3ff]">
              <TimerReset className="h-5.5 w-5.5" />
            </span>
            <div className="mt-6 text-sm uppercase tracking-[0.22em] text-[#84b3ff]">
              Limits
            </div>
            <h2 className="mt-4 max-w-md text-4xl font-semibold tracking-[-0.05em] text-white sm:text-[2.9rem]">
              Built-in limits to protect your device.
            </h2>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <LimitCard
                body={`Hard cap at ${formatDuration(MAX_VIDEO_DURATION_SECONDS)} per clip.`}
                title="Max video length"
              />
              <LimitCard
                body={`Hard cap at ${formatBytes(MAX_UPLOAD_BYTES)} per clip.`}
                title="Max file size"
              />
            </div>

            <div className="mt-4 rounded-[28px] border border-white/10 bg-[#0a101d] px-5 py-5 text-base leading-7 text-slate-300">
              These caps keep memory spikes and giant ZIP builds from dragging the browser into a crash.
              Recommended sweet spot: under {formatDuration(RECOMMENDED_VIDEO_DURATION_SECONDS)} and under {formatBytes(RECOMMENDED_UPLOAD_BYTES)} for the fastest local turnaround.
            </div>
          </article>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8" id="opensource">
        <div
          className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.022),rgba(255,255,255,0.01))] px-6 py-10 text-center shadow-[0_25px_100px_rgba(3,7,17,0.32)] sm:px-10"
          data-reveal-card
        >
          <span className="inline-flex h-13 w-13 items-center justify-center rounded-[22px] border border-[#7aaeff]/22 bg-[#0c1730] text-[#84b3ff]">
            <Sparkles className="h-5.5 w-5.5" />
          </span>
          <div className="mt-6 text-sm uppercase tracking-[0.22em] text-[#84b3ff]">
            Open source and free
          </div>
          <h2 className="mx-auto mt-4 max-w-3xl text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">
            Free to use. Free to improve.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            MotionSplit stays simple on purpose: no paywall, no accounts, no premium gate.
            Just a local tool you can inspect, fork, and keep making better.
          </p>
          <div className="mt-8 flex justify-center">
            <AnimatedActionButton
              href="https://github.com/abhijeetkakade1234/MotionSplit"
              label="Star on GitHub"
              variant="github"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <div className="rounded-[34px] border border-white/10 bg-white/[0.025] px-6 py-14 text-center shadow-[0_25px_100px_rgba(3,7,17,0.32)]">
          <div className="text-xs uppercase tracking-[0.28em] text-[#93a4d7]">
            Ready when you are
          </div>
          <h2 className="mt-5 text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">
            Start splitting in seconds.
          </h2>
          <div className="mt-8 flex justify-center">
            <AnimatedActionButton
              label="Enter Tool"
              onClick={onEnterTool}
              variant="upload"
            />
          </div>
        </div>

        <footer className="mt-10 flex flex-col gap-7 border-t border-white/8 pt-8 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3 text-white">
            <BrandBadge className="h-9 w-9 rounded-2xl">
              <SparkLogo className="relative h-4.5 w-4.5" />
            </BrandBadge>
            <span className="text-lg font-semibold">MotionSplit</span>
          </div>

          <div className="text-center">
            <span>2026 MotionSplit</span>
            <span className="mx-2 text-slate-600">/</span>
            <span>Open source</span>
            <span className="mx-2 text-slate-600">/</span>
            <span>MIT License</span>
          </div>

          <a className="text-slate-300" href="#top">
            Back to top
          </a>
        </footer>
      </section>
    </div>
  )
}

function BrandBadge({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <span
      className={`relative inline-flex items-center justify-center overflow-hidden border border-white/10 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.12),transparent_46%),linear-gradient(180deg,#6f98f2_0%,#89b0f7_56%,#c6ddff_100%)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] ${className ?? ''}`}
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 opacity-10 [background-image:radial-gradient(rgba(255,255,255,0.45)_0.7px,transparent_0.9px)] [background-position:0_0,4px_4px] [background-size:8px_8px]"
      />
      {children}
    </span>
  )
}

function TrustLine({ detail, text }: { detail: string; text: string }) {
  return (
    <div className="flex items-start gap-4 rounded-[24px] border border-white/8 bg-[#0a101d]/75 px-5 py-4">
      <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#12203f] text-[#84b3ff]">
        <CheckCheck className="h-4 w-4" />
      </span>
      <div>
        <div className="text-lg font-medium text-white">{text}</div>
        <div className="mt-1 text-base leading-7 text-slate-300">{detail}</div>
      </div>
    </div>
  )
}

function LimitCard({ body, title }: { body: string; title: string }) {
  return (
    <article className="rounded-[28px] border border-white/10 bg-[#0a101d] p-5">
      <div className="text-lg font-medium text-white">{title}</div>
      <p className="mt-2 text-base leading-7 text-slate-300">{body}</p>
    </article>
  )
}

function UploadMock() {
  return (
    <div className="overflow-hidden rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(12,18,32,0.95),rgba(9,13,23,0.98))]">
      <MockTopBar />
      <div className="grid gap-0 lg:grid-cols-[170px_1fr]">
        <MockSidebar active="Video" />
        <div className="p-4 sm:p-5">
          <div className="rounded-[24px] border border-dashed border-white/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.025),rgba(255,255,255,0.01))] px-6 py-9 text-center">
            <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full border border-[#7aaeff]/28 bg-[#12203f] text-[#84b3ff]">
              <Upload className="h-5 w-5" />
            </span>
            <div className="mt-4 text-lg font-medium text-white">Drop your MP4 here</div>
            <div className="mt-2 text-sm text-slate-400">or click to browse locally</div>
          </div>

          <div className="mt-4 rounded-[22px] border border-white/8 bg-black/20 px-4 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-white">demo.mp4</div>
                <div className="mt-1 text-xs tracking-[0.2em] text-slate-500">
                  1920×1080 / 24 FPS / 00:01:24
                </div>
              </div>
              <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
                Local only
              </span>
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-slate-500">
                <span>Start</span>
                <span>Duration</span>
                <span>End</span>
              </div>
              <div className="mt-3 h-1 rounded-full bg-white/8">
                <div className="relative h-1 rounded-full bg-[#4f84f3]">
                  <span className="absolute -left-1.5 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border border-white/12 bg-white shadow-[0_4px_14px_rgba(255,255,255,0.24)]" />
                  <span className="absolute -right-1.5 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border border-white/12 bg-white shadow-[0_4px_14px_rgba(255,255,255,0.24)]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ConfigureMock() {
  return (
    <div className="overflow-hidden rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(12,18,32,0.95),rgba(9,13,23,0.98))]">
      <MockTopBar />
      <div className="grid gap-0 lg:grid-cols-[170px_1fr]">
        <MockSidebar active="Settings" />
        <div className="space-y-4 p-4 sm:p-5">
          <div className="grid gap-3 md:grid-cols-2">
            <SettingTile title="Frame Rate (FPS)" value="24 FPS" />
            <SettingTile title="Image Format" value="JPG / PNG" />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <SettingTile title="Start / End" value="12.4s → 40.4s" />
            <SettingTile title="Padding Digits" value="4 digits" />
          </div>

          <div className="rounded-[22px] border border-[#7aaeff]/18 bg-[#0a101d] p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-medium text-white">Naming Pattern</div>
                <div className="mt-2 font-mono text-sm text-slate-300">frame_0001.jpg</div>
              </div>
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-400">
                Copy
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Pill text="Every frame" />
            <Pill active text="Custom FPS" />
            <Pill text="High quality" />
          </div>
        </div>
      </div>
    </div>
  )
}

function ExportMock() {
  const previewFrames = ['0001', '0002', '0003', '0004', '0005', '0006']

  return (
    <div className="overflow-hidden rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(12,18,32,0.95),rgba(9,13,23,0.98))]">
      <MockTopBar />
      <div className="grid gap-0 lg:grid-cols-[170px_1fr]">
        <MockSidebar active="Export" />
        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-medium text-white">Preview</div>
              <div className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                960 frames / 24 FPS / JPG
              </div>
            </div>
            <span className="text-xs uppercase tracking-[0.18em] text-slate-500">960 of 960</span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {previewFrames.map((frame) => (
              <div className="rounded-[18px] border border-white/8 bg-[#0b121f] p-2" key={frame}>
                <div className="aspect-[4/3] rounded-[14px] bg-[radial-gradient(circle_at_top,rgba(148,187,255,0.35),transparent_38%),linear-gradient(180deg,#2c3a56_0%,#0c1422_55%,#050816_100%)]" />
                <div className="mt-2 text-[11px] text-slate-400">frame_{frame}.jpg</div>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-[22px] border border-white/8 bg-black/20 px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-medium text-white">Exporting frames...</div>
              <div className="text-sm text-slate-300">100%</div>
            </div>
            <div className="mt-3 h-2 rounded-full bg-white/8">
              <div className="h-2 rounded-full bg-[linear-gradient(90deg,#4f84f3_0%,#8fc0ff_100%)]" />
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm text-emerald-300">
                <CheckCheck className="h-4 w-4" />
                Completed
              </div>
              <button
                className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#8bb4ff]/45 bg-[linear-gradient(180deg,#7cabff_0%,#4f84f3_58%,#305fd8_100%)] px-4 text-sm font-semibold text-white"
                type="button"
              >
                Download ZIP
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MockTopBar() {
  return (
    <div className="flex items-center justify-between border-b border-white/8 px-4 py-3 sm:px-5">
      <div className="text-sm font-medium text-white">MotionSplit</div>
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/12" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/12" />
      </div>
    </div>
  )
}

function MockSidebar({ active }: { active: 'Export' | 'Settings' | 'Video' }) {
  const items = [
    { icon: Frame, label: 'Video' },
    { icon: ScanSearch, label: 'Preview' },
    { icon: SlidersHorizontal, label: 'Settings' },
    { icon: FileArchive, label: 'Export' },
  ] as const

  return (
    <div className="border-b border-white/8 bg-black/12 p-4 lg:border-b-0 lg:border-r lg:p-3">
      <div className="grid gap-2">
        {items.map((item) => {
          const Icon = item.icon
          const selected = item.label === active

          return (
            <div
              className={`flex items-center gap-3 rounded-[18px] px-3 py-2.5 text-sm ${
                selected
                  ? 'border border-[#7aaeff]/16 bg-[#142545] text-white'
                  : 'text-slate-400'
              }`}
              key={item.label}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Pill({ active, text }: { active?: boolean; text: string }) {
  return (
    <span
      className={`rounded-full border px-3 py-1.5 text-xs ${
        active
          ? 'border-[#7aaeff]/24 bg-[#142545] text-[#9fc4ff]'
          : 'border-white/10 bg-white/[0.02] text-slate-400'
      }`}
    >
      {text}
    </span>
  )
}

function SettingTile({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-[#0a101d] p-4">
      <div className="text-xs uppercase tracking-[0.18em] text-slate-500">{title}</div>
      <div className="mt-3 text-base font-medium text-white">{value}</div>
    </div>
  )
}
