import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import eventApi from '../../../api/eventApi';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Edit, 
  Trash2, 
  Eye,
  Settings,
  ChevronLeft,
  ChevronRight,
  Download,
  Star,
  Share2,
  Bookmark,
  User,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';
import {
  fetchEvents,
  unregisterFromEvent,
  deleteEvent,
  clearError,
  clearSuccessMessage,
  fetchAvailableSpots,
} from '../../../store/slices/eventsSlice';
import EventRegistrationModal from './EventRegistrationModal';
import DynamicFormSubmission from './DynamicFormSubmission';

const EnhancedEventList = ({ 
  searchQuery = '', 
  filterType = 'all', 
  dateRange = { startDate: '', endDate: '' },
  showPagination = true,
  limit = 9
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const {
    events,
    totalPages,
    currentPage,
    eventsLoading,
    error,
    successMessage,
    availableSpots
  } = useSelector(state => state.events);
  
  const { user } = useSelector(state => state.auth);
  
  const [registrationModal, setRegistrationModal] = useState({ show: false, eventId: null });
  const [registering, setRegistering] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [submissionModal, setSubmissionModal] = useState({ show: false, eventId: null, formId: null });
  const [registrationStatuses, setRegistrationStatuses] = useState({});
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    loadEvents();
  }, [currentPage, searchQuery, filterType, dateRange]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => dispatch(clearSuccessMessage()), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, dispatch]);

  useEffect(() => {
    if (events && events.length > 0) {
      const eventIds = events.filter(event => event && event.id).map(event => event.id);
      dispatch(fetchAvailableSpots(eventIds));
      
      if (user) {
        loadRegistrationStatuses();
      }
    }
  }, [events, user, dispatch]);

  const loadEvents = async () => {
    // If date range is specified, use the date range API directly
    if (dateRange.startDate && dateRange.endDate) {
      try {
        const response = await eventApi.getEventsByDateRange(dateRange.startDate, dateRange.endDate);
        // Here you might want to dispatch a different action to update the events
        // For now, let's dispatch the regular fetchEvents with the date range info
        dispatch(fetchEvents({
          page: currentPage,
          size: limit,
          searchQuery,
          filterType: 'date-range',
          dateRange
        }));
      } catch (error) {
        console.error('Error fetching events by date range:', error);
      }
    } else {
      dispatch(fetchEvents({
        page: currentPage,
        size: limit,
        searchQuery,
        filterType
      }));
    }
  };

  const loadRegistrationStatuses = async () => {
    if (!user) return;
    
    const statuses = {};
    const validEvents = events.filter(event => event && event.id);
    
    try {
      await Promise.all(
        validEvents.map(async (event) => {
          try {
            const response = await eventApi.getRegistrationStatus(event.id);
            statuses[event.id] = response.data;
          } catch (error) {
            statuses[event.id] = null;
          }
        })
      );
      setRegistrationStatuses(statuses);
    } catch (error) {
      console.error('Error loading registration statuses:', error);
    }
  };

  const handleUnregister = async (eventId, formId) => {
    if (window.confirm('Are you sure you want to unregister from this event?')) {

      if(formId == -1){
      try{
        await eventApi.unregisterFromEvent(eventId);
        setRegistrationStatuses(prev => ({
          ...prev,
          [eventId]: null
        }));
        // Update available spots for all events
        dispatch(fetchAvailableSpots(events.map(event => event.id)));

        return;
      }catch(error){
        console.error('Error unregistering from event:', error);
        setError(error.response?.data?.message || 'Failed to unregister from event');
        return;
      }
    }
      try {
        await dispatch(unregisterFromEvent({ eventId, formId })).unwrap();
        setRegistrationStatuses(prev => ({
          ...prev,
          [eventId]: null
        }));
        // Update available spots for all events
        dispatch(fetchAvailableSpots(events.map(event => event.id)));
      } catch (error) {
        console.error('Unregistration failed:', error);
      }
    }
  };

  const handleDelete = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      setDeleting(eventId);
      try {
        await dispatch(deleteEvent(eventId)).unwrap();
      } catch (error) {
        console.error('Delete failed:', error);
      } finally {
        setDeleting(null);
      }
    }
  };

  const handleRegistrationComplete = (registrationData) => {
    const eventId = registrationModal.eventId;
    setRegistrationModal({ show: false, eventId: null });
    
    if (registrationData) {
      setRegistrationStatuses(prev => ({
        ...prev,
        [eventId]: registrationData
      }));
    } else {
      setRegistrationStatuses(prev => ({
        ...prev,
        [eventId]: null
      }));
    }
    
    loadEvents();
    // Update available spots for all events
    dispatch(fetchAvailableSpots(events.map(event => event.id)));
    // Reload registration statuses to ensure UI consistency
    loadRegistrationStatuses();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const handleDownloadTicket = async (eventId) => {
    try {
      const registrationId = await eventApi.getRegistrationId(eventId);
      
      if (registrationId) {
        const pdfResponse = await eventApi.downloadPdf(registrationId.data);
        const blob = pdfResponse.data;
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ticket-${registrationId.data}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading ticket:', error);
    }
  };

  const getEventStatus = (event) => {
    if (!event || !event.startDate) {
      return { status: 'unknown', label: 'Unknown', color: 'bg-gray-500', icon: <Info className="w-3 h-3" /> };
    }

    try {
      const now = new Date();
      const startDate = new Date(event.startDate);
      const endDate = event.endDate ? new Date(event.endDate) : startDate;

      if (isNaN(startDate.getTime())) {
        return { status: 'unknown', label: 'Unknown', color: 'bg-gray-500', icon: <Info className="w-3 h-3" /> };
      }

      if (endDate < now) {
        return { status: 'past', label: 'Past Event', color: 'bg-gray-500', icon: <XCircle className="w-3 h-3" /> };
      } 
      else if (startDate <= now && endDate >= now) {
        return { status: 'ongoing', label: 'Live Now', color: 'bg-green-500', icon: <Clock className="w-3 h-3" /> };
      }
      else if (startDate.toDateString() === now.toDateString()) {
        return { status: 'today', label: 'Today', color: 'bg-orange-500', icon: <Star className="w-3 h-3" /> };
      }
      else if (startDate > now) {
        const timeUntil = startDate - now;
        const daysUntil = Math.ceil(timeUntil / (1000 * 60 * 60 * 24));
        
        if (daysUntil <= 7) {
          return { status: 'soon', label: `${daysUntil}d left`, color: 'bg-yellow-500', icon: <AlertCircle className="w-3 h-3" /> };
        } else {
          return { status: 'upcoming', label: 'Upcoming', color: 'bg-blue-500', icon: <Calendar className="w-3 h-3" /> };
        }
      }
    } catch (error) {
      console.error('Error calculating event status:', error);
    }

    return { status: 'unknown', label: 'Unknown', color: 'bg-gray-500', icon: <Info className="w-3 h-3" /> };
  };

  const hasCapacityLimit = (event) => {
    if (!event) return false;
    const cap = Number(event.maxParticipants);
    return Number.isFinite(cap) && cap > 0;
  };

  const getAvailableSpots = (event) => {
    if (!hasCapacityLimit(event)) return Infinity;
    
    if (availableSpots[event.id] !== null && availableSpots[event.id] !== undefined) {
      return availableSpots[event.id];
    }
    
    const cap = Number(event.maxParticipants);
    const current = Number(event.currentRegistrations || event.currentParticipants || 0);
    return cap - current;
  };

  const isEventFull = (event) => {
    if (!event) return false;
    if (!hasCapacityLimit(event)) return false;
    return getAvailableSpots(event) <= 0;
  };

  // Loading Skeleton
  if (eventsLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-800 rounded-xl overflow-hidden shadow-lg animate-pulse">
            <div className="h-48 bg-gray-700"></div>
            <div className="p-6">
              <div className="h-4 bg-gray-700 rounded mb-3"></div>
              <div className="h-3 bg-gray-700 rounded mb-4 w-3/4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-700 rounded"></div>
                <div className="h-3 bg-gray-700 rounded"></div>
                <div className="h-3 bg-gray-700 rounded w-1/2"></div>
              </div>
              <div className="flex gap-2 mt-4">
                <div className="h-8 bg-gray-700 rounded flex-1"></div>
                <div className="h-8 bg-gray-700 rounded w-8"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-6 mb-6 backdrop-blur-sm">
        <div className="flex items-center gap-3 text-red-300">
          <AlertCircle className="w-5 h-5" />
          <div className="flex-1">
            <div className="font-medium">Unable to load events</div>
            <div className="text-sm opacity-80">{error}</div>
          </div>
          <button
            onClick={() => dispatch(clearError())}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-500/10 border border-green-500/50 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center gap-3 text-green-300">
            <CheckCircle className="w-5 h-5" />
            <span>{successMessage}</span>
          </div>
        </div>
      )}

      {/* Events Grid */}
      {!events || events.length === 0 ? (
        <div className="text-center py-16">
          <div className="bg-gray-800/50 rounded-2xl p-12 backdrop-blur-sm border border-gray-700/50 max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchQuery ? 'No events found' : 'No events available'}
            </h3>
            <p className="text-gray-400 mb-6">
              {searchQuery 
                ? `No events match "${searchQuery}". Try different keywords.`
                : 'Check back later for new events.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.filter(event => event && event.id).map((event) => {
            const status = getEventStatus(event);
            const availableSpots = getAvailableSpots(event);
            const isFull = isEventFull(event);
            const isCreator = (
              event.isCreator ||
              event.createdByCurrentUser ||
              (event.createdBy?.id && user?.id && event.createdBy.id === user.id) ||
              (event.creatorId && user?.id && event.creatorId === user.id) ||
              (event.createdById && user?.id && event.createdById === user.id)
            );
            const isRegistered = registrationStatuses[event.id];

            return (
              <div 
                key={event.id} 
                className={`bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-700/50 backdrop-blur-sm ${
                  hoveredCard === event.id ? 'ring-2 ring-purple-500/30' : ''
                }`}
                onMouseEnter={() => setHoveredCard(event.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Event Banner with Gradient Overlay */}
                <div className="relative h-48 overflow-hidden">
                  {event.bannerUrl ? (
                    <>
                      <img
                        src={event.bannerUrl ? event.bannerUrl : '/default-event-banner.jpg'}
                        alt={event.title || 'Event banner'}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent"></div>
                    </>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center">
                      <Calendar className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Status Badges */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold text-white ${status.color} backdrop-blur-sm shadow-lg`}>
                      {status.icon}
                      <span>{status.label}</span>
                    </div>
                    {event.status && event.status !== 'PUBLISHED' && (
                      <div className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-yellow-500 text-white backdrop-blur-sm shadow-lg">
                        <AlertCircle className="w-3 h-3" />
                        <span>{event.status}</span>
                      </div>
                    )}
                  </div>

                  {/* Quick Actions Overlay */}
                  
                </div>
                
                <div className="p-6">
                  {/* Event Title and University */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 leading-tight hover:text-purple-300 transition-colors cursor-pointer"
                        onClick={() => navigate(`/events/${event.id}`)}>
                      {event.title || 'Untitled Event'}
                    </h3>
                    {event.university && (
                      <span className="inline-flex items-center gap-1 bg-purple-600/20 text-purple-300 text-xs px-3 py-1.5 rounded-full font-medium border border-purple-500/30">
                        {event.university.replace(/_/g, ' ')}
                      </span>
                    )}
                  </div>

                  {/* Creator Info */}
                  {event.createdByUsername && (
                    <div className="flex items-center justify-between bg-gray-700/30 rounded-xl p-3 mb-4 backdrop-blur-sm border border-gray-600/30">
                      <div className="flex items-center text-sm text-gray-300">
                        <div className="relative">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mr-3 shadow-lg overflow-hidden">
                            {event.createdByProfilePictureUrl ? (
                              <img 
                                src={event.createdByProfilePictureUrl} 
                                alt="Creator profile"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white font-semibold text-sm">
                                {event.createdByUsername.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          
                        </div>
                        <div>
                          <div className="font-semibold">{event.createdByUsername}</div>
                          <div className="text-xs text-gray-400">Organizer</div>
                        </div>
                      </div>
                      {isCreator && (
                        <span className="bg-green-500/20 text-green-300 text-xs px-3 py-1 rounded-full font-medium border border-green-500/30">
                          Your Event
                        </span>
                      )}
                    </div>
                  )}
                  
                  {/* Event Description */}
                  <p className="text-gray-400 text-sm mb-4 line-clamp-3 leading-relaxed">
                    {event.description || 'No description available'}
                  </p>
                  
                  {/* Event Details */}
                  <div className="space-y-3 mb-4 text-sm">
                    <div className="flex items-center gap-3 text-gray-300 p-2 rounded-lg bg-gray-700/20">
                      <Calendar className="w-4 h-4 text-purple-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{formatDate(event.startDate)}</div>
                        {event.endDate && event.endDate !== event.startDate && (
                          <div className="text-xs text-gray-400 truncate">Until {formatDate(event.endDate)}</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 text-gray-300 p-2 rounded-lg bg-gray-700/20">
                      <MapPin className="w-4 h-4 text-purple-400 flex-shrink-0" />
                      <span className="truncate">{event.location || 'Location to be announced'}</span>
                    </div>
                    
                    <div className="flex items-center gap-3 text-gray-300 p-2 rounded-lg bg-gray-700/20">
                      <Users className="w-4 h-4 text-purple-400 flex-shrink-0" />
                      <div className="flex-1 flex items-center justify-between">
                        <span>Capacity</span>
                        {hasCapacityLimit(event) ? (
                          <span className={`font-semibold ${
                            availableSpots <= 5 && availableSpots > 0 ? 'text-yellow-400' : 
                            isFull ? 'text-red-400' : 'text-green-400'
                          }`}>
                            {Math.max(0, availableSpots)}/{event.maxParticipants}
                          </span>
                        ) : (
                          <span className="text-green-400 font-semibold">Unlimited</span>
                        )}
                      </div>
                    </div>

                    {/* Attachment */}
                    {event.attachmentUrl && (
                      <div className="flex items-center gap-3 text-gray-300 p-2 rounded-lg bg-gray-700/20">
                        <Download className="w-4 h-4 text-blue-400 flex-shrink-0" />
                        <a 
                          href={event.attachmentUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 underline text-sm truncate transition-colors"
                        >
                          Download Event Details
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Registration Status */}
                  {isRegistered && (
                    <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-green-300">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">You're registered!</span>
                        </div>
                        <button
                          onClick={() => handleDownloadTicket(event.id)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-xs"
                        >
                          <Download className="w-3 h-3" />
                          Ticket
                        </button>
                      </div>
                    </div>
                  )}

                  {isFull && !isRegistered && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                      <div className="flex items-center gap-2 text-red-300 text-sm">
                        <XCircle className="w-4 h-4" />
                        <span>Event is full. Join waitlist if available.</span>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {/* View Details Button */}
                    <button
                      onClick={() => navigate(`/events/${event.id}`)}
                      className="flex items-center gap-2 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-all duration-200 text-sm font-medium flex-1 justify-center"
                    >
                      <Eye className="w-4 h-4" />
                      Details
                    </button>

                    {/* Creator Actions */}
                    {isCreator ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/events/${event.id}/edit`)}
                          className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
                          title="Edit Event"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/events/${event.id}/registrations`)}
                          className="p-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors"
                          title="View Registrations"
                        >
                          <Users className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(event.id)}
                          disabled={deleting === event.id}
                          className="p-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors disabled:opacity-50"
                          title="Delete Event"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      /* Participant Actions */
                      <div className="flex gap-2 flex-1">
                        {isRegistered  ? (
                          <>

                            {isRegistered != -1 ? (
                                <button
                              onClick={async () => {
                                try {
                                  const { default: eventApi } = await import('../../../api/eventApi');
                                  const formRes = await eventApi.getRegistrationStatus(event.id);
                                  
                                  
                                  setSubmissionModal({ show: true, eventId: event.id, formId: formRes.data });
                                } catch (e) {
                                  console.error('No active form or failed to load:', e);
                                  navigate('/events/registrations');
                                }
                              }}
                              className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors text-sm font-medium"
                            >
                              My Response
                            </button>
                            ) : null

                            }
                            
                            <button
                              onClick={() => handleUnregister(event.id, isRegistered)}
                              className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors text-sm font-medium"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setRegistrationModal({ show: true, eventId: event.id })}
                            disabled={
                              isFull || 
                              status.status === 'past' || 
                              registering === event.id ||
                              (event.status && event.status !== 'PUBLISHED')
                            }
                            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl transition-all duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                          >
                            {registering === event.id ? (
                              <span className="flex items-center gap-2 justify-center">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Registering...
                              </span>
                            ) : (event.status && event.status !== 'PUBLISHED') ? 'Not Available' : 'Register Now'}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-12">
          <button
            onClick={() => dispatch(fetchEvents({ page: currentPage - 1, size: limit, searchQuery, filterType }))}
            disabled={currentPage === 0}
            className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          
          <div className="flex items-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-xl font-medium shadow-lg">
            <span>Page</span>
            <span className="text-purple-300">{currentPage + 1}</span>
            <span>of</span>
            <span>{totalPages}</span>
          </div>
          
          <button
            onClick={() => dispatch(fetchEvents({ page: currentPage + 1, size: limit, searchQuery, filterType }))}
            disabled={currentPage === totalPages - 1}
            className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Modals */}
      {registrationModal.show && (
        <EventRegistrationModal
          eventId={registrationModal.eventId}
          show={registrationModal.show}
          onClose={() => setRegistrationModal({ show: false, eventId: null })}
          onRegistrationComplete={handleRegistrationComplete}
        />
      )}

      {submissionModal.show && (
        <DynamicFormSubmission
          eventId={submissionModal.eventId}
          formId={submissionModal.formId}
          existingSubmission={true}
          onSubmissionComplete={() => setSubmissionModal({ show: false, eventId: null, formId: null })}
          onClose={() => setSubmissionModal({ show: false, eventId: null, formId: null })}
        />
      )}
    </div>
  );
};

export default EnhancedEventList;