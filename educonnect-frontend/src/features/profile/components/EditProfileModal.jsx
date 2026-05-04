import { useState } from "react";
import { Universities, Courses, Skills } from '../../../constants/enums';
import { Edit, X, Link as LinkIcon, Github, Linkedin, GraduationCap, BookOpen, Award, User, Mail, Loader } from "lucide-react";
import { checkUpdate, update } from "../../../api/userApi";
import { useDispatch } from "react-redux";
import { update as updateUserState } from "../../../store/slices/authSlice";

const EditProfileModal = ({ user, onClose, setUser, setSearchParams, searchParams }) => {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    id: user.id,
    role: user.role,
    password: user.password,
    fullName: user.fullName,
    username: user.username,
    email: user.email,
    bio: user.bio || '',
    linkedin: user.linkedin || '',
    github: user.github || '',
    university: user.university || '',
    course: user.course || '',
    skills: user.skills || [],
    avatar: user.avatar || null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeSection, setActiveSection] = useState('basic'); // 'basic', 'education', 'social'

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrorMessage('');
  };

  const handleSkillChange = (e) => {
    const options = e.target.options;
    const selectedSkills = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedSkills.push(options[i].value);
      }
    }
    setFormData(prev => ({ ...prev, skills: selectedSkills }));
  };

  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, avatar: e.target.files[0] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.username || !formData.email || !formData.university || !formData.course) {
      setErrorMessage("Please fill all required fields.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await checkUpdate({
        username: formData.username, 
        email: formData.email
      });

      if (res.status === 200 && !res.data.availability) {
        setErrorMessage("Username or Email is not available.");
        return;
      }

      const updateRes = await update({
        ...formData,
        avatar: formData.avatar instanceof File ? null : formData.avatar
      }, formData.avatar instanceof File ? formData.avatar : null);

      if (updateRes.status === 200) {
        dispatch(updateUserState(updateRes.data))
        setUser(updateRes.data)
        searchParams.set("username", updateRes.data.username);
        setSearchParams(searchParams);
        onClose();
      } else {
        setErrorMessage("Error while updating user.");
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrorMessage("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAvatarUrl = () => {
    if (!formData.avatar) return '';
    if (typeof formData.avatar === 'string') return formData.avatar;
    return URL.createObjectURL(formData.avatar);
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'basic':
        return (
          <div className="space-y-5">
            <div className="flex flex-col items-center">
              <div className="relative">
                <img
                  className="h-32 w-32 rounded-full object-cover border-4 border-gray-700 shadow-lg"
                  src={getAvatarUrl() || `https://ui-avatars.com/api/?name=${formData.fullName}&background=random&size=256`}
                  alt="Profile preview"
                />
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-3 right-3 bg-purple-600 p-2 rounded-full shadow-lg cursor-pointer hover:bg-purple-700 transition-colors"
                >
                  <Edit className="h-4 w-4 text-white" />
                  <input
                    id="avatar-upload"
                    name="avatar"
                    type="file"
                    className="sr-only"
                    onChange={handleAvatarChange}
                    accept="image/*"
                  />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  id="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full rounded-lg py-3 px-4 bg-gray-700/60 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                  placeholder="John Doe"
                />
              </div>
              
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Username *
                </label>
                <input
                  type="text"
                  name="username"
                  id="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full rounded-lg py-3 px-4 bg-gray-700/60 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                  placeholder="@johndoe"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-lg py-3 px-4 bg-gray-700/60 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                  placeholder="john@example.com"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                id="bio"
                rows="3"
                value={formData.bio}
                onChange={handleChange}
                className="w-full rounded-lg py-3 px-4 bg-gray-700/60 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Tell us about yourself..."
              ></textarea>
            </div>
          </div>
        );
        
      case 'education':
        return (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="university" className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  University *
                </label>
                <div className="relative">
                  <select
                    name="university"
                    id="university"
                    value={formData.university}
                    onChange={handleChange}
                    className="w-full appearance-none rounded-lg py-3 px-4 bg-gray-700/60 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 pr-10"
                    required
                  >
                    <option value="" className="bg-gray-700">Select University</option>
                    {Object.values(Universities).map((uni) => (
                      <option key={uni} value={uni} className="bg-gray-700">
                        {uni.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div>
                <label htmlFor="course" className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Course *
                </label>
                <div className="relative">
                  <select
                    name="course"
                    id="course"
                    value={formData.course}
                    onChange={handleChange}
                    className="w-full appearance-none rounded-lg py-3 px-4 bg-gray-700/60 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 pr-10"
                    required
                  >
                    <option value="" className="bg-gray-700">Select Course</option>
                    {Object.values(Courses).map((course) => (
                      <option key={course} value={course} className="bg-gray-700">
                        {course.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="skills" className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                  <Award className="h-4 w-4 mr-2" />
                  Skills
                </label>
                <select
                  name="skills"
                  id="skills"
                  multiple
                  value={formData.skills}
                  onChange={handleSkillChange}
                  className="w-full h-40 rounded-lg py-3 px-4 bg-gray-700/60 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {Object.values(Skills).map((skill) => (
                    <option key={skill} value={skill} className="bg-gray-700 py-2">
                      {skill.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-sm text-gray-400">Hold Ctrl/Cmd to select multiple skills</p>
              </div>
            </div>
          </div>
        );
        
      case 'social':
        return (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-5">
              <div>
                <label htmlFor="linkedin" className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                  <Linkedin className="h-4 w-4 mr-2 text-blue-400" />
                  LinkedIn URL
                </label>
                <div className="flex rounded-lg shadow-sm bg-gray-700/60 border border-gray-600 overflow-hidden">
                  <span className="inline-flex items-center px-3 rounded-l-lg border-r border-gray-600 text-gray-300">
                    linkedin.com/in/
                  </span>
                  <input
                    type="text"
                    name="linkedin"
                    id="linkedin"
                    value={formData.linkedin?.replace('https://linkedin.com/in/', '') || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      linkedin: e.target.value ? `https://linkedin.com/in/${e.target.value}` : ''
                    }))}
                    className="flex-1 min-w-0 w-full px-4 py-3 bg-transparent text-white focus:outline-none focus:ring-0"
                    placeholder="your-profile"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="github" className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                  <Github className="h-4 w-4 mr-2 text-gray-300" />
                  GitHub URL
                </label>
                <div className="flex rounded-lg shadow-sm bg-gray-700/60 border border-gray-600 overflow-hidden">
                  <span className="inline-flex items-center px-3 rounded-l-lg border-r border-gray-600 text-gray-300">
                    github.com/
                  </span>
                  <input
                    type="text"
                    name="github"
                    id="github"
                    value={formData.github?.replace('https://github.com/', '') || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      github: e.target.value ? `https://github.com/${e.target.value}` : ''
                    }))}
                    className="flex-1 min-w-0 w-full px-4 py-3 bg-transparent text-white focus:outline-none focus:ring-0"
                    placeholder="your-username"
                  />
                </div>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div 
        className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 shadow-2xl overflow-hidden w-full max-w-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="p-5 border-b border-gray-700">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Edit className="h-5 w-5 text-purple-400" />
                Edit Profile
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                Update your personal information and preferences
              </p>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1.5 rounded-full hover:bg-gray-700 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          {/* Navigation Tabs */}
          <div className="flex mt-6 border-b border-gray-700">
            <button
              className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeSection === 'basic'
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
              onClick={() => setActiveSection('basic')}
            >
              Basic Info
            </button>
            <button
              className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeSection === 'education'
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
              onClick={() => setActiveSection('education')}
            >
              Education
            </button>
            <button
              className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeSection === 'social'
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
              onClick={() => setActiveSection('social')}
            >
              Social Profiles
            </button>
          </div>
        </div>
        
        {/* Form Content */}
        <div className="p-6 max-h-[65vh] overflow-y-auto">
          <form onSubmit={handleSubmit}>
            {renderSection()}
            
            {errorMessage && (
              <div className="mt-5 p-3 bg-red-900/40 border border-red-700/50 rounded-lg flex items-center gap-3">
                <svg className="h-5 w-5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-300 text-sm">{errorMessage}</p>
              </div>
            )}
            
            <div className="flex justify-end gap-3 mt-8">
              <button
                type="button"
                onClick={() => onClose(false)}
                className="px-5 py-2.5 text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200 flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;