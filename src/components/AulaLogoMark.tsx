interface Props {
  size?: number
  color?: string
  className?: string
}

export default function AulaLogoMark({
  size = 32,
  color = '#4F8E4A',
  className,
}: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M30.6 16.2C30.6 24.1533 24.9588 30.6 18 30.6C14.85 30.6 9.45 28.8 7.2 25.2L5.4 30.6"
        stroke={color}
        strokeWidth="6.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
