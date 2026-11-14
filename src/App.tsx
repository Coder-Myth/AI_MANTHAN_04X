import type { ReactElement } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ClipboardList, Home as HomeIcon, LayoutGrid, PieChart, User, type LucideIcon } from 'lucide-react';
import { AppProvider, useApp, type Route } from './lib/store';
import { Logo, StatusBar, cx } from './components/ui';
import { Login, Splash } from './screens/Auth';
import { Calculating, Inputs, StepBusiness, StepElectricity, StepFuel, StepMaterials, StepReview, StepTransport } from './screens/Wizard';
import { Home } from './screens/Home';
import { Results } from './screens/Results';
import { Actions } from './screens/Actions';
import { WhatIf } from './screens/WhatIf';
import { Profile } from './screens/Profile';
import { Contact, Factors, Help, Legal, More, Notifications, SettingsPage } from './screens/More';

const SCREENS: Record<Route, () => ReactElement> = {
  splash: () => <Splash />,
  login: () => <Login />,
  'w-business': () => <StepBusiness />,
  'w-electricity': () => <StepElectricity />,
  'w-fuel': () => <StepFuel />,
  'w-materials': () => <StepMaterials />,
  'w-transport': () => <StepTransport />,
  'w-review': () => <StepReview />,
  calculating: () => <Calculating />,
  home: () => <Home />,
  results: () => <Results />,
  actions: () => <Actions />,
  whatif: () => <WhatIf />,
  profile: () => <Profile />,
  inputs: () => <Inputs />,
  more: () => <More />,
  factors: () => <Factors />,
  settings: () => <SettingsPage />,
  help: () => <Help />,
  privacy: () => <Legal kind="privacy" />,
  terms: () => <Legal kind="terms" />,
  contact: () => <Contact />,
  notifications: () => <Notifications />,
};

type Tab = 'home' | 'profile' | 'inputs' | 'results' | 'more';
const TABS: { id: Tab; label: string; icon: LucideIcon }[] = [
  { id: 'home', label: 'Home', icon: HomeIcon },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'inputs', label: 'Inputs', icon: ClipboardList },
  { id: 'results', label: 'Results', icon: PieChart },
  { id: 'more', label: 'More', icon: LayoutGrid },
];

const TAB_OF: Partial<Record<Route, Tab>> = {
  home: 'home',
  notifications: 'home',
  profile: 'profile',
  inputs: 'inputs',
  results: 'results',
  actions: 'results',
  whatif: 'results',
  more: 'more',
  factors: 'more',
  settings: 'more',
  help: 'more',
  privacy: 'more',
  terms: 'more',
  contact: 'more',
};

const FLOW: { group: string; items: [Route, string][] }[] = [
  {
    group: 'Get started',
    items: [
      ['splash', 'Welcome'],
      ['login', 'Sign in'],
    ],
  },
  {
    group: 'Set up',
    items: [
      ['w-business', 'Your business'],
      ['w-electricity', 'Electricity'],
      ['w-fuel', 'Fuel'],
      ['w-materials', 'Materials & waste'],
      ['w-transport', 'Transport'],
      ['w-review', 'Review'],
    ],
  },
  {
    group: 'App',
    items: [
      ['home', 'Home'],
      ['results', 'Results'],
      ['actions', 'Actions'],
      ['whatif', 'What-If'],
      ['inputs', 'Inputs'],
      ['profile', 'Profile'],
      ['more', 'More'],
    ],
  },
];

function BottomNav({ active }: { active: Tab }) {
  const { reset } = useApp();
  return (
    <nav aria-label="Main" className="shrink-0 px-4 pt-1 pb-[max(0.9rem,env(safe-area-inset-bottom))]">
      <ul className="glass grid grid-cols-5 rounded-[28px] px-1.5 py-1.5">
        {TABS.map((t) => {
          const on = t.id === active;
          return (
            <li key={t.id}>
              <button
                type="button"
                aria-current={on ? 'page' : undefined}
                onClick={() => reset(t.id)}
                className={cx(
                  'flex h-[52px] w-full flex-col items-center justify-center gap-1 rounded-[20px] text-[10.5px] transition active:scale-95',
                  on ? 'font-extrabold text-navy' : 'font-semibold text-ink-mute hover:text-ink',
                )}
              >
                <t.icon className="size-[19px]" strokeWidth={on ? 2.6 : 2} fill={on ? 'currentColor' : 'none'} fillOpacity={on ? 0.16 : 0} />
                {t.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function FlowPanel() {
  const { route, reset } = useApp();
  let n = 0;
  return (
    <aside className="hidden w-60 shrink-0 lg:block">
      <Logo size={30} />
      <p className="mt-3 text-[15px] leading-snug font-medium text-ink-soft">Carbon intelligence for MSMEs. Jump to any screen in the flow.</p>
      <nav aria-label="Screens" className="mt-6 space-y-5">
        {FLOW.map((g) => (
          <div key={g.group}>
            <p className="mb-1.5 text-[11.5px] font-extrabold tracking-[0.08em] text-ink-mute uppercase">{g.group}</p>
            <ul>
              {g.items.map(([r, label]) => {
                n += 1;
                const on = route === r;
                return (
                  <li key={r}>
                    <button
                      type="button"
                      aria-current={on ? 'page' : undefined}
                      onClick={() => reset(r)}
                      className={cx(
                        'flex h-9 w-full items-center gap-3 rounded-full px-3 text-left text-[13.5px] transition',
                        on ? 'btn-navy font-bold' : 'font-semibold text-ink hover:bg-white/70',
                      )}
                    >
                      <span className={cx('w-5 text-[11px] font-bold tabular-nums', on ? 'text-white/70' : 'text-ink-mute')}>
                        {String(n).padStart(2, '0')}
                      </span>
                      {label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}

function Shell() {
  const { route, toastMsg } = useApp();
  const reduce = useReducedMotion();
  const tab = TAB_OF[route];
  return (
    <div className="stage relative flex min-h-dvh items-center justify-center gap-16 overflow-hidden sm:p-6">
      <img src="/img/leaf.webp" alt="" className="pointer-events-none absolute top-[8%] left-[6%] hidden w-24 -rotate-[24deg] opacity-40 blur-[3px] sm:block" />
      <img src="/img/leaf.webp" alt="" className="pointer-events-none absolute right-[7%] bottom-[10%] hidden w-32 rotate-[140deg] opacity-35 blur-[4px] sm:block" />

      <FlowPanel />

      <main className="screen-bg relative flex h-dvh w-full flex-col overflow-hidden sm:h-[min(860px,calc(100dvh-48px))] sm:w-[400px] sm:shrink-0 sm:rounded-[46px] sm:shadow-[0_50px_90px_-40px_rgba(30,58,138,0.55),0_0_0_1px_rgba(255,255,255,0.9),0_0_0_10px_rgba(255,255,255,0.45)]">
        <StatusBar />
        <div className="relative min-h-0 flex-1">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={route}
              className="absolute inset-0"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
            >
              {SCREENS[route]()}
            </motion.div>
          </AnimatePresence>
        </div>
        {tab && <BottomNav active={tab} />}

        <div id="overlay-root" className="pointer-events-none absolute inset-0 z-40" />
        <div aria-live="polite" className="pointer-events-none absolute inset-x-0 bottom-28 z-50 flex justify-center px-6">
          <AnimatePresence>
            {toastMsg && (
              <motion.p
                key={toastMsg}
                role="status"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="btn-navy rounded-full px-5 py-3 text-[13px] font-bold"
              >
                {toastMsg}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
