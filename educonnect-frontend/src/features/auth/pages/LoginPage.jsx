import LoginForm from '../components/LoginForm';

const LoginPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4">
      <div className="w-full max-w-md">
        {/* Animated Background Card */}
        <div className="card-glass p-8 scale-in">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold font-display text-transparent bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text mb-2">
                Welcome Back
              </h1>
              <div className="w-16 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 mx-auto rounded-full"></div>
            </div>
            <p className="text-gray-400 text-lg">
              Sign in to your premium EduConnect account
            </p>
          </div>

          {/* Login Form */}
          <div className="fade-in">
            <LoginForm />
          </div>

          {/* Footer Links */}
          <div className="mt-8 text-center">
            <p className="text-gray-400 mb-4">
              Don't have an account?{' '}
              <a 
                href="/signup" 
                className="text-yellow-400 hover:text-yellow-300 font-medium transition-colors duration-300 hover:underline"
              >
                Create Account
              </a>
            </p>
            <a 
              href="/forgot-password" 
              className="inline-block text-yellow-400 hover:text-yellow-300 transition-colors duration-300 hover:underline"
            >
              Forgot your password?
            </a>
          </div>
        </div>

        {/* Additional Visual Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;