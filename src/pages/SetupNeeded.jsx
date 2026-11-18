// Shown when the .env file is missing, so you get instructions
// instead of a blank screen.
export default function SetupNeeded() {
  return (
    <main className="mx-auto max-w-xl px-6 py-20">
      <h1 className="text-5xl font-bold">Connect Supabase to get started</h1>
      <ol className="mt-6 list-decimal space-y-3 pl-5 text-muted">
        <li>Copy the file <code className="text-ink">.env.example</code> and rename the copy to <code className="text-ink">.env</code>.</li>
        <li>Paste in your Project URL and publishable key from Supabase (Project Settings, then API Keys).</li>
        <li>Stop the dev server with Control + C and run <code className="text-ink">npm run dev</code> again.</li>
      </ol>
    </main>
  )
}
