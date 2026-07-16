type SparkLogoProps = {
  className?: string
}

export function SparkLogo({ className = '' }: SparkLogoProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M32 20L34.4 29.6L44 32L34.4 34.4L32 44L29.6 34.4L20 32L29.6 29.6L32 20Z"
        fill="white"
      />
      <circle cx="32" cy="32" fill="white" r="2.4" />
    </svg>
  )
}
