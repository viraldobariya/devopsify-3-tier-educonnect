import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Mail, 
  Link, 
  Github, 
  Linkedin, 
  Edit, 
  Calendar,
  User,
  BookOpen,
  GraduationCap,
  Shield,
  MapPin,
  Award,
  Star,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import EditProfileModal from '../components/EditProfileModal';
import { getProfile } from '../../../api/userApi';
import { useSelector } from 'react-redux';

const ProfilePage = () => {
  const currentUser = useSelector(store => store.auth.user);
  const [searchParams, setSearchParams] = useSearchParams();
  const username = searchParams.get("username");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        console.log(username);
        const response = await getProfile(username);
        if (response.status === 200) {
          setUser(response.data.user);
          console.log(response.data.user.username, currentUser.username);
          setIsCurrentUser(response.data.user.username === currentUser.username);
        } else {
          console.log(response);
          console.log("Error while fetching user", username);
        }
      } catch (error) {
        console.error('Failed to load user profile', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [username, currentUser]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex justify-center items-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-20 h-20 border-4 border-gray-800 border-t-yellow-400 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-yellow-300 rounded-full animate-spin mx-auto mt-2 ml-2" style={{animationDelay: '0.3s', animationDirection: 'reverse'}}></div>
          </div>
          <div className="space-y-2">
            <div className="w-32 h-2 bg-gray-800 rounded-full mx-auto overflow-hidden">
              <div className="h-full bg-gradient-to-r from-yellow-400 to-yellow-300 rounded-full animate-pulse"></div>
            </div>
            <p className="text-gray-400 text-lg">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex justify-center items-center">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center max-w-md shadow-2xl">
          <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-12 h-12 text-gray-600" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">User not found</h2>
          <p className="text-gray-400 leading-relaxed">The requested profile doesn't exist or has been removed</p>
          <div className="mt-6 w-16 h-1 bg-yellow-400 rounded-full mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-8 px-4">
      {/* Subtle Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/6 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/6 w-80 h-80 bg-yellow-300/3 rounded-full blur-3xl"></div>
        <div className="absolute top-3/4 left-1/3 w-64 h-64 bg-yellow-400/4 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Profile Header */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl mb-8 overflow-hidden shadow-2xl hover:border-gray-700 transition-all duration-300">
          <div className="relative">
            {/* Header accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 to-yellow-300"></div>
            
            <div className="p-8">
              <div className="flex flex-col lg:flex-row gap-8 items-start">
                <div className="flex-shrink-0 relative group">
                  <div className="relative">
                    {/* Avatar with yellow border */}
                    <div className="w-44 h-44 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-300 p-1">
                      <img
                        className="w-full h-full rounded-full object-cover bg-gray-800"
                        src={user.avatar || `https://ui-avatars.com/api/?name=${user.fullName}&background=1f2937&color=fbbf24&size=256`}
                        alt={user.fullName}
                      />
                    </div>
                    
                    {/* Status indicator */}
                    <div className="absolute bottom-4 right-4 w-6 h-6 bg-green-500 rounded-full border-4 border-gray-900 shadow-lg">
                      <div className="w-full h-full bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h1 className="text-4xl lg:text-5xl font-bold text-white">
                          {user.fullName}
                        </h1>
                        {user.role === 'ADMIN' && (
                          <span className="bg-red-900/50 border border-red-700 text-red-400 px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-1">
                            <Shield className="w-4 h-4" />
                            Admin
                          </span>
                        )}
                        {/* <span className="bg-yellow-400/20 border border-yellow-400/50 text-yellow-400 px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-1">
                          <Star className="w-4 h-4" />
                          Pro
                        </span> */}
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <p className="text-yellow-400 text-xl font-semibold">@{user.username}</p>
                        <button
                          onClick={() => copyToClipboard(user.username, 'username')}
                          className="text-gray-500 hover:text-yellow-400 transition-colors duration-200 p-1 hover:bg-gray-800 rounded"
                          title="Copy username"
                        >
                          {copiedField === 'username' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    
                    {isCurrentUser && (
                      <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="bg-yellow-400 hover:bg-yellow-300 text-black px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-yellow-400/25"
                      >
                        <Edit className="h-5 w-5" />
                        Edit Profile
                      </button>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    {user.university && (
                      <span className="bg-gray-800 border border-gray-700 text-gray-300 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 hover:border-yellow-400/50 transition-colors duration-200">
                        <GraduationCap className="h-4 w-4 text-yellow-400" />
                        {user.university.replace(/_/g, ' ')}
                      </span>
                    )}
                    
                    {user.course && (
                      <span className="bg-gray-800 border border-gray-700 text-gray-300 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 hover:border-yellow-400/50 transition-colors duration-200">
                        <BookOpen className="h-4 w-4 text-yellow-400" />
                        {user.course.replace(/_/g, ' ')}
                      </span>
                    )}
                  </div>
                  
                  {/* <div className="flex items-center text-gray-400 bg-gray-800/50 rounded-xl px-4 py-3 w-fit">
                    <Calendar className="h-5 w-5 mr-3 text-yellow-400" />
                    <span>Member since {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                  </div> */}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* About Section */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl hover:border-gray-700 transition-all duration-300">
            <div className="border-b border-gray-800 p-6">
              <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center">
                  <User className="h-5 w-5 text-black" />
                </div>
                About
              </h3>
            </div>
            <div className="p-6">
              {user.bio ? (
                <div className="space-y-4">
                  <p className="text-gray-300 leading-relaxed whitespace-pre-line text-lg">{user.bio}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500 pt-4 border-t border-gray-800">
                    <Award className="h-4 w-4 text-yellow-400" />
                    <span>{user.bio.split(' ').length} words • {user.bio.length} characters</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="h-8 w-8 text-gray-600" />
                  </div>
                  <p className="text-gray-500 italic text-lg">No bio added yet</p>
                  {isCurrentUser && (
                    <button
                      onClick={() => setIsEditModalOpen(true)}
                      className="mt-4 text-yellow-400 hover:text-yellow-300 transition-colors duration-200 underline"
                    >
                      Add your bio
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Contact Section */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl hover:border-gray-700 transition-all duration-300">
            <div className="border-b border-gray-800 p-6">
              <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center">
                  <Mail className="h-5 w-5 text-black" />
                </div>
                Contact
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="group bg-gray-800/50 rounded-xl p-4 hover:bg-gray-800 transition-all duration-200 border border-gray-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-4">
                    <div className="text-yellow-400 mt-1">
                      <Mail className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-white font-semibold mb-1">Email</p>
                      <p className="text-gray-300">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(user.email, 'email')}
                    className="text-gray-500 hover:text-yellow-400 transition-colors duration-200 p-2 hover:bg-gray-700 rounded-lg"
                  >
                    {copiedField === 'email' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              {user.linkedin && (
                <div className="group bg-gray-800/50 rounded-xl p-4 hover:bg-gray-800 transition-all duration-200 border border-gray-700/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-4">
                      <div className="text-yellow-400 mt-1">
                        <Linkedin className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-white font-semibold mb-1">LinkedIn</p>
                        <a 
                          href={user.linkedin} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-yellow-400 hover:text-yellow-300 transition-colors duration-200 hover:underline flex items-center gap-1"
                        >
                          {user.linkedin.replace(/^https?:\/\//, '')}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(user.linkedin, 'linkedin')}
                      className="text-gray-500 hover:text-yellow-400 transition-colors duration-200 p-2 hover:bg-gray-700 rounded-lg"
                    >
                      {copiedField === 'linkedin' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}
              
              {user.github && (
                <div className="group bg-gray-800/50 rounded-xl p-4 hover:bg-gray-800 transition-all duration-200 border border-gray-700/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-4">
                      <div className="text-yellow-400 mt-1">
                        <Github className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-white font-semibold mb-1">GitHub</p>
                        <a 
                          href={user.github} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-yellow-400 hover:text-yellow-300 transition-colors duration-200 hover:underline flex items-center gap-1"
                        >
                          {user.github.replace(/^https?:\/\//, '')}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(user.github, 'github')}
                      className="text-gray-500 hover:text-yellow-400 transition-colors duration-200 p-2 hover:bg-gray-700 rounded-lg"
                    >
                      {copiedField === 'github' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Skills Section - Full Width */}
          <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl hover:border-gray-700 transition-all duration-300">
            <div className="border-b border-gray-800 p-6">
              <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center">
                  <Award className="h-5 w-5 text-black" />
                </div>
                Skills & Expertise
              </h3>
            </div>
            <div className="p-6">
              {user.skills && user.skills.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {user.skills.map((skill, index) => (
                    <span 
                      key={index}
                      className="bg-gray-800 border border-gray-700 text-gray-300 px-4 py-2 rounded-xl text-sm font-medium hover:border-yellow-400 hover:text-yellow-300 transition-all duration-200 cursor-default"
                    >
                      {skill.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Award className="h-10 w-10 text-gray-600" />
                  </div>
                  <p className="text-gray-500 italic text-lg mb-4">No skills added yet</p>
                  {isCurrentUser && (
                    <button
                      onClick={() => setIsEditModalOpen(true)}
                      className="text-yellow-400 hover:text-yellow-300 transition-colors duration-200 underline"
                    >
                      Add your first skill
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <EditProfileModal 
          user={user} 
          onClose={() => setIsEditModalOpen(false)} 
          setUser={setUser}
          setSearchParams={setSearchParams}
          searchParams={searchParams}
        />
      )}
    </div>
  );
};

export default ProfilePage;