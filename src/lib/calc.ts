export type Period = 'Monthly' | 'Quarterly' | 'Yearly';
export const PERIODS: Period[] = ['Monthly', 'Quarterly', 'Yearly'];
export const perYear = (p: Period) => (p === 'Monthly' ? 12 : p === 'Quarterly' ? 4 : 1);
export const periodWord = (p: Period) => (p === 'Monthly' ? 'month' : p === 'Quarterly' ? 'quarter' : 'year');

export type SourceKey = 'electricity' | 'fuel' | 'transport' | 'materials' | 'waste';
export const SOURCE_KEYS: SourceKey[] = ['electricity', 'fuel', 'transport', 'materials', 'waste'];

export const SOURCES: Record<SourceKey, { label: string; color: string }> = {
  electricity: { label: 'Electricity', color: '#2e6bf6' },
  fuel: { label: 'Fuel', color: '#f4b63f' },
  transport: { label: 'Transport', color: '#8b7cf6' },
  materials: { label: 'Materials', color: '#2fbf71' },
  waste: { label: 'Waste', color: '#2bb8c9' },
};

type Unit = [label: string, mult: number];
interface Kind {
  id: string;
  label: string;
  units: Unit[];
}

const LIQ: Unit[] = [['Litres', 1], ['Kilolitres', 1000]];
const MASS: Unit[] = [['kg', 1], ['Tonnes', 1000]];

export const FUELS: Kind[] = [
  { id: 'diesel', label: 'Diesel', units: LIQ },
  { id: 'petrol', label: 'Petrol', units: LIQ },
  { id: 'furnace', label: 'Furnace oil', units: LIQ },
  { id: 'lpg', label: 'LPG', units: MASS },
  { id: 'coal', label: 'Coal', units: MASS },
  { id: 'png', label: 'Natural gas (PNG)', units: [['m³', 1]] },
];

export const MATERIALS: Kind[] = [
  { id: 'steel', label: 'Steel', units: MASS },
  { id: 'aluminium', label: 'Aluminium', units: MASS },
  { id: 'cotton', label: 'Cotton yarn', units: MASS },
  { id: 'plastic', label: 'Plastic resin', units: MASS },
  { id: 'paper', label: 'Paper & cardboard', units: MASS },
  { id: 'cement', label: 'Cement', units: MASS },
];

export const WASTES: Kind[] = [
  { id: 'general', label: 'General waste', units: MASS },
  { id: 'organic', label: 'Organic waste', units: MASS },
  { id: 'textile', label: 'Textile scrap', units: MASS },
  { id: 'recycled', label: 'Segregated for recycling', units: MASS },
];

export const VEHICLES: Kind[] = [
  { id: 'bike', label: 'Two / three-wheeler', units: [['km', 1]] },
  { id: 'car', label: 'Car', units: [['km', 1]] },
  { id: 'lcv', label: 'Light commercial vehicle', units: [['km', 1]] },
  { id: 'truck', label: 'Heavy truck', units: [['km', 1]] },
];

export const INDUSTRIES = [
  'Textiles',
  'Food processing',
  'Engineering & fabrication',
  'Plastics & packaging',
  'Chemicals',
  'Printing',
  'Leather',
  'Pharma',
  'Retail & services',
  'Other',
];
export const FY = ['FY 2024-25', 'FY 2025-26', 'FY 2026-27'];

export const kindLabel = (list: Kind[], id: string) => list.find((k) => k.id === id)?.label ?? id;
export const kindUnits = (list: Kind[], id: string) => (list.find((k) => k.id === id) ?? list[0]).units.map((u) => u[0]);
const mult = (list: Kind[], id: string, unit: string) =>
  (list.find((k) => k.id === id) ?? list[0]).units.find((u) => u[0] === unit)?.[1] ?? 1;

/* ---------- Emission factors ---------- */

export interface FactorDef {
  key: string;
  group: string;
  label: string;
  unit: string;
  value: number;
  note?: string;
}

export const GRID_NOTE = 'CEA CO₂ Baseline Database v22.0 · FY 2025-26';

export const FACTOR_DEFS: FactorDef[] = [
  { key: 'grid', group: 'Electricity', label: 'Grid electricity (India)', unit: 'kg CO₂e / kWh', value: 0.675, note: GRID_NOTE },
  { key: 'fuel.diesel', group: 'Fuel', label: 'Diesel', unit: 'kg CO₂e / litre', value: 2.68 },
  { key: 'fuel.petrol', group: 'Fuel', label: 'Petrol', unit: 'kg CO₂e / litre', value: 2.31 },
  { key: 'fuel.furnace', group: 'Fuel', label: 'Furnace oil', unit: 'kg CO₂e / litre', value: 3.17 },
  { key: 'fuel.lpg', group: 'Fuel', label: 'LPG', unit: 'kg CO₂e / kg', value: 2.98 },
  { key: 'fuel.coal', group: 'Fuel', label: 'Coal', unit: 'kg CO₂e / kg', value: 2.42 },
  { key: 'fuel.png', group: 'Fuel', label: 'Natural gas (PNG)', unit: 'kg CO₂e / m³', value: 2.02 },
  { key: 'veh.bike', group: 'Transport', label: 'Two / three-wheeler', unit: 'kg CO₂e / km', value: 0.05 },
  { key: 'veh.car', group: 'Transport', label: 'Car', unit: 'kg CO₂e / km', value: 0.17 },
  { key: 'veh.lcv', group: 'Transport', label: 'Light commercial vehicle', unit: 'kg CO₂e / km', value: 0.3 },
  { key: 'veh.truck', group: 'Transport', label: 'Heavy truck', unit: 'kg CO₂e / km', value: 0.85 },
  { key: 'mat.steel', group: 'Materials', label: 'Steel', unit: 'kg CO₂e / kg', value: 1.85 },
  { key: 'mat.aluminium', group: 'Materials', label: 'Aluminium', unit: 'kg CO₂e / kg', value: 8.6 },
  { key: 'mat.cotton', group: 'Materials', label: 'Cotton yarn', unit: 'kg CO₂e / kg', value: 4.0 },
  { key: 'mat.plastic', group: 'Materials', label: 'Plastic resin', unit: 'kg CO₂e / kg', value: 2.5 },
  { key: 'mat.paper', group: 'Materials', label: 'Paper & cardboard', unit: 'kg CO₂e / kg', value: 0.9 },
  { key: 'mat.cement', group: 'Materials', label: 'Cement', unit: 'kg CO₂e / kg', value: 0.83 },
  { key: 'waste.general', group: 'Waste', label: 'General waste', unit: 'kg CO₂e / kg', value: 0.45 },
  { key: 'waste.organic', group: 'Waste', label: 'Organic waste', unit: 'kg CO₂e / kg', value: 0.6 },
  { key: 'waste.textile', group: 'Waste', label: 'Textile scrap', unit: 'kg CO₂e / kg', value: 0.45 },
  { key: 'waste.recycled', group: 'Waste', label: 'Segregated for recycling', unit: 'kg CO₂e / kg', value: 0.02 },
];

export type Factors = Record<string, number>;
export const factorOf = (f: Factors, key: string) => f[key] ?? FACTOR_DEFS.find((d) => d.key === key)?.value ?? 0;

/* ---------- Inputs ---------- */

export type Basis = 'actual' | 'estimated';

export interface FuelEntry {
  id: string;
  type: string;
  qty: number;
  unit: string;
  period: Period;
  basis: Basis;
}
export interface MaterialEntry {
  id: string;
  type: string;
  qty: number;
  unit: string;
  period: Period;
}

export interface Inputs {
  business: { name: string; industry: string; city: string; employees: number; period: string };
  electricity: { qty: number; unit: string; period: Period; basis: Basis; bill: string };
  fuels: FuelEntry[];
  fuelBill: string;
  materials: MaterialEntry[];
  invoice: string;
  waste: { type: string; qty: number; unit: string; period: Period };
  transport: { vehicle: string; km: number; period: Period; ownership: 'own' | 'third' };
}

export const DEFAULT_INPUTS: Inputs = {
  business: { name: 'ABC Textiles', industry: 'Textiles', city: 'Indore, Madhya Pradesh', employees: 50, period: 'FY 2025-26' },
  electricity: { qty: 12000, unit: 'kWh', period: 'Monthly', basis: 'actual', bill: '' },
  fuels: [{ id: 'f1', type: 'diesel', qty: 500, unit: 'Litres', period: 'Monthly', basis: 'actual' }],
  fuelBill: '',
  materials: [{ id: 'm1', type: 'steel', qty: 5000, unit: 'kg', period: 'Monthly' }],
  invoice: '',
  waste: { type: 'general', qty: 200, unit: 'kg', period: 'Monthly' },
  transport: { vehicle: 'truck', km: 2500, period: 'Monthly', ownership: 'third' },
};

export interface Costs {
  tariff: number;
  fuel: number;
  km: number;
}
export const DEFAULT_COSTS: Costs = { tariff: 8, fuel: 90, km: 25 };

/* ---------- Footprint ---------- */

export interface Result {
  bySource: Record<SourceKey, number>;
  total: number;
  scope1: number;
  scope2: number;
  scope3: number;
  kwh: number;
  fuelUnits: number;
  km: number;
}

export function compute(i: Inputs, f: Factors): Result {
  const kwh = i.electricity.qty * (i.electricity.unit === 'MWh' ? 1000 : 1) * perYear(i.electricity.period);
  const electricity = (kwh * factorOf(f, 'grid')) / 1000;

  let fuel = 0;
  let fuelUnits = 0;
  for (const e of i.fuels) {
    const base = e.qty * mult(FUELS, e.type, e.unit) * perYear(e.period);
    fuelUnits += base;
    fuel += (base * factorOf(f, `fuel.${e.type}`)) / 1000;
  }

  let materials = 0;
  for (const m of i.materials) {
    materials += (m.qty * mult(MATERIALS, m.type, m.unit) * perYear(m.period) * factorOf(f, `mat.${m.type}`)) / 1000;
  }

  const waste =
    (i.waste.qty * mult(WASTES, i.waste.type, i.waste.unit) * perYear(i.waste.period) * factorOf(f, `waste.${i.waste.type}`)) / 1000;

  const km = i.transport.km * perYear(i.transport.period);
  const transport = (km * factorOf(f, `veh.${i.transport.vehicle}`)) / 1000;
  const own = i.transport.ownership === 'own';

  const bySource = { electricity, fuel, transport, materials, waste };
  return {
    bySource,
    total: electricity + fuel + transport + materials + waste,
    scope1: fuel + (own ? transport : 0),
    scope2: electricity,
    scope3: materials + waste + (own ? 0 : transport),
    kwh,
    fuelUnits,
    km,
  };
}

export const scopeOf = (k: SourceKey, i: Inputs) =>
  k === 'fuel' ? 1 : k === 'electricity' ? 2 : k === 'transport' ? (i.transport.ownership === 'own' ? 1 : 3) : 3;

/* ---------- Reduction actions ---------- */

export interface Action {
  id: string;
  title: string;
  source: SourceKey;
  desc: string;
  assumption: string;
  pct: number;
  tco2: number;
  invest: number | null;
  saving: number | null;
  payback: number | null;
  priority: 'High' | 'Medium' | 'Low';
}

export function buildActions(r: Result, c: Costs): Action[] {
  const list: Action[] = [];
  const add = (
    id: string,
    title: string,
    source: SourceKey,
    pct: number,
    desc: string,
    assumption: string,
    saving: number | null,
    invest: number | null,
  ) => {
    const tco2 = r.bySource[source] * pct;
    if (tco2 < 0.01) return;
    const share = r.total ? tco2 / r.total : 0;
    list.push({
      id,
      title,
      source,
      desc,
      assumption,
      pct,
      tco2,
      saving,
      invest,
      payback: saving && invest ? invest / saving : null,
      priority: share >= 0.02 ? 'High' : share >= 0.008 ? 'Medium' : 'Low',
    });
  };

  const led = r.kwh * 0.06 * c.tariff;
  add(
    'led',
    'LED lighting upgrade',
    'electricity',
    0.06,
    'Replace tube lights and high-bay lamps with LED fixtures, and add occupancy sensors in stores and corridors.',
    'Assumes lighting is about 12% of your electricity use and LEDs halve it. Payback of roughly 1.7 years.',
    led,
    led * 1.7,
  );
  const solar = r.kwh * 0.3 * c.tariff;
  add(
    'solar',
    'Rooftop solar',
    'electricity',
    0.3,
    'Install a rooftop solar plant sized to cover part of your daytime load and draw less from the grid.',
    'Assumes 30% of grid use is offset, about 1,400 kWh per kW each year, and ₹45,000 per kW installed.',
    solar,
    ((r.kwh * 0.3) / 1400) * 45000,
  );
  const motors = r.kwh * 0.08 * c.tariff;
  add(
    'motors',
    'Efficient motors & drives',
    'electricity',
    0.08,
    'Swap old motors for IE3-class units and fit variable frequency drives on pumps, fans and compressors.',
    'Assumes an 8% cut in electricity use. Payback of roughly 2.4 years.',
    motors,
    motors * 2.4,
  );
  const tune = r.fuelUnits * 0.08 * c.fuel;
  add(
    'tuneup',
    'Boiler & generator tune-up',
    'fuel',
    0.08,
    'Service burners, fix steam leaks, insulate hot lines and run generators only at efficient loads.',
    'Assumes an 8% cut in fuel burned. Payback of under a year.',
    tune,
    tune * 0.8,
  );
  const route = r.km * 0.12 * c.km;
  add(
    'route',
    'Transport route optimization',
    'transport',
    0.12,
    'Combine part-loads, plan return trips with cargo and pick shorter routes for regular deliveries.',
    'Assumes 12% fewer kilometres driven. Mostly planning effort, so payback is quick.',
    route,
    route * 0.6,
  );
  add(
    'scrap',
    'Cut material scrap',
    'materials',
    0.04,
    'Track rejects by line, tighten cutting plans and reuse off-cuts so less raw material is bought.',
    'Assumes 4% less raw material purchased. Savings depend on your material prices.',
    null,
    null,
  );
  add(
    'recycle',
    'Segregate & recycle waste',
    'waste',
    0.5,
    'Separate dry, wet and process waste at source and send recyclables to an authorised recycler.',
    'Assumes half of your waste is diverted from landfill.',
    null,
    null,
  );

  return list.sort((a, b) => b.tco2 - a.tco2);
}

export function recommended(actions: Action[]) {
  const high = actions.filter((a) => a.priority === 'High');
  return (high.length ? high : actions).slice(0, 3);
}

/* ---------- Projection ---------- */

export function projection(total: number, plan: Action[], months: number) {
  const base = total / 12;
  const ordered = [...plan].sort((a, b) => (a.payback ?? 0) - (b.payback ?? 0));
  const withPlan = Array.from({ length: months }, (_, m) => {
    const cut = ordered.reduce((s, a, k) => (m >= 1 + k * 2 ? s + a.tco2 / 12 : s), 0);
    return Math.max(base - cut, 0);
  });
  return { baseline: Array.from({ length: months }, () => base), withPlan };
}

export function monthLabels(n: number) {
  const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const start = new Date().getMonth();
  return Array.from({ length: n }, (_, i) => names[(start + i) % 12]);
}

/* ---------- Formatting ---------- */

export const fmt = (n: number, d = 1) => {
  const digits = Math.abs(n) >= 10000 ? 0 : d;
  return n.toLocaleString('en-IN', { minimumFractionDigits: digits, maximumFractionDigits: digits });
};
export const num = (n: number) => n.toLocaleString('en-IN', { maximumFractionDigits: 2 });
export const inr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;
export const pctOf = (v: number, total: number) => {
  const p = total ? (v / total) * 100 : 0;
  return p > 0 && p < 0.5 ? '<1' : String(Math.round(p));
};

export function ago(ts: number) {
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
