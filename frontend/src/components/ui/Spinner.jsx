export default function Spinner({ label = 'Loading' }) {
  return (
    <span className="cluster" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <span className="text-muted">{label}</span>
    </span>
  )
}