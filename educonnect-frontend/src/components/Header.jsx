import { Link, useNavigate } from 'react-router-dom';
import { FiMessageSquare, FiUsers, FiCalendar, FiLogOut, FiUser, FiSettings, FiMenu, FiX } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../api/authApi';
import { useState, useEffect } from 'react';
import { logoutService } from '../services/authService';
import { QuestionCircleOutlined } from '@ant-design/icons';
import NotificationBell from "../features/home/components/NotificationBell"


export default function Header() {
  const { user: currentUser, isAuthenticated } = useSelector(store => store.auth);
  const [openMenu, setOpenMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside mobile menu
      const mobileMenuBtn = event.target.closest('.mobile-menu-btn');
      const mobileMenu = event.target.closest('.mobile-menu');
      
      if (!mobileMenuBtn && !mobileMenu && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
      
      // Check if click is outside user dropdown
      const userDropdownBtn = event.target.closest('.user-dropdown-btn');
      const userDropdown = event.target.closest('.user-dropdown');
      
      if (!userDropdownBtn && !userDropdown && openMenu) {
        setOpenMenu(false);
      }
    };
    
    if (mobileMenuOpen || openMenu) {
      document.addEventListener('click', handleClickOutside);
    }
    
    return () => document.removeEventListener('click', handleClickOutside);
  }, [mobileMenuOpen, openMenu]);

  const handleLogout = async () => {
    try {
      await logout();
      dispatch(logoutService());
      setOpenMenu(false);
      setMobileMenuOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navItems = [
    { to: "/students", icon: FiUsers, label: "Students" },
    { to: "/events", icon: FiCalendar, label: "Events" },
    { to: "/chat", icon: FiMessageSquare, label: "Messages" },
    { to: "/qconnect", icon: QuestionCircleOutlined, label: "QConnect" }
  ];

  return (
    <header className={`bg-gradient-to-r from-black via-gray-900 to-black border-b transition-all duration-500 sticky top-0 z-50 ${
      scrolled 
        ? 'border-yellow-500/30 backdrop-blur-xl bg-black/95 shadow-xl shadow-black/20' 
        : 'border-yellow-500/20 backdrop-blur-md'
    }`}>
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
        {/* Logo */}
        <Link 
          to="/" 
          className="group relative flex items-center font-bold text-xl sm:text-2xl font-display tracking-wide transition-all duration-300 hover:scale-105"
        >
          <span 
            className="logo-text relative z-10 font-extrabold"
            style={{
              background: 'linear-gradient(135deg, #facc15 0%, #eab308 50%, #ca8a04 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: 'transparent',
              textShadow: '0 0 30px rgba(250, 204, 21, 0.5)',
              filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))'
            }}
            data-text="EduConnect"
          >
            EduConnect
          </span>
          {/* Solid fallback for browsers that don't support gradient text */}
          <span 
            className="absolute inset-0 text-yellow-500 font-extrabold opacity-0 pointer-events-none logo-fallback"
            style={{ zIndex: -1 }}
          >
            EduConnect
          </span>
          {/* Enhanced glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/30 via-yellow-500/30 to-yellow-600/30 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500 -z-10 scale-125 animate-pulse"></div>
        </Link>

        {/* Desktop Navigation */}
        {isAuthenticated && (
          <nav className="hidden lg:flex space-x-1">
            {navItems.map(({ to, icon: Icon, label }) => (
              <Link 
                key={to}
                to={to} 
                className="group relative px-4 py-2 text-gray-300 hover:text-yellow-400 flex items-center gap-2 transition-all duration-300 font-medium rounded-xl hover:bg-yellow-500/10 hover:scale-105"
              >
                <Icon className="text-lg transition-transform duration-300 group-hover:rotate-12" />
                <span className="relative">
                  {label}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-yellow-400 to-yellow-600 transition-all duration-300 group-hover:w-full"></span>
                </span>
              </Link>
            ))}
          </nav>
        )}

        {/* User Section & Mobile Menu */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Mobile Menu Button */}
          {isAuthenticated && (
            <button 
              className="mobile-menu-btn lg:hidden p-2 rounded-xl text-gray-300 hover:text-yellow-400 hover:bg-yellow-500/10 transition-all duration-300 border border-transparent hover:border-yellow-500/30"
              onClick={(e) => {
                e.stopPropagation();
                setMobileMenuOpen(prev => !prev);
              }}
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
            </button>
          )}

          {isAuthenticated ? (
            
            <div className="relative">
              <button 
                className="user-dropdown-btn group flex items-center space-x-2 sm:space-x-3 focus:outline-none p-2 rounded-xl hover:bg-yellow-500/10 transition-all duration-300 border border-transparent hover:border-yellow-500/30" 
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenu(prev => !prev);
                }}
              >
                <div className="relative">
                  <img 
                    src={currentUser?.avatar || '/default-avatar.png'} 
                    alt="Profile" 
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-yellow-500/50 group-hover:border-yellow-400 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-yellow-500/20"
                  />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-yellow-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <span className="text-gray-200 hidden sm:inline font-medium text-sm group-hover:text-yellow-400 transition-colors duration-300">
                  {currentUser?.fullName || currentUser?.username}
                </span>
                <div className={`w-2 h-2 border-l-2 border-b-2 border-gray-400 transform rotate-45 transition-transform duration-300 ${openMenu ? '-rotate-135' : ''}`}></div>
              </button>

              {/* Enhanced Dropdown Menu */}
              {openMenu && (
                <div className="user-dropdown absolute right-0 mt-3 w-64 bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-yellow-500/30 rounded-2xl shadow-2xl backdrop-blur-xl py-3 z-50 animate-fade-in">
                  <div className="px-4 py-3 border-b border-gray-700/50">
                    <div className="flex items-center gap-3">
                      <img 
                        src={currentUser?.avatar || '/default-avatar.png'} 
                        alt="Profile" 
                        className="w-12 h-12 rounded-full object-cover border-2 border-yellow-500/50"
                      />
                      <div>
                        <p className="text-yellow-400 font-semibold text-sm">
                          {currentUser?.fullName || currentUser?.username}
                        </p>
                        <p className="text-gray-400 text-xs">{currentUser?.email}</p>
                      </div>
                    </div>
                  </div>

                  
                  <div className="py-2">
                    <Link 
                      to={`/profile?username=${currentUser.username}`} 
                      className="group px-4 py-3 text-gray-300 hover:text-yellow-400 hover:bg-gradient-to-r hover:from-yellow-500/10 hover:to-transparent flex items-center gap-3 transition-all duration-300 rounded-lg mx-2"
                      onClick={() => setOpenMenu(false)}
                    >
                      <FiUser className="text-lg group-hover:scale-110 transition-transform duration-300" /> 
                      <span>View Profile</span>
                    </Link>
                    {/* <Link 
                      to="/settings" 
                      className="group px-4 py-3 text-gray-300 hover:text-yellow-400 hover:bg-gradient-to-r hover:from-yellow-500/10 hover:to-transparent flex items-center gap-3 transition-all duration-300 rounded-lg mx-2"
                      onClick={() => setOpenMenu(false)}
                    >
                      <FiSettings className="text-lg group-hover:rotate-90 transition-transform duration-300" /> 
                      <span>Settings</span>
                    </Link> */}
                  </div>
                  
                  <hr className="border-gray-700/50 my-2 mx-3" />
                  
                  <button 
                    onClick={handleLogout}
                    className="group w-full text-left px-4 py-3 text-red-400 hover:text-red-300 hover:bg-gradient-to-r hover:from-red-500/10 hover:to-transparent flex items-center gap-3 transition-all duration-300 rounded-lg mx-2"
                  >
                    <FiLogOut className="text-lg group-hover:translate-x-1 transition-transform duration-300" /> 
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link 
                to="/login" 
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-yellow-400 border border-gray-600 hover:border-yellow-500/50 rounded-xl transition-all duration-300 hover:bg-yellow-500/10"
              >
                Login
              </Link>
              <Link 
                to="/signup" 
                className="px-4 py-2 text-sm font-medium text-black bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-xl transition-all duration-300 hover:from-yellow-500 hover:to-yellow-700 hover:scale-105 shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isAuthenticated && (
        <div className={`mobile-menu lg:hidden absolute top-full left-0 right-0 bg-gradient-to-b from-gray-900 to-black border-b border-yellow-500/20 backdrop-blur-xl shadow-2xl transition-all duration-300 transform ${
          mobileMenuOpen 
            ? 'opacity-100 translate-y-0 visible' 
            : 'opacity-0 -translate-y-4 invisible'
        }`}>
          <nav className="container mx-auto px-4 py-4 space-y-2">
            {navItems.map(({ to, icon: Icon, label }) => (
              <Link 
                key={to}
                to={to} 
                className="group flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-yellow-400 hover:bg-gradient-to-r hover:from-yellow-500/10 hover:to-transparent rounded-xl transition-all duration-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Icon className="text-lg group-hover:scale-110 transition-transform duration-300" />
                <span className="font-medium">{label}</span>
              </Link>
            ))}
          </nav>
        </div>
      )}

      
    </header>
  );
}