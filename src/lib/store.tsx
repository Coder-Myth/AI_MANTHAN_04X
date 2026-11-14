import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  buildActions,
  compute,
  DEFAULT_COSTS,
  DEFAULT_INPUTS,
  fmt,
  type Action,
  type Costs,
  type Factors,
  type Inputs,
  type Result,
  type SourceKey,
} from './calc';

export type Route =
  | 'splash'
  | 'login'
  | 'w-business'
  | 'w-electricity'
  | 'w-fuel'
  | 'w-materials'
  | 'w-transport'
  | 'w-review'
  | 'calculating'
  | 'home'
  | 'results'
  | 'actions'
  | 'whatif'
  | 'profile'
  | 'inputs'
  | 'more'
  | 'factors'
  | 'settings'
  | 'help'
  | 'privacy'
  | 'terms'
  | 'contact'
  | 'notifications';

const PREV: Partial<Record<Route, Route>> = {
  login: 'splash',
  'w-business': 'login',
  'w-electricity': 'w-business',
  'w-fuel': 'w-electricity',
  'w-materials': 'w-fuel',
  'w-transport': 'w-materials',
  'w-review': 'w-transport',
};

export interface Note {
  id: string;
  kind: 'report' | 'alert';
  title: string;
  body: string;
  at: number;
  read: boolean;
}

interface State {
  stack: Route[];
  editing: boolean;
  account: { name: string; email: string; phone: string };
  inputs: Inputs;
  factors: Factors;
  costs: Costs;
  prefs: { alerts: boolean; tips: boolean };
  applied: string[];
  onboarded: boolean;
  previousTotal: number | null;
  notes: Note[];
  shared: { email: string; at: number }[];
  whatIf: { source: SourceKey; pct: number };
}

const KEY = 'terraai.v1';

const initial: State = {
  stack: ['splash'],
  editing: false,
  account: { name: '', email: '', phone: '' },
  inputs: DEFAULT_INPUTS,
  factors: {},
  costs: DEFAULT_COSTS,
  prefs: { alerts: true, tips: true },
  applied: [],
  onboarded: false,
  previousTotal: null,
  notes: [],
  shared: [],
  whatIf: { source: 'electricity', pct: 20 },
};

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initial;
    const s = JSON.parse(raw) as Partial<State>;
    const stack = (s.stack ?? []).filter((r) => r !== 'calculating');
    return {
      ...initial,
      ...s,
      inputs: { ...initial.inputs, ...s.inputs },
      costs: { ...initial.costs, ...s.costs },
      prefs: { ...initial.prefs, ...s.prefs },
      editing: false,
      stack: stack.length ? stack : [s.onboarded ? 'home' : 'splash'],
    };
  } catch {
    return initial;
  }
}

const note = (kind: Note['kind'], title: string, body: string): Note => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  kind,
  title,
  body,
  at: Date.now(),
  read: false,
});

interface Ctx extends State {
  route: Route;
  result: Result;
  actions: Action[];
  toastMsg: string;
  go: (r: Route) => void;
  back: () => void;
  reset: (r: Route) => void;
  signIn: (a: Partial<State['account']>) => void;
  signOut: () => void;
  saveInputs: (patch: Partial<Inputs>) => void;
  calculate: () => void;
  startEdit: (r: Route) => void;
  endEdit: () => void;
  setFactor: (key: string, v: number) => void;
  resetFactors: () => void;
  setCosts: (p: Partial<Costs>) => void;
  setPrefs: (p: Partial<State['prefs']>) => void;
  setAccount: (p: Partial<State['account']>) => void;
  toggleAction: (a: Action) => void;
  share: (email: string) => void;
  unshare: (email: string) => void;
  markRead: () => void;
  setWhatIf: (p: Partial<State['whatIf']>) => void;
  resetAll: () => void;
  toast: (m: string) => void;
}

const AppCtx = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [s, set] = useState<State>(load);
  const [toastMsg, setToast] = useState('');
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(s));
    } catch {
      /* storage unavailable — keep working in memory */
    }
  }, [s]);

  const toast = useCallback((m: string) => {
    setToast(m);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToast(''), 2600);
  }, []);

  const api = useMemo(
    () => ({
      go: (r: Route) => set((p) => (p.stack[p.stack.length - 1] === r ? p : { ...p, stack: [...p.stack, r] })),
      back: () =>
        set((p) => {
          if (p.stack.length > 1) return { ...p, editing: false, stack: p.stack.slice(0, -1) };
          const top = p.stack[0];
          return { ...p, editing: false, stack: [PREV[top] ?? 'home'] };
        }),
      reset: (r: Route) => set((p) => ({ ...p, editing: false, stack: [r] })),
      signIn: (a: Partial<State['account']>) =>
        set((p) => ({
          ...p,
          account: { ...p.account, ...a },
          stack: p.onboarded ? ['home'] : [...p.stack, 'w-business'],
        })),
      signOut: () => set((p) => ({ ...p, editing: false, stack: ['splash'] })),
      saveInputs: (patch: Partial<Inputs>) =>
        set((p) => {
          const inputs = { ...p.inputs, ...patch };
          if (!p.onboarded) return { ...p, inputs };
          const before = compute(p.inputs, p.factors).total;
          const after = compute(inputs, p.factors).total;
          if (Math.abs(after - before) < 0.05) return { ...p, inputs };
          return {
            ...p,
            inputs,
            previousTotal: before,
            notes: [
              note('report', 'Footprint updated', `Your total is now ${fmt(after)} tCO₂e, from ${fmt(before)} before.`),
              ...p.notes,
            ],
          };
        }),
      calculate: () =>
        set((p) => {
          const total = compute(p.inputs, p.factors).total;
          return {
            ...p,
            onboarded: true,
            editing: false,
            stack: ['calculating'],
            notes: [
              note('report', 'Footprint ready', `Your ${p.inputs.business.period} footprint is ${fmt(total)} tCO₂e.`),
              ...p.notes,
            ],
          };
        }),
      startEdit: (r: Route) => set((p) => ({ ...p, editing: true, stack: [...p.stack, r] })),
      endEdit: () => set((p) => ({ ...p, editing: false, stack: p.stack.length > 1 ? p.stack.slice(0, -1) : ['inputs'] })),
      setFactor: (key: string, v: number) => set((p) => ({ ...p, factors: { ...p.factors, [key]: v } })),
      resetFactors: () => set((p) => ({ ...p, factors: {} })),
      setCosts: (c: Partial<Costs>) => set((p) => ({ ...p, costs: { ...p.costs, ...c } })),
      setPrefs: (c: Partial<State['prefs']>) => set((p) => ({ ...p, prefs: { ...p.prefs, ...c } })),
      setAccount: (a: Partial<State['account']>) => set((p) => ({ ...p, account: { ...p.account, ...a } })),
      toggleAction: (a: Action) =>
        set((p) => {
          const on = p.applied.includes(a.id);
          return {
            ...p,
            applied: on ? p.applied.filter((x) => x !== a.id) : [...p.applied, a.id],
            notes: on
              ? p.notes
              : [note('alert', 'Action applied', `${a.title} — about ${fmt(a.tco2)} tCO₂e less each year.`), ...p.notes],
          };
        }),
      share: (email: string) =>
        set((p) => (p.shared.some((x) => x.email === email) ? p : { ...p, shared: [...p.shared, { email, at: Date.now() }] })),
      unshare: (email: string) => set((p) => ({ ...p, shared: p.shared.filter((x) => x.email !== email) })),
      markRead: () => set((p) => (p.notes.some((n) => !n.read) ? { ...p, notes: p.notes.map((n) => ({ ...n, read: true })) } : p)),
      setWhatIf: (w: Partial<State['whatIf']>) => set((p) => ({ ...p, whatIf: { ...p.whatIf, ...w } })),
      resetAll: () => {
        try {
          localStorage.removeItem(KEY);
        } catch {
          /* ignore */
        }
        set(initial);
      },
    }),
    [],
  );

  const result = useMemo(() => compute(s.inputs, s.factors), [s.inputs, s.factors]);
  const actions = useMemo(() => buildActions(result, s.costs), [result, s.costs]);

  const value: Ctx = { ...s, ...api, route: s.stack[s.stack.length - 1], result, actions, toastMsg, toast };
  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  const c = useContext(AppCtx);
  if (!c) throw new Error('useApp must be used inside AppProvider');
  return c;
}
