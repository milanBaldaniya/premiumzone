import { cn } from '@/lib/utils';

const VARIANTS = {
  primary: 'btn-primary',
  gold: 'btn-gold',
  outline: 'btn-outline',
  ghost: 'btn text-primary hover:bg-slate-100',
};

export default function Button({
  as: Comp = 'button',
  variant = 'primary',
  className,
  loading = false,
  children,
  disabled,
  ...props
}) {
  return (
    <Comp className={cn(VARIANTS[variant], className)} disabled={disabled || loading} {...props}>
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </Comp>
  );
}
