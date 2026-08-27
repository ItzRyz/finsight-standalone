export default function Loading() {
  return <main className="space-y-6 p-6" aria-busy="true"><div className="h-8 w-48 animate-pulse rounded bg-muted" /><div className="grid gap-4 sm:grid-cols-3">{Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-28 animate-pulse rounded-xl bg-muted" />)}</div><div className="h-80 animate-pulse rounded-xl bg-muted" /></main>;
}
