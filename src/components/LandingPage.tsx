import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { AnimatedActionButton } from './AnimatedActionButton'
import Grainient from './Grainient'
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

const features = [
  {
    body: 'Extract every frame or sample at a custom frames-per-second cadence.',
    title: 'Extract your way',
  },
  {
    body: 'Get a single ZIP file with your frames, ready to use.',
    title: 'ZIP download',
  },
  {
    body: 'Choose your output format. High quality, no compromises.',
    title: 'JPG or PNG',
  },
  {
    body: 'Set start and end time, frame range, naming pattern, and more.',
    title: 'Full control',
  },
]

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
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-sm">
                MS
              </span>
              MotionSplit
            </div>

            <div className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
              <a href="#features">Features</a>
              <a href="#privacy">Privacy</a>
              <a href="#limits">Limits</a>
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
            <div className="mx-auto inline-flex h-20 w-20 items-center justify-center rounded-[28px] border border-white/12 bg-white/[0.07] text-xl text-white shadow-[0_14px_40px_rgba(0,0,0,0.22)]">
              MS
            </div>

            <h1 className="mx-auto mt-10 max-w-4xl text-[clamp(3.4rem,8vw,6rem)] font-semibold leading-[0.96] tracking-[-0.065em] text-white">
              Turn video into
              <span className="block">frame sequences, locally.</span>
            </h1>

            <p className="mx-auto mt-7 max-w-2xl text-xl leading-9 text-slate-300">
              Extract every frame or at a chosen FPS.
              <br />
              Runs entirely in your browser. Nothing leaves your device.
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

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8" id="features">
        <div className="text-center" data-reveal-card>
          <div className="text-xs uppercase tracking-[0.28em] text-[#93a4d7]">
            Features
          </div>
          <h2 className="mx-auto mt-5 max-w-3xl text-5xl font-semibold leading-[1.04] tracking-[-0.05em] text-white">
            Everything you need. Nothing you do not.
          </h2>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => (
            <article
              className="rounded-[28px] border border-white/10 bg-white/[0.025] p-7"
              data-reveal-card
              key={feature.title}
            >
              <h3 className="text-3xl font-semibold leading-tight text-white">
                {feature.title}
              </h3>
              <p className="mt-5 text-base leading-7 text-slate-300">{feature.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-white/8 bg-white/[0.015]" id="privacy">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8">
          <div data-reveal-card>
            <div className="text-xs uppercase tracking-[0.28em] text-[#93a4d7]">
              Privacy first
            </div>
            <h2 className="mt-5 max-w-lg text-5xl font-semibold leading-[1.02] tracking-[-0.05em] text-white">
              Your data stays exactly where it belongs.
            </h2>
          </div>

          <div className="grid gap-0" data-reveal-card>
            <TrustLine detail="Your video never leaves your device." text="No uploads" />
            <TrustLine detail="Everything runs locally in your browser." text="No servers" />
            <TrustLine detail="No sign-ups, logins, or personal data." text="No accounts" />
            <TrustLine detail="We do not collect. We do not store. Period." text="No tracking" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8" id="limits">
        <div className="grid gap-12 lg:grid-cols-[0.84fr_1.16fr]">
          <div data-reveal-card>
            <div className="text-xs uppercase tracking-[0.28em] text-[#93a4d7]">
              Limits
            </div>
            <h2 className="mt-5 max-w-lg text-5xl font-semibold leading-[1.02] tracking-[-0.05em] text-white">
              Built-in limits to protect your device.
            </h2>
          </div>

          <div className="grid gap-4">
            <LimitCard
              body={`Hard cap at ${formatDuration(MAX_VIDEO_DURATION_SECONDS)} per clip.`}
              title="Max video length"
            />
            <LimitCard
              body={`Hard cap at ${formatBytes(MAX_UPLOAD_BYTES)} per clip.`}
              title="Max file size"
            />
            <div className="rounded-[28px] border border-white/10 bg-white/[0.025] px-6 py-5 text-base leading-7 text-slate-300" data-reveal-card>
              These caps keep memory spikes and giant ZIP builds from dragging the browser into a crash.
              Recommended sweet spot: under {formatDuration(RECOMMENDED_VIDEO_DURATION_SECONDS)} and under {formatBytes(RECOMMENDED_UPLOAD_BYTES)} for the fastest local turnaround.
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/8" id="opensource">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8">
          <div data-reveal-card>
            <div className="text-xs uppercase tracking-[0.28em] text-[#93a4d7]">
              Open source and free
            </div>
            <h2 className="mt-5 max-w-2xl text-5xl font-semibold leading-[1.02] tracking-[-0.05em] text-white">
              Free to use. Free to improve.
            </h2>
          </div>

          <div className="grid gap-0" data-reveal-card>
            <TrustLine detail="Built in the open. Contributions welcome." text="Open source" />
            <TrustLine detail="No paywalls. No premium tiers. Just free." text="Always free" />
            <div className="border-b border-white/10 px-6 py-6">
              <AnimatedActionButton
                href="https://github.com/abhijeetkakade1234/MotionSplit"
                label="Star on GitHub"
                variant="github"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
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
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-sm">
              MS
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
      </section>
    </div>
  )
}

function TrustLine({ detail, text }: { detail: string; text: string }) {
  return (
    <div className="grid gap-3 border-b border-white/10 px-6 py-6 md:grid-cols-[180px_1fr]">
      <div className="text-lg font-medium text-white">{text}</div>
      <div className="text-base leading-7 text-slate-300">{detail}</div>
    </div>
  )
}

function LimitCard({ body, title }: { body: string; title: string }) {
  return (
    <article
      className="rounded-[28px] border border-white/10 bg-white/[0.025] p-6"
      data-reveal-card
    >
      <div className="text-lg font-medium text-white">{title}</div>
      <p className="mt-2 text-base leading-7 text-slate-300">{body}</p>
    </article>
  )
}

