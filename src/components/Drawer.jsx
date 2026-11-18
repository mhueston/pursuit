import { useEffect, useRef } from 'react'

/*
  The side panel used for editing jobs and contacts.
  It uses the browser's built-in <dialog> element, which handles
  focus, the Escape key, and the dimmed background for free.

  - title / subtitle: shown at the top
  - children: the scrolling middle
  - footer: buttons pinned to the bottom
  - onClose: called however the panel closes (X, Escape, clicking outside)

  To close it from a button inside, use onClick={closeDrawer}.
*/

// Closes whichever drawer the clicked button is inside.
export function closeDrawer(e) {
  e.currentTarget.closest('dialog')?.close()
}

export default function Drawer({ title, subtitle, children, footer, onClose }) {
  const dialogRef = useRef(null)

  // Open as a modal as soon as the component appears.
  useEffect(() => {
    dialogRef.current?.showModal()
  }, [])

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      // Clicking the dimmed background (the dialog itself, outside the panel) closes it
      onClick={(e) => e.target === e.currentTarget && e.currentTarget.close()}
      aria-labelledby="drawer-title"
      className="m-0 ml-auto h-dvh max-h-none w-full max-w-lg bg-white p-0 text-ink backdrop:bg-ink/30 backdrop:backdrop-blur-sm sm:rounded-l-3xl"
    >
      <div className="flex h-full flex-col">
        <header className="flex items-start justify-between gap-4 px-7 pt-7 pb-2">
          <div className="min-w-0">
            <h2 id="drawer-title" className="truncate text-3xl font-bold">
              {title}
            </h2>
            {subtitle && <p className="mt-1 text-muted">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Close"
            className="-mr-2 rounded-full p-2 text-muted hover:bg-cloud hover:text-ink"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <path d="M5 5l10 10M15 5L5 15" />
            </svg>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-7 py-5">{children}</div>

        {footer && (
          <footer className="flex flex-wrap items-center gap-3 border-t border-line px-7 py-5">{footer}</footer>
        )}
      </div>
    </dialog>
  )
}

// A titled block inside a drawer, like "People" or "Touchpoints".
export function DrawerSection({ title, children }) {
  return (
    <section className="mt-8 border-t border-line pt-6">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="mt-3">{children}</div>
    </section>
  )
}
