import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';
import Link from 'next/link';
import { Icon, type IconName } from './icons';

/* ── Button ──────────────────────────────────────────────────────────────── */

type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonOwnProps {
  variant?: ButtonVariant | undefined;
  size?: ButtonSize | undefined;
  loading?: boolean | undefined;
  block?: boolean | undefined;
  iconLeft?: IconName | undefined;
  iconRight?: IconName | undefined;
}

const btnClass = (v: ButtonVariant, s: ButtonSize, block?: boolean) =>
  ['btn', `btn--${v}`, s !== 'md' && `btn--${s}`, block && 'btn--block'].filter(Boolean).join(' ');

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  block,
  iconLeft,
  iconRight,
  children,
  className,
  disabled,
  ...rest
}: ButtonOwnProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={[btnClass(variant, size, block), className].filter(Boolean).join(' ')}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? <Icon name="loader" size={16} className="spin" /> : iconLeft ? <Icon name={iconLeft} size={16} /> : null}
      {children}
      {iconRight && !loading ? <Icon name={iconRight} size={16} /> : null}
    </button>
  );
}

interface ButtonLinkProps extends ButtonOwnProps {
  href: string;
  children: ReactNode;
  className?: string | undefined;
  target?: string | undefined;
  rel?: string | undefined;
}

export function ButtonLink({
  href,
  variant = 'primary',
  size = 'md',
  block,
  iconLeft,
  iconRight,
  children,
  className,
  target,
  rel,
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      target={target}
      rel={rel}
      className={[btnClass(variant, size, block), className].filter(Boolean).join(' ')}
    >
      {iconLeft ? <Icon name={iconLeft} size={16} /> : null}
      {children}
      {iconRight ? <Icon name={iconRight} size={16} /> : null}
    </Link>
  );
}

/* ── Card ────────────────────────────────────────────────────────────────── */

export function Card({
  children,
  padding = 20,
  className,
  style,
}: {
  children: ReactNode;
  padding?: number | string | undefined;
  className?: string | undefined;
  style?: React.CSSProperties | undefined;
}) {
  return (
    <div
      className={className}
      style={{
        background: 'var(--white)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ── Page header ─────────────────────────────────────────────────────────── */

export function PageHeader({
  title,
  eyebrow,
  description,
  actions,
  breadcrumb,
}: {
  title: string;
  eyebrow?: string | undefined;
  description?: string | undefined;
  actions?: ReactNode | undefined;
  breadcrumb?: ReactNode | undefined;
}) {
  return (
    <div style={{ marginBottom: 24 }}>
      {breadcrumb}
      <div className="page-header">
        <div>
          {eyebrow && <div className="page-header__eyebrow">{eyebrow}</div>}
          <h1>{title}</h1>
          {description && <p>{description}</p>}
        </div>
        {actions && <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{actions}</div>}
      </div>
    </div>
  );
}

/* ── Badge ───────────────────────────────────────────────────────────────── */

export type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'brand';

export function Badge({
  children,
  tone = 'neutral',
  icon,
}: {
  children: ReactNode;
  tone?: BadgeTone | undefined;
  icon?: IconName | undefined;
}) {
  return (
    <span className={`badge badge--${tone}`}>
      {icon && <Icon name={icon} size={12} />}
      {children}
    </span>
  );
}

export const VENDOR_STATUS_TONE: Record<string, { tone: BadgeTone; label: string }> = {
  PENDING: { tone: 'warning', label: 'Pending review' },
  APPROVED: { tone: 'success', label: 'Approved' },
  REJECTED: { tone: 'danger', label: 'Rejected' },
  SUSPENDED: { tone: 'neutral', label: 'Suspended' },
};

export const INQUIRY_STATUS_TONE: Record<string, { tone: BadgeTone; label: string }> = {
  NEW: { tone: 'warning', label: 'New' },
  CONTACTED: { tone: 'info', label: 'Contacted' },
  CONFIRMED: { tone: 'success', label: 'Confirmed' },
  CLOSED: { tone: 'neutral', label: 'Closed' },
};

/* ── Callout ─────────────────────────────────────────────────────────────── */

export function Callout({
  children,
  tone = 'info',
  icon,
}: {
  children: ReactNode;
  tone?: 'info' | 'warning' | 'success' | 'danger' | undefined;
  icon?: IconName | undefined;
}) {
  const fallback: Record<string, IconName> = {
    info: 'message-circle',
    warning: 'alert-triangle',
    success: 'check-circle',
    danger: 'alert-triangle',
  };
  return (
    <div className={`callout callout--${tone}`}>
      <Icon name={icon ?? fallback[tone]!} size={18} />
      <div>{children}</div>
    </div>
  );
}

/* ── Stat card ───────────────────────────────────────────────────────────── */

export function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: ReactNode;
  icon?: IconName | undefined;
}) {
  return (
    <div className="stat-card">
      {icon && (
        <div className="stat-card__icon">
          <Icon name={icon} size={18} />
        </div>
      )}
      <div className="stat-card__value">{value}</div>
      <div className="stat-card__label">{label}</div>
    </div>
  );
}

/* ── Stars ───────────────────────────────────────────────────────────────── */

export function Stars({
  rating,
  size = 15,
  count,
  showValue = false,
}: {
  rating: number;
  size?: number | undefined;
  count?: number | undefined;
  showValue?: boolean | undefined;
}) {
  const rounded = Math.round(rating);
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <span
        style={{ display: 'inline-flex', gap: 1, color: 'var(--star)' }}
        aria-label={`${rating.toFixed(1)} out of 5`}
      >
        {Array.from({ length: 5 }, (_, i) => (
          <Icon key={i} name={i < rounded ? 'star-filled' : 'star'} size={size} strokeWidth={1.5} />
        ))}
      </span>
      {(showValue || count !== undefined) && (
        <span style={{ fontSize: size - 2, color: 'var(--text-sec)', fontWeight: 500 }}>
          {showValue && rating.toFixed(1)}
          {count !== undefined && (
            <span style={{ color: 'var(--text-muted)' }}> ({count})</span>
          )}
        </span>
      )}
    </span>
  );
}

/* ── Form controls ──────────────────────────────────────────────────────── */

export function Field({
  label,
  htmlFor,
  required,
  hint,
  error,
  children,
}: {
  label?: string | undefined;
  htmlFor?: string | undefined;
  required?: boolean | undefined;
  hint?: string | undefined;
  error?: string | undefined;
  children: ReactNode;
}) {
  return (
    <div className="field-group">
      {label && (
        <label className="label" htmlFor={htmlFor}>
          {label}
          {required && <span className="req" aria-hidden="true">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <span className="hint">{hint}</span>}
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean | undefined;
  icon?: IconName | undefined;
}

export function Input({ invalid, icon, className, ...rest }: InputProps) {
  const input = (
    <input
      className={['input', className].filter(Boolean).join(' ')}
      aria-invalid={invalid || undefined}
      {...rest}
    />
  );
  if (!icon) return input;
  return (
    <span className="input-wrap">
      <Icon name={icon} size={16} />
      {input}
    </span>
  );
}

export function Textarea({
  invalid,
  className,
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return (
    <textarea
      className={['textarea', className].filter(Boolean).join(' ')}
      aria-invalid={invalid || undefined}
      {...rest}
    />
  );
}

export function Select({
  invalid,
  className,
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }) {
  return (
    <span className="input-wrap" style={{ display: 'block' }}>
      <select
        className={['select', className].filter(Boolean).join(' ')}
        aria-invalid={invalid || undefined}
        style={{ paddingRight: 34 }}
        {...rest}
      >
        {children}
      </select>
      <Icon
        name="chevron-down"
        size={16}
        style={{ position: 'absolute', right: 11, left: 'auto', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}
      />
    </span>
  );
}

/* ── Empty state ────────────────────────────────────────────────────────── */

export function EmptyState({
  icon = 'inbox',
  title,
  body,
  action,
}: {
  icon?: IconName | undefined;
  title: string;
  body?: string | undefined;
  action?: ReactNode | undefined;
}) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">
        <Icon name={icon} size={22} />
      </div>
      <h3>{title}</h3>
      {body && <p>{body}</p>}
      {action}
    </div>
  );
}

/* ── Loading ────────────────────────────────────────────────────────────── */

export function Spinner({ size = 18 }: { size?: number }) {
  return <Icon name="loader" size={size} className="spin" />;
}

export function LoadingBlock({ label = 'Loading…' }: { label?: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        padding: '64px 20px',
        color: 'var(--text-sec)',
        fontSize: 14,
      }}
    >
      <Spinner />
      {label}
    </div>
  );
}

/* ── Pagination ────────────────────────────────────────────────────────── */

function pageItems(current: number, total: number): (number | '…')[] {
  const items = Array.from({ length: total }, (_, i) => i + 1).filter(
    (p) => Math.abs(p - current) <= 2 || p === 1 || p === total,
  );
  return items.reduce<(number | '…')[]>((acc, p, i) => {
    if (i > 0 && (items[i - 1] as number) + 1 < p) acc.push('…');
    acc.push(p);
    return acc;
  }, []);
}

export function Pagination({
  page,
  totalPages,
  hrefFor,
  onPage,
}: {
  page: number;
  totalPages: number;
  hrefFor?: ((p: number) => string) | undefined;
  onPage?: ((p: number) => void) | undefined;
}) {
  if (totalPages <= 1) return null;

  const cls = (active: boolean) => `btn btn--sm ${active ? 'btn--primary' : 'btn--ghost'}`;
  const items = pageItems(page, totalPages);

  const cell = (p: number, label?: ReactNode, active = false) => {
    const content = label ?? p;
    if (hrefFor) {
      return (
        <Link key={`${p}-${String(label)}`} href={hrefFor(p)} className={cls(active)} aria-current={active ? 'page' : undefined}>
          {content}
        </Link>
      );
    }
    return (
      <button key={`${p}-${String(label)}`} className={cls(active)} onClick={() => onPage?.(p)} aria-current={active ? 'page' : undefined}>
        {content}
      </button>
    );
  };

  return (
    <nav
      aria-label="Pagination"
      style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 32 }}
    >
      {page > 1 && cell(page - 1, <Icon name="chevron-left" size={15} />)}
      {items.map((it, i) =>
        it === '…' ? (
          <span key={`e${i}`} style={{ padding: '0 4px', color: 'var(--text-muted)' }}>
            …
          </span>
        ) : (
          cell(it, undefined, it === page)
        ),
      )}
      {page < totalPages && cell(page + 1, <Icon name="chevron-right" size={15} />)}
    </nav>
  );
}
