import { useDroppable } from '@dnd-kit/core'
import JobCard from './JobCard'

// Full class names for each stage's color. Tailwind needs to see the whole
// class name in the code (it can't build "bg-" + stage.id on the fly).
const DOT = {
  saved: 'bg-saved',
  applied: 'bg-applied',
  interviewing: 'bg-interviewing',
  offer: 'bg-offer',
  closed: 'bg-closed',
}
const DROP_RING = {
  saved: 'ring-saved',
  applied: 'ring-applied',
  interviewing: 'ring-interviewing',
  offer: 'ring-offer',
  closed: 'ring-closed',
}

// One stage on the board. Cards can be dropped anywhere inside it.
export default function Column({ stage, applications, onOpen, onAdd }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id })

  return (
    <section
      ref={setNodeRef}
      aria-labelledby={`column-${stage.id}`}
      className={`flex min-h-[26rem] flex-col rounded-3xl bg-cloud p-3 transition-shadow ${
        isOver ? `ring-2 ${DROP_RING[stage.id]}` : ''
      }`}
    >
      <header className="flex items-center gap-2 px-2 pt-2 pb-4">
        <span className={`size-2.5 rounded-full ${DOT[stage.id]}`} aria-hidden="true" />
        <h2 id={`column-${stage.id}`} className="text-base font-semibold">
          {stage.label}
        </h2>
        <span className="ml-auto text-sm text-muted" aria-label={`${applications.length} jobs`}>
          {applications.length}
        </span>
      </header>

      <div className="flex flex-1 flex-col gap-2.5">
        {applications.map((application) => (
          <JobCard key={application.id} application={application} onOpen={onOpen} />
        ))}

        {applications.length === 0 && (
          <p className="px-3 py-6 text-center text-sm text-muted">{stage.hint}</p>
        )}
      </div>

      <button
        type="button"
        onClick={() => onAdd(stage.id)}
        className="mt-3 rounded-xl px-3 py-2 text-left text-sm font-medium text-muted transition-colors hover:bg-white hover:text-primary"
      >
        + Add a job
      </button>
    </section>
  )
}
