import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getConnections } from '../../../api/connectAPI';

export default function ConnectionsPage() {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const response = await getConnections();
        setConnections(response.data);
      } catch (error) {
        console.error('Failed to fetch connections:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConnections();
  }, []);

  return (
    <div className="bg-gray-900 min-h-screen p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">My Connections</h1>
          <p className="text-gray-400">{connections.length} students connected</p>
        </div>
        <Link 
          to="/students" 
          className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
        >
          Discover More
        </Link>
      </div>

      {/* Connections Grid */}
      {loading ? (
        <div className="text-white">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {connections.map(user => (
            <div key={user.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-purple-500 transition-colors">
              <div className="flex items-start gap-4">
                <img 
                  onClick = {() => navigate("/profile?username=" + user.username)}
                  src={user.avatar || '/default-avatar.png'} 
                  alt={user.fullName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-purple-500"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-white">{user.fullName}</h3>
                  <p className="text-gray-400 text-sm">{user.university} • {user.course}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {user.skills?.slice(0, 3).map(skill => (
                      <span key={skill} className="bg-gray-700 text-xs px-2 py-1 rounded-full text-gray-300">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              {/* <div className="mt-4">
                <Link 
                  to={`/chat/${user.id}`}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-3 rounded-md text-sm flex items-center justify-center gap-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Message
                </Link>
              </div> */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}