import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  ArrowUpRight,
  CloudOff,
  Code2,
  LockKeyhole,
  ShieldCheck,
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

const trustItems = [
  {
    body: 'The browser handles the work on your machine.',
    icon: ShieldCheck,
    title: 'Client-side only',
  },
  {
    body: 'Your source file never leaves your device.',
    icon: CloudOff,
    title: 'No uploads',
  },
  {
    body: 'Open the tool and use it. No identity required.',
    icon: UserRoundX,
    title: 'No accounts',
  },
  {
    body: 'We do not collect or store usage data.',
    icon: LockKeyhole,
    title: 'No tracking',
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
            <LockKeyhole className="h-8 w-8 text-[#84b3ff]" strokeWidth={1.5} />
            <h2 className="mt-8 text-4xl font-semibold leading-[1.02] tracking-[-0.055em] text-white sm:text-6xl">
              Your video never leaves the tab.
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              MotionSplit does the full job in your browser. No transfer, remote queue, or account sits between your clip and the ZIP.
            </p>
          </div>

          <div
            className="mt-16 grid border-y border-white/10 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4"
            data-reveal-card
          >
            {trustItems.map((item, index) => {
              const Icon = item.icon

              return (
                <article
                  className={`py-8 sm:px-7 lg:min-h-56 lg:px-8 lg:py-9 ${index > 0 ? 'border-t border-white/10 sm:border-t-0 sm:[&:nth-child(even)]:border-l lg:border-l' : ''} ${index > 1 ? 'sm:border-t' : ''}`}
                  key={item.title}
                >
                  <Icon className="h-6 w-6 text-[#84b3ff]" strokeWidth={1.5} />
                  <h3 className="mt-8 text-xl font-semibold tracking-[-0.025em] text-white">
                    {item.title}
                  </h3>
                  <p className="mt-3 max-w-56 text-sm leading-6 text-slate-400">{item.body}</p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-28 lg:px-8 lg:py-32" id="limits">
        <div className="grid gap-14 lg:grid-cols-[0.82fr_1.18fr] lg:gap-24">
          <div data-reveal-card>
            <h2 className="max-w-md text-4xl font-semibold leading-[1.05] tracking-[-0.055em] text-white sm:text-5xl">
              Clear limits. Better browser performance.
            </h2>
            <p className="mt-6 max-w-md text-lg leading-8 text-slate-300">
              The caps prevent memory spikes and oversized ZIP builds from taking down the tab.
            </p>
          </div>

          <div className="border-t border-white/12" data-reveal-card>
            <div className="grid gap-5 border-b border-white/10 py-9 sm:grid-cols-[1fr_auto] sm:items-end sm:py-10">
              <div className="text-base text-slate-400">Maximum video length</div>
              <div className="text-5xl font-semibold tabular-nums tracking-[-0.055em] text-white sm:text-6xl">
                {formatDuration(MAX_VIDEO_DURATION_SECONDS)}
              </div>
            </div>
            <div className="grid gap-5 border-b border-white/10 py-9 sm:grid-cols-[1fr_auto] sm:items-end sm:py-10">
              <div className="text-base text-slate-400">Maximum file size</div>
              <div className="text-5xl font-semibold tabular-nums tracking-[-0.055em] text-white sm:text-6xl">
                {formatBytes(MAX_UPLOAD_BYTES)}
              </div>
            </div>
            <p className="max-w-2xl pt-7 text-sm leading-7 text-slate-400">
              For the fastest local turnaround, stay under {formatDuration(RECOMMENDED_VIDEO_DURATION_SECONDS)} and {formatBytes(RECOMMENDED_UPLOAD_BYTES)}.
            </p>
          </div>
        </div>

        <div
          className="mt-24 flex flex-col gap-8 border-y border-white/10 py-9 sm:mt-28 sm:py-10 lg:flex-row lg:items-center lg:justify-between"
          data-reveal-card
          id="opensource"
        >
          <div className="flex max-w-2xl items-start gap-5">
            <Code2 className="mt-1 h-7 w-7 shrink-0 text-[#84b3ff]" strokeWidth={1.5} />
            <div>
              <h2 className="text-2xl font-semibold tracking-[-0.035em] text-white sm:text-3xl">
                Open source. Free for everyone.
              </h2>
              <p className="mt-3 text-base leading-7 text-slate-400">
                Read the code, fork it, or improve it. There are no premium tiers hiding behind the tool.
              </p>
            </div>
          </div>

          <a
            className="inline-flex min-h-11 shrink-0 items-center gap-2 self-start rounded-full border border-white/14 px-5 text-sm font-medium text-white transition hover:border-[#84b3ff]/60 hover:text-[#9fc4ff] active:translate-y-px lg:self-auto"
            href="https://github.com/abhijeetkakade1234/MotionSplit"
          >
            Star on GitHub
            <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
          </a>
        </div>
      </section>

      <section className="border-t border-white/8 bg-[#070b18]">
        <div className="mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pt-20 lg:px-8">
          <div className="flex flex-col gap-9 lg:flex-row lg:items-center lg:justify-between">
            <h2 className="max-w-2xl text-4xl font-semibold tracking-[-0.055em] text-white sm:text-5xl">
              Turn the clip into frames.
            </h2>
            <AnimatedActionButton
              label="Enter Tool"
              onClick={onEnterTool}
              variant="upload"
            />
          </div>

          <footer className="mt-16 flex flex-col gap-7 border-t border-white/8 pt-8 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3 text-white">
              <span className="relative inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(180deg,#3b82f6_0%,#dbeafe_100%)]">
                <span
                  aria-hidden="true"
                  className="absolute inset-0 opacity-20 [background-image:radial-gradient(rgba(255,255,255,0.7)_0.6px,transparent_0.8px)] [background-position:0_0,3px_3px] [background-size:6px_6px] mix-blend-soft-light"
                />
                <SparkLogo className="relative h-4.5 w-4.5" />
              </span>
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
        </div>
      </section>
    </div>
  )
}
