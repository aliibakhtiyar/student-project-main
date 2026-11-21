import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Copy, Send, Save, UsersRound, Code2, RefreshCcw } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLive } from '../../components/community/useLive';
import { Header, ErrorBox, panel, input, button, outlineButton } from '../../components/community/CommunityUI';

export default function StudyRoom() {
  const {id} = useParams(); const navigate = useNavigate();
  const {user} = useAuth(); const {socket, connected} = useLive();
  const [room,setRoom] = useState(null);
  const [messages,setMessages] = useState([]);
  const [message,setMessage] = useState('');
  const [code,setCode] = useState('');
  const [language,setLanguage] = useState('javascript');
  const [revision,setRevision] = useState(0);
  const [dirty,setDirty] = useState(false);
  const [conflict,setConflict] = useState(false);
  const [saving,setSaving] = useState(false);
  const [error,setError] = useState('');
  const scrollRef = useRef(null);
  const loadRoom = async()=>{try{const {data}=await api.get(`/rooms/${id}`);setRoom(data.room);setCode(data.room.code||'');setRevision(data.room.revision);setLanguage(data.room.language);setDirty(false);setConflict(false);}
    catch(e){setError(e.response?.data?.message||'Unable to load room');}};
  const loadMessages = async()=>{try{const {data}=await api.get(`/rooms/${id}/messages`);setMessages(data.messages||[]);}catch{}};
  useEffect(()=>{loadRoom();loadMessages();},[id]);
  useEffect(()=>{if(!socket)return;
    const onCode=(update)=>{if(update.roomId!==id)return;setRevision(update.revision);
      if(String(update.editorId)===String(user?._id))return;
      setCode(prev => { if (dirty) {setConflict(true); return prev;} return update.code; });
      if(!dirty)setLanguage(update.language);
    };
    const onChat=(item)=>{if(item.roomId!==id)return;setMessages(prev=>prev.some(m=>m.id===item.id)?prev:[...prev,item].slice(-100));};
    const onMembership=(item)=>{if(item.roomId===id && !dirty)loadRoom();};
    socket.emit('room:subscribe',{roomId:id});
    socket.on('room:code',onCode);socket.on('room:chat',onChat);socket.on('room:membership',onMembership);
    return()=>{socket.emit('room:unsubscribe',{roomId:id});socket.off('room:code',onCode);socket.off('room:chat',onChat);socket.off('room:membership',onMembership);};
  },[socket,id,dirty,user?._id]);
  useEffect(()=>{scrollRef.current?.scrollIntoView({behavior:'smooth'});},[messages.length]);
  // HTTP fallback for chat after reconnection or Render instance restart.
  useEffect(()=>{const t=setInterval(loadMessages,15000);return()=>clearInterval(t);},[id]);
  const send=()=>{if(!message.trim())return;
    if(!socket?.connected)return toast.error('Connection interrupted. Reconnecting…');
    socket.emit('room:chat',{roomId:id,text:message.trim()},ack=>{if(!ack?.ok)toast.error(ack?.error||'Could not send');else setMessage('');});
  };
  const save=()=>{if(!socket?.connected)return toast.error('Reconnect to save changes');
    setSaving(true);socket.emit('room:edit',{roomId:id,revision,code,language},ack=>{
      setSaving(false);
      if(!ack?.ok){setConflict(true);return toast.error(ack?.error||'Could not save');}
      setRevision(ack.revision);setDirty(false);setConflict(false);toast.success('Shared editor updated');
    });
  };
  const leave=async()=>{try{await api.post(`/rooms/${id}/leave`);navigate('/study-rooms');}catch(e){toast.error(e.response?.data?.message||'Could not leave');}};
  const copy=()=>{navigator.clipboard.writeText(room.joinCode).then(()=>toast.success('Invite code copied')).catch(()=>toast.error('Copy failed'));};
  return <div className="mx-auto max-w-7xl text-white">
    <Link to="/study-rooms" className="mb-4 inline-block text-sm text-indigo-400">← All rooms</Link>
    <Header title={room?.title||'Study Room'} description={room?.topic||'Shared workspace'} action={<span className="text-xs text-slate-400">{connected?'● Live connected':'○ Reconnecting'}</span>}/>
    <ErrorBox message={error}/>
    {!room?<p className="text-slate-400">Loading room…</p>:<>
      <div className={`${panel} mb-5 flex flex-wrap items-center gap-4`}>
        <button className={`${outlineButton} flex items-center gap-2`} onClick={copy}><Copy size={16}/>{room.joinCode}</button>
        <span className="flex items-center gap-2 text-xs text-slate-400"><UsersRound size={16}/>{room.members.map(m=>m.name||'Student').join(', ')}</span>
        <span className="ml-auto text-xs text-slate-500">{room.members.length}/8 members</span>
        {room.owner!==String(user?._id) && <button className="text-xs text-rose-400" onClick={leave}>Leave room</button>}
      </div>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(310px,1fr)]">
        <section className={panel}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 className="flex items-center gap-2 font-bold"><Code2 className="text-indigo-400" size={20}/> Shared Code Scratchpad</h2>
            <select aria-label="Editor language" className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs" value={language} onChange={e=>{setLanguage(e.target.value);setDirty(true);}}>
              <option value="javascript">JavaScript</option><option value="cpp">C++</option><option value="python">Python</option><option value="java">Java</option><option value="text">Plain text</option>
            </select>
          </div>
          <p className="mb-3 text-xs text-slate-500">Edit your code, then Save to sync it to all members instantly. Revision checks protect against silent overwrites; this scratchpad does not execute code.</p>
          <textarea aria-label="Shared code editor" spellCheck="false" maxLength={6000} value={code} onChange={e=>{setCode(e.target.value);setDirty(true);}}
            className="min-h-[360px] w-full resize-y rounded-xl border border-slate-700 bg-[#070B14] p-4 font-mono text-sm leading-6 text-emerald-100 outline-none focus:border-indigo-500" placeholder="// Solve a problem with your group…"/>
          {conflict&&<div className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">Someone edited this room after your last loaded revision. Copy your unsaved work somewhere safe, then refresh the editor to merge manually.</div>}
          <div className="mt-4 flex flex-wrap items-center gap-3"><button disabled={!dirty||saving||conflict} onClick={save} className={`${button} flex items-center gap-2`}><Save size={16}/>{saving?'Saving…':'Save & sync code'}</button>
            <button className={`${outlineButton} flex items-center gap-2`} onClick={loadRoom}><RefreshCcw size={16}/> Reload editor</button>
            <span className="text-xs text-slate-500">Revision {revision} {dirty?'· Unsaved':''}</span>
          </div>
        </section>
        <section className={`${panel} flex min-h-[520px] flex-col`}><h2 className="mb-4 font-bold">Live Room Chat</h2>
          <div className="max-h-[500px] min-h-[300px] flex-1 space-y-3 overflow-y-auto rounded-xl bg-slate-950/70 p-3">
            {messages.length===0&&<p className="text-center text-xs text-slate-500">Start a conversation with your study group.</p>}
            {messages.map(m=><div key={m.id} className={`max-w-[95%] rounded-xl p-3 ${String(m.authorId)===String(user?._id)?'ml-auto bg-indigo-500/15':'bg-slate-800/70'}`}>
              <p className="mb-1 text-xs font-semibold text-indigo-300">{m.name}</p><p className="whitespace-pre-wrap break-words text-sm leading-5 text-slate-100">{m.text}</p><p className="mt-1 text-right text-[10px] text-slate-500">{new Date(m.createdAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</p>
            </div>)}<div ref={scrollRef}/>
          </div>
          <form onSubmit={e=>{e.preventDefault();send();}} className="mt-3 flex gap-2"><input maxLength={1000} className={input} placeholder="Type a message…" value={message} onChange={e=>setMessage(e.target.value)}/><button disabled={!connected||!message.trim()} className={button} aria-label="Send message"><Send size={18}/></button></form>
        </section>
      </div>
    </>}
  </div>;
}
