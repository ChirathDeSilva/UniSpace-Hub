export default function InputField({
  id,
  label,
  error,
  className = '',
  ...props
}) {
  const hasError = Boolean(error)

  return (
    <div className={`field ${className}`.trim()}>
      {label ? <label htmlFor={id}>{label}</label> : null}
      <input id={id} aria-invalid={hasError} aria-describedby={hasError ? `${id}-error` : undefined} {...props} />
      {hasError ? (
        <p className="field-error" id={`${id}-error`} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}