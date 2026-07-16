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
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const extracting = motionSplit.phase === 'extracting'
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

      if (isEscape && extracting) {
        event.preventDefault()
        motionSplit.cancelExtraction()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [extracting, motionSplit])

  useEffect(() => {
    if (!hasSource) {
      setCurrentStep(1)
      return
    }

    if (hasArchive) {
      setCurrentStep(4)
      return
    }

    if (extracting || motionSplit.phase === 'done') {
      setCurrentStep(3)
    }
  }, [extracting, hasArchive, hasSource, motionSplit.phase])

  useEffect(() => {
    if (!extracting) {
      return
    }

    function onBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [extracting])

  useEffect(() => {
    if (!motionSplit.errorMessage) {
      return
    }

    setToastMessage(motionSplit.errorMessage)
    const timeoutId = window.setTimeout(() => {
      setToastMessage(null)
    }, 3600)

    return () => window.clearTimeout(timeoutId)
  }, [motionSplit.errorMessage])

  function handleBack() {
    if (extracting && !window.confirm('Extraction is still running. Leave the tool?')) {
      return
    }

    onBack()
  }

  function goToStep(step: StepId) {
    if (!isStepUnlocked(step, hasSource, hasArchive)) {
      return
    }

    setCurrentStep(step)
  }

  return (
    <div className="min-h-screen bg-[#050816] text-slate-50">
      <div className="absolute inset-0">
        <Grainient className="opacity-95" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_12%,rgba(255,255,255,0.2),transparent_28%),linear-gradient(180deg,rgba(5,8,22,0.08),rgba(5,8,22,0.62)_54%,#050816_100%)]" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1180px] flex-col px-4 py-5 sm:px-6 lg:px-8">
        {toastMessage ? (
          <div className="fixed right-4 top-4 z-50 max-w-sm rounded-2xl border border-red-500/20 bg-[#2a1118]/92 px-4 py-3 text-sm text-red-100 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur xl:right-6 xl:top-6">
            {toastMessage}
          </div>
        ) : null}

        <header className="mb-8 flex items-center justify-end gap-3 border-b border-white/8 pb-5">
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

        <main className="pb-8">
          <div className="px-2 pb-0 pt-1 sm:px-3">
            <StepTopRail
              currentStep={currentStep}
              goToStep={goToStep}
              hasArchive={hasArchive}
              hasSource={hasSource}
            />
          </div>

          <div>
            <section className="min-w-0">
              <ActiveStepCard
                currentStep={currentStep}
                handleAdvance={() => setCurrentStep(nextStep(currentStep))}
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
  handleAdvance,
  handleRetreat,
  motionSplit,
}: {
  currentStep: StepId
  handleAdvance: () => void
  handleRetreat: () => void
  motionSplit: ReturnType<typeof useMotionSplit>
}) {
  const canContinueFromUpload = Boolean(motionSplit.metadata)
  const canContinueFromSettings = motionSplit.canExtract

  if (currentStep === 1) {
    return (
      <section className="p-6 pt-8">
        <StepHeading
          description="Supports MP4, MOV, and WebM. Nothing leaves your device."
          title="Upload your video"
        />
        <div className="mt-6 rounded-[28px] border border-white/8 bg-black/10 p-5">
          <UploadZone
            busy={motionSplit.phase === 'extracting'}
            fileName={motionSplit.videoFile?.name ?? null}
            onSelectFile={motionSplit.handleFileSelection}
          />
          <div className="mt-4 text-sm text-slate-400">
            Supported: MP4, MOV, WebM
          </div>
        </div>
        <StepFooter
          actionLabel="Continue to settings"
          disabled={!canContinueFromUpload}
          onAction={handleAdvance}
          onBack={currentStep > 1 ? handleRetreat : undefined}
        />
      </section>
    )
  }

  if (currentStep === 2) {
    return (
      <section className="p-6 pt-8">
        <StepHeading
          description="Choose cadence, range, format, naming, and quality before extraction."
          title="Extraction settings"
        />
        <div className="mt-6">
          <ExtractionControls
            canExtract={motionSplit.canExtract}
            disabled={motionSplit.phase === 'extracting'}
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
          onAction={handleAdvance}
          onBack={handleRetreat}
        />
      </section>
    )
  }

  if (currentStep === 3) {
    return (
      <section className="p-6 pt-8">
        <StepHeading
          description="Run the extraction, monitor progress, and download the ZIP when it is ready."
          title="Extract frames"
        />
        <div className="mt-6 grid gap-5">
          <PreviewStrip
            previewFrames={motionSplit.previewFrames}
            totalFrames={motionSplit.progress.totalFrames}
          />
          <ProgressPanel
            phase={motionSplit.phase}
            progress={motionSplit.progress}
            onCancel={motionSplit.cancelExtraction}
            statusText={motionSplit.statusText}
          />
          <DownloadPanel
            archiveInfo={motionSplit.archiveInfo}
          />
        </div>
        <div className="mt-6 border-t border-white/8 pt-5">
          <button
            className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-white/10 bg-black/15 px-5 text-sm font-medium text-slate-200 transition hover:border-white/20 hover:bg-white/5"
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
    <section className="p-6 pt-8">
      <StepHeading
        description="MotionSplit is free and open source. If it helped, give the repo a star."
        title="Support open source"
      />
      <div className="mt-6 rounded-[28px] border border-white/8 bg-black/10 p-6">
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
      <div className="mt-5">
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
      <h2 className="text-[2rem] font-semibold tracking-[-0.04em] text-white">{title}</h2>
      <p className="mt-2 text-base leading-8 text-slate-400">{description}</p>
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
    <div className="mt-6 flex items-center justify-between gap-3 border-t border-white/8 pt-5">
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
  currentStep,
  goToStep,
  hasArchive,
  hasSource,
}: {
  currentStep: StepId
  goToStep: (step: StepId) => void
  hasArchive: boolean
  hasSource: boolean
}) {
  return (
    <div className="mb-2 overflow-x-auto pb-4">
      <div className="flex min-w-[720px] items-center gap-3">
        {([1, 2, 3, 4] as StepId[]).map((step, index, steps) => {
          const active = currentStep === step
          const complete = step < currentStep && isStepUnlocked(step, hasSource, hasArchive)
          const locked = !isStepUnlocked(step, hasSource, hasArchive)

          return (
            <div className="flex min-w-0 flex-1 items-center gap-3" key={step}>
              <button
                className={`grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full transition ${
                  active || complete
                    ? 'bg-white shadow-[0_0_0_4px_rgba(255,255,255,0.08)]'
                    : 'border border-white/15 bg-transparent'
                } ${locked ? 'opacity-45' : 'hover:scale-110'}`}
                disabled={locked}
                onClick={() => goToStep(step)}
                type="button"
              >
                <span className="sr-only">{STEP_COPY[step].title}</span>
              </button>
              <div className="min-w-0">
                <div className={`truncate text-sm ${active ? 'text-white' : 'text-slate-400'}`}>
                  {STEP_COPY[step].title}
                </div>
              </div>
              {index < steps.length - 1 ? (
                <div className="h-px flex-1 bg-white/10" />
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

function nextStep(step: StepId): StepId {
  if (step === 4) {
    return 4
  }

  return (step + 1) as StepId
}

function previousStep(step: StepId): StepId {
  if (step === 1) {
    return 1
  }

  return (step - 1) as StepId
}
