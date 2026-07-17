import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  ArrowRight,
  ArrowUpRight,
  CloudOff,
  Code2,
  FileArchive,
  FileVideoCamera,
  MonitorCog,
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

const workflowShots = [
  {
    body: 'Load a clip locally, scrub the file, and lock the exact range before you do anything else.',
    image: '/landing/tool-upload.png',
    step: '01',
    title: 'Drop your video',
  },
  {
    body: 'Set FPS, output format, and naming without leaving the browser or touching a backend.',
    image: '/landing/tool-settings.png',
    step: '02',
    title: 'Choose frame cadence',
  },
  {
    body: 'Run extraction, preview the result, and pull one ZIP when the sequence is ready.',
    image: '/landing/tool-export.png',
    step: '03',
    title: 'Export one ZIP',
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
          { autoAlpha: 0, y: 28 },
          {
            autoAlpha: 1,
            duration: 0.68,
            ease: 'power3.out',
            scrollTrigger: {
              start: 'top 86%',
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
              <span className="relative inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(180deg,#3b82f6_0%,#dbeafe_100%)]">
                <span
                  aria-hidden="true"
                  className="absolute inset-0 opacity-20 [background-image:radial-gradient(rgba(255,255,255,0.7)_0.6px,transparent_0.8px)] [background-position:0_0,3px_3px] [background-size:6px_6px] mix-blend-soft-light"
                />
                <SparkLogo className="relative h-4.5 w-4.5" />
              </span>
              MotionSplit
            </div>

            <div className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
              <a href="#workflow">Workflow</a>
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
            <div className="relative mx-auto inline-flex h-20 w-20 items-center justify-center overflow-hidden rounded-[28px] border border-white/12 bg-[linear-gradient(180deg,#3b82f6_0%,#dbeafe_100%)] text-xl text-white shadow-[0_14px_40px_rgba(0,0,0,0.22)]">
              <span
                aria-hidden="true"
                className="absolute inset-0 opacity-20 [background-image:radial-gradient(rgba(255,255,255,0.7)_0.8px,transparent_1px)] [background-position:0_0,4px_4px] [background-size:8px_8px] mix-blend-soft-light"
              />
              <SparkLogo className="relative h-10 w-10" />
            </div>

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

      <section className="mx-auto max-w-6xl px-4 py-22 sm:px-6 sm:py-24 lg:px-8 lg:py-28" id="workflow">
        <div className="space-y-24 sm:space-y-28 lg:space-y-32">
          {workflowShots.map((shot, index) => (
            <article
              className={`grid items-center gap-12 lg:gap-20 ${index % 2 === 1 ? 'lg:grid-cols-[1.02fr_0.98fr]' : 'lg:grid-cols-[0.98fr_1.02fr]'}`}
              data-reveal-card
              key={shot.step}
            >
              <div className={index % 2 === 1 ? 'lg:order-2 lg:pl-6' : 'lg:pr-6'}>
                <div className="text-sm uppercase tracking-[0.22em] text-[#84b3ff]">{shot.step}</div>
                <h3 className="mt-4 max-w-md text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">
                  {shot.title}
                </h3>
                <p className="mt-5 max-w-lg text-lg leading-8 text-slate-300">{shot.body}</p>
              </div>

              <div className={index % 2 === 1 ? 'lg:order-1' : undefined}>
                <img
                  alt={shot.title}
                  className="w-full rounded-[28px] border border-white/10 shadow-[0_25px_90px_rgba(0,0,0,0.36)]"
                  loading="lazy"
                  src={shot.image}
                />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section
        className="relative overflow-hidden border-y border-white/8 bg-[#080d1d]"
        id="privacy"
      >
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(132,179,255,0.55),transparent)]" />
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
          <div className="max-w-3xl" data-reveal-card>
            <h2 className="text-4xl font-semibold leading-[1.02] tracking-[-0.055em] text-white sm:text-6xl">
              Your video stays on your device.
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              MotionSplit reads the file, extracts frames, and builds the ZIP in your browser. Nothing is sent to a server.
            </p>
          </div>

          <div
            className="mt-16 grid items-center gap-0 border-y border-white/10 py-8 sm:py-10 lg:mt-20 lg:grid-cols-[1fr_64px_1.18fr_64px_1fr] lg:py-12"
            data-reveal-card
          >
            <article className="px-2 py-7 sm:px-8 lg:py-8">
              <FileVideoCamera className="h-7 w-7 text-[#84b3ff]" strokeWidth={1.5} />
              <h3 className="mt-7 text-xl font-semibold tracking-[-0.025em] text-white">
                Video file
              </h3>
              <p className="mt-3 max-w-52 text-sm leading-6 text-slate-400">
                Selected directly from your device.
              </p>
            </article>

            <div className="flex h-12 items-center justify-center text-[#84b3ff] lg:h-auto" aria-hidden="true">
              <ArrowRight className="h-5 w-5 rotate-90 lg:rotate-0" strokeWidth={1.5} />
            </div>

            <article className="relative overflow-hidden rounded-[30px] border border-[#84b3ff]/30 bg-[linear-gradient(180deg,rgba(41,85,171,0.28),rgba(12,24,52,0.72))] px-7 py-9 shadow-[0_24px_70px_rgba(4,11,30,0.38)] sm:px-9 sm:py-10">
              <div className="absolute inset-x-10 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(167,202,255,0.8),transparent)]" />
              <MonitorCog className="h-8 w-8 text-[#9fc4ff]" strokeWidth={1.5} />
              <div className="mt-6 text-xs font-medium text-[#9fc4ff]">Inside this browser tab</div>
              <h3 className="mt-3 text-2xl font-semibold tracking-[-0.035em] text-white">
                Processed locally
              </h3>
              <p className="mt-3 max-w-64 text-sm leading-6 text-slate-300">
                Frames are extracted and packaged without uploading the source.
              </p>
            </article>

            <div className="flex h-12 items-center justify-center text-[#84b3ff] lg:h-auto" aria-hidden="true">
              <ArrowRight className="h-5 w-5 rotate-90 lg:rotate-0" strokeWidth={1.5} />
            </div>

            <article className="px-2 py-7 sm:px-8 lg:py-8">
              <FileArchive className="h-7 w-7 text-[#84b3ff]" strokeWidth={1.5} />
              <h3 className="mt-7 text-xl font-semibold tracking-[-0.025em] text-white">
                ZIP download
              </h3>
              <p className="mt-3 max-w-52 text-sm leading-6 text-slate-400">
                Saved straight back to your device.
              </p>
            </article>
          </div>

          <div className="mt-8 flex items-center justify-center gap-3 text-sm text-slate-400" data-reveal-card>
            <CloudOff className="h-5 w-5 text-[#84b3ff]" strokeWidth={1.5} />
            <span>Your video never crosses a server boundary.</span>
          </div>

          <div
            className="mt-20 grid border-t border-white/10 lg:grid-cols-[0.9fr_0.9fr_1.2fr]"
            data-reveal-card
            id="limits"
          >
            <div className="py-9 lg:pr-10">
              <div className="text-sm text-slate-400">Video length</div>
              <div className="mt-3 text-5xl font-semibold tabular-nums tracking-[-0.055em] text-white">
                {formatDuration(MAX_VIDEO_DURATION_SECONDS)}
              </div>
              <p className="mt-3 text-sm text-slate-500">Hard limit per clip</p>
            </div>

            <div className="border-t border-white/10 py-9 lg:border-l lg:border-t-0 lg:px-10">
              <div className="text-sm text-slate-400">File size</div>
              <div className="mt-3 text-5xl font-semibold tabular-nums tracking-[-0.055em] text-white">
                {formatBytes(MAX_UPLOAD_BYTES)}
              </div>
              <p className="mt-3 text-sm text-slate-500">Hard limit per clip</p>
            </div>

            <div className="border-t border-white/10 py-9 lg:border-l lg:border-t-0 lg:pl-10">
              <div className="text-sm text-slate-400">Recommended working range</div>
              <div className="mt-4 text-3xl font-semibold tabular-nums tracking-[-0.045em] text-white sm:text-4xl">
                {formatDuration(RECOMMENDED_VIDEO_DURATION_SECONDS)} / {formatBytes(RECOMMENDED_UPLOAD_BYTES)}
              </div>
              <p className="mt-4 max-w-sm text-sm leading-6 text-slate-400">
                Smaller clips finish faster and keep browser memory steady.
              </p>
            </div>
          </div>

          <div
            className="mt-16 flex flex-col gap-8 border-t border-white/10 pt-10 sm:mt-20 lg:flex-row lg:items-center lg:justify-between"
            data-reveal-card
            id="opensource"
          >
            <div className="flex max-w-2xl items-start gap-5">
              <Code2 className="mt-1 h-7 w-7 shrink-0 text-[#84b3ff]" strokeWidth={1.5} />
              <div>
                <h2 className="text-2xl font-semibold tracking-[-0.035em] text-white sm:text-3xl">
                  Open source by default.
                </h2>
                <p className="mt-3 text-base leading-7 text-slate-400">
                  Read the code, fork it, or improve it. MotionSplit stays free for everyone.
                </p>
              </div>
            </div>

            <AnimatedActionButton
              href="https://github.com/abhijeetkakade1234/MotionSplit"
              label="Star on GitHub"
              variant="github"
            />
          </div>
        </div>
      </section>

      <section className="bg-[#050816] px-4 pb-4 pt-16 sm:px-6 sm:pb-6 sm:pt-20 lg:px-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[30px] bg-white text-[#08101f] shadow-[0_30px_100px_rgba(19,54,120,0.24)] sm:rounded-[40px]">
          <div className="grid gap-9 px-6 py-10 sm:px-10 sm:py-14 lg:grid-cols-[1fr_auto] lg:items-end lg:px-14 lg:py-16">
            <h2 className="max-w-3xl text-4xl font-semibold leading-[1.02] tracking-[-0.055em] sm:text-6xl">
              Turn the clip into frames.
            </h2>
            <button
              className="inline-flex min-h-12 items-center justify-center gap-2 self-start rounded-full bg-[#08101f] px-6 text-sm font-semibold text-white transition hover:bg-[#102044] active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#315fca] lg:self-auto"
              onClick={onEnterTool}
              type="button"
            >
              Enter Tool
              <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>

          <footer className="flex flex-col gap-7 border-t border-slate-200 px-6 py-7 text-sm text-slate-600 sm:px-10 md:flex-row md:items-center md:justify-between lg:px-14">
            <div className="flex items-center gap-3 text-[#08101f]">
              <span className="relative inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-[linear-gradient(180deg,#3b82f6_0%,#dbeafe_100%)]">
                <span
                  aria-hidden="true"
                  className="absolute inset-0 opacity-20 [background-image:radial-gradient(rgba(255,255,255,0.7)_0.6px,transparent_0.8px)] [background-position:0_0,3px_3px] [background-size:6px_6px] mix-blend-soft-light"
                />
                <SparkLogo className="relative h-4.5 w-4.5" />
              </span>
              <span className="text-lg font-semibold">MotionSplit</span>
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-2 md:justify-center">
              <a className="transition hover:text-[#08101f]" href="https://github.com/abhijeetkakade1234/MotionSplit">
                GitHub
              </a>
              <span>MIT License</span>
              <a className="transition hover:text-[#08101f]" href="https://abhijeetkakade.in/">
                Built by Abhijeet Kakade
              </a>
            </div>

            <a className="text-[#08101f] transition hover:text-[#315fca]" href="#top">
              Back to top
            </a>
          </footer>
        </div>
      </section>
    </div>
  )
}
