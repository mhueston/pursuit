import { useDraggable } from '@dnd-kit/core'
import { daysUntil, relativeDay, shortDate } from '../../lib/dates'

/*
  One job on the board.
  - Click the company/role to open it for editing.
  - Drag anywhere on the card with a mouse or trackpad.
  - On a phone, press and hold the card, then drag.
  - Keyboard users tab to the grip button, press Space to pick it up,
    use the arrow keys to move, and Space again to drop.
*/
export default function JobCard({ application, onOpen }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, isDragging } = useDraggable({
    id: application.id,
    data: { application },
  })

  // The whole card responds to mouse and touch. Keyboard dragging stays
  // on the grip button so pressing Enter on the card's title still opens it.
  const { onKeyDown: _keyboardOnly, ...pointerListeners } = listeners ?? {}

  return (
    <article
      ref={setNodeRef}
      {...pointerListeners}
      className={`group relative cursor-grab rounded-2xl bg-white p-4 shadow-[0_1px_2px_rgba(27,28,33,0.06)] active:cursor-grabbing ${
        isDragging ? 'opacity-40' : ''
      }`}
    >
      <CardBody application={application} onOpen={onOpen} />

      <button
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        aria-label={`Move ${application.company} ${application.role}`}
        className="absolute top-3 right-2 rounded-md p-1 text-muted opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
      >
        <GripIcon />
      </button>
    </article>
  )
}

// The card's content. Shared with the floating copy shown while dragging.
export function CardBody({ application, onOpen }) {
  const { company, role, location, salary_range, status } = application
  const meta = [location, salary_range].filter(Boolean).join(', ')

  return (
    <>
      <button
        type="button"
        onClick={() => onOpen?.(application)}
        className="block w-full pr-6 text-left"
      >
        <span className="block font-display text-lg leading-tight font-semibold">{company}</span>
        <span className="mt-0.5 block text-sm text-ink">{role}</span>
      </button>

      {meta && <p className="mt-2 text-xs text-muted">{meta}</p>}

      <CardSignal application={application} status={status} />
    </>
  )
}

/*
  The one most useful thing to know about this job right now,
  shown at the bottom of the card. Overdue or due-soon items turn coral.
*/
function CardSignal({ application, status }) {
  const { next_step, next_step_date, deadline, date_applied } = application

  let text = null
  let date = null

  if (next_step || next_step_date) {
    text = next_step || 'Next step'
    date = next_step_date
  } else if (status === 'saved' && deadline) {
    text = 'Apply by'
    date = deadline
  } else if (date_applied && status !== 'saved') {
    return <p className="mt-3 text-xs text-muted">Applied {shortDate(date_applied)}</p>
  }

  if (!text) return null

  const days = daysUntil(date)
  const urgent = days !== null && days <= 2

  return (
    <p
      className={`mt-3 flex items-baseline justify-between gap-3 rounded-lg px-2.5 py-1.5 text-xs font-medium ${
        urgent ? 'bg-coral/10 text-coral' : 'bg-cloud text-ink'
      }`}
    >
      <span>{text}</span>
      {date && <span className="shrink-0 font-normal">{relativeDay(date)}</span>}
    </p>
  )
}

function GripIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <circle cx="5.5" cy="3.5" r="1.25" />
      <circle cx="10.5" cy="3.5" r="1.25" />
      <circle cx="5.5" cy="8" r="1.25" />
      <circle cx="10.5" cy="8" r="1.25" />
      <circle cx="5.5" cy="12.5" r="1.25" />
      <circle cx="10.5" cy="12.5" r="1.25" />
    </svg>
  )
}
