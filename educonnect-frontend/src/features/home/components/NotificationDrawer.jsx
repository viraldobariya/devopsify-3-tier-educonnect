import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import NotificationCard from './NotificationCard';
import { fetchNotifications, markAllRead, markAllSeen } from '../../../store/slices/notificationsSlice';

const tabs = [
  { id: 'all', label: 'All' },
  { id: 'events', label: 'Events' },
  { id: 'chat', label: 'Chat' },
  { id: 'requests', label: 'Requests' },
];

const filterByTab = (n, tab) => {
  if (tab === 'all') return true;
  if (tab === 'events') return n.type.startsWith('NEW_EVENT');
  if (tab === 'chat') return n.type === 'NEW_MESSAGE' || n.type === 'NEW_GROUP_MESSAGE' || n.type === 'Request_Accepted';
  if (tab === 'requests') return n.type === 'CONNECTION_REQUEST';
  return true;
};

const NotificationDrawer = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const { byId, order, status } = useSelector((s) => s.notifications);
  const [activeTab, setActiveTab] = useState('all');

  const items = order.map((id) => byId[id]).filter(Boolean).filter((n) => filterByTab(n, activeTab));

  return (
    <div
      role="dialog"
      aria-modal="true"
      className={`fixed inset-y-0 right-0 w-full sm:w-96 bg-gray-900 z-50 transform transition-transform ${open ? 'translate-x-0' : 'translate-x-full'}`}
    >
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Notifications</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => dispatch(markAllSeen())} className="text-sm text-gray-300 hover:text-white">Mark all read</button>
          <button onClick={onClose} aria-label="Close" className="p-2 rounded hover:bg-gray-800 focus:outline-none">
            ✕
          </button>
        </div>
      </div>

      <div className="p-3">
        <div role="tablist" aria-label="Notification categories" className="flex gap-2 mb-3">
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={activeTab === t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-3 py-1 rounded ${activeTab === t.id ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-300'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {status === 'loading' && (
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-16 animate-pulse bg-gray-800 rounded" />
            ))}
          </div>
        )}

        {status !== 'loading' && items.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            <p>No notifications in this tab.</p>
          </div>
        )}

        <div className="space-y-2">
          {items.map((n) => (
            <NotificationCard key={n.id} n={n} />
          ))}
        </div>

        {/* <div className="mt-4 text-center">
          <a href="/updates" className="text-sm text-indigo-400 hover:underline">View all updates</a>
        </div> */}
      </div>
    </div>
  );
};

export default NotificationDrawer;