import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Clock3, CheckCircle2, Swords, Trophy } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLive } from '../../components/community/useLive';
import { Header, ErrorBox, panel, button, outlineButton } from '../../components/community/CommunityUI';

export default function BattleRoom() {
  const { id } = useParams();
  const {user} = useAuth();
  const {socket, connected} = useLive();
  const [battle, setBattle] = useState(null);
  const [answers, setAnswers] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [now, setNow] = useState(Date.now());
  const load = async () => { try { const {data} = await api.get(`/battles/${id}`); setBattle(data.battle); setError(''); }
    catch(e) { setError(e.response?.data?.message || 'Could not load battle'); } };
  useEffect(()=>{load();const interval=setInterval(()=>{setNow(Date.now());load();},3000);return()=>clearInterval(interval);},[id]);
  useEffect(()=>{ if(!socket)return;const handler=({id:updated})=>{if(updated===id)load();};socket.on('battle:update',handler);return()=>socket.off('battle:update',handler);},[socket,id]);
  const run=async(action)=>{setBusy(true);try{await api.post(`/battles/${id}/${action}`);await load();toast.success('Updated');}catch(e){toast.error(e.response?.data?.message||'Action failed');}finally{setBusy(false);}};
  const submit=async()=>{ if(!battle?.questions || Object.keys(answers).length!==battle.questions.length) return toast.error('Answer every question');
    setBusy(true);try{await api.post(`/battles/${id}/submit`,{answers:battle.questions.map((_,i)=>answers[i])});toast.success('Answers locked in');await load();}
    catch(e){toast.error(e.response?.data?.message||'Could not submit answers');}finally{setBusy(false);} };
  const seconds = battle?.endsAt ? Math.max(0,Math.ceil((new Date(battle.endsAt).getTime()-now)/1000)) : 0;
  const mine = String(user?._id);
  const youWon = battle?.status==='finished' && battle.winner===mine;
  return <div className="mx-auto max-w-4xl text-white">
    <Link to="/battles" className="mb-5 inline-block text-sm text-indigo-400">← All battles</Link>
    <Header title={battle ? battle.topic : 'Battle'} description="Both students receive exactly the same questions. No correct answers are revealed until the match is over." action={<span className="text-xs text-slate-400">{connected?'● Live':'○ Refresh active'}</span>}/>
    <ErrorBox message={error}/>
    {!battle ? <p className="text-slate-400">Loading battle…</p> : <>
      <div className={`${panel} mb-5 flex flex-wrap items-center justify-between gap-4`}>
        <div><p className="font-semibold">{battle.challengerName} <Swords className="mx-2 inline text-indigo-400" size={18}/> {battle.opponentName}</p>
          <p className="mt-1 text-xs text-slate-400">{battle.difficulty} · {battle.questionCount} questions · {battle.status}</p></div>
        {battle.status==='active' && <p className="flex items-center gap-2 text-xl font-bold text-amber-300"><Clock3 size={20}/>{Math.floor(seconds/60)}:{String(seconds%60).padStart(2,'0')}</p>}
      </div>
      {battle.status==='pending' && <div className={panel}>
        <p className="text-sm text-slate-300">Waiting for the invited student to accept. The invite expires after 24 hours.</p>
        {battle.opponent===mine && <div className="mt-4 flex gap-3"><button disabled={busy} onClick={()=>run('accept')} className={button}>Accept & start</button><button disabled={busy} onClick={()=>run('decline')} className={outlineButton}>Decline</button></div>}
      </div>}
      {(battle.status==='expired'||battle.status==='declined') && <div className={panel}>This invitation is no longer active.</div>}
      {battle.status==='active' && battle.submitted && <div className={panel}><CheckCircle2 className="mb-3 text-emerald-400"/><p className="font-bold">Your answers are submitted.</p><p className="mt-2 text-sm text-slate-400">Waiting for your friend or the timer. You cannot change your answers after submitting.</p></div>}
      {battle.status==='active' && !battle.submitted && seconds>0 && <div className="space-y-4">
        {battle.questions?.map((q,i)=><div className={panel} key={i}>
          <p className="mb-4 font-semibold leading-6"><span className="mr-2 text-indigo-400">{i+1}.</span>{q.question}</p>
          <div className="space-y-2">{q.options.map((o,j)=><button type="button" key={j} onClick={()=>setAnswers(prev=>({...prev,[i]:j}))}
            className={`block w-full rounded-xl border p-3 text-left text-sm ${answers[i]===j?'border-indigo-400 bg-indigo-500/20 text-white':'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-600'}`}>{'ABCD'[j]}. {o}</button>)}</div>
        </div>)}
        <button onClick={submit} disabled={busy} className={`w-full ${button}`}>{busy?'Submitting…':`Submit ${Object.keys(answers).length}/${battle.questionCount} answered`}</button>
      </div>}
      {battle.status==='finished' && <div className="space-y-4">
        <div className={`${panel} text-center`}><Trophy size={36} className="mx-auto mb-3 text-amber-400"/>
          <h2 className="text-2xl font-bold">{!battle.winner?'Draw':youWon?'You won!':'Your friend won!'}</h2>
          <p className="mt-2 text-sm text-slate-400">{battle.challengerName}: {battle.submissions?.find(s=>s.user===battle.challenger)?.score ?? 0}/{battle.questionCount} · {battle.opponentName}: {battle.submissions?.find(s=>s.user===battle.opponent)?.score ?? 0}/{battle.questionCount}</p>
          <p className="mt-2 text-xs text-slate-500">Tie-break: first valid submission for equal nonzero scores. Otherwise a draw.</p></div>
        {battle.questions?.map((q,i)=><div className={panel} key={i}><h3 className="font-semibold">{i+1}. {q.question}</h3>
          <p className="mt-3 text-sm text-emerald-400">Correct: {q.options[q.correctAnswer]}</p><p className="mt-2 text-sm text-slate-400">{q.explanation}</p></div>)}
      </div>}
    </>}
  </div>;
}
