import type { CSSProperties } from 'react';
import { ArrowDown, ExternalLink } from 'lucide-react';
import { FACTOR_DEFS, FUELS, GRID_NOTE, SOURCES, VEHICLES, factorOf, fmt, inr, kindLabel, type SourceKey } from '../lib/calc';
import { useApp, type Route } from '../lib/store';
import { Btn, IconTile, Page, PageHead, Segmented, SOURCE_ICON } from '../components/ui';
import { BellBtn } from './Home';

const STEP: Record<string, Route> = { electricity: 'w-electricity', fuel: 'w-fuel', transport: 'w-transport' };

export function WhatIf() {
  const { whatIf, setWhatIf, result, costs, factors, inputs, back, go, startEdit } = useApp();
  const src = whatIf.source;
  const p = whatIf.pct / 100;
  const base = result.bySource[src];
  const cut = base * p;
  const total = result.total - cut;
  const saving = src === 'electricity' ? result.kwh * p * costs.tariff : src === 'fuel' ? result.fuelUnits * p * costs.fuel : result.km * p * costs.km;
  const [startYears, perPoint] = src === 'electricity' ? [1.2, 0.09] : src === 'fuel' ? [0.4, 0.05] : [0.3, 0.025];
  const payback = whatIf.pct > 0 ? startYears + whatIf.pct * perPoint : null;
  const invest = payback ? saving * payback : 0;
  const name = SOURCES[src].label.toLowerCase();

  const mainFuel = [...inputs.fuels].sort((a, b) => b.qty - a.qty)[0];
  const fKey = src === 'electricity' ? 'grid' : src === 'fuel' ? `fuel.${mainFuel?.type ?? 'diesel'}` : `veh.${inputs.transport.vehicle}`;
  const def = FACTOR_DEFS.find((d) => d.key === fKey);
  const custom = factors[fKey] !== undefined && factors[fKey] !== def?.value;
  const fLabel =
    src === 'electricity' ? 'Grid electricity (India)' : src === 'fuel' ? kindLabel(FUELS, mainFuel?.type ?? 'diesel') : kindLabel(VEHICLES, inputs.transport.vehicle);

  return (
    <Page>
      <PageHead title="What-If" onBack={back} right={<BellBtn />} />
      <Segmented
        label="Emission source"
        value={src}
        onChange={(source: SourceKey) => setWhatIf({ source })}
        options={[
          { value: 'electricity', label: 'Electricity' },
          { value: 'fuel', label: 'Fuel' },
          { value: 'transport', label: 'Transport' },
        ]}
      />

      {base <= 0 ? (
        <div className="glass mt-4 flex flex-col items-center rounded-[26px] px-6 py-8 text-center">
          <IconTile icon={SOURCE_ICON[src]} color={SOURCES[src].color} size={52} />
          <p className="mt-3 text-[15px] font-extrabold">No {name} data yet</p>
          <p className="mt-1 text-[13px] leading-snug text-ink-soft">Add your {name} use to test how a reduction changes your footprint.</p>
          <Btn className="mt-4" onClick={() => startEdit(STEP[src])}>
            Add {name} data
          </Btn>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <section className="glass rounded-[26px] p-4">
            <h2 className="text-[15px] font-extrabold">
              Reduce {name} use by {whatIf.pct}%
            </h2>
            <input
              type="range"
              min={0}
              max={50}
              step={1}
              value={whatIf.pct}
              aria-label={`Reduce ${name} use, percent`}
              onChange={(e) => setWhatIf({ pct: Number(e.target.value) })}
              className="range mt-3"
              style={{ '--p': `${whatIf.pct * 2}%` } as CSSProperties}
            />
            <div className="flex justify-between text-[11.5px] font-bold text-ink-soft">
              <span>0%</span>
              <span className="text-[13px] font-extrabold text-ink">{whatIf.pct}%</span>
              <span>50%</span>
            </div>
          </section>

          <section className="glass relative overflow-hidden rounded-[26px] p-4">
            <p className="text-[12.5px] font-bold text-ink-soft">New total footprint</p>
            <div className="mt-1 flex items-end justify-between gap-3">
              <p className="leading-none">
                <span className="text-[32px] font-extrabold tracking-tight tabular-nums">{fmt(total)}</span>{' '}
                <span className="text-[14px] font-extrabold">tCO₂e</span>
              </p>
              <p className="rounded-2xl bg-leaf-soft px-3 py-1.5 text-right text-[12.5px] leading-tight font-extrabold text-leaf">
                <span className="inline-flex items-center gap-0.5">
                  <ArrowDown className="size-3.5" strokeWidth={3} />
                  {fmt(cut)} tCO₂e
                </span>
                <br />
                <span className="font-bold">(−{fmt(result.total ? (cut / result.total) * 100 : 0)}%)</span>
              </p>
            </div>
          </section>

          <section className="glass rounded-[26px] p-4">
            <h2 className="text-[14px] font-extrabold">Financial impact (per year)</h2>
            <dl className="mt-3 grid grid-cols-3 gap-2">
              {[
                ['Investment', inr(invest)],
                ['Annual saving', inr(saving)],
                ['Payback', payback ? `${fmt(payback)} years` : '—'],
              ].map(([k, v]) => (
                <div key={k} className="min-w-0">
                  <dt className="text-[11.5px] font-bold text-ink-soft">{k}</dt>
                  <dd className="truncate text-[15px] font-extrabold tabular-nums">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-[12px] leading-snug text-ink-soft">
              Indicative. Savings use your cost assumptions, and deeper cuts are assumed to take longer to pay back.{' '}
              <button type="button" onClick={() => go('settings')} className="font-bold text-sky hover:underline">
                Edit assumptions
              </button>
            </p>
          </section>

          <section className="glass rounded-[26px] p-4">
            <h2 className="text-[14px] font-extrabold">Source of emission</h2>
            <button type="button" onClick={() => go('factors')} className="mt-2 flex w-full items-center gap-3 rounded-2xl text-left">
              <IconTile icon={SOURCE_ICON[src]} color={src === 'fuel' ? '#d99a1c' : SOURCES[src].color} size={42} />
              <span className="min-w-0 flex-1">
                <span className="block text-[13.5px] font-extrabold">{fLabel}</span>
                <span className="block text-[12px] font-semibold text-ink-soft">
                  {factorOf(factors, fKey)} {def?.unit.replace(/ \/ /, '/')}
                </span>
                <span className="block truncate text-[11.5px] font-medium text-ink-soft">
                  {custom ? 'Custom factor' : src === 'electricity' ? GRID_NOTE : 'Indicative default factor'}
                </span>
              </span>
              <ExternalLink className="size-4 shrink-0 text-sky" strokeWidth={2.3} />
            </button>
          </section>
        </div>
      )}
    </Page>
  );
}
