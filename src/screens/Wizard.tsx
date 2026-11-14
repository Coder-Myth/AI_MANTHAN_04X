import { useEffect, useState, type ReactNode } from 'react';
import { Building2, CalendarDays, Factory, MapPin, Pencil, Plus, Trash2, Users, type LucideIcon } from 'lucide-react';
import {
  FUELS,
  FY,
  INDUSTRIES,
  MATERIALS,
  PERIODS,
  SOURCES,
  VEHICLES,
  WASTES,
  fmt,
  kindLabel,
  kindUnits,
  num,
  periodWord,
  type Basis,
  type FuelEntry,
  type MaterialEntry,
  type Period,
  type SourceKey,
} from '../lib/calc';
import { useApp, type Route } from '../lib/store';
import { BackLink, Btn, IconTile, Labeled, NumInput, Page, PageHead, Radios, Segmented, Select, SOURCE_ICON, Upload, cx } from '../components/ui';

const BASIS: { value: Basis; label: string }[] = [
  { value: 'actual', label: 'Actual (from bills)' },
  { value: 'estimated', label: 'Estimated' },
];

function Step({
  n,
  title,
  sub,
  art,
  children,
  onNext,
  nextLabel = 'Next',
}: {
  n: number;
  title: ReactNode;
  sub: string;
  art: string;
  children: ReactNode;
  onNext: () => void;
  nextLabel?: string;
}) {
  const { editing, back } = useApp();
  return (
    <Page
      footer={
        <div className="flex items-center justify-between">
          <BackLink onClick={back} label={editing ? 'Cancel' : 'Back'} />
          <Btn arrow={!editing} onClick={onNext} className="min-w-[112px]">
            {editing ? 'Save' : nextLabel}
          </Btn>
        </div>
      }
    >
      <div className="relative">
        <div className="flex h-10 items-center gap-3">
          <span className="text-[13px] font-extrabold tabular-nums">{n}/5</span>
          <div
            role="progressbar"
            aria-label="Setup progress"
            aria-valuemin={0}
            aria-valuemax={5}
            aria-valuenow={n}
            className="h-1 w-32 overflow-hidden rounded-full bg-line"
          >
            <div className="h-full rounded-full bg-sky transition-[width] duration-500" style={{ width: `${(n / 5) * 100}%` }} />
          </div>
        </div>
        <img src={art} alt="" className="float-slow absolute top-7 right-0 w-[76px] opacity-90" />
        <h1 className="mt-3 max-w-[72%] text-[25px] leading-[1.15] font-extrabold tracking-tight">{title}</h1>
        <p className="mt-2 max-w-[74%] text-[13px] leading-snug text-ink-soft">{sub}</p>
      </div>
      <div className="mt-5 space-y-3">{children}</div>
    </Page>
  );
}

function useDone(next: Route) {
  const { editing, endEdit, go } = useApp();
  return () => (editing ? endEdit() : go(next));
}

function QtyUnit({
  qty,
  onQty,
  unit,
  units,
  onUnit,
  label,
}: {
  qty: number;
  onQty: (v: number) => void;
  unit: string;
  units: string[];
  onUnit: (v: string) => void;
  label: string;
}) {
  return (
    <div className="input flex items-center gap-3 focus-within:shadow-[0_0_0_2px_var(--color-sky)]">
      <NumInput bare label={label} value={qty} onChange={onQty} className="flex-1" />
      <span className="h-5 w-px shrink-0 bg-line" />
      {units.length > 1 ? (
        <Select bare label={`${label} unit`} value={unit} onChange={onUnit} options={units} className="w-[104px] shrink-0" />
      ) : (
        <span className="shrink-0 text-[14px] font-semibold text-ink-soft">{units[0]}</span>
      )}
    </div>
  );
}

function IconField({ icon: Icon, label, children, hint }: { icon: LucideIcon; label: string; children: ReactNode; hint?: string }) {
  return (
    <div>
      <label className="glass flex items-center gap-3.5 rounded-2xl px-4 py-2.5 focus-within:shadow-[0_0_0_2px_var(--color-sky)]">
        <Icon className="size-[19px] shrink-0 text-sky" strokeWidth={2.1} />
        <span className="min-w-0 flex-1">
          <span className="block text-[11.5px] font-semibold text-ink-soft">{label}</span>
          {children}
        </span>
      </label>
      {hint && <p className="mt-1.5 pl-4 text-[12px] font-semibold text-danger">{hint}</p>}
    </div>
  );
}

/* ---------- 1 · Business ---------- */

export function StepBusiness() {
  const { inputs, saveInputs } = useApp();
  const [d, setD] = useState(inputs.business);
  const [err, setErr] = useState('');
  const done = useDone('w-electricity');
  const next = () => {
    if (!d.name.trim()) return setErr('Add your business name to continue.');
    saveInputs({ business: { ...d, name: d.name.trim() } });
    done();
  };
  return (
    <Step
      n={1}
      title={
        <>
          Tell us about
          <br />
          your business
        </>
      }
      sub="This helps us calculate your carbon footprint accurately."
      art="/img/building.webp"
      onNext={next}
    >
      <IconField icon={Building2} label="Business Name" hint={err}>
        <input
          className="bare h-7"
          aria-label="Business name"
          value={d.name}
          onChange={(e) => {
            setD({ ...d, name: e.target.value });
            setErr('');
          }}
        />
      </IconField>
      <IconField icon={Factory} label="Industry Type">
        <Select bare label="Industry type" value={d.industry} onChange={(v) => setD({ ...d, industry: v })} options={INDUSTRIES} />
      </IconField>
      <IconField icon={MapPin} label="City & Location">
        <input className="bare h-7" aria-label="City and location" value={d.city} onChange={(e) => setD({ ...d, city: e.target.value })} />
      </IconField>
      <IconField icon={Users} label="Number of Employees">
        <NumInput bare label="Number of employees" value={d.employees} onChange={(v) => setD({ ...d, employees: Math.round(v) })} />
      </IconField>
      <IconField icon={CalendarDays} label="Reporting Period">
        <Select bare label="Reporting period" value={d.period} onChange={(v) => setD({ ...d, period: v })} options={FY} />
      </IconField>
    </Step>
  );
}

/* ---------- 2 · Electricity ---------- */

const CATS: { key: SourceKey; route: Route }[] = [
  { key: 'electricity', route: 'w-electricity' },
  { key: 'fuel', route: 'w-fuel' },
  { key: 'transport', route: 'w-transport' },
  { key: 'materials', route: 'w-materials' },
  { key: 'waste', route: 'w-materials' },
];

export function StepElectricity() {
  const { inputs, saveInputs, editing, go } = useApp();
  const [d, setD] = useState(inputs.electricity);
  const done = useDone('w-fuel');
  return (
    <Step
      n={2}
      title="Activity Inputs"
      sub="Enter details manually or upload your bills."
      art="/img/bolt.webp"
      onNext={() => {
        saveInputs({ electricity: d });
        done();
      }}
    >
      {!editing && (
        <div className="grid grid-cols-5 gap-2">
          {CATS.map((c) => {
            const Icon = SOURCE_ICON[c.key];
            const on = c.key === 'electricity';
            return (
              <button
                key={c.key}
                type="button"
                aria-current={on ? 'step' : undefined}
                onClick={() => {
                  if (on) return;
                  saveInputs({ electricity: d });
                  go(c.route);
                }}
                className={cx(
                  'flex h-[64px] flex-col items-center justify-center gap-1.5 rounded-2xl text-[10px] font-bold transition active:scale-95',
                  on ? 'tile-sky' : 'glass text-ink hover:brightness-[0.97]',
                )}
              >
                <Icon className="size-[18px]" strokeWidth={2.2} />
                {SOURCES[c.key].label}
              </button>
            );
          })}
        </div>
      )}

      <div className="glass space-y-3.5 rounded-[26px] p-4">
        <p className="text-[14px] font-extrabold">Electricity Consumption</p>
        <QtyUnit
          label="Electricity used"
          qty={d.qty}
          onQty={(qty) => setD({ ...d, qty })}
          unit={d.unit}
          units={['kWh', 'MWh']}
          onUnit={(unit) => setD({ ...d, unit })}
        />
        <Labeled label="Period">
          <Select label="Period" value={d.period} onChange={(v) => setD({ ...d, period: v as Period })} options={PERIODS} />
        </Labeled>
        <Radios label="Data basis" value={d.basis} onChange={(basis) => setD({ ...d, basis })} options={BASIS} />
      </div>

      <Upload label="Upload Bill (Image / PDF)" file={d.bill} onFile={(bill) => setD({ ...d, bill })} />
    </Step>
  );
}

/* ---------- 2 · Fuel ---------- */

export function StepFuel() {
  const { inputs, saveInputs } = useApp();
  const [list, setList] = useState<FuelEntry[]>(inputs.fuels);
  const [bill, setBill] = useState(inputs.fuelBill);
  const done = useDone('w-materials');
  const patch = (id: string, p: Partial<FuelEntry>) => setList(list.map((f) => (f.id === id ? { ...f, ...p } : f)));
  return (
    <Step
      n={2}
      title="Fuel Consumption"
      sub="Enter fuel usage details."
      art="/img/pump.webp"
      onNext={() => {
        saveInputs({ fuels: list, fuelBill: bill });
        done();
      }}
    >
      {list.map((f, idx) => (
        <div key={f.id} className="glass space-y-3.5 rounded-[26px] p-4">
          {list.length > 1 && (
            <div className="-mb-1 flex items-center justify-between">
              <p className="text-[14px] font-extrabold">Fuel {idx + 1}</p>
              <button
                type="button"
                aria-label={`Remove fuel ${idx + 1}`}
                onClick={() => setList(list.filter((x) => x.id !== f.id))}
                className="grid size-10 place-items-center rounded-full text-danger hover:bg-danger-soft"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          )}
          <Labeled label="Fuel Type">
            <Select
              label="Fuel type"
              value={f.type}
              onChange={(type) => patch(f.id, { type, unit: kindUnits(FUELS, type)[0] })}
              options={FUELS.map((k) => ({ value: k.id, label: k.label }))}
            />
          </Labeled>
          <Labeled label="Quantity">
            <QtyUnit
              label="Fuel quantity"
              qty={f.qty}
              onQty={(qty) => patch(f.id, { qty })}
              unit={f.unit}
              units={kindUnits(FUELS, f.type)}
              onUnit={(unit) => patch(f.id, { unit })}
            />
          </Labeled>
          <Labeled label="Period">
            <Select label="Period" value={f.period} onChange={(v) => patch(f.id, { period: v as Period })} options={PERIODS} />
          </Labeled>
          <Radios label="Data basis" value={f.basis} onChange={(basis) => patch(f.id, { basis })} options={BASIS} />
        </div>
      ))}

      <button
        type="button"
        onClick={() =>
          setList([...list, { id: `f${Date.now()}`, type: 'petrol', qty: 0, unit: 'Litres', period: 'Monthly', basis: 'actual' }])
        }
        className="glass flex h-12 w-full items-center justify-center gap-2 rounded-full text-[14px] font-bold text-ink transition hover:brightness-[0.97] active:scale-[0.98]"
      >
        <Plus className="size-4 text-sky" strokeWidth={2.8} />
        Add another fuel
      </button>
      <Upload label="Upload Bill (Image / PDF)" file={bill} onFile={setBill} />
    </Step>
  );
}

/* ---------- 3 · Materials & waste ---------- */

export function StepMaterials() {
  const { inputs, saveInputs } = useApp();
  const [list, setList] = useState<MaterialEntry[]>(inputs.materials);
  const [invoice, setInvoice] = useState(inputs.invoice);
  const [waste, setWaste] = useState(inputs.waste);
  const done = useDone('w-transport');
  const patch = (id: string, p: Partial<MaterialEntry>) => setList(list.map((m) => (m.id === id ? { ...m, ...p } : m)));
  return (
    <Step
      n={3}
      title={
        <>
          Materials
          <br />
          and waste
        </>
      }
      sub="Tell us what you purchase and generate."
      art="/img/crate.webp"
      onNext={() => {
        saveInputs({ materials: list, invoice, waste });
        done();
      }}
    >
      {list.map((m, idx) => (
        <div key={m.id} className="glass space-y-3.5 rounded-[26px] p-4">
          <div className="-mb-1 flex min-h-8 items-center justify-between">
            <p className="text-[14px] font-extrabold">{list.length > 1 ? `Raw material ${idx + 1}` : 'Raw materials'}</p>
            {list.length > 1 && (
              <button
                type="button"
                aria-label={`Remove raw material ${idx + 1}`}
                onClick={() => setList(list.filter((x) => x.id !== m.id))}
                className="grid size-10 place-items-center rounded-full text-danger hover:bg-danger-soft"
              >
                <Trash2 className="size-4" />
              </button>
            )}
          </div>
          <Labeled label="Material type">
            <Select label="Material type" value={m.type} onChange={(type) => patch(m.id, { type })} options={MATERIALS.map((k) => ({ value: k.id, label: k.label }))} />
          </Labeled>
          <Labeled label="Quantity">
            <QtyUnit
              label="Material quantity"
              qty={m.qty}
              onQty={(qty) => patch(m.id, { qty })}
              unit={m.unit}
              units={kindUnits(MATERIALS, m.type)}
              onUnit={(unit) => patch(m.id, { unit })}
            />
          </Labeled>
          <Labeled label="Period">
            <Select label="Period" value={m.period} onChange={(v) => patch(m.id, { period: v as Period })} options={PERIODS} />
          </Labeled>
        </div>
      ))}

      <button
        type="button"
        onClick={() => setList([...list, { id: `m${Date.now()}`, type: 'cotton', qty: 0, unit: 'kg', period: 'Monthly' }])}
        className="glass flex h-12 w-full items-center justify-center gap-2 rounded-full text-[14px] font-bold text-ink transition hover:brightness-[0.97] active:scale-[0.98]"
      >
        <Plus className="size-4 text-sky" strokeWidth={2.8} />
        Add another material
      </button>
      <Upload label="Upload invoice (optional)" file={invoice} onFile={setInvoice} />

      <div className="glass space-y-3.5 rounded-[26px] p-4">
        <p className="text-[14px] font-extrabold">Waste</p>
        <Labeled label="Waste type">
          <Select label="Waste type" value={waste.type} onChange={(type) => setWaste({ ...waste, type })} options={WASTES.map((k) => ({ value: k.id, label: k.label }))} />
        </Labeled>
        <Labeled label="Quantity">
          <QtyUnit
            label="Waste quantity"
            qty={waste.qty}
            onQty={(qty) => setWaste({ ...waste, qty })}
            unit={waste.unit}
            units={kindUnits(WASTES, waste.type)}
            onUnit={(unit) => setWaste({ ...waste, unit })}
          />
        </Labeled>
        <Labeled label="Period">
          <Select label="Period" value={waste.period} onChange={(v) => setWaste({ ...waste, period: v as Period })} options={PERIODS} />
        </Labeled>
      </div>
    </Step>
  );
}

/* ---------- 4 · Transport ---------- */

export function StepTransport() {
  const { inputs, saveInputs } = useApp();
  const [d, setD] = useState(inputs.transport);
  const done = useDone('w-review');
  return (
    <Step
      n={4}
      title={
        <>
          Transport
          <br />
          and logistics
        </>
      }
      sub="Add the distance your goods and vehicles travel. Leave it at zero to skip."
      art="/img/truck.webp"
      onNext={() => {
        saveInputs({ transport: d });
        done();
      }}
    >
      <div className="glass space-y-3.5 rounded-[26px] p-4">
        <Labeled label="Vehicle type">
          <Select label="Vehicle type" value={d.vehicle} onChange={(vehicle) => setD({ ...d, vehicle })} options={VEHICLES.map((k) => ({ value: k.id, label: k.label }))} />
        </Labeled>
        <Labeled label="Distance">
          <QtyUnit label="Distance travelled" qty={d.km} onQty={(km) => setD({ ...d, km })} unit="km" units={['km']} onUnit={() => {}} />
        </Labeled>
        <Labeled label="Period">
          <Select label="Period" value={d.period} onChange={(v) => setD({ ...d, period: v as Period })} options={PERIODS} />
        </Labeled>
        <Labeled label="Who runs the vehicles?">
          <Segmented
            label="Vehicle ownership"
            value={d.ownership}
            onChange={(ownership) => setD({ ...d, ownership })}
            options={[
              { value: 'own', label: 'Own fleet' },
              { value: 'third', label: 'Third-party' },
            ]}
          />
        </Labeled>
        <p className="text-[12px] leading-snug text-ink-soft">
          Your own fleet counts under Scope 1. Hired transport counts under Scope 3.
        </p>
      </div>
    </Step>
  );
}

/* ---------- 5 · Review ---------- */

interface Row {
  key: string;
  route: Route;
  icon: LucideIcon;
  color: string;
  title: string;
  lines: string[];
}

function useRows(): Row[] {
  const { inputs: i } = useApp();
  const basis = (b: Basis) => (b === 'actual' ? 'Actual (from bills)' : 'Estimated');
  const fuels = i.fuels.filter((f) => f.qty > 0);
  const mats = i.materials.filter((m) => m.qty > 0);
  return [
    {
      key: 'business',
      route: 'w-business',
      icon: Building2,
      color: '#2e6bf6',
      title: 'Business details',
      lines: [[i.business.name, i.business.city.split(',')[0]].filter(Boolean).join(', '), `${i.business.industry} · ${num(i.business.employees)} employees`],
    },
    {
      key: 'electricity',
      route: 'w-electricity',
      icon: SOURCE_ICON.electricity,
      color: SOURCES.electricity.color,
      title: 'Electricity',
      lines: i.electricity.qty > 0 ? [`${num(i.electricity.qty)} ${i.electricity.unit} / ${periodWord(i.electricity.period)}`, basis(i.electricity.basis)] : ['Not added'],
    },
    {
      key: 'fuel',
      route: 'w-fuel',
      icon: SOURCE_ICON.fuel,
      color: '#d99a1c',
      title: 'Fuel',
      lines: fuels.length
        ? fuels.map((f) => `${num(f.qty)} ${f.unit} ${kindLabel(FUELS, f.type).toLowerCase()} / ${periodWord(f.period)}`)
        : ['Not added'],
    },
    {
      key: 'transport',
      route: 'w-transport',
      icon: SOURCE_ICON.transport,
      color: SOURCES.transport.color,
      title: 'Transport',
      lines:
        i.transport.km > 0
          ? [`${num(i.transport.km)} km / ${periodWord(i.transport.period)}`, `${kindLabel(VEHICLES, i.transport.vehicle)} · ${i.transport.ownership === 'own' ? 'Own fleet' : 'Third-party'}`]
          : ['Not added'],
    },
    {
      key: 'materials',
      route: 'w-materials',
      icon: SOURCE_ICON.materials,
      color: '#1f9d5b',
      title: 'Materials',
      lines: mats.length
        ? mats.map((m) => `${num(m.qty)} ${m.unit} ${kindLabel(MATERIALS, m.type).toLowerCase()} / ${periodWord(m.period)}`)
        : ['Not added'],
    },
    {
      key: 'waste',
      route: 'w-materials',
      icon: SOURCE_ICON.waste,
      color: '#1b9aab',
      title: 'Waste',
      lines: i.waste.qty > 0 ? [`${num(i.waste.qty)} ${i.waste.unit} / ${periodWord(i.waste.period)}`, kindLabel(WASTES, i.waste.type)] : ['Not added'],
    },
  ];
}

function ReviewList() {
  const rows = useRows();
  const { startEdit } = useApp();
  return (
    <ul className="space-y-2.5">
      {rows.map((r) => (
        <li key={r.key} className="glass flex items-center gap-3.5 rounded-[22px] py-2.5 pr-2 pl-3">
          <IconTile icon={r.icon} color={r.color} />
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-extrabold">{r.title}</p>
            {r.lines.map((l) => (
              <p key={l} className="truncate text-[12.5px] font-medium text-ink-soft">
                {l}
              </p>
            ))}
          </div>
          <button
            type="button"
            aria-label={`Edit ${r.title.toLowerCase()}`}
            onClick={() => startEdit(r.route)}
            className="grid size-11 shrink-0 place-items-center rounded-full text-sky hover:bg-sky-soft"
          >
            <Pencil className="size-4" strokeWidth={2.3} />
          </button>
        </li>
      ))}
    </ul>
  );
}

export function StepReview() {
  const { calculate } = useApp();
  return (
    <Step
      n={5}
      title={
        <>
          Review your
          <br />
          information
        </>
      }
      sub="Check your details before calculating."
      art="/img/clipboard.webp"
      onNext={calculate}
      nextLabel="Calculate"
    >
      <ReviewList />
    </Step>
  );
}

/* ---------- Calculating ---------- */

const STAGES = ['Reading your activity data', 'Applying emission factors', 'Building your insights'];

export function Calculating() {
  const { reset } = useApp();
  const [stage, setStage] = useState(0);
  useEffect(() => {
    const a = window.setTimeout(() => setStage(1), 800);
    const b = window.setTimeout(() => setStage(2), 1600);
    const c = window.setTimeout(() => reset('home'), 2500);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
      window.clearTimeout(c);
    };
  }, [reset]);
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden px-8 text-center">
      <div aria-hidden="true" className="absolute -bottom-32 left-1/2 h-72 w-[130%] -translate-x-1/2 rounded-[50%] bg-gradient-to-b from-white to-[#cddbf8]" />
      <img src="/img/leaf.webp" alt="" className="float-slow absolute top-[14%] left-6 w-10 -rotate-[30deg] opacity-70 blur-[0.5px]" />
      <img src="/img/leaf.webp" alt="" className="float absolute top-[24%] right-8 w-8 rotate-[40deg] opacity-70" />
      <img
        src="/img/robot.webp"
        alt="TerraAI robot holding a small sprout"
        className="float relative max-h-[46%] w-[62%] object-contain drop-shadow-[0_26px_24px_rgba(46,84,170,0.28)]"
      />
      <h1 className="relative mt-6 text-[24px] font-extrabold tracking-tight">Crunching your numbers</h1>
      <p role="status" className="relative mt-2 text-[14px] font-medium text-ink-soft">
        {STAGES[stage]}…
      </p>
      <div className="relative mt-6 h-1.5 w-44 overflow-hidden rounded-full bg-line">
        <div className="h-full rounded-full bg-sky" style={{ animation: 'fill 2.4s ease-out forwards' }} />
      </div>
    </div>
  );
}

/* ---------- Inputs tab ---------- */

export function Inputs() {
  const { result, inputs, reset } = useApp();
  return (
    <Page>
      <img src="/img/clipboard.webp" alt="" className="float-slow absolute top-2 right-4 w-[68px] opacity-90" />
      <PageHead title="Inputs" sub="Edit your data. Results refresh when you save." />
      <ReviewList />
      <button
        type="button"
        onClick={() => reset('results')}
        className="glass-leaf mt-3 flex w-full items-center gap-3 rounded-[24px] p-4 text-left transition hover:brightness-[0.98]"
      >
        <img src="/img/leaf.webp" alt="" className="w-10 shrink-0" />
        <span className="min-w-0 flex-1">
          <span className="block text-[12.5px] font-semibold text-ink-soft">{inputs.business.period} footprint</span>
          <span className="block text-[18px] font-extrabold tracking-tight">
            {fmt(result.total)} <span className="text-[13px]">tCO₂e</span>
          </span>
        </span>
        <span className="text-[13px] font-bold text-leaf">View results</span>
      </button>
    </Page>
  );
}
