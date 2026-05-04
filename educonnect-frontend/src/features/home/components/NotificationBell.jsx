import React, { useEffect, useState, useRef } from 'react';
import { Bell } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import notificationsApi from '../../../api/notificationsApi';
import SocketService from '../../../services/SocketService';
import { fetchNotifications, fetchUnreadCount,markAllSeen , addOrMerge, markAllRead } from '../../../store/slices/notificationsSlice';

export default function NotificationBell() {
  const dispatch = useDispatch();
  const unread = useSelector(s => s.notifications.unreadCount);
  const order = useSelector(s => s.notifications.order);
  const byId = useSelector(s => s.notifications.byId);
  const [open, setOpen] = useState(false);
  const subRef = useRef(null);

  useEffect(() => {
    dispatch(fetchNotifications({ page: 0, size: 20 }));
    dispatch(fetchUnreadCount());

    // subscribe socket notifications
    const connectAndSub = async () => {
      SocketService.connect();
      // give socket a moment
      setTimeout(() => {
        subRef.current = SocketService.subscribeNotifications((msg) => {
          let body = msg.body ? JSON.parse(msg.body) : msg;
          // dispatch into store
          dispatch(addOrMerge(body));
          // optionally update unread count
          dispatch(fetchUnreadCount());
        });
      }, 800);
    };
    connectAndSub();

    return () => {
      try { subRef.current && subRef.current.unsubscribe(); } catch(e){}
    };
  }, [dispatch]);

  const handleMarkAllSeen = async () => {
    try {
      dispatch(markAllSeen());
      dispatch(markAllRead());
      dispatch(fetchUnreadCount());
    } catch (e) {
      console.error('mark all seen failed', e);
    }
  };

  return (
    <div className="relative">
      <button onClick={() => { setOpen(v => !v); }} className="relative">
        <Bell />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5">{unread}</span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-gray-800 rounded-lg p-3 border border-gray-700 z-50">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-white font-medium">Notifications</h4>
            <button onClick={handleMarkAllSeen} className="text-sm text-gray-300 hover:text-white">Mark all seen</button>
          </div>
          <div className="space-y-2 max-h-64 overflow-auto custom-scrollbar">
            {order.length === 0 && <div className="text-gray-400">No notifications</div>}
            {order.map(id => {
              const n = byId[id];
              return (
                <div key={id} className={`p-2 rounded ${n?.read ? 'bg-gray-800' : 'bg-gray-700'}`}>
                  <div className="text-sm text-white">{n?.title || n?.message || 'Notification'}</div>
                  <div className="text-xs text-gray-400">{new Date(n?.createdAt || n?.timestamp || Date.now()).toLocaleString()}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}