import { useEffect, useState } from 'react';
import { Bell, ChevronDown, Database, FileText, Info, LifeBuoy, ListChecks, Mail, RotateCcw, ScrollText, Settings, ShieldCheck, SlidersHorizontal } from 'lucide-react';
import { DEFAULT_COSTS, FACTOR_DEFS, ago, factorOf } from '../lib/calc';
import { useApp } from '../lib/store';
import { Btn, Labeled, MenuRow, NumInput, Page, PageHead, Segmented, Select, Sheet, SoftBtn, Toggle, cx } from '../components/ui';

/* ---------- More ---------- */

export function More() {
  const { go } = useApp();
  return (
    <Page>
      <PageHead title="More" />
      <div className="glass rounded-[26px] p-1.5">
        <MenuRow icon={Database} label="Emission Factors" onClick={() => go('factors')} />
        <MenuRow icon={ListChecks} label="Reduction Actions" onClick={() => go('actions')} />
        <MenuRow icon={SlidersHorizontal} label="What-If Simulator" onClick={() => go('whatif')} />
        <MenuRow icon={Settings} label="Settings" onClick={() => go('settings')} />
        <MenuRow icon={LifeBuoy} label="Help & Support" onClick={() => go('help')} />
      </div>

      <h2 className="mt-5 mb-2.5 text-[14px] font-extrabold">Legal</h2>
      <div className="glass rounded-[26px] p-1.5">
        <MenuRow icon={ShieldCheck} label="Privacy Policy" onClick={() => go('privacy')} />
        <MenuRow icon={ScrollText} label="Terms & Conditions" onClick={() => go('terms')} />
        <MenuRow icon={Mail} label="Contact Us" onClick={() => go('contact')} />
      </div>

      <h2 className="mt-5 mb-2.5 text-[14px] font-extrabold">App information</h2>
      <div className="glass flex items-center gap-3.5 rounded-[22px] px-4 py-3">
        <Info className="size-[19px] shrink-0" strokeWidth={2.1} />
        <div>
          <p className="text-[14px] font-bold">TerraAI v1.0.0</p>
          <p className="text-[12px] font-medium text-ink-soft">Carbon Intelligence for MSMEs</p>
        </div>
      </div>

      <div className="glass-leaf relative mt-4 overflow-hidden rounded-[26px] p-4 pr-28">
        <p className="text-[15px] font-extrabold">Go Green Together</p>
        <p className="mt-0.5 text-[12.5px] leading-snug font-medium text-ink-soft">A sustainable future is in our hands.</p>
        <img src="/img/globe.webp" alt="" className="absolute -right-3 -bottom-5 w-28" />
      </div>
    </Page>
  );
}

/* ---------- Emission factors ---------- */

export function Factors() {
  const { back, factors, setFactor, resetFactors, toast } = useApp();
  const groups = [...new Set(FACTOR_DEFS.map((d) => d.group))];
  const changed = FACTOR_DEFS.some((d) => factors[d.key] !== undefined && factors[d.key] !== d.value);
  return (
    <Page>
      <PageHead title="Emission Factors" onBack={back} />
      <p className="text-[13px] leading-snug text-ink-soft">
        The grid factor comes from the CEA CO₂ Baseline Database. All other values are indicative defaults — replace them with figures from your suppliers or
        auditor.
      </p>
      {groups.map((g) => (
        <section key={g} className="mt-4">
          <h2 className="mb-2 text-[14px] font-extrabold">{g}</h2>
          <ul className="glass divide-y divide-line/70 rounded-[24px] px-4">
            {FACTOR_DEFS.filter((d) => d.group === g).map((d) => (
              <li key={d.key} className="flex items-center gap-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] font-bold">{d.label}</p>
                  <p className="text-[11.5px] font-medium text-ink-soft">{d.unit}</p>
                  {d.note && <p className="text-[11.5px] font-medium text-ink-soft">{d.note}</p>}
                </div>
                <NumInput
                  label={`${d.label} factor, ${d.unit}`}
                  value={factorOf(factors, d.key)}
                  onChange={(v) => setFactor(d.key, v)}
                  className="h-11! w-[84px]! shrink-0 px-3! text-right tabular-nums"
                />
              </li>
            ))}
          </ul>
        </section>
      ))}
      <SoftBtn
        full
        className={cx('mt-5', !changed && 'pointer-events-none opacity-50')}
        onClick={() => {
          resetFactors();
          toast('Factors reset to defaults');
        }}
      >
        <RotateCcw className="size-4 text-sky" />
        Reset to defaults
      </SoftBtn>
    </Page>
  );
}

/* ---------- Settings ---------- */

export function SettingsPage() {
  const { back, prefs, setPrefs, costs, setCosts, resetAll, toast } = useApp();
  const [confirm, setConfirm] = useState(false);
  const rows: [string, string, boolean, (v: boolean) => void][] = [
    ['Activity alerts', 'Show a dot on the bell for new updates', prefs.alerts, (alerts) => setPrefs({ alerts })],
    ['Tips on Home', 'Show the progress card on your Home screen', prefs.tips, (tips) => setPrefs({ tips })],
  ];
  return (
    <Page>
      <PageHead title="Settings" onBack={back} />

      <h2 className="mb-2 text-[14px] font-extrabold">App preferences</h2>
      <ul className="glass divide-y divide-line/70 rounded-[24px] px-4">
        {rows.map(([t, s, on, fn]) => (
          <li key={t} className="flex items-center gap-3 py-3">
            <div className="min-w-0 flex-1">
              <p className="text-[13.5px] font-bold">{t}</p>
              <p className="text-[12px] font-medium text-ink-soft">{s}</p>
            </div>
            <Toggle on={on} onChange={fn} label={t} />
          </li>
        ))}
      </ul>

      <h2 className="mt-5 mb-1 text-[14px] font-extrabold">Cost assumptions</h2>
      <p className="mb-2.5 text-[12.5px] leading-snug text-ink-soft">Used to estimate savings and payback. Set them to what you actually pay.</p>
      <div className="glass space-y-3 rounded-[24px] p-4">
        <Labeled label="Electricity tariff (₹ per kWh)">
          <NumInput label="Electricity tariff in rupees per kWh" value={costs.tariff} onChange={(tariff) => setCosts({ tariff })} />
        </Labeled>
        <Labeled label="Fuel price (₹ per litre or kg)">
          <NumInput label="Fuel price in rupees per litre or kilogram" value={costs.fuel} onChange={(fuel) => setCosts({ fuel })} />
        </Labeled>
        <Labeled label="Transport cost (₹ per km)">
          <NumInput label="Transport cost in rupees per kilometre" value={costs.km} onChange={(km) => setCosts({ km })} />
        </Labeled>
        <button
          type="button"
          onClick={() => {
            setCosts(DEFAULT_COSTS);
            toast('Cost assumptions reset');
          }}
          className="h-11 text-[12.5px] font-bold text-sky hover:underline"
        >
          Reset to starting values
        </button>
      </div>

      <h2 className="mt-5 mb-2 text-[14px] font-extrabold">Data & Privacy</h2>
      <div className="glass rounded-[24px] p-4">
        <p className="text-[12.5px] leading-snug text-ink-soft">Everything you enter is kept in this browser. Erasing removes your inputs, actions and account details.</p>
        <button
          type="button"
          onClick={() => setConfirm(true)}
          className="mt-3 h-12 w-full rounded-full bg-danger-soft text-[14px] font-bold text-danger transition hover:brightness-95"
        >
          Erase all data
        </button>
      </div>

      {confirm && (
        <Sheet title="Erase all data?" onClose={() => setConfirm(false)}>
          <p className="text-[13.5px] leading-relaxed text-ink-soft">This clears your inputs, applied actions and account details from this browser. It cannot be undone.</p>
          <div className="mt-5 grid grid-cols-2 gap-2.5">
            <SoftBtn onClick={() => setConfirm(false)}>Keep data</SoftBtn>
            <button type="button" onClick={resetAll} className="h-12 rounded-full bg-danger text-[14px] font-bold text-white transition hover:brightness-110 active:scale-[0.98]">
              Erase
            </button>
          </div>
        </Sheet>
      )}
    </Page>
  );
}

/* ---------- Help ---------- */

const FAQ: [string, string][] = [
  [
    'How is my footprint calculated?',
    'Each activity you enter is scaled up to a full year and multiplied by its emission factor. For example, units of electricity × the grid factor gives kilograms of CO₂e, which we show in tonnes.',
  ],
  [
    'What are Scope 1, 2 and 3?',
    'Scope 1 is fuel you burn yourself, including your own vehicles. Scope 2 is the electricity you buy. Scope 3 covers your supply chain — here, purchased materials, waste and hired transport.',
  ],
  [
    'Where do the emission factors come from?',
    'The grid electricity factor is the all-India weighted average from the CEA CO₂ Baseline Database. The other factors are indicative defaults that you can change under Emission Factors.',
  ],
  [
    'How are savings and payback estimated?',
    'Savings are the units you would avoid multiplied by the cost assumptions in Settings. Investment and payback are rules of thumb, so treat them as a starting point and get vendor quotes before deciding.',
  ],
  ['Where is my data stored?', 'In this browser only. Bills and invoices you attach are not uploaded anywhere — only the file name is remembered.'],
];

export function Help() {
  const { back, go } = useApp();
  const [open, setOpen] = useState<number | null>(0);
  return (
    <Page>
      <PageHead title="Help & Support" onBack={back} />
      <ul className="space-y-2.5">
        {FAQ.map(([q, a], i) => {
          const on = open === i;
          return (
            <li key={q} className="glass rounded-[22px]">
              <button
                type="button"
                aria-expanded={on}
                onClick={() => setOpen(on ? null : i)}
                className="flex min-h-[52px] w-full items-center gap-3 rounded-[22px] px-4 py-2 text-left text-[13.5px] font-bold"
              >
                <span className="flex-1">{q}</span>
                <ChevronDown className={cx('size-4 shrink-0 text-ink-mute transition-transform', on && 'rotate-180')} strokeWidth={2.6} />
              </button>
              {on && <p className="px-4 pb-4 text-[13px] leading-relaxed text-ink-soft">{a}</p>}
            </li>
          );
        })}
      </ul>
      <div className="glass-leaf mt-4 flex items-center gap-3 rounded-[24px] p-4">
        <img src="/img/robot.webp" alt="" className="w-12 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-extrabold">Still stuck?</p>
          <p className="text-[12.5px] font-medium text-ink-soft">Write to us and we will help.</p>
        </div>
        <Btn onClick={() => go('contact')} className="h-11! px-5! text-[13px]!">
          Contact
        </Btn>
      </div>
    </Page>
  );
}

/* ---------- Legal ---------- */

const LEGAL = {
  privacy: {
    title: 'Privacy Policy',
    icon: ShieldCheck,
    sections: [
      ['What we keep', 'The business details, activity data, cost assumptions and account details you type in, plus the actions you mark as applied.'],
      ['Where it lives', 'In your browser’s local storage on this device. Nothing is sent to a server, and nothing is shared with third parties.'],
      ['Bills and invoices', 'Files you attach stay on your device. Only the file name is remembered so you can see what you attached.'],
      ['Your control', 'You can change any entry in Inputs, and erase everything at once from Settings → Erase all data.'],
    ],
  },
  terms: {
    title: 'Terms & Conditions',
    icon: ScrollText,
    sections: [
      ['Estimates, not an audit', 'TerraAI gives indicative carbon estimates to help you plan. Results are not a verified inventory and should not be filed as one without independent review.'],
      ['Your inputs', 'Results are only as accurate as the data and emission factors you provide. You are responsible for checking them against your bills and records.'],
      ['Financial figures', 'Investment, saving and payback numbers are rules of thumb. Get vendor quotes and professional advice before committing money.'],
      ['Emission factors', 'Default factors can change when official sources publish new editions. Review them under Emission Factors for each reporting period.'],
    ],
  },
} as const;

export function Legal({ kind }: { kind: keyof typeof LEGAL }) {
  const { back } = useApp();
  const doc = LEGAL[kind];
  return (
    <Page>
      <PageHead title={doc.title} onBack={back} />
      <div className="glass space-y-4 rounded-[26px] p-5">
        {doc.sections.map(([h, p]) => (
          <section key={h}>
            <h2 className="flex items-center gap-2 text-[14px] font-extrabold">
              <FileText className="size-4 text-sky" strokeWidth={2.2} />
              {h}
            </h2>
            <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">{p}</p>
          </section>
        ))}
      </div>
    </Page>
  );
}

/* ---------- Contact ---------- */

const TOPICS = ['Question about my results', 'Problem with the app', 'Emission factor query', 'Feedback'];

export function Contact() {
  const { back, inputs } = useApp();
  const [topic, setTopic] = useState(TOPICS[0]);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const send = () => {
    if (msg.trim().length < 10) return setErr('Tell us a little more — at least 10 characters.');
    const body = `${msg.trim()}\n\n— ${inputs.business.name}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(`TerraAI: ${topic}`)}&body=${encodeURIComponent(body)}`;
  };
  return (
    <Page>
      <PageHead title="Contact Us" onBack={back} />
      <p className="text-[13px] leading-snug text-ink-soft">Write your message here and we will open it as a draft in your mail app, ready to send.</p>
      <div className="glass mt-4 space-y-3.5 rounded-[26px] p-4">
        <Labeled label="Topic">
          <Select label="Topic" value={topic} onChange={setTopic} options={TOPICS} />
        </Labeled>
        <Labeled label="Message" hint={err}>
          <textarea
            className="input"
            rows={6}
            aria-label="Message"
            placeholder="How can we help?"
            value={msg}
            onChange={(e) => {
              setMsg(e.target.value);
              setErr('');
            }}
          />
        </Labeled>
      </div>
      <Btn full arrow className="mt-4" onClick={send}>
        Open in mail app
      </Btn>
    </Page>
  );
}

/* ---------- Notifications ---------- */

export function Notifications() {
  const { back, notes, markRead, reset } = useApp();
  const [tab, setTab] = useState<'all' | 'report' | 'alert'>('all');
  const [, tick] = useState(0);
  useEffect(() => {
    const t = window.setTimeout(markRead, 1200);
    const i = window.setInterval(() => tick((n) => n + 1), 30000);
    return () => {
      window.clearTimeout(t);
      window.clearInterval(i);
    };
  }, [markRead]);
  const list = notes.filter((n) => tab === 'all' || n.kind === tab);
  return (
    <Page>
      <PageHead title="Notifications" onBack={back} />
      <Segmented
        label="Notification type"
        value={tab}
        onChange={setTab}
        options={[
          { value: 'all', label: 'All' },
          { value: 'report', label: 'Reports' },
          { value: 'alert', label: 'Alerts' },
        ]}
      />
      <ul className="mt-4 space-y-2.5">
        {list.map((n) => (
          <li key={n.id} className="glass flex items-start gap-3 rounded-[22px] p-3.5">
            <span
              className={cx(
                'grid size-10 shrink-0 place-items-center rounded-full',
                n.kind === 'report' ? 'bg-leaf-soft text-leaf' : 'bg-sun-soft text-sun-ink',
              )}
            >
              {n.kind === 'report' ? <FileText className="size-[18px]" strokeWidth={2.2} /> : <Bell className="size-[18px]" strokeWidth={2.2} />}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className="truncate text-[13.5px] font-extrabold">
                  {n.title}
                  {!n.read && <span className="ml-1.5 inline-block size-1.5 -translate-y-0.5 rounded-full bg-sky" aria-label="unread" />}
                </p>
                <span className="shrink-0 text-[11px] font-semibold text-ink-soft">{ago(n.at)}</span>
              </div>
              <p className="mt-0.5 text-[12.5px] leading-snug font-medium text-ink-soft">{n.body}</p>
            </div>
          </li>
        ))}
      </ul>
      {list.length === 0 && (
        <div className="glass mt-1 flex flex-col items-center rounded-[26px] px-6 py-8 text-center">
          <img src="/img/leaf.webp" alt="" className="float w-14" />
          <p className="mt-3 text-[15px] font-extrabold">Nothing here yet</p>
          <p className="mt-1 text-[13px] leading-snug text-ink-soft">Updates appear when your footprint changes or you apply an action.</p>
          <SoftBtn className="mt-4" onClick={() => reset('home')}>
            Back to Home
          </SoftBtn>
        </div>
      )}
    </Page>
  );
}
