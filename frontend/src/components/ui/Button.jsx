export default function Button({
  children,
  variant = 'primary',
  type = 'button',
  className = '',
  ...props
}) {
  const normalizedVariant = ['primary', 'secondary', 'ghost'].includes(variant)
    ? variant
    : 'primary'

  return (
    <button
      type={type}
      className={`btn btn-${normalizedVariant} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  )
}