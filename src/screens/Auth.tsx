import { useState, type FormEvent } from 'react';
import { ChevronLeft, Eye, EyeOff, Lock, Mail, Phone, User } from 'lucide-react';
import { useApp } from '../lib/store';
import { Btn, CircleBtn, Logo, Page, Segmented, cx } from '../components/ui';

export function Splash() {
  const { go } = useApp();
  return (
    <div className="absolute inset-0 flex flex-col items-center overflow-hidden px-6">
      <div aria-hidden="true" className="absolute -bottom-28 -left-24 h-64 w-[85%] rounded-[50%] bg-gradient-to-b from-white to-[#cddbf8]" />
      <div aria-hidden="true" className="absolute -right-28 -bottom-36 h-72 w-[90%] rounded-[50%] bg-gradient-to-b from-[#f7faff] to-[#c3d4f6]" />
      <img src="/img/plants.webp" alt="" className="absolute bottom-16 -left-6 w-28 opacity-90" />
      <img src="/img/leaf.webp" alt="" className="float-slow absolute top-[38%] right-3 w-9 rotate-12 opacity-80 blur-[0.5px]" />
      <img src="/img/leaf.webp" alt="" className="absolute right-5 bottom-24 w-8 -rotate-45 opacity-60 blur-[1px]" />

      <div className="relative mt-[11%] text-center sm:mt-[8%]">
        <Logo size={44} />
        <p className="mt-3 text-[15px] leading-snug font-medium text-ink-soft">
          Carbon Intelligence
          <br />
          for MSMEs.
        </p>
      </div>

      <div className="relative grid min-h-0 w-full flex-1 place-items-center py-2">
        <img
          src="/img/globe.webp"
          alt="A glossy globe circled by a blue orbit ring with green leaves"
          className="float max-h-full w-[88%] object-contain drop-shadow-[0_30px_30px_rgba(46,84,170,0.28)]"
        />
      </div>

      <Btn arrow onClick={() => go('login')} className="relative mb-[max(2.5rem,env(safe-area-inset-bottom))] w-[212px]">
        Get Started
      </Btn>
    </div>
  );
}

function GoogleG() {
  return (
    <svg viewBox="0 0 24 24" className="size-[18px]" aria-hidden="true">
      <path fill="#4285F4" d="M23 12.27c0-.82-.07-1.6-.2-2.36H12v4.47h6.17a5.28 5.28 0 0 1-2.29 3.46v2.88h3.7C21.75 18.72 23 15.76 23 12.27z" />
      <path fill="#34A853" d="M12 23.5c3.1 0 5.7-1.03 7.59-2.78l-3.7-2.88c-1.03.69-2.34 1.1-3.89 1.1-2.99 0-5.52-2.02-6.43-4.74H1.75v2.97A11.5 11.5 0 0 0 12 23.5z" />
      <path fill="#FBBC05" d="M5.57 14.2a6.9 6.9 0 0 1 0-4.4V6.83H1.75a11.5 11.5 0 0 0 0 10.34l3.82-2.97z" />
      <path fill="#EA4335" d="M12 5.06c1.69 0 3.2.58 4.39 1.72l3.28-3.28C17.7 1.66 15.1.5 12 .5A11.5 11.5 0 0 0 1.75 6.83L5.57 9.8C6.48 7.08 9.01 5.06 12 5.06z" />
    </svg>
  );
}

type Mode = 'signin' | 'signup' | 'reset';

const COPY: Record<Mode, { title: string; sub: string; cta: string }> = {
  signin: { title: 'Welcome back', sub: 'Sign in to continue your greener journey.', cta: 'Sign In' },
  signup: { title: 'Create account', sub: 'Set up TerraAI for your business in a few minutes.', cta: 'Create Account' },
  reset: { title: 'Reset password', sub: 'Choose a new password to get back in.', cta: 'Reset & Sign In' },
};

export function Login() {
  const { back, signIn, account } = useApp();
  const [mode, setMode] = useState<Mode>('signin');
  const [via, setVia] = useState<'email' | 'phone'>('email');
  const [name, setName] = useState('');
  const [email, setEmail] = useState(account.email);
  const [phone, setPhone] = useState(account.phone);
  const [pw, setPw] = useState('');
  const [show, setShow] = useState(false);
  const [err, setErr] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (mode === 'signup' && !name.trim()) return setErr('Enter your full name.');
    if (via === 'email' && !/^\S+@\S+\.\S+$/.test(email)) return setErr('Enter a valid email address, like you@company.com.');
    if (via === 'phone' && phone.replace(/\D/g, '').length < 10) return setErr('Enter a 10-digit mobile number.');
    if (pw.length < 6) return setErr('Your password needs at least 6 characters.');
    setErr('');
    const guess = email
      .split('@')[0]
      .replace(/[._-]+/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
    signIn({
      name: name.trim() || account.name || (via === 'email' ? guess : ''),
      ...(via === 'email' ? { email } : { phone }),
    });
  };

  const swap = (m: Mode) => {
    setMode(m);
    setErr('');
    setPw('');
  };

  const field = 'glass flex h-[52px] items-center gap-3 rounded-2xl px-4 focus-within:shadow-[0_0_0_2px_var(--color-sky)]';

  return (
    <Page>
      <img src="/img/leaf.webp" alt="" className="float-slow absolute -top-1 right-2 w-20 rotate-[18deg] opacity-80 blur-[0.5px]" />
      <CircleBtn onClick={mode === 'signin' ? back : () => swap('signin')} label="Go back">
        <ChevronLeft className="size-5" strokeWidth={2.6} />
      </CircleBtn>

      <h1 className="mt-7 text-[28px] leading-tight font-extrabold tracking-tight">{COPY[mode].title}</h1>
      <p className="mt-2 max-w-[78%] text-[14px] leading-snug text-ink-soft">{COPY[mode].sub}</p>

      <form onSubmit={submit} noValidate className="mt-6">
        <Segmented
          label="Sign in with"
          value={via}
          onChange={(v) => {
            setVia(v);
            setErr('');
          }}
          options={[
            { value: 'email', label: 'Email' },
            { value: 'phone', label: 'Phone' },
          ]}
        />

        <div className="mt-5 space-y-3">
          {mode === 'signup' && (
            <label className={field}>
              <User className="size-[18px] shrink-0 text-sky" />
              <input className="bare" placeholder="Full name" aria-label="Full name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
            </label>
          )}
          {via === 'email' ? (
            <label className={field}>
              <Mail className="size-[18px] shrink-0 text-sky" />
              <input
                className="bare"
                type="email"
                placeholder="Email address"
                aria-label="Email address"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
          ) : (
            <label className={field}>
              <Phone className="size-[18px] shrink-0 text-sky" />
              <input
                className="bare"
                type="tel"
                inputMode="tel"
                placeholder="Mobile number"
                aria-label="Mobile number"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </label>
          )}
          <label className={field}>
            <Lock className="size-[18px] shrink-0 text-sky" />
            <input
              className="bare"
              type={show ? 'text' : 'password'}
              placeholder={mode === 'reset' ? 'New password' : 'Password'}
              aria-label={mode === 'reset' ? 'New password' : 'Password'}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              value={pw}
              onChange={(e) => setPw(e.target.value)}
            />
            <button
              type="button"
              aria-label={show ? 'Hide password' : 'Show password'}
              onClick={() => setShow(!show)}
              className="-mr-2 grid size-10 shrink-0 place-items-center rounded-full text-ink hover:bg-sky-soft"
            >
              {show ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
            </button>
          </label>
        </div>

        <div className="flex min-h-11 items-center justify-between gap-3">
          <p role="alert" className="text-[12.5px] font-semibold text-danger">
            {err}
          </p>
          {mode === 'signin' && (
            <button type="button" onClick={() => swap('reset')} className="h-11 shrink-0 text-[12.5px] font-bold text-ink hover:text-sky">
              Forgot password?
            </button>
          )}
        </div>

        <Btn type="submit" full arrow>
          {COPY[mode].cta}
        </Btn>
      </form>

      {mode !== 'reset' && (
        <>
          <div className="my-4 flex items-center gap-3 text-[12.5px] font-semibold text-ink-soft">
            <span className="h-px flex-1 bg-line" />
            or
            <span className="h-px flex-1 bg-line" />
          </div>
          <button
            type="button"
            onClick={() => signIn({})}
            className="glass flex h-12 w-full items-center justify-center gap-3 rounded-full text-[14px] font-bold text-ink transition hover:brightness-[0.97] active:scale-[0.98]"
          >
            <GoogleG />
            Continue with Google
          </button>
        </>
      )}

      <p className={cx('mt-4 text-center text-[13px] text-ink-soft')}>
        {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}{' '}
        <button
          type="button"
          onClick={() => swap(mode === 'signin' ? 'signup' : 'signin')}
          className="inline-flex h-11 items-center font-bold text-sky hover:underline"
        >
          {mode === 'signin' ? 'Create account' : 'Sign in'}
        </button>
      </p>
    </Page>
  );
}
