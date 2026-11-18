import { initials } from '../lib/contacts'

// Soft tints from the stage colors. Each person always gets the same one,
// picked from the letters in their name.
const TINTS = ['bg-saved/20', 'bg-applied/20', 'bg-interviewing/25', 'bg-offer/20']

function tintFor(name = '') {
  let sum = 0
  for (const ch of name) sum += ch.charCodeAt(0)
  return TINTS[sum % TINTS.length]
}

export default function Avatar({ name, size = 'md' }) {
  const sizes = { sm: 'size-8 text-xs', md: 'size-12 text-base', lg: 'size-14 text-lg' }
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-display font-semibold text-ink ${tintFor(name)} ${sizes[size]}`}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  )
}
