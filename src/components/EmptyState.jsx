// A reusable "nothing here yet" panel that tells people what to do next.
export default function EmptyState({ title, children, action }) {
  return (
    <div className="mt-10 rounded-3xl bg-cloud px-6 py-16 text-center">
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-muted">{children}</p>
      {action && <div className="mt-7">{action}</div>}
    </div>
  )
}
