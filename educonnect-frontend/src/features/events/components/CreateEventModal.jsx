import React, { useState, useEffect } from 'react';
import eventApi from '../../../api/eventApi';
import { Universities } from "../../../constants/enums";
import { ChevronDown, Calendar, MapPin, Users, Image, FileText } from 'lucide-react';
import FormBuilder from './FormBuilder';

const CreateEventModal = ({ show, onClose, onEventCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    bannerUrl: '',
    attachmentUrl: '',
    status: 'PUBLISHED',
    university: '',
    maxParticipants: 1
  });


  const [shareEventData, setShareEventData] = useState(null);
  const [shareBannerFile, setShareBannerFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [showFormBuilder, setShowFormBuilder] = useState(false);

  // Cleanup banner preview URL on unmount
  useEffect(() => {
    return () => {
      if (bannerPreview) {
        URL.revokeObjectURL(bannerPreview);
      }
    };
  }, [bannerPreview]);
  const [createdEvent, setCreatedEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleBannerFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBannerFile(file);
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setBannerPreview(previewUrl);
      
      // Clear any banner URL since we're using file upload
      setFormData(prev => ({
        ...prev,
        bannerUrl: ''
      }));
      
      // Clear file error
      if (errors.bannerFile) {
        setErrors(prev => ({
          ...prev,
          bannerFile: null
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Required field validation
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.university) newErrors.university = 'University is required';
    if (formData.maxParticipants < 1) newErrors.maxParticipants = 'Must have at least 1 participant';
    
    // Date validation
    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      const now = new Date();
      
      if (startDate < now) {
        newErrors.startDate = 'Start date cannot be in the past';
      }
      if (endDate <= startDate) {
        newErrors.endDate = 'End date must be after start date';
      }
    }
    
    // URL validation
    if (formData.bannerUrl && !isValidUrl(formData.bannerUrl)) {
      newErrors.bannerUrl = 'Please enter a valid URL';
    }
    if (formData.attachmentUrl && !isValidUrl(formData.attachmentUrl)) {
      newErrors.attachmentUrl = 'Please enter a valid URL';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      // Prepare data for API
      const eventData = {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        maxParticipants: parseInt(formData.maxParticipants)
      };
      
      // Ask if user wants to create a registration form
      if (window.confirm('Would you like to create a registration form for this event? Both the event and form will be created together.')) {
        setShareEventData(eventData);
        setShareBannerFile(bannerFile);

        setShowFormBuilder(true);
      } else {
        const response = await eventApi.createEvent(eventData, bannerFile);
        setCreatedEvent(response.data);
        onEventCreated(response.data);
        onClose();
      }
    } catch (error) {
      console.error('Error creating event:', error);
      setErrors({ general: error.response?.data?.message || 'Failed to create event' });
    } finally {
      setLoading(false);
    }
  };

  const handleFormCreated = (formData) => {
    setShowFormBuilder(false);
    onClose();
  };

  if (!show) return null;

  if (showFormBuilder) {
    return (
      <FormBuilder
        shareBannerFile={shareBannerFile}
        shareEventData={shareEventData}
        onFormSaved={handleFormCreated}
        onEventCreated={onEventCreated}
        onClose={() => {
          setShowFormBuilder(false);
          onClose();
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-white">Create New Event</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {errors.general && (
          <div className="mb-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg text-red-300">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Basic Information
            </h3>
            
            <div>
              <label className="block text-gray-400 mb-2">Event Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 ${
                  errors.title ? 'border border-red-500 focus:ring-red-500' : 'focus:ring-purple-600'
                }`}
                placeholder="Enter event title"
                required
              />
              {errors.title && <div className="text-red-400 text-sm mt-1">{errors.title}</div>}
            </div>

            <div>
              <label className="block text-gray-400 mb-2">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className={`w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 ${
                  errors.description ? 'border border-red-500 focus:ring-red-500' : 'focus:ring-purple-600'
                }`}
                placeholder="Describe your event"
                required
              />
              {errors.description && <div className="text-red-400 text-sm mt-1">{errors.description}</div>}
            </div>
          </div>

          {/* Date and Time */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Date & Time
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 mb-2">Start Date & Time *</label>
                <input
                  type="datetime-local"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 ${
                    errors.startDate ? 'border border-red-500 focus:ring-red-500' : 'focus:ring-purple-600'
                  }`}
                  required
                />
                {errors.startDate && <div className="text-red-400 text-sm mt-1">{errors.startDate}</div>}
              </div>
              
              <div>
                <label className="block text-gray-400 mb-2">End Date & Time *</label>
                <input
                  type="datetime-local"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 ${
                    errors.endDate ? 'border border-red-500 focus:ring-red-500' : 'focus:ring-purple-600'
                  }`}
                  required
                />
                {errors.endDate && <div className="text-red-400 text-sm mt-1">{errors.endDate}</div>}
              </div>
            </div>
          </div>

          {/* Location and Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Location & Details
            </h3>
            
            <div>
              <label className="block text-gray-400 mb-2">Location *</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 ${
                  errors.location ? 'border border-red-500 focus:ring-red-500' : 'focus:ring-purple-600'
                }`}
                placeholder="Event venue or location"
                required
              />
              {errors.location && <div className="text-red-400 text-sm mt-1">{errors.location}</div>}
            </div>
            
            <div>
              <label className="block text-gray-400 mb-2">University *</label>
              <div className="relative">
                <select
                  name="university"
                  value={formData.university}
                  onChange={handleChange}
                  className={`w-full appearance-none bg-gray-700 border ${
                    errors.university ? 'border-red-500' : 'border-gray-600'
                  } focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 rounded-lg px-4 py-2.5 pr-12 text-white cursor-pointer transition-all duration-300`}
                  required
                >
                  <option value="" className="bg-gray-800 text-gray-400" disabled={true}>Select a university</option>
                  {Universities.map((uni) => (
                    <option key={uni} value={uni} className="bg-gray-800 text-white">{uni}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                </div>
              </div>
              {errors.university && <div className="text-red-400 text-sm mt-1">{errors.university}</div>}
            </div>

            <div>
              <label className="flex items-center gap-2 text-gray-400 mb-2">
                <Users className="w-4 h-4" />
                Maximum Participants *
              </label>
              <input
                type="number"
                name="maxParticipants"
                value={formData.maxParticipants}
                onChange={handleChange}
                min="1"
                className={`w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 ${
                  errors.maxParticipants ? 'border border-red-500 focus:ring-red-500' : 'focus:ring-purple-600'
                }`}
                required
              />
              {errors.maxParticipants && <div className="text-red-400 text-sm mt-1">{errors.maxParticipants}</div>}
            </div>
          </div>

          {/* Media and Attachments */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <Image className="w-5 h-5" />
              Media & Attachments
            </h3>
            
            <div>
              <label className="block text-gray-400 mb-2">Banner Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleBannerFileChange}
                className={`w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 ${
                  errors.bannerFile ? 'border border-red-500 focus:ring-red-500' : 'focus:ring-purple-600'
                } file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700`}
              />
              {errors.bannerFile && <div className="text-red-400 text-sm mt-1">{errors.bannerFile}</div>}
              {bannerPreview && (
                <div className="mt-3">
                  <p className="text-gray-400 text-sm mb-2">Preview:</p>
                  <img
                    src={bannerPreview}
                    alt="Banner preview"
                    className="w-full h-32 object-cover rounded-lg border border-gray-600"
                  />
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-gray-400 mb-2">Attachment URL</label>
              <input
                type="url"
                name="attachmentUrl"
                value={formData.attachmentUrl}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 ${
                  errors.attachmentUrl ? 'border border-red-500 focus:ring-red-500' : 'focus:ring-purple-600'
                }`}
                placeholder="https://example.com/document.pdf"
              />
              {errors.attachmentUrl && <div className="text-red-400 text-sm mt-1">{errors.attachmentUrl}</div>}
            </div>
          </div>

          {/* Event Status */}
          {/* <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Event Status</h3>
            
            <div>
              <label className="block text-gray-400 mb-2">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              >
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div> */}

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-600">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-400 hover:text-white bg-gray-700 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEventModal;
