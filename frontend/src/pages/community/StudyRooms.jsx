import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { UsersRound, Plus, LockKeyhole, Code2 } from 'lucide-react';
import api from '../../services/api';
import { Header, Empty, panel, input, button, outlineButton } from '../../components/community/CommunityUI';

export default function StudyRooms() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [title, setTitle] = useState('DSA Study Group');
  const [topic, setTopic] = useState('Arrays & Strings');
  const [joinCode, setJoinCode] = useState('');
  const [busy, setBusy] = useState(false);
  const load = async () => { try { const {data} = await api.get('/rooms');setRooms(data.rooms || []); } catch { toast.error('Could not load rooms'); } };
  useEffect(()=>{load();},[]);
  const run = async (action,payload) => {
    setBusy(true);try{const {data}=await api.post(action,payload);toast.success(action==='/rooms'?'Room created':'Joined room');navigate(`/study-rooms/${data.room.id}`);}
    catch(e){toast.error(e.response?.data?.message||'Unable to continue');}finally{setBusy(false);} };
  return <div className="mx-auto max-w-6xl text-white">
    <Header title="Collaborative Study Rooms" description="Create a private room for up to 8 students. Share an invite code, chat live, and work in a synchronized code scratchpad." />
    <div className="mb-6 grid gap-5 md:grid-cols-2">
      <section className={panel}><h2 className="mb-4 flex items-center gap-2 font-bold"><Plus size={20} className="text-indigo-400"/> Create a room</h2>
        <form onSubmit={e=>{e.preventDefault();run('/rooms',{title,topic});}} className="space-y-3">
          <label className="block text-xs text-slate-400">Room title<input required minLength={3} maxLength={80} value={title} onChange={e=>setTitle(e.target.value)} className={`${input} mt-2`}/></label>
          <label className="block text-xs text-slate-400">Study topic<input required minLength={2} maxLength={80} value={topic} onChange={e=>setTopic(e.target.value)} className={`${input} mt-2`}/></label>
          <button disabled={busy} className={button}>Create private room</button>
        </form>
      </section>
      <section className={panel}><h2 className="mb-4 flex items-center gap-2 font-bold"><LockKeyhole size={20} className="text-indigo-400"/> Join a friend</h2>
        <form className="space-y-3" onSubmit={e=>{e.preventDefault();run('/rooms/join',{joinCode});}}>
          <label className="block text-xs text-slate-400">10-character invite code<input required minLength={10} maxLength={10} className={`${input} mt-2 uppercase tracking-[.2em]`} placeholder="AB12CD34EF" value={joinCode} onChange={e=>setJoinCode(e.target.value.toUpperCase())}/></label>
          <p className="text-xs text-slate-500">Ask the room owner to share their private code.</p>
          <button className={outlineButton} disabled={busy}>Join room</button>
        </form>
      </section>
    </div>
    <h2 className="mb-4 font-bold">My study rooms ({rooms.length})</h2>
    {rooms.length===0?<Empty title="No study rooms yet" description="Start a collaborative room or join one with an invite code."/> :
      <div className="grid gap-3 md:grid-cols-2">{rooms.map(r=><Link key={r.id} to={`/study-rooms/${r.id}`} className={`${panel} block transition hover:border-indigo-500/50`}>
        <h3 className="flex items-center gap-2 font-semibold"><Code2 size={18} className="text-indigo-400"/>{r.title}</h3>
        <p className="mt-2 text-sm text-slate-400">{r.topic}</p><p className="mt-3 flex items-center gap-2 text-xs text-slate-500"><UsersRound size={14}/>{r.members.length} members · Last edited {new Date(r.updatedAt).toLocaleDateString()}</p>
      </Link>)}</div>}
  </div>;
}
