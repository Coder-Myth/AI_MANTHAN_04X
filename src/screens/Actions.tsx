import { useState } from 'react';
import { Check, ChevronRight, Cog, Flame, Lightbulb, Recycle, Route as RouteIcon, Scissors, SlidersHorizontal, Sun, type LucideIcon } from 'lucide-react';
import { SOURCES, fmt, inr, recommended, type Action } from '../lib/calc';
import { useApp } from '../lib/store';
import { Btn, IconTile, Page, PageHead, Segmented, Sheet, SoftBtn, cx } from '../components/ui';
import { BellBtn } from './Home';

const ICONS: Record<string, LucideIcon> = {
  led: Lightbulb,
  solar: Sun,
  motors: Cog,
  tuneup: Flame,
  route: RouteIcon,
  scrap: Scissors,
  recycle: Recycle,
};

const PRIORITY: Record<Action['priority'], string> = {
  High: 'bg-leaf-soft text-leaf',
  Medium: 'bg-sun-soft text-sun-ink',
  Low: 'bg-sky-soft text-sky',
};

type Tab = 'rec' | 'all' | 'applied';

export function Actions() {
  const { actions, applied, back, toggleAction, setWhatIf, go, toast } = useApp();
  const [tab, setTab] = useState<Tab>('rec');
  const [openId, setOpenId] = useState<string | null>(null);
  const open = actions.find((a) => a.id === openId) ?? null;

  const list =
    tab === 'rec'
      ? recommended(actions.filter((a) => !applied.includes(a.id)))
      : tab === 'all'
        ? actions
        : actions.filter((a) => applied.includes(a.id));

  const empty: Record<Tab, [string, string]> = {
    rec: actions.length
      ? ['All caught up', 'You have applied every recommended action. See All actions for more ideas.']
      : ['Nothing to recommend yet', 'Add your activity data in Inputs and suggestions will appear here.'],
    all: ['No actions yet', 'Add your activity data in Inputs and suggestions will appear here.'],
    applied: ['No actions applied yet', 'Open a recommended action and mark it as applied to track it here.'],
  };

  return (
    <Page>
      <PageHead title="Actions" onBack={back} right={<BellBtn />} />
      <Segmented
        label="Action list"
        value={tab}
        onChange={setTab}
        options={[
          { value: 'rec', label: 'Recommended' },
          { value: 'all', label: 'All actions' },
          { value: 'applied', label: `Applied${applied.length ? ` · ${applied.length}` : ''}` },
        ]}
      />

      <ul className="mt-4 space-y-3">
        {list.map((a) => {
          const on = applied.includes(a.id);
          return (
            <li key={a.id}>
              <button
                type="button"
                onClick={() => setOpenId(a.id)}
                className="glass flex w-full items-start gap-3 rounded-[24px] p-3.5 text-left transition hover:brightness-[0.98] active:scale-[0.99]"
              >
                <IconTile icon={ICONS[a.id] ?? Lightbulb} color={on ? '#0f8f47' : SOURCES[a.source].color === '#f4b63f' ? '#d99a1c' : SOURCES[a.source].color} />
                <span className="min-w-0 flex-1">
                  <span className="block text-[14.5px] leading-tight font-extrabold">{a.title}</span>
                  <span className="mt-1.5 flex flex-wrap gap-1.5">
                    <span className={cx('inline-flex h-[22px] items-center rounded-full px-2 text-[10.5px] font-extrabold', PRIORITY[a.priority])}>
                      {a.priority} priority
                    </span>
                    {on && (
                      <span className="inline-flex h-[22px] items-center gap-1 rounded-full bg-navy px-2 text-[10.5px] font-extrabold text-white">
                        <Check className="size-3" strokeWidth={3.5} />
                        Applied
                      </span>
                    )}
                  </span>
                  <span className="mt-2.5 grid grid-cols-2 gap-x-3">
                    <span>
                      <span className="block text-[13px] font-extrabold tabular-nums">{fmt(a.tco2)} tCO₂e/yr</span>
                      <span className="block text-[11px] font-medium text-ink-soft">{a.invest ? `Investment ${inr(a.invest)}` : 'Low upfront cost'}</span>
                    </span>
                    <span>
                      <span className="block text-[13px] font-extrabold tabular-nums">{a.saving ? `${inr(a.saving)}/yr` : 'Savings vary'}</span>
                      <span className="block text-[11px] font-medium text-ink-soft">{a.payback ? `Payback ${fmt(a.payback)} years` : 'By material price'}</span>
                    </span>
                  </span>
                </span>
                <ChevronRight className="mt-3 size-4 shrink-0 text-ink-mute" strokeWidth={2.4} />
              </button>
            </li>
          );
        })}
      </ul>

      {list.length === 0 && (
        <div className="glass mt-1 flex flex-col items-center rounded-[26px] px-6 py-8 text-center">
          <img src="/img/leaf.webp" alt="" className="float w-14" />
          <p className="mt-3 text-[15px] font-extrabold">{empty[tab][0]}</p>
          <p className="mt-1 text-[13px] leading-snug text-ink-soft">{empty[tab][1]}</p>
          {tab !== 'all' && actions.length > 0 && (
            <SoftBtn className="mt-4" onClick={() => setTab(tab === 'applied' ? 'rec' : 'all')}>
              {tab === 'applied' ? 'See recommended' : 'See all actions'}
            </SoftBtn>
          )}
        </div>
      )}

      {list.length > 0 && (
        <p className="mt-4 px-1 text-[12px] leading-snug text-ink-soft">
          Figures are indicative estimates built from your inputs and the cost assumptions in Settings.
        </p>
      )}

      {open && (
        <Sheet title={open.title} onClose={() => setOpenId(null)}>
          <p className="text-[13.5px] leading-relaxed text-ink-soft">{open.desc}</p>
          <dl className="mt-4 grid grid-cols-2 gap-2.5">
            {[
              ['Reduction', `${fmt(open.tco2)} tCO₂e/yr`],
              ['Of your ' + SOURCES[open.source].label.toLowerCase(), `${Math.round(open.pct * 100)}%`],
              ['Investment', open.invest ? inr(open.invest) : 'Low upfront cost'],
              ['Annual saving', open.saving ? inr(open.saving) : 'Varies'],
            ].map(([k, v]) => (
              <div key={k} className="glass rounded-[18px] px-3.5 py-3">
                <dt className="text-[11.5px] font-bold text-ink-soft">{k}</dt>
                <dd className="text-[15px] font-extrabold tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-[12px] leading-snug text-ink-soft">{open.assumption}</p>
          <div className="mt-5 space-y-2.5">
            <Btn
              full
              onClick={() => {
                const was = applied.includes(open.id);
                toggleAction(open);
                toast(was ? 'Removed from applied actions' : 'Marked as applied');
                setOpenId(null);
              }}
            >
              {applied.includes(open.id) ? 'Remove from applied' : 'Mark as applied'}
            </Btn>
            {(open.source === 'electricity' || open.source === 'fuel' || open.source === 'transport') && (
              <SoftBtn
                full
                onClick={() => {
                  setWhatIf({ source: open.source, pct: Math.round(open.pct * 100) });
                  setOpenId(null);
                  go('whatif');
                }}
              >
                <SlidersHorizontal className="size-4 text-sky" />
                Simulate in What-If
              </SoftBtn>
            )}
          </div>
        </Sheet>
      )}
    </Page>
  );
}
