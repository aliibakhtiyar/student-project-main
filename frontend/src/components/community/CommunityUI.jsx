import { Link } from 'react-router-dom';
export const panel = 'rounded-2xl border border-slate-800 bg-[#0D1422] p-4 sm:p-6';
export const input = 'w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-indigo-400';
export const button = 'rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50';
export const outlineButton = 'rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 disabled:opacity-50';
export function Header({ eyebrow='STUDENT ARENA', title, description, action }) {
  return <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
    <div><p className="text-xs font-bold uppercase tracking-[.2em] text-indigo-400">{eyebrow}</p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">{description}</p>
    </div>{action}
  </div>;
}
export function ErrorBox({ message }) { return message ? <p role="alert" className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">{message}</p> : null; }
export function Empty({ title, description, to, label }) { return <div className={`${panel} text-center`}>
  <p className="font-semibold text-white">{title}</p><p className="mt-2 text-sm text-slate-400">{description}</p>
  {to && <Link to={to} className={`mt-4 inline-block ${button}`}>{label}</Link>}
</div>; }
export function Metric({ label, value, helper }) { return <div className={panel}>
  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
  <p className="mt-3 text-3xl font-bold text-white">{value}</p>
  {helper && <p className="mt-1 text-xs text-slate-500">{helper}</p>}
</div>; }
