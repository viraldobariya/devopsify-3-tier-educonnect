// components/GroupList.jsx
import { Link } from 'react-router-dom';
import { Users, Lock, Loader } from 'lucide-react';

const GroupList = ({ groups = [], loading = false }) => {
  if (loading) {
    // Render a set of skeleton cards while groups are loading
    const skeletons = Array.from({ length: 6 });
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {skeletons.map((_, idx) => (
          <div key={idx} className="bg-gray-800 border border-gray-700 rounded-xl p-5 animate-pulse">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className="bg-gray-700 w-12 h-12 rounded-xl" />
                <div className="h-5 w-40 bg-gray-700 rounded" />
              </div>
              <div className="h-4 w-14 bg-gray-700 rounded" />
            </div>
            <div className="flex items-center text-gray-400 text-sm mt-4 justify-between">
              <div className="h-4 w-20 bg-gray-700 rounded" />
              <div className="h-8 w-20 bg-gray-700 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {groups.map((group, index) => (
        <div
          key={group.id || group.name || index}
          className="bg-gray-800 hover:bg-gray-750 border border-gray-700 rounded-xl p-5 transition-all hover:shadow-lg group"
        >
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-900 w-12 h-12 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="font-semibold text-lg group-hover:text-blue-400 transition-colors">{group.name}</h3>
            </div>
            {group.isPrivate && (
              <span className="text-xs bg-gray-700 px-2.5 py-1 rounded-full flex items-center">
                <Lock className="w-3 h-3 mr-1" /> Private
              </span>
            )}
          </div>
          <div className="flex items-center text-gray-400 text-sm mt-4 justify-between">
            <span className="bg-gray-700 px-2.5 py-1 rounded-full">
              {group.members?.length + 1} members
            </span>
            <Link to={`/chat/group?name=${group.name}`} className="ml-4 inline-flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors">
              Open
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GroupList;