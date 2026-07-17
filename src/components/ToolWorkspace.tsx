import { useEffect, useState } from 'react'
import { AnimatedActionButton } from './AnimatedActionButton'
import { DownloadPanel } from './DownloadPanel'
import { ExtractionControls } from './ExtractionControls'
import Grainient from './Grainient'
import { PreviewStrip } from './PreviewStrip'
import { ProgressPanel } from './ProgressPanel'
import { UploadZone } from './UploadZone'
import { useMotionSplit } from '../hooks/useMotionSplit'

type ToolWorkspaceProps = {
  onBack: () => void
}

type StepId = 1 | 2 | 3 | 4

const STEP_COPY: Record<
  StepId,
  { body: string; title: string }
> = {
  1: {
    body: 'Add your source file and review what MotionSplit detected.',
    title: 'Upload and review',
  },
  2: {
    body: 'Adjust FPS, range, output format, naming, and quality.',
    title: 'Extraction settings',
  },
  3: {
    body: 'Run extraction, watch progress, and download your ZIP.',
    title: 'Extract frames',
  },
  4: {
    body: 'If MotionSplit helped, star the repo and keep it alive.',
    title: 'Support open source',
  },
}

export function ToolWorkspace({ onBack }: ToolWorkspaceProps) {
  const motionSplit = useMotionSplit()
  const [currentStep, setCurrentStep] = useState<StepId>(1)
  const busy = motionSplit.isBusy
  const processing = motionSplit.isProcessing
  const hasSource = Boolean(motionSplit.metadata)
  const hasArchive = Boolean(motionSplit.archiveInfo)

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const isSubmit =
        (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'enter'
      const isEscape = event.key === 'Escape'

      if (isSubmit && motionSplit.canExtract) {
        event.preventDefault()
        void motionSplit.startExtraction()
      }

      if (isEscape && processing) {
        event.preventDefault()
        motionSplit.cancelExtraction()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [motionSplit, processing])

  useEffect(() => {
    if (!hasSource) {
      setCurrentStep(1)
      return
    }

    if (hasArchive) {
      setCurrentStep(4)
      return
    }

    if (processing || motionSplit.phase === 'done') {
      setCurrentStep(3)
      return
    }

    setCurrentStep(2)
  }, [hasArchive, hasSource, motionSplit.phase, processing])

  useEffect(() => {
    if (!busy) {
      return
    }

    function onBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [busy])

  function handleBack() {
    if (busy && !window.confirm('MotionSplit is still working. Leave the tool?')) {
      return
    }

    onBack()
  }

  function goToStep(step: StepId) {
    if (busy || !isStepUnlocked(step, hasSource, hasArchive)) {
      return
    }

    setCurrentStep(step)
  }

  return (
    <div className="min-h-screen bg-[#050816] text-slate-50">
      <div className="absolute inset-0">
        {busy ? null : <Grainient className="opacity-95" />}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_12%,rgba(255,255,255,0.2),transparent_28%),linear-gradient(180deg,rgba(5,8,22,0.08),rgba(5,8,22,0.62)_54%,#050816_100%)]" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1180px] flex-col px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
        <header className="mb-4 flex items-center justify-end gap-3 border-b border-white/8 pb-3 sm:mb-5 sm:pb-4">
          <div className="flex items-center gap-3">
            <button
              className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-200 transition hover:bg-white/[0.08]"
              onClick={handleBack}
              type="button"
            >
              Back
            </button>
          </div>
        </header>

        <main className="flex flex-1 flex-col pb-4">
          <div className="px-1 pb-0 pt-0 sm:px-2">
            <StepTopRail
              currentStep={currentStep}
              busy={busy}
              goToStep={goToStep}
              hasArchive={hasArchive}
              hasSource={hasSource}
            />
          </div>

          {motionSplit.errorMessage ? (
            <ErrorBanner
              canRetry={motionSplit.phase === 'error' && motionSplit.canExtract}
              message={motionSplit.errorMessage}
              onRetry={() => void motionSplit.startExtraction()}
            />
          ) : null}

          <div className="flex-1">
            <section className="min-w-0">
              <ActiveStepCard
                currentStep={currentStep}
                handleRetreat={() => setCurrentStep(previousStep(currentStep))}
                motionSplit={motionSplit}
              />
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}

function ActiveStepCard({
  currentStep,
  handleRetreat,
  motionSplit,
}: {
  currentStep: StepId
  handleRetreat: () => void
  motionSplit: ReturnType<typeof useMotionSplit>
}) {
  const canContinueFromSettings = motionSplit.canExtract
  const hasArchive = Boolean(motionSplit.archiveInfo)

  if (currentStep === 1) {
    return (
      <section className="p-4 pt-3 sm:p-5 sm:pt-4 lg:p-6 lg:pt-5">
        <StepHeading
          description="Supports MP4, MOV, and WebM. Nothing leaves your device."
          title="Upload your video"
        />
        <div className="mt-4 rounded-[28px] border border-white/8 bg-black/10 p-4 sm:p-5">
          <UploadZone
            busy={motionSplit.isBusy}
            fileName={motionSplit.videoFile?.name ?? null}
            onSelectFile={motionSplit.handleFileSelection}
          />
          <div className="mt-3 text-sm text-slate-400">
            Supported: MP4, MOV, WebM
          </div>
        </div>
      </section>
    )
  }

  if (currentStep === 2) {
    return (
      <section className="p-4 pt-3 sm:p-5 sm:pt-4 lg:p-6 lg:pt-5">
        <StepHeading
          description="Choose cadence, range, format, naming, and quality before extraction."
          title="Extraction settings"
        />
        <div className="mt-4">
          <ExtractionControls
            canExtract={motionSplit.canExtract}
            disabled={motionSplit.isBusy}
            onCopyPattern={motionSplit.copyNamingPattern}
            onReset={motionSplit.resetAll}
            onStart={() => void motionSplit.startExtraction()}
            settings={motionSplit.settings}
            setSettings={motionSplit.setSettings}
            videoDuration={motionSplit.metadata?.duration ?? 0}
          />
        </div>
        <StepFooter
          actionLabel="Next"
          disabled={!canContinueFromSettings}
          onAction={() => void motionSplit.startExtraction()}
          onBack={handleRetreat}
        />
      </section>
    )
  }

  if (currentStep === 3) {
    return (
      <section className="p-4 pt-3 sm:p-5 sm:pt-4 lg:p-6 lg:pt-5">
        <StepHeading
          description={
            hasArchive
              ? 'Your archive is ready. Download the ZIP and move on.'
              : 'Processing your video locally. MotionSplit is extracting frames now.'
          }
          title={hasArchive ? 'Download frames' : 'Processing'}
        />
        <div className="mt-4">
          <div className="grid gap-4">
            <ProgressPanel
              phase={motionSplit.phase}
              progress={motionSplit.progress}
              onCancel={motionSplit.cancelExtraction}
              statusText={motionSplit.statusText}
            />
            {hasArchive ? (
              <>
                <PreviewStrip
                  previewFrames={motionSplit.previewFrames}
                  totalFrames={motionSplit.progress.totalFrames}
                />
                <DownloadPanel
                  archiveInfo={motionSplit.archiveInfo}
                />
              </>
            ) : null}
          </div>
        </div>
        <div className="mt-4 border-t border-white/8 pt-4">
          <button
            className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-white/10 bg-black/15 px-5 text-sm font-medium text-slate-200 transition hover:border-white/20 hover:bg-white/5"
            disabled={motionSplit.isBusy}
            onClick={handleRetreat}
            type="button"
          >
            Previous
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="p-4 pt-3 sm:p-5 sm:pt-4 lg:p-6 lg:pt-5">
      <StepHeading
        description="MotionSplit is free and open source. If it helped, give the repo a star."
        title="Support open source"
      />
      <div className="mt-4 rounded-[28px] border border-white/8 bg-black/10 p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-lg font-semibold text-white">Finished extracting?</div>
            <p className="mt-2 max-w-xl text-sm leading-7 text-slate-400">
              Download your archive, ship your sequence, and star MotionSplit on GitHub
              if you want to support the project.
            </p>
          </div>
          <AnimatedActionButton
            href="https://github.com/abhijeetkakade1234/MotionSplit"
            label="Star on GitHub"
            variant="github"
          />
        </div>
      </div>
      <div className="mt-4">
        <DownloadPanel archiveInfo={motionSplit.archiveInfo} />
      </div>
    </section>
  )
}

function StepHeading({
  description,
  title,
}: {
  description: string
  title: string
}) {
  return (
    <div>
      <h2 className="text-[1.8rem] font-semibold tracking-[-0.04em] text-white sm:text-[2rem]">{title}</h2>
      <p className="mt-1.5 text-sm leading-6 text-slate-400 sm:text-base sm:leading-7">{description}</p>
    </div>
  )
}

function ErrorBanner({
  canRetry,
  message,
  onRetry,
}: {
  canRetry: boolean
  message: string
  onRetry: () => void
}) {
  return (
    <div
      className="mx-1 mb-3 flex flex-col gap-3 rounded-2xl border border-red-500/25 bg-[#2a1118]/85 px-4 py-3 text-sm text-red-100 sm:mx-2 sm:flex-row sm:items-center sm:justify-between"
      role="alert"
    >
      <span>{message}</span>
      {canRetry ? (
        <button
          className="shrink-0 rounded-xl border border-red-300/20 px-4 py-2 font-medium transition hover:bg-white/8"
          onClick={onRetry}
          type="button"
        >
          Retry
        </button>
      ) : null}
    </div>
  )
}

function StepFooter({
  actionLabel,
  disabled,
  helperText,
  onAction,
  onBack,
}: {
  actionLabel: string
  disabled: boolean
  helperText?: string
  onAction: () => void
  onBack?: () => void
}) {
  return (
    <div className="mt-4 shrink-0 flex items-center justify-between gap-3 border-t border-white/8 pt-4">
      <div className="min-h-11">
        {onBack ? (
          <button
            className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-white/10 bg-black/15 px-5 text-sm font-medium text-slate-200 transition hover:border-white/20 hover:bg-white/5"
            onClick={onBack}
            type="button"
          >
            Previous
          </button>
        ) : helperText ? (
          <div className="flex min-h-11 items-center text-sm text-slate-500">
            {helperText}
          </div>
        ) : null}
      </div>

      <button
        className="inline-flex min-h-11 min-w-[220px] items-center justify-center rounded-2xl border border-[#8bb4ff]/45 bg-[linear-gradient(180deg,#7cabff_0%,#4f84f3_58%,#305fd8_100%)] px-6 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(29,76,188,0.35),inset_0_1px_0_rgba(255,255,255,0.18)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none"
        disabled={disabled}
        onClick={onAction}
        type="button"
      >
        {actionLabel}
      </button>
    </div>
  )
}

function StepTopRail({
  busy,
  currentStep,
  goToStep,
  hasArchive,
  hasSource,
}: {
  busy: boolean
  currentStep: StepId
  goToStep: (step: StepId) => void
  hasArchive: boolean
  hasSource: boolean
}) {
  return (
    <div className="mb-1 pb-2 sm:pb-3">
      <div className="grid grid-cols-4 items-center gap-3">
        {([1, 2, 3, 4] as StepId[]).map((step, index, steps) => {
          const active = currentStep === step
          const complete = step < currentStep && isStepUnlocked(step, hasSource, hasArchive)
          const locked =
            !isStepUnlocked(step, hasSource, hasArchive) || (busy && !active)

          return (
            <div className="min-w-0" key={step}>
              <button
                className={`flex w-full min-w-0 items-center gap-3 text-left transition ${locked ? 'opacity-45' : 'hover:opacity-100'}`}
                disabled={locked}
                onClick={() => goToStep(step)}
                type="button"
              >
                <span
                  className={`grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full transition ${
                    active || complete
                      ? 'bg-white shadow-[0_0_0_4px_rgba(255,255,255,0.08)]'
                      : 'border border-white/15 bg-transparent'
                  }`}
                >
                  <span className="sr-only">{STEP_COPY[step].title}</span>
                </span>
                <div className="hidden min-w-0 md:block">
                  <div className={`truncate text-sm ${active ? 'text-white' : 'text-slate-400'}`}>
                    {STEP_COPY[step].title}
                  </div>
                </div>
              </button>
              {index < steps.length - 1 ? (
                <div className="mt-2 hidden h-px bg-white/10 md:block" />
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function isStepUnlocked(step: StepId, hasSource: boolean, hasArchive: boolean) {
  if (step === 1) {
    return true
  }

  if (step === 4) {
    return hasArchive
  }

  return hasSource
}

function previousStep(step: StepId): StepId {
  if (step === 1) {
    return 1
  }

  return (step - 1) as StepId
}
