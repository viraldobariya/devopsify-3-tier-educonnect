import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  FileText,
  Edit,
  Trash2,
  Download,
  Settings,
  ArrowLeft,
  ExternalLink,
  Share2,
  TrendingUp,
  UserCheck,
  Star,
  Eye,
  Bookmark,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  CalendarDays,
  User,
  Ticket,
  BarChart3,
  Plus,
  Sparkles,
  Loader2
} from 'lucide-react';

import { fetchEventById, clearSuccessMessage, fetchAvailableSpots } from '../../../store/slices/eventsSlice';
import EventRegistrationModal from '../components/EventRegistrationModal';
import FormBuilder from '../components/FormBuilder';
import DynamicFormSubmission from '../components/DynamicFormSubmission';
import eventApi from '../../../api/eventApi';

const EventDetailPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { availableSpots } = useSelector(state => state.events);
  const { currentEvent: event, loading, error, successMessage } = useSelector(state => state.events);
  const { user } = useSelector(state => state.auth);
  
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState(null);
  const [activeForm, setActiveForm] = useState(null);
  const [allForms, setAllForms] = useState([]);
  const [isCreator, setIsCreator] = useState(false);
  const [showFormBuilder, setShowFormBuilder] = useState(false);
  const [editingForm, setEditingForm] = useState(null);
  const [showSubmissionEditor, setShowSubmissionEditor] = useState(false);
  const [isLoadingSupplemental, setIsLoadingSupplemental] = useState(false);
  const [downloadingFormId, setDownloadingFormId] = useState(null);

  useEffect(() => {
    if (eventId) {
      dispatch(fetchEventById(eventId)); 
    }
  }, [eventId, dispatch]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => dispatch(clearSuccessMessage()), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, dispatch]);

  useEffect(() => {
    dispatch(fetchAvailableSpots([eventId]));
  }, [showRegistrationModal, eventId, dispatch]);

  const loadSupplemental = async () => {
    try {
      setIsLoadingSupplemental(true);
      const [creatorRes, statusRes, activeFormRes, allFormsRes] = await Promise.allSettled([
        eventApi.isUserEventCreator(eventId),
        eventApi.getRegistrationStatus(eventId),
        eventApi.getActiveForm(eventId),
        eventApi.getAllForms(eventId)
      ]);
      setIsCreator(creatorRes.status === 'fulfilled' ? !!creatorRes.value.data : false);
      setRegistrationStatus(statusRes.status === 'fulfilled' ? statusRes.value.data : null);
      setActiveForm(activeFormRes.status === 'fulfilled' ? activeFormRes.value.data : null);
      setAllForms(allFormsRes.status === 'fulfilled' ? allFormsRes.value.data || [] : []);
    } catch {
      // ignore
    } finally {
      setIsLoadingSupplemental(false);
    }
  };

  const handleRegistrationComplete = () => {
    setShowRegistrationModal(false);
    loadSupplemental();
    dispatch(fetchAvailableSpots([eventId]));
  };

  const handleUnregister = async () => {
    if (!window.confirm('Are you sure you want to unregister from this event?')) {
      return;
    }


    if(registrationStatus == -1){
      try{
        await eventApi.unregisterFromEvent(eventId);
        dispatch(fetchAvailableSpots([eventId]));
        loadSupplemental();
        return;
      }catch(error){
        console.error('Error unregistering from event:', error);
        setError(error.response?.data?.message || 'Failed to unregister from event');
        return;
      }
    }
    try {
      await eventApi.deleteFormFromSubmission(eventId, registrationStatus);
      loadSupplemental();
      dispatch(fetchAvailableSpots([eventId]));
    } catch (error) {
      console.error('Error unregistering:', error);
      alert('Failed to unregister from event');
    }
  };

  const handleCreateNewForm = () => {
    setEditingForm(null);
    setShowFormBuilder(true);
  };

  const handleEditForm = (form) => {
    setEditingForm(form);
    setShowFormBuilder(true);
  };

  const handleDeleteForm = async (formId) => {
    if (!window.confirm('Are you sure you want to delete this form? This action cannot be undone.')) {
      return;
    }

    try {
      await eventApi.deleteForm(eventId, formId);
      loadSupplemental();
    } catch (error) {
      console.error('Error deleting form:', error);
      alert('Failed to delete form');
    }
  };

  const handleDownloadFormResponses = async (form) => {
    if (!form?.id) {
      alert('Form identifier is missing. Please refresh and try again.');
      return;
    }

    try {
      setDownloadingFormId(form.id);
      const response = await eventApi.getFormResponses(eventId, form.id);
      const submissions = Array.isArray(response?.data) ? response.data : [];

      if (!submissions.length) {
        alert('No responses are available for this form yet.');
        return;
      }

      const baseColumns = ['registrationId', 'username', 'eventId', 'formId', 'userId', 'status', 'submittedAt', 'updatedAt'];
      const dynamicLabels = [];
      const labelSet = new Set();

      submissions.forEach((submission) => {
        (submission.responses || []).forEach((answer) => {
          const rawLabel = answer?.fieldLabel?.trim() || `Field ${answer?.fieldId ?? ''}`.trim();
          const label = rawLabel || `Field ${answer?.fieldId ?? dynamicLabels.length + 1}`;

          if (!labelSet.has(label)) {
            labelSet.add(label);
            dynamicLabels.push(label);
          }
        });
      });

      const escapeCSV = (value) => {
        if (value === null || value === undefined) return '""';
        const stringValue = String(value).replace(/"/g, '""');
        return `"${stringValue}`.concat('"');
      };

      const rows = submissions.map((submission) => {
        const responseMap = {};
        (submission.responses || []).forEach((answer) => {
          const label = (answer?.fieldLabel?.trim() || `Field ${answer?.fieldId ?? ''}`) || 'Field';
          if (responseMap[label]) {
            responseMap[label] = `${responseMap[label]}; ${answer?.value ?? ''}`;
          } else {
            responseMap[label] = answer?.value ?? '';
          }
        });

        const baseData = [
          submission.registrationId ?? '',
          submission.username ?? '',
          submission.eventId ?? '',
          submission.formId ?? '',
          submission.userId ?? '',
          submission.status ?? '',
          submission.submittedAt ? new Date(submission.submittedAt).toISOString() : '',
          submission.updatedAt ? new Date(submission.updatedAt).toISOString() : ''
        ];

        const dynamicData = dynamicLabels.map((label) => responseMap[label] ?? '');

        return [...baseData, ...dynamicData].map(escapeCSV).join(',');
      });

      const headerRow = [...baseColumns, ...dynamicLabels].map(escapeCSV).join(',');
      const csvContent = [headerRow, ...rows].join('\r\n');

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const rawTitle = form.title || `form-${form.id}`;
      const sanitizedTitle = rawTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `form-${form.id}`;
      const filename = `event-${eventId}-form-${sanitizedTitle}-${timestamp}.csv`;

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download form responses:', err);
      alert('Unable to download responses right now. Please try again later.');
    } finally {
      setDownloadingFormId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const hasCapacityLimit = () => {
    if (!event) return false;
    const cap = Number(event.maxParticipants);
    return Number.isFinite(cap) && cap > 0;
  };

  const getAvailableSpots = () => {
    if (!hasCapacityLimit() || !event) return Infinity;
    if (availableSpots[eventId] !== null && availableSpots[eventId] !== undefined) {
      return availableSpots[eventId];
    }
    const cap = Number(event.maxParticipants);
    const current = Number(event.currentRegistrations || event.currentParticipants || 0);
    return cap - current;
  };

  const isEventFull = hasCapacityLimit() ? getAvailableSpots() <= 0 : false;
  const isEventPast = event ? new Date(event.endDate) < new Date() : false;
  const isAlreadyRegistered = registrationStatus;

  const getEventStatus = () => {
    if (!event || !event.startDate) return { status: 'unknown', label: 'Unknown', color: 'bg-gray-500', icon: <Info className="w-4 h-4" /> };
    
    const now = new Date();
    const startDate = new Date(event.startDate);
    const endDate = event.endDate ? new Date(event.endDate) : startDate;

    if (endDate < now) {
      return { status: 'past', label: 'Past Event', color: 'bg-gray-500', icon: <XCircle className="w-4 h-4" /> };
    } else if (startDate <= now && endDate >= now) {
      return { status: 'ongoing', label: 'Live Now', color: 'bg-green-500', icon: <Clock className="w-4 h-4" /> };
    } else if (startDate.toDateString() === now.toDateString()) {
      return { status: 'today', label: 'Today', color: 'bg-orange-500', icon: <Star className="w-4 h-4" /> };
    } else {
      const daysUntil = Math.ceil((startDate - now) / (1000 * 60 * 60 * 24));
      if (daysUntil <= 7) {
        return { status: 'soon', label: `In ${daysUntil} days`, color: 'bg-yellow-500', icon: <AlertCircle className="w-4 h-4" /> };
      } else {
        return { status: 'upcoming', label: 'Upcoming', color: 'bg-blue-500', icon: <CalendarDays className="w-4 h-4" /> };
      }
    }
  };

  useEffect(() => {
    if (eventId) {
      dispatch(fetchEventById(eventId));
      loadSupplemental();
    }
  }, [eventId, dispatch]);

  if (loading && !event) {
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

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 backdrop-blur-sm">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Event Not Found</h3>
            <p className="text-gray-400 mb-6">{error || 'The event you are looking for does not exist or has been removed.'}</p>
            <button
              onClick={() => navigate('/events')}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg"
            >
              Browse Events
            </button>
          </div>
        </div>
      </div>
    );
  }

  const eventStatus = getEventStatus();
  const availableSpotsCount = getAvailableSpots();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-500/10 border border-green-500/30 rounded-xl p-4 backdrop-blur-sm animate-in slide-in-from-right">
          <div className="flex items-center gap-3 text-green-300">
            <CheckCircle className="w-5 h-5" />
            <span>{successMessage}</span>
          </div>
        </div>
      )}

      {/* Header with Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate("/events")}
            className="group p-3 bg-gray-800/50 backdrop-blur-sm text-gray-400 hover:text-white rounded-2xl hover:bg-gray-700/50 transition-all border border-gray-700/30 hover:border-gray-600/50"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              {event.title}
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${eventStatus.color} text-white backdrop-blur-sm`}>
                {eventStatus.icon}
                {eventStatus.label}
              </span>
              {event.university && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-purple-600/20 text-purple-300 border border-purple-500/30">
                  <User className="w-3 h-3" />
                  {event.university.replace(/_/g, ' ')}
                </span>
              )}
            </div>
          </div>
          
        </div>

        {/* Banner Image */}
        {event.bannerUrl && (
          <div className="mb-8 rounded-3xl overflow-hidden shadow-2xl">
            <img
              src={event.bannerUrl}
              alt={event.title}
              className="w-full h-80 object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = `
                  <div class="w-full h-80 bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center">
                    <Calendar className="w-16 h-16 text-gray-400" />
                  </div>
                `;
              }}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Event Details Card */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/30">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Info className="w-6 h-6 text-purple-400" />
                Event Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="flex items-center gap-4 p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 font-medium">Start Date</div>
                    <div className="text-white font-semibold">{formatDate(event.startDate)}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 font-medium">End Date</div>
                    <div className="text-white font-semibold">{formatDate(event.endDate)}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 font-medium">Location</div>
                    <div className="text-white font-semibold">{event.location || 'To be announced'}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 font-medium">Available Spots</div>
                    {hasCapacityLimit() ? (
                      <div className={`font-semibold ${
                        availableSpotsCount <= 5 && availableSpotsCount > 0 ? 'text-yellow-400' : 
                        isEventFull ? 'text-red-400' : 'text-green-400'
                      }`}>
                        {Math.max(0, availableSpotsCount)} / {event.maxParticipants}
                      </div>
                    ) : (
                      <div className="text-green-400 font-semibold">Unlimited spots</div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="text-gray-300">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-400" />
                  Description
                </h3>
                <p className="whitespace-pre-wrap leading-relaxed text-gray-300 bg-gray-900/30 rounded-xl p-6 border border-gray-700/30">
                  {event.description || 'No description provided for this event.'}
                </p>
              </div>
              
              {event.attachmentUrl && (
                <div className="mt-8">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Download className="w-5 h-5 text-blue-400" />
                    Event Attachments
                  </h3>
                  <a
                    href={event.attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 px-6 py-3 bg-blue-600/20 text-blue-300 rounded-xl hover:bg-blue-600/30 transition-all border border-blue-500/30 hover:border-blue-400/50"
                  >
                    <Download className="w-4 h-4" />
                    Download Attachment
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>

            {/* Active Registration Forms - Visible to all users */}
            {/* {allForms.filter(form => form.isActive).length > 0 && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/30">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  Active Registration Forms ({allForms.filter(form => form.isActive).length})
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {allForms.filter(form => form.isActive).map((form, index) => (
                    <div key={form.id || index} className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                            <FileText className="w-5 h-5 text-green-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white">
                              {form.title || `Registration Form ${index + 1}`}
                            </h3>
                            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-300 border border-green-500/30">
                              <CheckCircle className="w-3 h-3" />
                              Active
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {form.description && (
                        <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                          {form.description}
                        </p>
                      )}
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Fields:</span>
                          <span className="text-white font-medium">{form.fields?.length || 0} questions</span>
                        </div>
                        
                        {form.deadline && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">Deadline:</span>
                            <span className="text-white font-medium">
                              {new Date(form.deadline).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        )}
                        
                        {form.createdAt && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">Created:</span>
                            <span className="text-white font-medium">
                              {new Date(form.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {!isCreator && !isAlreadyRegistered && !isEventFull && !isEventPast && (
                        <button
                          onClick={() => setShowRegistrationModal(true)}
                          className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl transition-all shadow-lg font-semibold flex items-center justify-center gap-2"
                        >
                          <UserCheck className="w-4 h-4" />
                          Register with this Form
                        </button>
                      )}
                      
                      {isCreator && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditForm(form)}
                            className="flex-1 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded-lg transition-all border border-blue-500/30 text-sm font-medium flex items-center justify-center gap-2"
                          >
                            <Edit className="w-3 h-3" />
                            Edit Form
                          </button>
                          <button
                            onClick={() => navigate(`/events/${eventId}/registrations`)}
                            className="flex-1 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 rounded-lg transition-all border border-purple-500/30 text-sm font-medium flex items-center justify-center gap-2"
                          >
                            <Eye className="w-3 h-3" />
                            View Responses
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {!isCreator && (
                  <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-blue-300 mb-2">
                      <Info className="w-4 h-4" />
                      <span className="font-semibold">Registration Information</span>
                    </div>
                    <p className="text-gray-300 text-sm">
                      Choose any of the active forms above to register for this event. Each form may collect different information based on your needs.
                    </p>
                  </div>
                )}
              </div>
            )} */}

            {/* Form Management Section */}
            {isCreator && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/30">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <FileText className="w-6 h-6 text-green-400" />
                    Registration Forms ({allForms.length})
                  </h2>
                  <button
                    onClick={handleCreateNewForm}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl transition-all shadow-lg font-semibold"
                  >
                    <Plus className="w-4 h-4" />
                    Create New Form
                  </button>
                </div>
                
                {allForms.length > 0 ? (
                  <div className="space-y-4">
                    {allForms.map((form, index) => (
                      <div key={form.id || index} className={`rounded-xl p-4 border ${
                        form.isActive 
                          ? 'bg-green-500/10 border-green-500/30' 
                          : 'bg-gray-700/30 border-gray-600/30'
                      }`}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {form.isActive ? (
                              <CheckCircle className="w-5 h-5 text-green-300" />
                            ) : (
                              <FileText className="w-5 h-5 text-gray-400" />
                            )}
                            <span className={`font-semibold ${
                              form.isActive ? 'text-green-300' : 'text-gray-300'
                            }`}>
                              {form.title || `Form ${index + 1}`}
                            </span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              form.isActive
                                ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                                : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                            }`}>
                              {form.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleDownloadFormResponses(form)}
                              disabled={downloadingFormId === form.id}
                              className={`px-3 py-1 rounded-lg transition-all border text-sm flex items-center ${
                                downloadingFormId === form.id
                                  ? 'bg-purple-600/10 border-purple-500/20 text-purple-200 cursor-wait'
                                  : 'bg-purple-600/20 hover:bg-purple-600/30 border-purple-500/30 text-purple-300'
                              }`}
                            >
                              {downloadingFormId === form.id ? (
                                <>
                                  <Loader2 className="w-3 h-3 inline mr-2 animate-spin" />
                                  Preparing...
                                </>
                              ) : (
                                <>
                                  <Download className="w-3 h-3 inline mr-2" />
                                  Download Responses
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => handleEditForm(form)}
                              className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded-lg transition-all border border-blue-500/30 text-sm"
                            >
                              <Edit className="w-3 h-3 inline mr-1" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteForm(form.id)}
                              className="px-3 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded-lg transition-all border border-red-500/30 text-sm"
                            >
                              <Trash2 className="w-3 h-3 inline mr-1" />
                              Delete
                            </button>
                          </div>
                        </div>
                        <div className="text-gray-300 text-sm">
                          Fields: <span className="text-white font-medium">{form.fields?.length || 0} fields configured</span>
                        </div>
                        {form.deadline && (
                          <div className="text-gray-300 text-sm mt-1">
                            Deadline: <span className="text-white font-medium">{new Date(form.deadline).toLocaleString()}</span>
                          </div>
                        )}
                        {form.description && (
                          <div className="text-gray-300 text-sm mt-1">
                            Description: <span className="text-white font-medium">{form.description}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 text-center">
                      <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-yellow-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">No Registration Forms</h3>
                      <p className="text-gray-400 mb-6">
                        Create custom registration forms to collect specific information from attendees beyond basic details.
                      </p>
                      <button
                        onClick={handleCreateNewForm}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl transition-all shadow-lg font-semibold"
                      >
                        <Plus className="w-5 h-5" />
                        Create First Form
                      </button>
                    </div>
                    
                    <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/30">
                      <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        What you can do with forms:
                      </h4>
                      <ul className="text-gray-300 text-sm space-y-1">
                        <li>• Create multiple registration forms for different purposes</li>
                        <li>• Collect specific information from attendees</li>
                        <li>• Add custom questions and field types</li>
                        <li>• Set registration deadlines for each form</li>
                        <li>• Manage form submissions easily</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Creator Analytics */}
            {/* {isCreator && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/30">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <BarChart3 className="w-6 h-6 text-green-400" />
                  Event Analytics
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
                    <div className="text-2xl font-bold text-purple-400 mb-1">{event.currentRegistrations || 0}</div>
                    <div className="text-gray-400 text-sm">Total Registrations</div>
                  </div>
                  <div className="text-center p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
                    <div className="text-2xl font-bold text-green-400 mb-1">{availableSpotsCount}</div>
                    <div className="text-gray-400 text-sm">Available Spots</div>
                  </div>
                  <div className="text-center p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
                    <div className="text-2xl font-bold text-blue-400 mb-1">{event.viewCount || 0}</div>
                    <div className="text-gray-400 text-sm">Total Views</div>
                  </div>
                  <div className="text-center p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
                    <div className="text-2xl font-bold text-yellow-400 mb-1">
                      {hasCapacityLimit() ? Math.round(((event.currentRegistrations || 0) / event.maxParticipants) * 100) : 0}%
                    </div>
                    <div className="text-gray-400 text-sm">Capacity Filled</div>
                  </div>
                </div>
              </div>
            )} */}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Registration Card */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/30">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Ticket className="w-5 h-5 text-purple-400" />
                Registration
              </h3>
              
              {isAlreadyRegistered ? (
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-2 text-green-300 mb-3">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-semibold">You're Registered!</span>
                  </div>
                  <div className="text-gray-300 text-sm mb-4">
                    Your spot is confirmed for this event
                  </div>
                  <div className="space-y-2">
                    {activeForm && (
                      <button
                        onClick={() => setShowSubmissionEditor(true)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors font-medium"
                      >
                        <Edit className="w-4 h-4" />
                        View/Edit Response
                      </button>
                    )}
                    <button
                      onClick={handleUnregister}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded-xl transition-colors border border-red-500/30 font-medium"
                    >
                      <Trash2 className="w-4 h-4" />
                      Unregister
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {isEventFull && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4">
                      <div className="flex items-center gap-2 text-red-300">
                        <XCircle className="w-5 h-5" />
                        <span className="font-semibold">Event is Full</span>
                      </div>
                    </div>
                  )}
                  
                  {isEventPast && (
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-4">
                      <div className="flex items-center gap-2 text-yellow-300">
                        <Clock className="w-5 h-5" />
                        <span className="font-semibold">Event Has Ended</span>
                      </div>
                    </div>
                  )}
                  
                  {!isEventFull && !isEventPast && !isCreator && (
                    <button
                      onClick={() => setShowRegistrationModal(true)}
                      className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl transition-all shadow-lg hover:shadow-xl font-bold text-lg"
                    >
                      Register Now
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Creator Actions */}
            {isCreator && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/30">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-blue-400" />
                  Manage Event
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => navigate(`/events/${eventId}/edit`)}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded-xl transition-all border border-blue-500/30 hover:border-blue-400/50"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Event Details
                  </button>
                  
                  <button
                    onClick={handleCreateNewForm}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-green-600/20 hover:bg-green-600/30 text-green-300 rounded-xl transition-all border border-green-500/30 hover:border-green-400/50"
                  >
                    <Plus className="w-4 h-4" />
                    Create New Form
                  </button>
                  
                  <button
                    onClick={() => navigate(`/events/${eventId}/registrations`)}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 rounded-xl transition-all border border-purple-500/30 hover:border-purple-400/50"
                  >
                    <UserCheck className="w-4 h-4" />
                    View Registrations
                  </button>
                </div>
              </div>
            )}

            {/* Form Information */}
            {allForms.length > 0 && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/30">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-green-400" />
                  Registration Forms
                </h3>
                <div className="space-y-3">
                  {/* Show active forms first, then inactive ones */}
                  {[...allForms]
                    .sort((a, b) => (b.isActive ? 1 : 0) - (a.isActive ? 1 : 0))
                    .slice(0, 3)
                    .map((form, index) => (
                    <div key={form.id || index} className={`p-3 rounded-lg border ${
                      form.isActive 
                        ? 'bg-green-500/10 border-green-500/30' 
                        : 'bg-gray-700/30 border-gray-600/30'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold text-white">{form.title || `Form ${index + 1}`}</div>
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                          form.isActive
                            ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                            : 'bg-red-500/20 text-red-300 border border-red-500/30'
                        }`}>
                          {form.isActive ? (
                            <>
                              <CheckCircle className="w-2 h-2" />
                              Active
                            </>
                          ) : (
                            <>
                              <XCircle className="w-2 h-2" />
                              Inactive
                            </>
                          )}
                        </div>
                      </div>
                      {form.deadline && (
                        <div className="text-gray-400 text-xs">
                          Deadline: {new Date(form.deadline).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  ))}
                  {allForms.length > 3 && (
                    <div className="text-center text-gray-400 text-sm py-2">
                      {allForms.filter(f => f.isActive).length > 0 && (
                        <span className="text-green-300">
                          {Math.max(0, allForms.filter(f => f.isActive).length - 3)} more active
                        </span>
                      )}
                      {allForms.filter(f => f.isActive).length > 0 && allForms.filter(f => !f.isActive).length > 0 && (
                        <span className="text-gray-400"> • </span>
                      )}
                      {allForms.filter(f => !f.isActive).length > 0 && (
                        <span className="text-gray-400">
                          {allForms.filter(f => !f.isActive).length} inactive
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showRegistrationModal && (
        <EventRegistrationModal
          eventId={eventId}
          show={showRegistrationModal}
          onClose={() => setShowRegistrationModal(false)}
          onRegistrationComplete={handleRegistrationComplete}
        />
      )}

      {showFormBuilder && (
        <FormBuilder
          eventId={eventId}
          form={editingForm}
          onFormSaved={() => {
            setShowFormBuilder(false);
            setEditingForm(null);
            loadSupplemental();
          }}
          onClose={() => {
            setShowFormBuilder(false);
            setEditingForm(null);
          }}
        />
      )}      {showSubmissionEditor && activeForm && (
        <DynamicFormSubmission
          eventId={eventId}
          formId={isAlreadyRegistered}
          existingSubmission={true}
          onSubmissionComplete={() => setShowSubmissionEditor(false)}
          onClose={() => setShowSubmissionEditor(false)}
        />
      )}
    </div>
  );
};

export default EventDetailPage;