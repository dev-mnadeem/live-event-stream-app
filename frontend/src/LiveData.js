import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001';
const MAX_EVENTS = 100;

export default function LiveData() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('Connecting');
  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socket.on('connect', () => setStatus('Connected'));
    socket.on('connect_error', () => setStatus('Reconnecting'));
    socket.on('disconnect', () => setStatus('Disconnected'));
    socket.on('processedData', data => {
      if (!data || !Number.isFinite(data.value)) return;
      setItems(previous => [data, ...previous].slice(0, MAX_EVENTS));
    });
    return () => socket.disconnect();
  }, []);
  return <main className="stream-workspace">
    <header><p className="eyebrow">SOCKET.IO · LIVE TELEMETRY</p><h1>Signal monitor</h1><p>Values above 50 pass the stream filter. Values above 80 are flagged for attention.</p></header>
    <section className="stream-summary" aria-label="Connection and stream status">
      <div><span>Connection</span><strong role="status">{status}</strong></div>
      <div><span>Events in this session</span><strong>{items.length}</strong></div>
      <div><span>Latest value</span><strong>{items[0]?.value ?? '—'}</strong></div>
    </section>
    <section className="stream-events"><h2>Incoming events</h2><p>Newest first · up to {MAX_EVENTS} events retained locally</p>
      {items.length === 0 ? <p className="empty-stream">Waiting for a qualifying event. Start the API simulator or send a newData message.</p> :
      <ul>{items.map((item,index)=><li key={`${item.processedAt}-${index}`}><strong className="event-value">{item.value}</strong><span className={`severity ${item.severity}`}>{item.severity}</span><span>{item.source || 'client'}</span><time>{item.processedAt}</time></li>)}</ul>}
    </section>
  </main>;
}
