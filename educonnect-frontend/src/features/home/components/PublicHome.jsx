import { Link } from 'react-router-dom';
import { FiUsers, FiMessageSquare, FiCalendar, FiStar, FiAward, FiCheckCircle } from 'react-icons/fi';

export default function PublicHome() {
  // Fake testimonials from Gujarat universities
  const testimonials = [
    {
      name: "Rahul Patel",
      university: "Dharmsinh Desai University",
      role: "Computer Engineering Student",
      quote: "Found my project team through EduConnect! Connected with 3 talented developers from my city.",
      rating: 5
    },
    {
      name: "Priya Sharma",
      university: "Gujarat University",
      role: "MBA Student",
      quote: "The event feature helped me attend 5+ workshops with industry leaders this semester.",
      rating: 4
    },
    {
      name: "Vikram Joshi",
      university: "Nirma University",
      role: "Mechanical Engineering",
      quote: "Shared my research paper and got valuable feedback from seniors across Gujarat.",
      rating: 5
    }
  ];

  // Partner universities in Gujarat
  const partnerUniversities = [
    "Dharmsinh Desai University",
    "Gujarat University", 
    "Nirma University",
    "PDPU",
    "Ganpat University",
    "Marwadi University"
  ];

  return (
    <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 min-h-screen">
      {/* Hero Section */}
      <section className="py-32 text-center bg-gradient-to-b from-yellow-900/10 via-transparent to-transparent relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="slide-up">
            <h1 className="text-6xl md:text-7xl font-bold font-display text-white mb-8 leading-tight">
              <span className="text-transparent bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text">Gujarat's</span><br />
              Premier Student Network
            </h1>
            <p className="text-gray-300 text-2xl mb-12 max-w-3xl mx-auto leading-relaxed">
              Connect with <span className="text-yellow-400 font-bold">50,000+</span> students across <span className="text-yellow-400 font-bold">15+</span> universities in Gujarat
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6 fade-in">
              <Link 
                to="/signup" 
                className="btn-premium text-lg py-5 px-10"
              >
                <FiUsers className="text-xl" /> Join Now
              </Link>
              <Link 
                to="/login" 
                className="btn-secondary text-lg py-5 px-10"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto">
          <div className="card-glass p-8 mx-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { value: "50K+", label: "Students", icon: <FiUsers size={32} /> },
                { value: "15+", label: "Universities", icon: <FiAward size={32} /> },
                { value: "200+", label: "Monthly Events", icon: <FiCalendar size={32} /> },
                { value: "10K+", label: "Study Groups", icon: <FiMessageSquare size={32} /> }
              ].map((stat, i) => (
                <div key={i} className="scale-in" style={{animationDelay: `${i * 0.1}s`}}>
                  <div className="text-yellow-400 mb-3 flex justify-center">{stat.icon}</div>
                  <p className="text-yellow-400 text-4xl font-bold font-display mb-2">{stat.value}</p>
                  <p className="text-gray-400 font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-20 slide-up">
          <h2 className="text-5xl font-bold font-display text-white mb-6">
            Why <span className="text-transparent bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text">Gujarati Students</span> Choose Us
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 mx-auto rounded-full"></div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-10">
          {[
            { 
              icon: <FiUsers size={32} />, 
              title: "Local Network", 
              desc: "Find students from your city or university",
              details: [
                "Ahmedabad • Vadodara • Surat",
                "University-specific groups",
                "Regional language support"
              ]
            },
            { 
              icon: <FiMessageSquare size={32} />, 
              title: "Study Together", 
              desc: "Collaborate on projects and assignments",
              details: [
                "Subject-specific channels",
                "File sharing for notes",
                "Exam preparation groups"
              ]
            },
            { 
              icon: <FiCalendar size={32} />, 
              title: "Campus Events", 
              desc: "Discover events across Gujarat",
              details: [
                "Hackathons & Workshops",
                "Cultural festivals",
                "Career fairs"
              ]
            }
          ].map((feature, i) => (
            <div 
              key={i} 
              className="card-elevated p-8 hover:scale-105 transition-all duration-500 group scale-in"
              style={{animationDelay: `${i * 0.2}s`}}
            >
              <div className="text-yellow-400 mb-6 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-white text-2xl font-bold font-display mb-4">{feature.title}</h3>
              <p className="text-gray-400 mb-6 text-lg leading-relaxed">{feature.desc}</p>
              <ul className="space-y-3">
                {feature.details.map((item, j) => (
                  <li key={j} className="flex items-start text-gray-300">
                    <FiCheckCircle className="text-green-400 mt-1 mr-3 flex-shrink-0" size={18} />
                    <span className="font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gradient-to-r from-gray-900/50 via-black/70 to-gray-900/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20 slide-up">
            <h2 className="text-5xl font-bold font-display text-white mb-6">
              What <span className="text-transparent bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text">Our Students</span> Say
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <div 
                key={i} 
                className="card-glass p-8 hover:scale-105 transition-all duration-500 scale-in"
                style={{animationDelay: `${i * 0.2}s`}}
              >
                <div className="flex mb-6">
                  {[...Array(5)].map((_, j) => (
                    <FiStar 
                      key={j} 
                      className={j < testimonial.rating ? "text-yellow-400" : "text-gray-600"} 
                      size={20}
                      fill={j < testimonial.rating ? "currentColor" : "none"}
                    />
                  ))}
                </div>
                <p className="text-gray-300 italic text-lg mb-8 leading-relaxed">"{testimonial.quote}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center justify-center text-black font-bold text-lg">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white font-bold text-lg">{testimonial.name}</p>
                    <p className="text-yellow-400 font-medium">
                      {testimonial.role}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {testimonial.university}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* University Partners */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-20 slide-up">
          <h2 className="text-5xl font-bold font-display text-white mb-6">
            Partnered <span className="text-transparent bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text">Universities</span> in Gujarat
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 mx-auto rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {partnerUniversities.map((uni, i) => (
            <div 
              key={i} 
              className="card-elevated p-8 flex items-center justify-center text-center hover:scale-105 transition-all duration-300 group scale-in"
              style={{animationDelay: `${i * 0.1}s`}}
            >
              <p className="text-gray-300 font-bold text-lg group-hover:text-yellow-400 transition-colors duration-300">{uni}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-b from-transparent to-yellow-900/10 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-5xl mx-auto text-center px-6 relative z-10">
          <div className="scale-in">
            <div className="text-yellow-400 text-6xl mx-auto mb-8 flex justify-center">
              <FiAward />
            </div>
            <h2 className="text-5xl font-bold font-display text-white mb-8 leading-tight">
              Join Gujarat's Most Active<br />
              <span className="text-transparent bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text">Student Community</span>
            </h2>
            <p className="text-gray-300 text-2xl mb-12 max-w-3xl mx-auto leading-relaxed">
              Start connecting in less than 2 minutes
            </p>
            <Link 
              to="/signup" 
              className="btn-premium text-xl py-6 px-12 inline-flex items-center gap-3"
            >
              <FiUsers size={24} /> Create Free Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}