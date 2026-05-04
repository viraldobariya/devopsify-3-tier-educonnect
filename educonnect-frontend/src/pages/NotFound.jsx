import { Link } from 'react-router-dom';
import { FiHome, FiArrowLeft } from 'react-icons/fi';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900 text-center px-6">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="card-glass p-12 max-w-2xl scale-in relative z-10">
        <div className="mb-8">
          <h1 className="text-8xl font-bold font-display text-transparent bg-gradient-to-r from-yellow-400 to-red-500 bg-clip-text mb-6">
            404
          </h1>
          <h2 className="text-3xl font-bold text-white mb-4">Page Not Found</h2>
          <p className="text-gray-400 text-lg leading-relaxed">
            The page you are looking for seems to have vanished into the digital void. 
            Don't worry, even the best explorers sometimes take a wrong turn.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/" 
            className="btn-premium"
          >
            <FiHome size={18} /> Go Home
          </Link>
          <button 
            onClick={() => window.history.back()} 
            className="btn-secondary"
          >
            <FiArrowLeft size={18} /> Go Back
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Error Code: <span className="text-yellow-400 font-mono">404_PAGE_NOT_FOUND</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
