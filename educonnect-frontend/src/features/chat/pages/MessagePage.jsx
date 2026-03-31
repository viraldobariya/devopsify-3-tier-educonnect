import { Link } from 'react-router-dom';
import { MessageCircle, Users } from 'lucide-react';

const MessagePage = () => {

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <header className="bg-gradient-to-r from-blue-700 to-indigo-800 py-12 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-3">EduConnect Chat</h1>
          <p className="text-xl text-blue-200 max-w-2xl mx-auto">
            Connect with your peers and educators in real-time
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center gap-10 mt-8 flex-wrap">
          <Link 
            to="/chat/personal"
            className="bg-gray-800 hover:bg-gray-750 border border-gray-700 rounded-2xl p-8 w-80 text-center shadow-xl hover:shadow-2xl transition-all"
          >
            <div className="flex justify-center mb-6">
              <MessageCircle className="w-16 h-16 text-blue-500" strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-semibold mb-4">Personal Chat</h2>
            <p className="text-gray-400 mb-8 leading-relaxed">
              Private 1-on-1 conversations with classmates, teachers, or mentors
            </p>
            <button className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-500 hover:to-indigo-600 transition-all">
              Enter Personal Chat
            </button>
          </Link>

          <Link 
            to="/chat/groups"
            className="bg-gray-800 hover:bg-gray-750 border border-gray-700 rounded-2xl p-8 w-80 text-center shadow-xl hover:shadow-2xl transition-all"
          >
            <div className="flex justify-center mb-6">
              <Users className="w-16 h-16 text-indigo-500" strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-semibold mb-4">Group Chat</h2>
            <p className="text-gray-400 mb-8 leading-relaxed">
              Collaborative spaces for classes, study groups, and projects
            </p>
            <button className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white px-6 py-3 rounded-xl font-medium hover:from-indigo-500 hover:to-purple-600 transition-all">
              Enter Group Chat
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MessagePage;