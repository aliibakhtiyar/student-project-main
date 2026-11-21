import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export function useLive() {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  useEffect(() => {
    const url = new URL(import.meta.env.VITE_API_URL || '/api', window.location.origin);
    const connection = io(url.origin, { auth: { token: localStorage.getItem('token') },
      transports: ['websocket', 'polling'], reconnection: true });
    connection.on('connect', () => setConnected(true));
    connection.on('disconnect', () => setConnected(false));
    setSocket(connection);
    return () => connection.disconnect();
  }, []);
  return { socket, connected };
}
