import { useEffect, useState } from 'react';
import { Trophy, Medal } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Header, ErrorBox, Empty, panel } from '../../components/community/CommunityUI';

export default function Leaderboard() {
  const [scope, setScope] = useState('global');
  const [period, setPeriod] = useState('week');
  const [leaders, setLeaders] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  useEffect(() => {
    let active = true;
    setLoading(true); setError('');
    api.get('/community/leaderboard', { params: { period, scope } })
      .then(({data}) => { if(active) setLeaders(data.leaders || []); })
      .catch(() => { if(active) setError('Could not load rankings'); })
      .finally(() => { if(active) setLoading(false); });
    return () => { active = false; };
  }, [scope, period]);
  return <div className="mx-auto max-w-5xl text-white">
    <Header title="Student Leaderboard" description="Compete across the platform. Only your best quiz per topic, difficulty and UTC day counts toward XP, so repeating a quiz cannot be repeated for extra XP. Daily XP is capped at 500." />
    <ErrorBox message={error}/>
    <div className={`${panel} mb-5 flex flex-wrap items-center gap-3`}>
      <label className="text-sm text-slate-400">Rankings</label>
      <select aria-label="Leaderboard scope" className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm" value={scope} onChange={e=>setScope(e.target.value)}>
        <option value="global">Global</option><option value="college">My college</option><option value="friends">Friends</option>
      </select>
      <select aria-label="Leaderboard period" className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm" value={period} onChange={e=>setPeriod(e.target.value)}>
        <option value="week">Last 7 days</option><option value="month">Last 30 days</option><option value="all">All-time</option>
      </select>
    </div>
    {loading ? <p className="text-slate-400">Loading rankings…</p> : leaders.length===0 ?
      <Empty title="No leaderboard activity yet" description="Complete quizzes to earn XP and appear here." to="/quiz-practice" label="Practice now"/> :
      <div className="space-y-3">{leaders.map(student => <div key={student.userId} className={`${panel} flex items-center gap-3 ${String(student.userId)===String(user?._id) ? 'border-indigo-500/60' : ''}`}>
        <span className="flex w-8 shrink-0 items-center justify-center text-lg font-bold text-indigo-300">{student.rank <= 3 ? <Medal size={23} className={student.rank===1?'text-amber-400':student.rank===2?'text-slate-300':'text-orange-400'}/> : `#${student.rank}`}</span>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 font-bold text-indigo-300">{student.name?.[0]?.toUpperCase() || 'S'}</div>
        <div className="min-w-0 flex-1"><p className="truncate font-semibold">{student.name} {String(student.userId)===String(user?._id) && <span className="text-xs text-indigo-400">(you)</span>}</p>
          <p className="truncate text-xs text-slate-500">{student.institute}</p></div>
        <div className="shrink-0 text-right"><p className="flex items-center justify-end gap-1.5 text-lg font-bold text-amber-400"><Trophy size={16}/>{student.xp} XP</p><p className="text-xs text-slate-500">{student.scoringQuizzes} scored sessions</p></div>
      </div>)}</div>}
  </div>;
}
