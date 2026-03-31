import { Link } from 'react-router-dom';
import { FiShield, FiHome, FiLogIn } from 'react-icons/fi';

const Unauthorized = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900 text-center px-6">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-yellow-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="card-glass p-12 max-w-2xl scale-in relative z-10">
        <div className="mb-8">
          <div className="text-red-400 text-6xl mb-6 flex justify-center">
            <FiShield />
          </div>
          <h1 className="text-6xl font-bold font-display text-transparent bg-gradient-to-r from-red-400 to-yellow-400 bg-clip-text mb-4">
            403
          </h1>
          <h2 className="text-3xl font-bold text-white mb-4">Access Denied</h2>
          <p className="text-gray-400 text-lg leading-relaxed">
            You need to sign in to access this premium area of EduConnect. 
            Join thousands of students already connected!
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/login" 
            className="btn-premium"
          >
            <FiLogIn size={18} /> Sign In
          </Link>
          <Link 
            to="/" 
            className="btn-secondary"
          >
            <FiHome size={18} /> Go Home
          </Link>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Error Code: <span className="text-red-400 font-mono">403_UNAUTHORIZED_ACCESS</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
