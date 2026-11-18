// The Pursuit wordmark: a blue tile with two dots (you, and where you're headed).
export default function Logo({ className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2 font-display text-lg font-bold tracking-tight ${className}`}>
      <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="9" fill="var(--color-primary)" />
        <circle cx="11" cy="16" r="3" fill="#fff" />
        <circle cx="21" cy="16" r="3" fill="#fff" opacity=".55" />
      </svg>
      Pursuit
    </span>
  )
}
