import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { STAGES } from '../../lib/applications'
import Column from './Column'
import { CardBody } from './JobCard'

/*
  The kanban board. DndContext from the dnd-kit library watches for
  drags and tells us which card was dropped on which column.
*/
export default function Board({ applications, onMove, onOpen, onAdd }) {
  const [activeApplication, setActiveApplication] = useState(null)

  const sensors = useSensors(
    // Mouse: a drag only starts after moving 6px, so a normal click still opens the card.
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    // Touch: press and hold for a quarter second, so swiping still scrolls the board.
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } }),
    useSensor(KeyboardSensor),
  )

  function handleDragStart({ active }) {
    setActiveApplication(active.data.current.application)
  }

  function handleDragEnd({ active, over }) {
    setActiveApplication(null)
    if (!over) return
    const application = active.data.current.application
    if (application.status !== over.id) onMove(application, over.id)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={detectColumn}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveApplication(null)}
      accessibility={{ announcements }}
    >
      {/* Columns scroll sideways on smaller screens */}
      <div className="-mx-5 overflow-x-auto px-5 pb-4 sm:-mx-10 sm:px-10">
        <div className="grid min-w-max auto-cols-[minmax(14rem,1fr)] grid-flow-col gap-3 xl:min-w-0">
          {STAGES.map((stage) => (
            <Column
              key={stage.id}
              stage={stage}
              applications={applications.filter((a) => a.status === stage.id)}
              onOpen={onOpen}
              onAdd={onAdd}
            />
          ))}
        </div>
      </div>

      {/* The floating copy of the card that follows your cursor */}
      <DragOverlay>
        {activeApplication && (
          <div className="rotate-2 cursor-grabbing rounded-2xl bg-white p-4 shadow-2xl ring-1 ring-primary">
            <CardBody application={activeApplication} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}

// Mouse: use the column under the pointer. Keyboard: use whichever column overlaps most.
function detectColumn(args) {
  const hits = pointerWithin(args)
  return hits.length ? hits : rectIntersection(args)
}

// What screen readers hear while dragging, using real names instead of ids.
function stageLabel(id) {
  return STAGES.find((s) => s.id === id)?.label ?? id
}

function cardName(active) {
  const a = active.data.current?.application
  return a ? `${a.role} at ${a.company}` : 'the card'
}

const announcements = {
  onDragStart: ({ active }) => `Picked up ${cardName(active)}. Use arrow keys to move between stages.`,
  onDragOver: ({ active, over }) => (over ? `${cardName(active)} is over ${stageLabel(over.id)}.` : undefined),
  onDragEnd: ({ active, over }) =>
    over ? `Moved ${cardName(active)} to ${stageLabel(over.id)}.` : `${cardName(active)} was dropped.`,
  onDragCancel: ({ active }) => `Moving ${cardName(active)} was cancelled.`,
}
