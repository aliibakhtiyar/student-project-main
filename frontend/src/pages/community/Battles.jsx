import { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Swords } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLive } from '../../components/community/useLive';
import { Header, ErrorBox, Empty, panel, input, button, outlineButton } from '../../components/community/CommunityUI';

export default function Battles() {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { socket, connected } = useLive();
  const [friends, setFriends] = useState([]);
  const [battles, setBattles] = useState([]);
  const [opponentId, setOpponentId] = useState(params.get('opponent') || '');
  const [topic, setTopic] = useState('DSA Arrays');
  const [difficulty, setDifficulty] = useState('Medium');
  const [count, setCount] = useState(5);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const load = async () => { try { const {data} = await api.get('/battles'); setBattles(data.battles || []); } catch { setError('Could not load challenges'); } };
  useEffect(() => {
    api.get('/community/friends').then(({data}) => setFriends((data.friendships || []).filter(x=>x.status==='accepted'))).catch(()=>{});
    load(); const timer = setInterval(load, 15000); return ()=>clearInterval(timer);
  }, []);
  useEffect(() => { if (!socket) return; socket.on('battle:update', load); return () => socket.off('battle:update', load); }, [socket]);
  const create = async (e) => { e.preventDefault(); if (!opponentId) return toast.error('Select a friend first');
    setBusy(true); try { const {data} = await api.post('/battles', {opponentId, topic, difficulty, count:Number(count)});
      toast.success('Challenge sent!'); await load(); navigate(`/battles/${data.battle.id}`);
    } catch (e) { toast.error(e.response?.data?.message || 'Could not create challenge'); } finally { setBusy(false); } };
  const accept = async (id, type) => { setBusy(true); try { await api.post(`/battles/${id}/${type}`); await load(); if (type==='accept') navigate(`/battles/${id}`); }
    catch(e) { toast.error(e.response?.data?.message || 'Could not update invitation'); } finally {setBusy(false);} };
  return <div className="mx-auto max-w-6xl text-white">
    <Header title="Friend vs Friend" description="Invite an accepted friend to the same timed, AI-generated question set. Scores are checked on the server and answers stay hidden until the match finishes." action={<span className="text-xs text-slate-500">{connected ? '● Live connected':'○ Reconnecting / refresh supported'}</span>}/>
    <ErrorBox message={error}/>
    <div className="grid gap-5 lg:grid-cols-3">
      <section className={`${panel} lg:col-span-1`}><h2 className="mb-4 flex items-center gap-2 font-bold"><Swords className="text-indigo-400" size={20}/> Create battle</h2>
        <form className="space-y-4" onSubmit={create}>
          <label className="block text-xs text-slate-400">Friend<select className={`${input} mt-2`} required value={opponentId} onChange={e=>setOpponentId(e.target.value)}><option value="">Select friend</option>{friends.map(f=><option value={f.student.id} key={f.id}>{f.student.name}</option>)}</select></label>
          <label className="block text-xs text-slate-400">Topic<input className={`${input} mt-2`} required maxLength={80} value={topic} onChange={e=>setTopic(e.target.value)}/></label>
          <label className="block text-xs text-slate-400">Difficulty<select className={`${input} mt-2`} value={difficulty} onChange={e=>setDifficulty(e.target.value)}><option>Easy</option><option>Medium</option><option>Hard</option></select></label>
          <label className="block text-xs text-slate-400">Number of questions<select className={`${input} mt-2`} value={count} onChange={e=>setCount(Number(e.target.value))}><option value={5}>5 · 10 minutes</option><option value={10}>10 · 15 minutes</option></select></label>
          <button disabled={busy || friends.length===0} className={`w-full ${button}`}>{busy?'Generating challenge…':'Challenge friend'}</button>
          {friends.length===0 && <p className="text-xs text-slate-400">Add a friend first in <Link className="text-indigo-300" to="/friends">Friends</Link>.</p>}
        </form>
      </section>
      <section className="lg:col-span-2"><h2 className="mb-4 font-bold">My challenges</h2>
        {battles.length===0 ? <Empty title="No battles yet" description="Invite your first friend to a timed quiz."/> :
          <div className="space-y-3">{battles.map(b=>{
            const isChallenger=String(b.challenger)===String(user?._id);
            return <div className={`${panel} flex flex-col gap-3 sm:flex-row sm:items-center`} key={b.id}>
              <div className="min-w-0 flex-1"><p className="truncate font-semibold">{b.topic} <span className="ml-1 text-xs font-normal text-slate-500">({b.difficulty})</span></p>
                <p className="mt-1 text-xs text-slate-400">{isChallenger?`Sent to ${b.opponentName}`:`From ${b.challengerName}`} · {b.questionCount} questions</p>
                <p className="mt-2 inline-block rounded-lg bg-indigo-500/10 px-2 py-1 text-xs capitalize text-indigo-300">{b.status}</p></div>
              <div className="flex flex-wrap gap-2">
                {b.status==='pending' && !isChallenger && <><button disabled={busy} className={button} onClick={()=>accept(b.id,'accept')}>Accept</button><button disabled={busy} className={outlineButton} onClick={()=>accept(b.id,'decline')}>Decline</button></>}
                {(b.status==='active'||b.status==='finished'||b.status==='pending') && <Link className={outlineButton} to={`/battles/${b.id}`}>{b.status==='finished'?'Results':b.status==='pending'?'View invite':'Open battle'}</Link>}
              </div></div>;
          })}</div>}
      </section>
    </div>
  </div>;
}
