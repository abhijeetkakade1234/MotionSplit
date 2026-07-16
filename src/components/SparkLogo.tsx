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
      <defs>
        <linearGradient id="spark-fill" x1="32" x2="32" y1="12" y2="52" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" />
          <stop offset="1" stopColor="#d8e5ff" />
        </linearGradient>
        <filter id="spark-grain" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence baseFrequency="1.1" numOctaves="2" seed="7" stitchTiles="stitch" type="fractalNoise" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA slope="0.08" type="linear" />
          </feComponentTransfer>
          <feBlend in2="SourceGraphic" mode="soft-light" />
        </filter>
      </defs>
      <g filter="url(#spark-grain)">
        <path
          d="M32 14L35.4 28.6L50 32L35.4 35.4L32 50L28.6 35.4L14 32L28.6 28.6L32 14Z"
          fill="url(#spark-fill)"
        />
        <circle cx="32" cy="32" fill="#ffffff" r="2.8" />
      </g>
    </svg>
  )
}
