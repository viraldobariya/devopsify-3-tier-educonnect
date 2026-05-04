import React, { useState, useEffect } from 'react';

const ToastHost = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const unsub = window.__NOTIF_TOAST__ || null;
    return () => unsub && unsub();
  }, []);

  // simple API: window.__pushToast({type:'info', title:'X', body:'Y'})
  useEffect(() => {
    window.__pushToast = (t) => {
      const id = Date.now() + Math.random();
      setToasts((s) => [...s.slice(-2), { ...t, id }]);
      setTimeout(() => setToasts((s) => s.filter((x) => x.id !== id)), 4000);
    };
  }, []);

  return (
    <div aria-live="polite" className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div key={t.id} className="max-w-xs bg-gray-800 text-white p-3 rounded shadow-lg border-l-4 border-indigo-500">
          <div className="text-sm font-semibold">{t.title}</div>
          <div className="text-xs text-gray-300">{t.body}</div>
        </div>
      ))}
    </div>
  );
};

export default ToastHost;