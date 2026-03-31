import React from 'react';
import { useSelector } from 'react-redux';

const BellButton = ({ onClick }) => {
  const unread = useSelector((s) => s.notifications?.unreadCount || 0);
  return (
    <button
      aria-label={`Notifications (${unread} unread)`}
      title="Notifications"
      onClick={onClick}
      className="relative p-2 rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
    >
      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0a3 3 0 11-6 0h6z" />
      </svg>
      {unread > 0 && (
        <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs rounded-full px-1.5 py-0.5" aria-hidden>
          {unread > 99 ? '99+' : unread}
        </span>
      )}
    </button>
  );
};

export default BellButton;