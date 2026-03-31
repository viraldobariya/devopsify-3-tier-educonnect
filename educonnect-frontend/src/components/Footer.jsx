import { FiHeart, FiGithub, FiLinkedin, FiTwitter, FiMail, FiMapPin, FiPhone, FiArrowUp } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const Footer = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

    const location = useLocation();

    

  // Show scroll to top button when user scrolls down
  useEffect(() => {
    console.log(location.pathname + "................................................"); 
    const handleScroll = () => {  
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const footerLinks = {
    platform: [
      { name: 'Find Students', href: '/students', icon: null },
      { name: 'Events', href: '/events', icon: null },
      { name: 'Q&A Connect', href: '/qconnect', icon: null },
      { name: 'Messages', href: '/chat', icon: null },
      { name: 'Study Groups', href: '/groups', icon: null }
    ]
  };

  const socialLinks = [
    { name: 'GitHub', href: '#', icon: FiGithub, color: 'hover:text-gray-300' },
    { name: 'LinkedIn', href: '#', icon: FiLinkedin, color: 'hover:text-blue-400' },
    { name: 'Twitter', href: '#', icon: FiTwitter, color: 'hover:text-blue-300' }
  ];


  

  return ( location.pathname == "/chat/group" ? null :
    (<footer className="relative bg-gradient-to-b from-gray-900 via-black to-gray-950 border-t border-yellow-500/30 mt-auto overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #facc15 1px, transparent 1px),
                           radial-gradient(circle at 75% 75%, #eab308 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-48 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-6 space-y-6">
            <div className="group">
              <h3 className="text-3xl font-extrabold font-display mb-4 relative inline-block">
                <span 
                  className="text-transparent bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text"
                  style={{
                    background: 'linear-gradient(135deg, #facc15 0%, #eab308 50%, #ca8a04 100%)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  EduConnect
                </span>
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-yellow-400 to-yellow-600 transition-all duration-500 group-hover:w-full"></div>
              </h3>
            </div>
            
            <p className="text-gray-400 leading-relaxed text-lg max-w-md">
              Empowering students worldwide through premium educational experiences. 
              Connect, collaborate, and grow together in our vibrant learning community.
            </p>

            {/* Contact Info */}
            {/* <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-400 hover:text-yellow-400 transition-colors duration-300">
                <FiMail className="text-yellow-500 flex-shrink-0" size={16} />
                <span className="text-sm">hello@educonnect.com</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400 hover:text-yellow-400 transition-colors duration-300">
                <FiPhone className="text-yellow-500 flex-shrink-0" size={16} />
                <span className="text-sm">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400 hover:text-yellow-400 transition-colors duration-300">
                <FiMapPin className="text-yellow-500 flex-shrink-0" size={16} />
                <span className="text-sm">San Francisco, CA</span>
              </div>
            </div> */}

            {/* Enhanced Social Links */}
            {/* <div className="pt-4">
              <h5 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Follow Us</h5>
              <div className="flex space-x-4">
                {socialLinks.map(({ name, href, icon: Icon, color }) => (
                  <a
                    key={name}
                    href={href}
                    className={`group p-3 rounded-xl bg-gray-800/50 border border-gray-700/50 text-gray-400 ${color} transition-all duration-300 hover:border-yellow-500/50 hover:bg-yellow-500/10 hover:scale-110 hover:shadow-lg hover:shadow-yellow-500/20`}
                    aria-label={name}
                  >
                    <Icon size={20} className="transition-transform duration-300 group-hover:rotate-12" />
                  </a>
                ))}
              </div>
            </div> */}
          </div>

          {/* Navigation Links Section */}
          <div className="lg:col-span-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 h-full">
              {/* Platform Links */}
              <div className="space-y-4">
                <h4 className="text-white font-bold text-lg mb-6 relative">
                  Platform
                  <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-gradient-to-r from-yellow-400 to-yellow-600"></div>
                </h4>
                <ul className="space-y-3">
                  {footerLinks.platform.map(({ name, href }) => (
                    <li key={name}>
                      <a 
                        href={href} 
                        className="group flex items-center text-gray-400 hover:text-yellow-400 transition-all duration-300 text-sm hover:translate-x-2"
                      >
                        <span className="w-0 h-px bg-yellow-400 transition-all duration-300 group-hover:w-4 group-hover:mr-3"></span>
                        {name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Support Links */}
              {/* <div className="space-y-4">
                <h4 className="text-white font-bold text-lg mb-6 relative">
                  Support
                  <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-gradient-to-r from-yellow-400 to-yellow-600"></div>
                </h4>
                <ul className="space-y-3">
                  <li>
                    <a href="/help" className="group flex items-center text-gray-400 hover:text-yellow-400 transition-all duration-300 text-sm hover:translate-x-2">
                      <span className="w-0 h-px bg-yellow-400 transition-all duration-300 group-hover:w-4 group-hover:mr-3"></span>
                      Help Center
                    </a>
                  </li>
                  <li>
                    <a href="/contact" className="group flex items-center text-gray-400 hover:text-yellow-400 transition-all duration-300 text-sm hover:translate-x-2">
                      <span className="w-0 h-px bg-yellow-400 transition-all duration-300 group-hover:w-4 group-hover:mr-3"></span>
                      Contact Us
                    </a>
                  </li>
                  <li>
                    <a href="/community" className="group flex items-center text-gray-400 hover:text-yellow-400 transition-all duration-300 text-sm hover:translate-x-2">
                      <span className="w-0 h-px bg-yellow-400 transition-all duration-300 group-hover:w-4 group-hover:mr-3"></span>
                      Community
                    </a>
                  </li>
                  <li>
                    <a href="/feedback" className="group flex items-center text-gray-400 hover:text-yellow-400 transition-all duration-300 text-sm hover:translate-x-2">
                      <span className="w-0 h-px bg-yellow-400 transition-all duration-300 group-hover:w-4 group-hover:mr-3"></span>
                      Feedback
                    </a>
                  </li>
                </ul>
              </div> */}

              {/* Legal Links */}
              {/* <div className="space-y-4">
                <h4 className="text-white font-bold text-lg mb-6 relative">
                  Legal
                  <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-gradient-to-r from-yellow-400 to-yellow-600"></div>
                </h4>
                <ul className="space-y-3">
                  <li>
                    <a href="/privacy" className="group flex items-center text-gray-400 hover:text-yellow-400 transition-all duration-300 text-sm hover:translate-x-2">
                      <span className="w-0 h-px bg-yellow-400 transition-all duration-300 group-hover:w-4 group-hover:mr-3"></span>
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a href="/terms" className="group flex items-center text-gray-400 hover:text-yellow-400 transition-all duration-300 text-sm hover:translate-x-2">
                      <span className="w-0 h-px bg-yellow-400 transition-all duration-300 group-hover:w-4 group-hover:mr-3"></span>
                      Terms of Service
                    </a>
                  </li>
                  <li>
                    <a href="/cookies" className="group flex items-center text-gray-400 hover:text-yellow-400 transition-all duration-300 text-sm hover:translate-x-2">
                      <span className="w-0 h-px bg-yellow-400 transition-all duration-300 group-hover:w-4 group-hover:mr-3"></span>
                      Cookie Policy
                    </a>
                  </li>
                  <li>
                    <a href="/guidelines" className="group flex items-center text-gray-400 hover:text-yellow-400 transition-all duration-300 text-sm hover:translate-x-2">
                      <span className="w-0 h-px bg-yellow-400 transition-all duration-300 group-hover:w-4 group-hover:mr-3"></span>
                      Guidelines
                    </a>
                  </li>
                </ul>
              </div> */}
            </div>
          </div>
        </div>

        

        {/* Bottom Section */}
        <div className="pt-8 border-t border-gray-800/50">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center lg:text-left">
              <p className="text-gray-500 text-sm">
                © 2025 EduConnect. All rights reserved.
              </p>
              <div className="hidden sm:block w-px h-4 bg-gray-700"></div>
              <p className="text-gray-500 text-sm flex items-center gap-2">
                Made with 
                <FiHeart className="text-red-500 animate-pulse" size={14} /> 
                for students everywhere
              </p>
            </div>

            {/* Back to Top Button */}
            {showScrollTop && (
              <button
                onClick={scrollToTop}
                className="group fixed bottom-8 right-8 lg:static lg:bottom-auto lg:right-auto p-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black rounded-full hover:from-yellow-500 hover:to-yellow-700 transition-all duration-300 hover:scale-110 shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40 z-20"
                aria-label="Scroll to top"
              >
                <FiArrowUp size={20} className="transition-transform duration-300 group-hover:-translate-y-1" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent opacity-50"></div>
    </footer>)
  );
};

export default Footer;