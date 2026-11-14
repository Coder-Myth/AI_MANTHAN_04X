import { useState } from 'react';
import { ArrowDown, ChevronRight, ListChecks, SlidersHorizontal } from 'lucide-react';
import { SOURCES, SOURCE_KEYS, fmt, monthLabels, pctOf, projection, recommended, scopeOf } from '../lib/calc';
import { useApp } from '../lib/store';
import { Donut, LineChart } from '../components/charts';
import { IconTile, Page, PageHead, Segmented, SOURCE_ICON, cx } from '../components/ui';
import { BellBtn } from './Home';

type Tab = 'overview' | 'breakdown' | 'trends';
const RANGES = [
  { label: '3M', n: 3 },
  { label: '6M', n: 6 },
  { label: '1Y', n: 12 },
];

export function Results() {
  const { result, inputs, actions, applied, go } = useApp();
  const [tab, setTab] = useState<Tab>('overview');
  const [range, setRange] = useState(6);

  const parts = SOURCE_KEYS.map((k) => ({ key: k, label: SOURCES[k].label, color: SOURCES[k].color, value: result.bySource[k] })).filter(
    (p) => p.value > 0,
  );
  const sorted = [...parts].sort((a, b) => b.value - a.value);
  const top = sorted[0];

  const done = actions.filter((a) => applied.includes(a.id));
  const plan = done.length ? done : recommended(actions);
  const planName = done.length ? 'applied' : 'recommended';
  const proj = (n: number) => projection(result.total, plan, n);
  const p = proj(range);
  const base = result.total / 12;
  const last = p.withPlan[p.withPlan.length - 1];
  const drop = base ? ((base - last) / base) * 100 : 0;
  const yearly = proj(12);
  const yearCut = yearly.baseline.reduce((s, v) => s + v, 0) - yearly.withPlan.reduce((s, v) => s + v, 0);

  const series = (n: number, d: ReturnType<typeof projection>) => [
    { name: 'Current path', values: d.baseline, color: '#9fb2da', dashed: true },
    { name: `With ${planName} actions`, values: d.withPlan, color: '#2e6bf6', area: true, dots: n <= 6 },
  ];

  return (
    <Page>
      <PageHead title="Results" sub={`Your ${inputs.business.period} carbon footprint`} right={<BellBtn />} />
      <Segmented
        label="Results view"
        value={tab}
        onChange={setTab}
        options={[
          { value: 'overview', label: 'Overview' },
          { value: 'breakdown', label: 'Breakdown' },
          { value: 'trends', label: 'Trends' },
        ]}
      />

      {result.total === 0 && (
        <div className="glass mt-4 rounded-[26px] p-5 text-center">
          <p className="text-[15px] font-extrabold">No activity data yet</p>
          <p className="mt-1 text-[13px] text-ink-soft">Add electricity, fuel or material use in Inputs to see your footprint.</p>
        </div>
      )}

      {tab === 'overview' && result.total > 0 && (
        <div className="mt-4 space-y-3">
          <section className="glass rounded-[26px] p-4">
            <h2 className="text-[14px] font-extrabold">Emissions by Source</h2>
            <div className="mt-3 flex items-center gap-4">
              <div className="relative">
                <Donut parts={parts} total={result.total} />
                <div className="absolute inset-0 grid place-content-center text-center">
                  <p className="text-[19px] leading-none font-extrabold tracking-tight tabular-nums">{fmt(result.total)}</p>
                  <p className="mt-0.5 text-[10px] font-bold text-ink-soft">tCO₂e</p>
                </div>
              </div>
              <ul className="min-w-0 flex-1 space-y-2">
                {parts.map((s) => (
                  <li key={s.key} className="flex items-center gap-2 text-[13px]">
                    <span className="size-2.5 shrink-0 rounded-full" style={{ background: s.color }} />
                    <span className="min-w-0 flex-1 truncate font-semibold">{s.label}</span>
                    <span className="font-extrabold tabular-nums">{pctOf(s.value, result.total)}%</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="glass rounded-[26px] p-4">
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="text-[14px] font-extrabold">Monthly emissions (tCO₂e)</h2>
              <span className="text-[11px] font-semibold text-ink-soft">next 6 months</span>
            </div>
            <div className="mt-2">
              <LineChart labels={monthLabels(6)} series={series(6, proj(6))} />
            </div>
            <Legend planName={planName} />
          </section>

          {top && (
            <section className="glass-leaf relative overflow-hidden rounded-[24px] p-4 pr-24">
              <p className="text-[12px] font-bold text-leaf">Largest source</p>
              <p className="text-[16px] font-extrabold">{top.label}</p>
              <p className="mt-0.5 text-[12.5px] leading-snug font-medium text-ink-soft">
                Contributes {pctOf(top.value, result.total)}% of your total emissions.
              </p>
              <img src="/img/plants.webp" alt="" className="absolute -right-2 -bottom-2 w-24" />
            </section>
          )}
        </div>
      )}

      {tab === 'breakdown' && result.total > 0 && (
        <div className="mt-4 space-y-3">
          <ul className="space-y-2.5">
            {sorted.map((s) => (
              <li key={s.key} className="glass rounded-[22px] p-3.5">
                <div className="flex items-center gap-3">
                  <IconTile icon={SOURCE_ICON[s.key]} color={s.color} size={40} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-extrabold">{s.label}</p>
                    <p className="text-[11.5px] font-semibold text-ink-soft">Scope {scopeOf(s.key, inputs)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[15px] font-extrabold tabular-nums">{fmt(s.value)}</p>
                    <p className="text-[11px] font-semibold text-ink-soft">tCO₂e · {pctOf(s.value, result.total)}%</p>
                  </div>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-line">
                  <div className="h-full rounded-full" style={{ width: `${(s.value / sorted[0].value) * 100}%`, background: s.color }} />
                </div>
              </li>
            ))}
          </ul>
          <section className="glass rounded-[26px] p-4">
            <h2 className="text-[14px] font-extrabold">By scope</h2>
            <div className="mt-3 flex h-3 overflow-hidden rounded-full bg-line">
              {[result.scope1, result.scope2, result.scope3].map((v, i) => (
                <span key={i} style={{ width: `${(v / result.total) * 100}%`, background: ['#f4b63f', '#2e6bf6', '#2fbf71'][i] }} />
              ))}
            </div>
            <dl className="mt-3 grid grid-cols-3 gap-2">
              {[
                ['Scope 1', 'Direct fuel', result.scope1, '#f4b63f'],
                ['Scope 2', 'Electricity', result.scope2, '#2e6bf6'],
                ['Scope 3', 'Supply chain', result.scope3, '#2fbf71'],
              ].map(([name, hint, v, c]) => (
                <div key={name as string}>
                  <dt className="flex items-center gap-1.5 text-[11.5px] font-bold text-ink-soft">
                    <span className="size-2 rounded-full" style={{ background: c as string }} />
                    {name}
                  </dt>
                  <dd className="text-[16px] font-extrabold tabular-nums">{fmt(v as number)}</dd>
                  <dd className="text-[11px] font-medium text-ink-soft">{hint}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      )}

      {tab === 'trends' && result.total > 0 && (
        <div className="mt-4 space-y-3">
          <section className="glass rounded-[26px] p-4">
            <h2 className="text-[14px] font-extrabold">Carbon Trend</h2>
            <p className="mt-1.5 inline-flex h-8 items-center gap-0.5 rounded-full bg-leaf-soft px-3 text-[17px] font-extrabold text-leaf">
              <ArrowDown className="size-4" strokeWidth={3} />
              {fmt(drop)}%
            </p>
            <div className="mt-2">
              <LineChart labels={monthLabels(range)} series={series(range, p)} height={150} />
            </div>
            <div role="tablist" aria-label="Time range" className="mt-2 flex gap-2">
              {RANGES.map((r) => (
                <button
                  key={r.n}
                  type="button"
                  role="tab"
                  aria-selected={range === r.n}
                  onClick={() => setRange(r.n)}
                  className={cx(
                    'h-11 flex-1 rounded-full text-[12.5px] font-extrabold transition',
                    range === r.n ? 'btn-navy' : 'bg-white/80 text-ink shadow-[inset_0_0_0_1px_var(--color-line)]',
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <Legend planName={planName} />
          </section>

          <section className="glass grid grid-cols-3 gap-2 rounded-[26px] p-4">
            {[
              ['Today', fmt(base), 't / month'],
              [`In ${range} mo`, fmt(last), 't / month'],
              ['First year', fmt(yearCut), 't avoided'],
            ].map(([k, v, u]) => (
              <div key={k}>
                <p className="text-[11.5px] font-bold text-ink-soft">{k}</p>
                <p className="text-[18px] font-extrabold tracking-tight tabular-nums">{v}</p>
                <p className="text-[11px] font-medium text-ink-soft">{u}</p>
              </div>
            ))}
          </section>
          <p className="px-1 text-[12px] leading-snug text-ink-soft">
            A projection, not a measurement: it assumes your activity stays level and the {plan.length} {planName}{' '}
            {plan.length === 1 ? 'action starts' : 'actions start'} two months apart.
          </p>
        </div>
      )}

      <div className="mt-3 grid grid-cols-2 gap-2.5">
        {(
          [
            ['View actions', 'Ways to cut emissions', ListChecks, 'actions'],
            ['Try What-If', 'Test a reduction', SlidersHorizontal, 'whatif'],
          ] as const
        ).map(([t, s, Icon, to]) => (
          <button
            key={to}
            type="button"
            onClick={() => go(to)}
            className="glass flex items-center gap-2 rounded-[22px] p-3.5 text-left transition hover:brightness-[0.97] active:scale-[0.98]"
          >
            <span className="min-w-0 flex-1">
              <Icon className="size-5 text-sky" strokeWidth={2.2} />
              <span className="mt-2 block text-[13.5px] font-extrabold">{t}</span>
              <span className="block truncate text-[11.5px] font-medium text-ink-soft">{s}</span>
            </span>
            <ChevronRight className="size-4 shrink-0 text-ink-mute" strokeWidth={2.4} />
          </button>
        ))}
      </div>
    </Page>
  );
}

function Legend({ planName }: { planName: string }) {
  return (
    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11.5px] font-semibold text-ink-soft">
      <span className="inline-flex items-center gap-1.5">
        <span className="h-0.5 w-4 rounded-full bg-sky" />
        With {planName} actions
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="w-4 border-t-2 border-dashed border-[#9fb2da]" />
        Current path
      </span>
    </div>
  );
}
