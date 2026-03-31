import React from 'react';
import { formatRelativeTimeIST, formatAbsoluteIST } from '../../../utils/timeI18n';
import { useDispatch } from 'react-redux';
import { markSeen, removeNotification } from '../../../store/slices/notificationsSlice';

const NotificationCard = ({ n }) => {
  const dispatch = useDispatch();
  const onMarkRead = () => dispatch(markSeen(n.id));
  const onRemove = () => dispatch(removeNotification(n.id));

  const iconForType = (type) => {
    if (type.startsWith('EVENT')) return <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-500 rounded-md flex items-center justify-center text-white">E</div>;
    if (type.startsWith('CHAT')) return <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-500 rounded-md flex items-center justify-center text-white">C</div>;
    if (type.startsWith('FRIEND')) return <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-md flex items-center justify-center text-white">F</div>;
    return <div className="w-10 h-10 bg-gray-600 rounded-md" />;
  };

  return (
    <article
      role="article"
      aria-labelledby={`nt-${n.id}`}
      tabIndex="0"
      className={`group flex gap-4 items-start p-3 rounded-lg transition-colors ${n.seen ? 'bg-gray-800' : 'bg-gray-700 ring-2 ring-indigo-500/20'}`}
    >
      <div>{iconForType(n.type)}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 id={`nt-${n.id}`} className="text-sm font-semibold text-white truncate">{n.title}</h3>
            {n.message && <p className="text-xs text-gray-300 truncate">{n.message}</p>}
            <div className="text-xs text-gray-400 mt-1">
              <time title={formatAbsoluteIST(n.createdAt)} aria-label={formatAbsoluteIST(n.createdAt)}>
                {formatRelativeTimeIST(n.createdAt)}
              </time>
            </div>
          </div>
          <div className="flex-shrink-0 ml-2 flex flex-col gap-2 items-end">
            <button onClick={onMarkRead} className= {`text-xs px-2 py-1 bg-gray-600 text-gray-200 rounded hover:bg-gray-500 focus:outline-none ${n.seen ? 'cursor-not-allowed bg-gray-700' : ''} ` }>Mark read</button>
            {/* <button onClick={onRemove} className="text-xs px-2 py-1 bg-rose-600 text-white rounded hover:bg-rose-500 focus:outline-none">Dismiss</button> */}
          </div>
        </div>
      </div>
    </article>
  );
};

export default NotificationCard;