import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowLeft,
  ArrowRight,
  BatteryFull,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Fuel,
  Package,
  Paperclip,
  Signal,
  Trash2,
  Truck,
  Wifi,
  X,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import type { SourceKey } from '../lib/calc';

export const cx = (...a: (string | false | null | undefined)[]) => a.filter(Boolean).join(' ');

export const SOURCE_ICON: Record<SourceKey, LucideIcon> = {
  electricity: Zap,
  fuel: Fuel,
  transport: Truck,
  materials: Package,
  waste: Trash2,
};

export function LogoMark({ size = 30 }: { size?: number }) {
  const id = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}b`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5b9bff" />
          <stop offset="1" stopColor="#1d4fd8" />
        </linearGradient>
        <linearGradient id={`${id}g`} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#12a150" />
          <stop offset="1" stopColor="#6fdc8c" />
        </linearGradient>
      </defs>
      <path d="M3 7c8.2 0 12.600 5 12.600 13.600 0 2-.3 3.700-.9 5.400C7.800 24 3 17.700 3 7z" fill={`url(#${id}b)`} />
      <path d="M29 3c0 11.800-4.300 18.800-12.400 22.500C15.700 16.300 19.700 7.400 29 3z" fill={`url(#${id}g)`} />
    </svg>
  );
}

export function Logo({ size = 30, className }: { size?: number; className?: string }) {
  return (
    <span className={cx('inline-flex items-center gap-2 font-extrabold tracking-tight text-ink', className)}>
      <LogoMark size={size} />
      <span style={{ fontSize: size * 0.78 }}>TerraAI</span>
    </span>
  );
}

export function StatusBar() {
  return (
    <div aria-hidden="true" className="hidden sm:flex h-11 shrink-0 items-end justify-between px-8 pb-1 text-ink">
      <span className="text-[13px] font-bold">9:41</span>
      <span className="flex items-center gap-1.5">
        <Signal className="size-3.5" strokeWidth={3} />
        <Wifi className="size-3.5" strokeWidth={3} />
        <BatteryFull className="size-[18px]" strokeWidth={2.4} />
      </span>
    </div>
  );
}

export function Btn({
  children,
  onClick,
  full,
  arrow,
  type = 'button',
  disabled,
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  full?: boolean;
  arrow?: boolean;
  type?: 'button' | 'submit';
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cx(
        'btn-navy inline-flex h-12 items-center justify-center gap-2 rounded-full px-7 text-[14px] font-bold whitespace-nowrap',
        full && 'w-full',
        className,
      )}
    >
      {children}
      {arrow && <ArrowRight className="size-4" strokeWidth={2.6} />}
    </button>
  );
}

export function SoftBtn({
  children,
  onClick,
  full,
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  full?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        'glass inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-[14px] font-bold text-ink transition hover:brightness-[0.97] active:scale-[0.98]',
        full && 'w-full',
        className,
      )}
    >
      {children}
    </button>
  );
}

export function BackLink({ onClick, label = 'Back' }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-12 items-center gap-2 rounded-full px-3 text-[14px] font-bold text-ink hover:bg-white/60"
    >
      <ArrowLeft className="size-4" strokeWidth={2.6} />
      {label}
    </button>
  );
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  label: string;
}) {
  return (
    <div role="tablist" aria-label={label} className="flex gap-2">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(o.value)}
            className={cx(
              'h-11 min-w-0 rounded-full px-3 text-[13px] font-bold transition',
              options.length > 2 ? 'flex-auto' : 'flex-1',
              on ? 'btn-navy' : 'glass text-ink hover:brightness-[0.97]',
            )}
          >
            <span className="block truncate">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

type Opt = string | { value: string; label: string };

export function Select({
  value,
  onChange,
  options,
  label,
  className,
  bare,
}: {
  value: string;
  onChange: (v: string) => void;
  options: Opt[];
  label: string;
  className?: string;
  bare?: boolean;
}) {
  return (
    <div className={cx('relative min-w-0', className)}>
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cx(bare ? 'bare h-7 pr-7' : 'input pr-10', 'cursor-pointer appearance-none truncate')}
      >
        {options.map((o) => {
          const v = typeof o === 'string' ? o : o.value;
          const l = typeof o === 'string' ? o : o.label;
          return (
            <option key={v} value={v}>
              {l}
            </option>
          );
        })}
      </select>
      <ChevronDown
        aria-hidden="true"
        className={cx('pointer-events-none absolute top-1/2 size-4 -translate-y-1/2 text-ink', bare ? 'right-0' : 'right-3.5')}
        strokeWidth={2.6}
      />
    </div>
  );
}

export function NumInput({
  value,
  onChange,
  label,
  className,
  bare,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
  className?: string;
  bare?: boolean;
}) {
  const [focus, setFocus] = useState(false);
  const [raw, setRaw] = useState('');
  return (
    <input
      aria-label={label}
      inputMode="decimal"
      placeholder="0"
      className={cx(bare ? 'bare h-7' : 'input', className)}
      value={focus ? raw : value ? value.toLocaleString('en-IN') : ''}
      onFocus={(e) => {
        setRaw(value ? String(value) : '');
        setFocus(true);
        const el = e.currentTarget;
        requestAnimationFrame(() => el.select());
      }}
      onBlur={() => setFocus(false)}
      onChange={(e) => {
        const v = e.target.value.replace(/[^0-9.]/g, '');
        setRaw(v);
        onChange(parseFloat(v) || 0);
      }}
    />
  );
}

export function Radios<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-x-5">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.value)}
            className="inline-flex h-11 items-center gap-2.5 rounded-full text-[13px] font-semibold text-ink"
          >
            <span
              className={cx(
                'grid size-[18px] place-items-center rounded-full border-2 transition',
                on ? 'border-navy bg-navy' : 'border-[#b9c6e4] bg-white',
              )}
            >
              <span className={cx('size-1.5 rounded-full bg-white transition', on ? 'opacity-100' : 'opacity-0')} />
            </span>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={cx(
        'relative h-7 w-12 shrink-0 rounded-full transition',
        on ? 'bg-navy' : 'bg-[#cdd8f0]',
      )}
    >
      <span
        className={cx(
          'absolute top-1 left-1 size-5 rounded-full bg-white shadow transition-transform',
          on && 'translate-x-5',
        )}
      />
    </button>
  );
}

export function Upload({ label, file, onFile }: { label: string; file: string; onFile: (name: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div>
      <input
        ref={ref}
        type="file"
        accept="image/*,application/pdf"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f.name);
          e.target.value = '';
        }}
      />
      {file ? (
        <div className="glass flex h-12 items-center gap-2.5 rounded-full pr-1.5 pl-4">
          <Paperclip className="size-4 shrink-0 text-sky" />
          <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-ink">{file}</span>
          <button
            type="button"
            aria-label={`Remove ${file}`}
            onClick={() => onFile('')}
            className="grid size-9 shrink-0 place-items-center rounded-full text-ink-soft hover:bg-sky-soft"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <SoftBtn full onClick={() => ref.current?.click()}>
          <Paperclip className="size-4 text-ink-soft" />
          {label}
        </SoftBtn>
      )}
    </div>
  );
}

export function Page({ children, footer, className }: { children: ReactNode; footer?: ReactNode; className?: string }) {
  return (
    <div className="absolute inset-0 flex flex-col">
      <div className={cx('no-scrollbar relative flex-1 overflow-x-hidden overflow-y-auto px-6 pt-[max(0.75rem,env(safe-area-inset-top))] pb-6 sm:pt-1', className)}>
        {children}
      </div>
      {footer && <div className="shrink-0 px-6 pt-2 pb-[max(1.25rem,env(safe-area-inset-bottom))]">{footer}</div>}
    </div>
  );
}

export function CircleBtn({
  onClick,
  label,
  children,
  dot,
}: {
  onClick: () => void;
  label: string;
  children: ReactNode;
  dot?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="glass relative grid size-11 shrink-0 place-items-center rounded-full text-ink transition hover:brightness-[0.97] active:scale-95"
    >
      {children}
      {dot && <span className="absolute top-2.5 right-2.5 size-2 rounded-full bg-danger ring-2 ring-white" />}
    </button>
  );
}

export function PageHead({
  title,
  sub,
  onBack,
  right,
}: {
  title: string;
  sub?: string;
  onBack?: () => void;
  right?: ReactNode;
}) {
  if (onBack) {
    return (
      <header className="mb-5 grid grid-cols-[44px_1fr_44px] items-center">
        <CircleBtn onClick={onBack} label="Go back">
          <ChevronLeft className="size-5" strokeWidth={2.6} />
        </CircleBtn>
        <h1 className="truncate px-2 text-center text-[18px] font-extrabold tracking-tight">{title}</h1>
        <div className="justify-self-end">{right}</div>
      </header>
    );
  }
  return (
    <header className="mb-5 flex items-start justify-between gap-3 pt-2">
      <div className="min-w-0">
        <h1 className="text-[26px] leading-tight font-extrabold tracking-tight">{title}</h1>
        {sub && <p className="mt-1 text-[13px] text-ink-soft">{sub}</p>}
      </div>
      {right}
    </header>
  );
}

export function IconTile({
  icon: Icon,
  color = '#2e6bf6',
  size = 44,
}: {
  icon: LucideIcon;
  color?: string;
  size?: number;
}) {
  return (
    <span
      className="grid shrink-0 place-items-center rounded-2xl"
      style={{ width: size, height: size, background: `${color}1f`, color }}
    >
      <Icon style={{ width: size * 0.45, height: size * 0.45 }} strokeWidth={2.2} />
    </span>
  );
}

export function MenuRow({
  icon: Icon,
  label,
  hint,
  onClick,
  danger,
}: {
  icon: LucideIcon;
  label: string;
  hint?: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        'flex min-h-[52px] w-full items-center gap-3.5 rounded-2xl px-3 text-left transition hover:bg-sky-soft/60',
        danger ? 'text-danger' : 'text-ink',
      )}
    >
      <Icon className="size-[19px] shrink-0" strokeWidth={2.1} />
      <span className="min-w-0 flex-1">
        <span className="block text-[14px] font-bold">{label}</span>
        {hint && <span className="block truncate text-[12px] font-medium text-ink-soft">{hint}</span>}
      </span>
      {!danger && <ChevronRight className="size-4 shrink-0 text-ink-mute" strokeWidth={2.4} />}
    </button>
  );
}

export function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const root = typeof document !== 'undefined' ? document.getElementById('overlay-root') : null;
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCloseRef.current();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  if (!root) return null;
  return createPortal(
    <div className="pointer-events-auto absolute inset-0 flex flex-col justify-end">
      <button type="button" aria-label="Close" tabIndex={-1} onClick={onClose} className="absolute inset-0 cursor-default bg-navy/35 backdrop-blur-[3px]" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="no-scrollbar relative max-h-[86%] overflow-y-auto rounded-t-[34px] bg-[#f6f9ff] px-6 pt-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-[0_-20px_50px_-20px_rgba(11,21,53,0.45)]"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-[19px] font-extrabold tracking-tight">{title}</h2>
          <button
            ref={closeRef}
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="glass grid size-11 shrink-0 place-items-center rounded-full text-ink"
          >
            <X className="size-4" strokeWidth={2.6} />
          </button>
        </div>
        {children}
      </div>
    </div>,
    root,
  );
}

export function Labeled({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <div>
      <p className="mb-1.5 text-[12.5px] font-semibold text-ink-soft">{label}</p>
      {children}
      {hint && <p className="mt-1.5 text-[12px] font-medium text-danger">{hint}</p>}
    </div>
  );
}
