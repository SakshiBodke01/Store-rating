import { Loader2 } from 'lucide-react';

export function Button({
  children,
  type = 'button',
  variant = 'primary', // 'primary' | 'secondary' | 'danger'
  size = 'md', // 'sm' | 'md' | 'lg'
  isLoading = false,
  loading = false,
  disabled = false,
  icon: Icon,
  className = '',
  onClick,
  style,
  ...props
}) {
  const isBusy = isLoading || loading;
  const baseClass = 'btn';
  const variantClass = `btn-${variant}`;
  const sizeClass = size === 'sm' ? 'btn-sm' : '';

  return (
    <button
      type={type}
      className={`${baseClass} ${variantClass} ${sizeClass} ${className}`.trim()}
      disabled={disabled || isBusy}
      onClick={onClick}
      style={style}
      {...props}
    >
      {isBusy ? (
        <>
          <Loader2 size={14} className="animate-spin" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          {Icon && <Icon size={16} />}
          {children}
        </>
      )}
    </button>
  );
}
