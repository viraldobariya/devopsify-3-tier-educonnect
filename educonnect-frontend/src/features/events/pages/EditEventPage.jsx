import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Users, 
  FileText, 
  Upload,
  AlertCircle,
  CheckCircle,
  Save,
  Eye,
  Clock,
  Globe,
  ChevronDown
} from 'lucide-react';
import eventApi from '../../../api/eventApi';
import { Universities } from '../../../constants/enums';

const EditEventPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    university: '',
    maxParticipants: '',
    bannerUrl: '',
    attachmentUrl: ''
  });
  
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [showUniversityDropdown, setShowUniversityDropdown] = useState(false);

  useEffect(() => {
    if (eventId) {
      fetchEventData();
      checkCreatorStatus();
    }
  }, [eventId]);

  const fetchEventData = async () => {
    try {
      setLoading(true);
      const response = await eventApi.getEventById(eventId);
      const event = response.data;
      
      setFormData({
        title: event.title || '',
        description: event.description || '',
        startDate: event.startDate ? new Date(event.startDate).toISOString().slice(0, 16) : '',
        endDate: event.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : '',
        location: event.location || '',
        university: event.university || '',
        maxParticipants: event.maxParticipants || '',
        bannerUrl: event.bannerUrl || '',
        attachmentUrl: event.attachmentUrl || ''
      });
      setError(null);
    } catch (error) {
      console.error('Error fetching event data:', error);
      setError('Failed to load event data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const checkCreatorStatus = async () => {
    try {
      const response = await eventApi.isUserEventCreator(eventId);
      setIsCreator(!!response.data);
      if (!response.data) {
        navigate('/unauthorized');
      }
    } catch (error) {
      console.error('Error checking creator status:', error);
      navigate('/unauthorized');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear success message when user starts editing
    if (success) {
      setSuccess(false);
    }
  };

  const handleUniversitySelect = (university) => {
    setFormData(prev => ({
      ...prev,
      university
    }));
    setShowUniversityDropdown(false);
    if (success) setSuccess(false);
  };

  const handleBannerFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBannerFile(file);
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setBannerPreview(previewUrl);
      
      // Clear success message when user changes file
      if (success) setSuccess(false);
    }
  };

  // Cleanup banner preview URL on unmount
  useEffect(() => {
    return () => {
      if (bannerPreview) {
        URL.revokeObjectURL(bannerPreview);
      }
    };
  }, [bannerPreview]);

  const validateForm = () => {
    const errors = [];
    
    if (!formData.title.trim()) {
      errors.push('Event title is required');
    }
    
    if (!formData.description.trim()) {
      errors.push('Event description is required');
    }
    
    if (!formData.startDate) {
      errors.push('Start date is required');
    }
    
    if (!formData.endDate) {
      errors.push('End date is required');
    }
    
    if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      errors.push('End date must be after start date');
    }
    
    if (formData.maxParticipants && formData.maxParticipants < 1) {
      errors.push('Maximum participants must be at least 1');
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return;
    }
    
    try {
      setSaving(true);
      setError(null);
      
      const updateData = {
        ...formData,
        maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null
      };
      
      await eventApi.updateEvent(eventId, updateData, bannerFile);
      setSuccess(true);
      
      // Redirect to event detail page after successful update
      setTimeout(() => {
        navigate(`/events/${eventId}`);
      }, 2000);
      
    } catch (error) {
      console.error('Error updating event:', error);
      setError(error.response?.data?.message || 'Failed to update event. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    navigate(`/events/${eventId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 bg-gray-700 rounded-full mx-auto mb-4"></div>
          <div className="h-6 bg-gray-700 rounded w-48 mx-auto mb-2"></div>
          <div className="h-4 bg-gray-700 rounded w-32 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!isCreator) {
    return null; // Will be redirected by checkCreatorStatus
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Success Message */}
      {success && (
        <div className="fixed top-4 right-4 z-50 bg-green-500/10 border border-green-500/30 rounded-xl p-4 backdrop-blur-sm animate-in slide-in-from-right">
          <div className="flex items-center gap-3 text-green-300">
            <CheckCircle className="w-5 h-5" />
            <span>Event updated successfully! Redirecting...</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(`/events/${eventId}`)}
            className="group p-3 bg-gray-800/50 backdrop-blur-sm text-gray-400 hover:text-white rounded-2xl hover:bg-gray-700/50 transition-all border border-gray-700/30 hover:border-gray-600/50"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Edit Event
            </h1>
            <p className="text-gray-400 mt-2">Update your event details and settings</p>
          </div>
          <button
            onClick={handlePreview}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 hover:bg-gray-700/70 text-gray-300 hover:text-white rounded-xl transition-all border border-gray-600/50 hover:border-gray-500/50"
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information Card */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/30">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <FileText className="w-6 h-6 text-purple-400" />
              Basic Information
            </h2>
            
            <div className="space-y-6">
              {/* Event Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Event Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter event title"
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* Event Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Event Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your event in detail"
                  rows={6}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                  required
                />
              </div>

              {/* University Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  University
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowUniversityDropdown(!showUniversityDropdown)}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all flex items-center justify-between"
                  >
                    <span className={formData.university ? 'text-white' : 'text-gray-400'}>
                      {formData.university ? formData.university.replace(/_/g, ' ') : 'Select University'}
                    </span>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showUniversityDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  {showUniversityDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-600/50 rounded-xl shadow-2xl z-10 max-h-48 overflow-y-auto">
                      {Object.values(Universities).map((university) => (
                        <button
                          key={university}
                          type="button"
                          onClick={() => handleUniversitySelect(university)}
                          className="w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-700/50 hover:text-white transition-all first:rounded-t-xl last:rounded-b-xl"
                        >
                          {university.replace(/_/g, ' ')}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Date & Location Card */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/30">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Calendar className="w-6 h-6 text-blue-400" />
              Date & Location
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Start Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Start Date & Time *
                </label>
                <input
                  type="datetime-local"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  End Date & Time *
                </label>
                <input
                  type="datetime-local"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* Location */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Enter event location"
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {/* Capacity & Media Card */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/30">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Users className="w-6 h-6 text-green-400" />
              Capacity & Media
            </h2>
            
            <div className="space-y-6">
              {/* Max Participants */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Maximum Participants
                </label>
                <input
                  type="number"
                  name="maxParticipants"
                  value={formData.maxParticipants}
                  onChange={handleChange}
                  placeholder="Leave empty for unlimited capacity"
                  min="1"
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
                <p className="text-gray-400 text-sm mt-2">
                  Leave empty for unlimited capacity
                </p>
              </div>

              {/* Banner URL */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Banner Image
                </label>
                
                {/* Current banner preview */}
                {formData.bannerUrl && !bannerPreview && (
                  <div className="mb-3">
                    <p className="text-gray-400 text-sm mb-2">Current Banner:</p>
                    <img
                      src={formData.bannerUrl}
                      alt="Current banner"
                      className="w-full h-32 object-cover rounded-lg border border-gray-600"
                    />
                  </div>
                )}
                
                {/* New banner preview */}
                {bannerPreview && (
                  <div className="mb-3">
                    <p className="text-gray-400 text-sm mb-2">New Banner Preview:</p>
                    <img
                      src={bannerPreview}
                      alt="New banner preview"
                      className="w-full h-32 object-cover rounded-lg border border-gray-600"
                    />
                  </div>
                )}
                
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBannerFileChange}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-600 file:text-white hover:file:bg-green-700"
                />
                <p className="text-gray-400 text-sm mt-1">
                  Choose a new banner image to replace the current one, or leave empty to keep existing banner.
                </p>
              </div>

              {/* Attachment URL */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Attachment URL
                </label>
                <input
                  type="url"
                  name="attachmentUrl"
                  value={formData.attachmentUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/attachment.pdf"
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <div className="flex items-center gap-3 text-red-300">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <button
              type="button"
              onClick={() => navigate(`/events/${eventId}`)}
              className="px-6 py-3 bg-gray-700/50 hover:bg-gray-700/70 text-gray-300 hover:text-white rounded-xl transition-all border border-gray-600/50 hover:border-gray-500/50 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl transition-all shadow-lg hover:shadow-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Update Event
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEventPage;