import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Target, Flame, Swords } from 'lucide-react';
import api from '../../services/api';
import { Header, Metric, ErrorBox, Empty, panel, button } from '../../components/community/CommunityUI';

const Stats = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { api.get('/community/stats').then(r => setData(r.data)).catch(() => setError('Unable to load your skill statistics.')); }, []);
  const topics = data?.topics || [];
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(); d.setUTCHours(0,0,0,0); d.setUTCDate(d.getUTCDate() - (29-i));
    const date = d.toISOString().slice(0,10);
    return { date, count: data?.activity?.find(x => x.date === date)?.count || 0 };
  });
  return <div className="mx-auto max-w-6xl text-white">
    <Header title="My Skill Stats" description="Your real quiz progress, strengths, consistency and head-to-head results — based on completed attempts, not generated AI guesses."
      action={<Link to="/quiz-practice" className={button}>Practice a topic</Link>} />
    <ErrorBox message={error}/>
    {!data ? <p className="text-slate-400">Loading your stats…</p> : <>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric label="Total XP" value={data.xp.toLocaleString()} helper="Daily XP capped at 500"/>
        <Metric label="Quizzes" value={data.completed} helper="Completed practice sessions"/>
        <Metric label="Accuracy" value={`${data.accuracy}%`} helper={`${data.correct} of ${data.questions} correct`}/>
        <Metric label="Current streak" value={`${data.streak} day${data.streak===1?'':'s'}`} helper="Consecutive UTC days"/>
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <section className={`${panel} lg:col-span-2`}>
          <h2 className="mb-1 flex items-center gap-2 text-lg font-bold"><Target size={20} className="text-indigo-400"/> Topic proficiency</h2>
          <p className="mb-5 text-sm text-slate-400">Accuracy of answered questions, grouped by topic.</p>
          {topics.length===0 ? <Empty title="No practice data yet" description="Complete your first quiz to unlock your skill breakdown." to="/quiz-practice" label="Start quiz"/> :
            <div className="space-y-5">{topics.map(topic => <div key={topic.topic}>
              <div className="mb-2 flex items-center justify-between gap-2 text-sm">
                <span className="truncate font-semibold">{topic.topic}</span>
                <span className="shrink-0 text-slate-400">{topic.accuracy}% · {topic.attempts} quizzes</span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-800"><div className="h-2.5 rounded-full bg-indigo-500 transition-all" style={{width: `${topic.accuracy}%`}} /></div>
            </div>)}</div>}
        </section>
        <div className="space-y-5">
          <div className={panel}><h2 className="flex items-center gap-2 font-bold"><Swords size={19} className="text-violet-400"/> PvP Record</h2>
            <div className="mt-5 grid grid-cols-3 gap-2 text-center">
              {['wins','losses','draws'].map(key => <div key={key} className="rounded-xl bg-slate-900 p-3"><div className="text-2xl font-bold">{data.pvp?.[key] || 0}</div><div className="mt-1 text-xs capitalize text-slate-400">{key}</div></div>)}
            </div><Link to="/battles" className="mt-4 inline-block text-sm font-semibold text-indigo-300">View battles →</Link>
          </div>
          <div className={panel}><h2 className="flex items-center gap-2 font-bold"><Flame size={19} className="text-amber-400"/> Recent activity</h2>
            <p className="mt-1 text-xs text-slate-400">Past 30 days of completed quizzes</p>
            <div className="mt-5 grid grid-cols-10 gap-1.5">{days.map(d => <span key={d.date} title={`${d.date}: ${d.count} quizzes`} className={`aspect-square rounded-sm ${d.count===0 ? 'bg-slate-800' : d.count===1 ? 'bg-indigo-900' : d.count===2 ? 'bg-indigo-600' : 'bg-indigo-400'}`} />)}</div>
          </div>
        </div>
      </div>
    </>}
  </div>;
};
export default Stats;
