import { useState, type FormEvent } from 'react';
import { LogOut, Pencil, UserPlus, X } from 'lucide-react';
import { fmt, inr, num } from '../lib/calc';
import { useApp } from '../lib/store';
import { Btn, Labeled, MenuRow, Page, PageHead, Sheet, SoftBtn } from '../components/ui';
import { BellBtn } from './Home';

export function Profile() {
  const { inputs, account, setAccount, result, actions, applied, shared, share, unshare, startEdit, signOut, toast } = useApp();
  const [sheet, setSheet] = useState<'account' | 'share' | null>(null);
  const [draft, setDraft] = useState(account);
  const [invite, setInvite] = useState('');
  const [err, setErr] = useState('');

  const b = inputs.business;
  const initials =
    b.name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join('') || 'T';
  const done = actions.filter((a) => applied.includes(a.id));
  const cut = done.reduce((s, a) => s + a.tco2, 0);
  const saved = done.reduce((s, a) => s + (a.saving ?? 0), 0);

  const submitInvite = (e: FormEvent) => {
    e.preventDefault();
    const email = invite.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(email)) return setErr('Enter a valid email address.');
    if (shared.some((s) => s.email === email)) return setErr('That person already has access.');
    share(email);
    setInvite('');
    setErr('');
  };

  return (
    <Page>
      <PageHead title="Profile" right={<BellBtn />} />

      <section className="flex items-center gap-4">
        <span className="grid size-[62px] shrink-0 place-items-center rounded-full bg-gradient-to-br from-sky-2 to-[#1d4fd8] text-[21px] font-extrabold text-white shadow-[0_14px_22px_-10px_rgba(36,89,230,0.8),inset_0_2px_0_rgba(255,255,255,0.4)] ring-4 ring-white">
          {initials}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-[18px] font-extrabold tracking-tight">{b.name}</h2>
          <p className="truncate text-[12.5px] font-medium text-ink-soft">{account.name ? `Owner: ${account.name}` : 'Business Owner'}</p>
          {b.city && <p className="truncate text-[12.5px] font-medium text-ink-soft">{b.city}</p>}
        </div>
        <button
          type="button"
          aria-label="Edit business details"
          onClick={() => startEdit('w-business')}
          className="glass grid size-11 shrink-0 place-items-center rounded-full text-sky"
        >
          <Pencil className="size-4" strokeWidth={2.3} />
        </button>
      </section>

      <section className="glass mt-5 rounded-[26px] p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[14px] font-extrabold">Account details</h3>
          <button
            type="button"
            onClick={() => {
              setDraft(account);
              setSheet('account');
            }}
            className="-my-2 h-11 px-1 text-[12.5px] font-bold text-sky hover:underline"
          >
            Edit
          </button>
        </div>
        <dl className="mt-2 space-y-2 text-[13px]">
          {[
            ['Name', account.name],
            ['Email', account.email],
            ['Phone', account.phone],
          ].map(([k, v]) => (
            <div key={k} className="flex gap-3">
              <dt className="w-16 shrink-0 font-medium text-ink-soft">{k}</dt>
              <dd className="min-w-0 flex-1 truncate font-bold">{v || <span className="font-medium text-ink-mute">Not added</span>}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="glass mt-3 rounded-[26px] p-4">
        <h3 className="text-[14px] font-extrabold">Business details</h3>
        <dl className="mt-2 space-y-2 text-[13px]">
          {[
            ['Industry', b.industry],
            ['Employees', num(b.employees)],
            ['Reporting period', b.period],
            ['Footprint', `${fmt(result.total)} tCO₂e`],
          ].map(([k, v]) => (
            <div key={k} className="flex gap-3">
              <dt className="w-32 shrink-0 font-medium text-ink-soft">{k}</dt>
              <dd className="min-w-0 flex-1 truncate font-bold">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <h3 className="mt-5 text-[14px] font-extrabold">Progress</h3>
      <div className="mt-2.5 grid grid-cols-2 gap-2.5">
        <div className="glass-leaf rounded-[22px] p-3.5">
          <p className="text-[20px] leading-tight font-extrabold tracking-tight text-leaf tabular-nums">
            {fmt(result.total ? (cut / result.total) * 100 : 0)}%
          </p>
          <p className="mt-0.5 text-[12.5px] font-bold">CO₂e reduction</p>
          <p className="text-[11.5px] font-medium text-ink-soft">from applied actions</p>
        </div>
        <div className="glass rounded-[22px] p-3.5">
          <p className="text-[20px] leading-tight font-extrabold tracking-tight tabular-nums">{inr(saved)}</p>
          <p className="mt-0.5 text-[12.5px] font-bold">Yearly saving</p>
          <p className="text-[11.5px] font-medium text-ink-soft">from applied actions</p>
        </div>
      </div>

      <section className="glass mt-3 rounded-[26px] p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-[14px] font-extrabold">Shared with</h3>
            <p className="truncate text-[12.5px] font-medium text-ink-soft">
              {shared.length ? shared.map((s) => s.email).join(', ') : 'Only you can see this report'}
            </p>
          </div>
          <SoftBtn onClick={() => setSheet('share')} className="h-11! shrink-0 px-4! text-[12.5px]!">
            Manage
          </SoftBtn>
        </div>
      </section>

      <div className="glass mt-3 rounded-[22px] p-1">
        <MenuRow icon={LogOut} label="Log Out" danger onClick={signOut} />
      </div>

      {sheet === 'account' && (
        <Sheet title="Account details" onClose={() => setSheet(null)}>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              setAccount({ name: draft.name.trim(), email: draft.email.trim(), phone: draft.phone.trim() });
              setSheet(null);
              toast('Account details saved');
            }}
          >
            <Labeled label="Name">
              <input className="input" aria-label="Name" autoComplete="name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </Labeled>
            <Labeled label="Email">
              <input className="input" type="email" aria-label="Email" autoComplete="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
            </Labeled>
            <Labeled label="Phone">
              <input className="input" type="tel" aria-label="Phone" autoComplete="tel" value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} />
            </Labeled>
            <Btn type="submit" full className="mt-5!">
              Save
            </Btn>
          </form>
        </Sheet>
      )}

      {sheet === 'share' && (
        <Sheet title="Shared with" onClose={() => setSheet(null)}>
          <p className="text-[13px] leading-snug text-ink-soft">Keep a list of the people you share this report with, such as your CA or accountant.</p>
          <form onSubmit={submitInvite} noValidate className="mt-4">
            <div className="flex gap-2">
              <input
                className="input flex-1"
                type="email"
                placeholder="name@firm.com"
                aria-label="Email to share with"
                value={invite}
                onChange={(e) => {
                  setInvite(e.target.value);
                  setErr('');
                }}
              />
              <Btn type="submit" className="px-5!">
                <UserPlus className="size-4" />
                Add
              </Btn>
            </div>
            <p role="alert" className="mt-1.5 min-h-4 text-[12px] font-semibold text-danger">
              {err}
            </p>
          </form>
          <ul className="mt-2 space-y-2">
            {shared.map((s) => (
              <li key={s.email} className="glass flex items-center gap-3 rounded-2xl py-1.5 pr-1.5 pl-4">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13.5px] font-bold">{s.email}</span>
                  <span className="block text-[11.5px] font-medium text-ink-soft">
                    Added {new Date(s.at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </span>
                <button
                  type="button"
                  aria-label={`Remove ${s.email}`}
                  onClick={() => unshare(s.email)}
                  className="grid size-11 shrink-0 place-items-center rounded-full text-danger hover:bg-danger-soft"
                >
                  <X className="size-4" />
                </button>
              </li>
            ))}
            {shared.length === 0 && <li className="py-3 text-center text-[13px] font-medium text-ink-soft">No one added yet.</li>}
          </ul>
        </Sheet>
      )}
    </Page>
  );
}
