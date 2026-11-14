import { ArrowDown, ArrowUp, Bell, Check, ChevronRight, ClipboardPen, ListChecks, PieChart, SlidersHorizontal, type LucideIcon } from 'lucide-react';
import { SOURCES, SOURCE_KEYS, fmt } from '../lib/calc';
import { useApp, type Route } from '../lib/store';
import { CircleBtn, Logo, Page, cx } from '../components/ui';

export function DeltaChip({ now, prev }: { now: number; prev: number | null }) {
  if (!prev) {
    return <span className="inline-flex h-7 items-center rounded-full bg-sky-soft px-2.5 text-[12px] font-extrabold text-sky">Baseline</span>;
  }
  const d = ((now - prev) / prev) * 100;
  const down = d <= 0;
  const Icon = down ? ArrowDown : ArrowUp;
  return (
    <span
      className={cx(
        'inline-flex h-7 items-center gap-0.5 rounded-full px-2.5 text-[13px] font-extrabold',
        down ? 'bg-leaf-soft text-leaf' : 'bg-sun-soft text-sun-ink',
      )}
    >
      <Icon className="size-3.5" strokeWidth={3} />
      {fmt(Math.abs(d))}%
    </span>
  );
}

export function BellBtn() {
  const { go, notes, prefs } = useApp();
  return (
    <CircleBtn onClick={() => go('notifications')} label="Notifications" dot={prefs.alerts && notes.some((n) => !n.read)}>
      <Bell className="size-[18px]" strokeWidth={2.3} />
    </CircleBtn>
  );
}

const QUICK: { label: string; icon: LucideIcon; to: Route; tab?: boolean }[] = [
  { label: 'Update Data', icon: ClipboardPen, to: 'inputs', tab: true },
  { label: 'Actions', icon: ListChecks, to: 'actions' },
  { label: 'What-If', icon: SlidersHorizontal, to: 'whatif' },
  { label: 'Results', icon: PieChart, to: 'results', tab: true },
];

export function Home() {
  const { inputs, result, previousTotal, applied, actions, go, reset, prefs } = useApp();
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const done = actions.filter((a) => applied.includes(a.id));
  const cut = done.reduce((s, a) => s + a.tco2, 0);
  const bars = SOURCE_KEYS.map((k) => ({ k, v: result.bySource[k] }))
    .filter((b) => b.v > 0)
    .sort((a, b) => a.v - b.v);
  const max = bars.length ? bars[bars.length - 1].v : 1;

  return (
    <Page>
      <div className="flex items-center justify-between pt-1">
        <Logo size={26} />
        <BellBtn />
      </div>

      <div className="mt-4">
        <p className="text-[16px] font-medium text-ink-soft">{greet},</p>
        <h1 className="text-[23px] leading-tight font-extrabold tracking-tight">{inputs.business.name} 👋</h1>
        {inputs.business.city && <p className="mt-0.5 text-[12.5px] font-medium text-ink-soft">{inputs.business.city}</p>}
      </div>

      <section className="glass relative mt-4 overflow-hidden rounded-[28px] p-5 pb-6">
        <p className="text-[13.5px] font-extrabold">Your Carbon Footprint</p>
        <p className="mt-1.5 leading-none">
          <span className={cx('font-extrabold tracking-tight tabular-nums', fmt(result.total).length > 7 ? 'text-[26px]' : 'text-[36px]')}>
            {fmt(result.total)}
          </span>{' '}
          <span className="text-[17px] font-extrabold">tCO₂e</span>
        </p>
        <div className="mt-3 flex items-center gap-2">
          <DeltaChip now={result.total} prev={previousTotal} />
          <span className="text-[11.5px] font-semibold text-ink-soft">{previousTotal ? 'vs previous data' : inputs.business.period}</span>
        </div>

        <img src="/img/leaf.webp" alt="" className="float-slow absolute top-3 right-4 w-11 rotate-12" />
        <div aria-hidden="true" className="absolute right-5 bottom-0 flex items-end gap-[5px]">
          {bars.map((b, i) => (
            <span
              key={b.k}
              title={SOURCES[b.k].label}
              className="bar3d w-[15px] origin-bottom"
              style={{ height: 14 + 62 * Math.sqrt(b.v / max), animation: `grow 0.7s ${0.1 + i * 0.08}s cubic-bezier(.2,.8,.2,1) both` }}
            />
          ))}
        </div>
      </section>

      {prefs.tips && (
        <button
          type="button"
          onClick={() => go('actions')}
          className="glass-leaf mt-3 flex w-full items-center gap-3.5 rounded-[24px] p-4 text-left transition hover:brightness-[0.98] active:scale-[0.99]"
        >
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-gradient-to-b from-[#3fd07f] to-[#0f8f47] text-white shadow-[0_10px_16px_-8px_rgba(15,143,71,0.8)]">
            <Check className="size-5" strokeWidth={3.2} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[14px] font-extrabold">{done.length ? "You're on track!" : 'Your baseline is ready'}</span>
            <span className="block text-[12.5px] leading-snug font-medium text-ink-soft">
              {done.length
                ? `${done.length} ${done.length === 1 ? 'action' : 'actions'} applied — about ${fmt(cut)} tCO₂e less each year.`
                : 'Pick an action to start reducing your carbon footprint.'}
            </span>
          </span>
          <ChevronRight className="size-4 shrink-0 text-leaf" strokeWidth={2.6} />
        </button>
      )}

      <div className="mt-3 grid grid-cols-3 gap-2.5">
        {[result.scope1, result.scope2, result.scope3].map((v, i) => (
          <div key={i} className="glass min-w-0 rounded-[20px] px-3.5 py-3">
            <p className={cx('truncate leading-tight font-extrabold tracking-tight tabular-nums', fmt(v).length > 6 ? 'text-[15px]' : 'text-[19px]')}>
              {fmt(v)}
            </p>
            <p className="mt-0.5 text-[11.5px] font-semibold text-ink-soft">Scope {i + 1}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-5 text-[16px] font-extrabold tracking-tight">Quick Actions</h2>
      <div className="mt-3 grid grid-cols-4 gap-2.5">
        {QUICK.map((q) => (
          <button
            key={q.label}
            type="button"
            onClick={() => (q.tab ? reset(q.to) : go(q.to))}
            className="glass flex h-[76px] flex-col items-center justify-center gap-2 rounded-[20px] text-[10.5px] font-bold text-ink transition hover:brightness-[0.97] active:scale-95"
          >
            <q.icon className="size-5 text-sky" strokeWidth={2.2} />
            {q.label}
          </button>
        ))}
      </div>
    </Page>
  );
}
