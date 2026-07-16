import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Download, Star, Upload } from 'lucide-react'

type AnimatedActionButtonProps = {
  download?: string
  href?: string
  label: string
  onClick?: () => void
  type?: 'button' | 'submit'
  variant: 'download' | 'github' | 'upload'
}

export function AnimatedActionButton({
  download,
  href,
  label,
  onClick,
  type = 'button',
  variant,
}: AnimatedActionButtonProps) {
  const [isHovered, setIsHovered] = useState(false)

  const content = (
    <>
      <div className="relative flex h-4 w-4 shrink-0 items-center justify-center">
        <AnimatePresence initial={false} mode="popLayout">
          {variant === 'github'
            ? renderGithubIcon(isHovered)
            : renderMorphIcon(isHovered, variant)}
        </AnimatePresence>
      </div>
      <span className="ml-2.5 text-[13px] font-medium tracking-tight">{label}</span>
    </>
  )

  const className =
    'relative inline-flex h-9 cursor-pointer items-center justify-center rounded-[40px] border border-white/5 bg-white/[0.04] px-6 text-white transition-colors duration-150 hover:bg-white/[0.06]'

  const hoverProps = {
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.96 },
  }

  if (href) {
    return (
      <motion.a
        {...hoverProps}
        className={className}
        download={download}
        href={href}
        rel={download ? undefined : 'noreferrer'}
        target={download ? undefined : '_blank'}
      >
        {content}
      </motion.a>
    )
  }

  return (
    <motion.button
      {...hoverProps}
      className={className}
      onClick={onClick}
      type={type}
    >
      {content}
    </motion.button>
  )
}

function renderMorphIcon(isHovered: boolean, variant: 'download' | 'upload') {
  const BaseIcon = variant === 'download' ? Download : Upload

  return !isHovered ? (
    <motion.div
      animate={{ opacity: 1, scale: 1 }}
      className="absolute inset-0 flex items-center justify-center"
      exit={{ opacity: 0, scale: 0.5 }}
      initial={{ opacity: 0, scale: 0.5 }}
      key={`${variant}-base`}
      transition={{ damping: 25, stiffness: 600, type: 'spring' }}
    >
      <BaseIcon className="h-4 w-4" />
    </motion.div>
  ) : (
    <motion.div
      animate={{ opacity: 1, scale: 1 }}
      className="absolute inset-0 flex items-center justify-center"
      exit={{ opacity: 0, scale: 0.5 }}
      initial={{ opacity: 0, scale: 0.5 }}
      key={`${variant}-check`}
      transition={{ damping: 25, stiffness: 600, type: 'spring' }}
    >
      <Check className="h-4 w-4" />
    </motion.div>
  )
}

function renderGithubIcon(isHovered: boolean) {
  return !isHovered ? (
    <motion.div
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="absolute inset-0 flex items-center justify-center"
      exit={{ opacity: 0, scale: 0.8, y: -15 }}
      initial={{ opacity: 0, scale: 0.8, y: -15 }}
      key="github-base"
      transition={{ damping: 25, stiffness: 600, type: 'spring' }}
    >
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 .5C5.65.5.5 5.65.5 12A11.5 11.5 0 0 0 8.36 22.9c.58.1.79-.25.79-.56v-2.18c-3.2.7-3.88-1.36-3.88-1.36-.53-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.15.08 1.76 1.2 1.76 1.2 1.03 1.75 2.7 1.25 3.36.95.1-.75.4-1.25.73-1.53-2.55-.29-5.23-1.28-5.23-5.68 0-1.25.45-2.27 1.18-3.07-.12-.3-.5-1.5.12-3.13 0 0 .97-.31 3.17 1.18a10.9 10.9 0 0 1 5.76 0c2.2-1.5 3.17-1.18 3.17-1.18.62 1.63.24 2.83.12 3.13.73.8 1.18 1.82 1.18 3.07 0 4.4-2.68 5.39-5.24 5.68.42.36.79 1.05.79 2.12v3.14c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
      </svg>
    </motion.div>
  ) : (
    <motion.div
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="absolute inset-0 flex items-center justify-center"
      exit={{ opacity: 0, scale: 0.8, y: 15 }}
      initial={{ opacity: 0, scale: 0.8, y: 15 }}
      key="github-star"
      transition={{ damping: 25, stiffness: 600, type: 'spring' }}
    >
      <Star className="h-4 w-4 text-yellow-400" />
      <motion.div
        animate={{ opacity: 1, rotate: 0, scale: 1, y: 0 }}
        className="absolute -right-2 -top-3"
        exit={{ opacity: 0, rotate: 45, scale: 0, y: 10 }}
        initial={{ opacity: 0, rotate: -45, scale: 0, y: 10 }}
        transition={{
          damping: 25,
          delay: 0.05,
          stiffness: 600,
          type: 'spring',
        }}
      >
        <svg className="h-2.5 w-2.5 text-yellow-200" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l2.4 7.6H22l-6.2 4.5 2.4 7.6-6.2-4.5-6.2 4.5 2.4-7.6L2 9.6h7.6z" />
        </svg>
      </motion.div>
    </motion.div>
  )
}
