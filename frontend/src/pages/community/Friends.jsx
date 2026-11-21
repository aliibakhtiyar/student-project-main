import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { UserRoundPlus, Search, Check, X, Swords, Users } from 'lucide-react';
import api from '../../services/api';
import { useLive } from '../../components/community/useLive';
import { Header, ErrorBox, panel, input, button, outlineButton } from '../../components/community/CommunityUI';

export default function Friends() {
  const [search, setSearch] = useState('');
  const [students, setStudents] = useState([]);
  const [friends, setFriends] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { socket } = useLive();
  const load = async () => { try { const {data} = await api.get('/community/friends'); setFriends(data.friendships || []); } catch { setError('Could not load friend requests'); } };
  useEffect(() => { load(); }, []);
  useEffect(() => { if (!socket) return; socket.on('social:update', load); return () => socket.off('social:update', load); }, [socket]);
  useEffect(() => {
    const q = search.trim(); if (q.length < 2) { setStudents([]); return; }
    let alive = true;
    const timer = setTimeout(() => api.get('/community/students', {params:{search:q}})
      .then(r => { if (alive) setStudents(r.data.students || []); })
      .catch(() => { if (alive) setStudents([]); }), 350);
    return () => { alive = false; clearTimeout(timer); };
  }, [search]);
  const act = async (run) => { setBusy(true); try { await run(); await load(); toast.success('Updated successfully'); } catch(e) { toast.error(e.response?.data?.message || 'Action failed'); } finally { setBusy(false); } };
  const known = new Set(friends.map(f=>f.student.id));
  const groups = {accepted:friends.filter(f=>f.status==='accepted'), incoming:friends.filter(f=>f.status==='pending' && f.direction==='incoming'), outgoing:friends.filter(f=>f.status==='pending' && f.direction==='outgoing')};
  function Student({person, actions}) { return <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-3">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600/20 font-bold text-indigo-300">{person.name?.[0]?.toUpperCase()}</div>
    <div className="min-w-0 flex-1"><p className="truncate font-semibold">{person.name}</p><p className="truncate text-xs text-slate-500">{person.institute}</p></div>
    <div className="flex flex-wrap gap-2">{actions}</div>
  </div>; }
  return <div className="mx-auto max-w-6xl text-white">
    <Header title="Student Friends" description="Find classmates, connect, and invite friends to 1v1 knowledge battles or private study rooms." />
    <ErrorBox message={error}/>
    <section className={`${panel} mb-5`}>
      <h2 className="mb-3 flex items-center gap-2 font-bold"><Search size={18} className="text-indigo-400"/> Find students</h2>
      <input className={input} placeholder="Search students by name (at least 2 characters)" maxLength={60} value={search} onChange={e=>setSearch(e.target.value)} />
      <div className="mt-3 space-y-2">{students.filter(s=>!known.has(s.id)).map(s=><Student key={s.id} person={s} actions={<button disabled={busy} className={button} onClick={()=>act(()=>api.post('/community/friends/request',{recipientId:s.id}))}><UserRoundPlus size={15} className="mr-1 inline"/> Add friend</button>}/>)}</div>
      {search.trim().length>=2 && students.filter(s=>!known.has(s.id)).length===0 && <p className="mt-3 text-sm text-slate-400">No new matching students found.</p>}
    </section>
    <div className="grid gap-5 lg:grid-cols-2">
      <section className={panel}><h2 className="mb-4 flex items-center gap-2 font-bold"><Users size={19} className="text-indigo-400"/> My Friends ({groups.accepted.length})</h2>
        {groups.accepted.length===0 ? <p className="text-sm text-slate-400">No friends added yet. Search for someone above.</p> : <div className="space-y-2">{groups.accepted.map(f=><Student key={f.id} person={f.student} actions={<><Link to={`/battles?opponent=${f.student.id}`} className={button}><Swords size={15} className="mr-1 inline"/> Challenge</Link><button className={outlineButton} disabled={busy} onClick={()=>act(()=>api.delete(`/community/friends/${f.id}`))}>Remove</button></>}/>)}</div>}
      </section>
      <div className="space-y-5"><section className={panel}><h2 className="mb-4 font-bold">Incoming requests ({groups.incoming.length})</h2>
        {groups.incoming.length===0 ? <p className="text-sm text-slate-400">No pending invitations.</p> : <div className="space-y-2">{groups.incoming.map(f=><Student key={f.id} person={f.student} actions={<><button className={button} disabled={busy} onClick={()=>act(()=>api.patch(`/community/friends/${f.id}/accept`))}><Check size={15} className="mr-1 inline"/> Accept</button><button className={outlineButton} disabled={busy} onClick={()=>act(()=>api.delete(`/community/friends/${f.id}`))}><X size={15}/></button></>}/>)}</div>}
      </section>
      <section className={panel}><h2 className="mb-4 font-bold">Sent requests ({groups.outgoing.length})</h2>
        {groups.outgoing.length===0 ? <p className="text-sm text-slate-400">No outstanding requests.</p> : <div className="space-y-2">{groups.outgoing.map(f=><Student key={f.id} person={f.student} actions={<button className={outlineButton} disabled={busy} onClick={()=>act(()=>api.delete(`/community/friends/${f.id}`))}>Cancel</button>}/>)}</div>}
      </section></div>
    </div>
  </div>;
}
