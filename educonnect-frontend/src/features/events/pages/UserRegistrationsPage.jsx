import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  MapPin, 
  Download, 
  Edit, 
  Trash2, 
  FileText, 
  Clock, 
  User,
  Ticket,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  XCircle,
  Star,
  Shield,
  CalendarDays,
  ArrowLeft
} from 'lucide-react';
import eventApi from '../../../api/eventApi';
import DynamicFormSubmission from '../components/DynamicFormSubmission';

const UserRegistrationsPage = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingRegistration, setEditingRegistration] = useState(null);
  const [showFormEdit, setShowFormEdit] = useState(false);
  const [downloadingTicket, setDownloadingTicket] = useState(null);
  const [unregistering, setUnregistering] = useState(null);

  useEffect(() => {
    loadRegistrations();
  }, []);

  const loadRegistrations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await eventApi.getMyRegistrations();
      setRegistrations(response.data);
    } catch (error) {
      console.error('Error loading registrations:', error);
      setError('Failed to load your registrations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUnregister = async (eventId, registrationId) => {
    if (!window.confirm(`Are you sure you want to unregister from this event? This action cannot be undone.`)) {
      return;
    }

    
    const fid = await eventApi.getRegistrationStatus(eventId);
    console.log(fid.data + "$$$$$$$########################");
    

    if(fid.data == -1){
      try{
        setUnregistering(registrationId);
        await eventApi.unregisterFromEvent(eventId);
        loadRegistrations();
        return;
      }catch(error){
        console.error('Error unregistering from event:', error);
        setError(error.response?.data?.message || 'Failed to unregister from event');
        return;
      }finally{
        setUnregistering(null);
      }
    }

    try {
      setUnregistering(registrationId);
      
      console.log(`Unregistering from event ${eventId} with registration ID ${registrationId}`);
      await eventApi.deleteFormFromSubmission(eventId,fid.data);
      loadRegistrations();
    } catch (error) {
      console.error('Error unregistering:', error);
      alert('Failed to unregister from event. Please try again.');
    } finally {
        
    }
  };

  const handleDownloadTicket = async (registrationId) => {
    try {
      setDownloadingTicket(registrationId);
      const response = await eventApi.downloadPdf(registrationId);
      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ticket-${registrationId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading ticket:', error);
      alert('Failed to download ticket. Please try again.');
    } finally {
      setDownloadingTicket(null);
    }
  };

  const handleEditRegistration = async (registration) => {
    try {
      const formResponse = await eventApi.getActiveForm(registration.event.id);
      if (formResponse.data) {
        setEditingRegistration(registration);
        setShowFormEdit(true);
      } else {
        alert('This event does not have an editable registration form');
      }
    } catch (error) {
      console.error('Error checking form:', error);
      alert('Cannot edit registration - form is no longer available');
    }
  };

  const handleFormUpdateComplete = () => {
    setShowFormEdit(false);
    setEditingRegistration(null);
    loadRegistrations();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
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

  const getEventStatus = (event) => {
    if (!event || !event.startDate) {
      return { status: 'unknown', color: 'text-gray-400', label: 'Unknown', bgColor: 'bg-gray-500/20', icon: <AlertCircle className="w-3 h-3" /> };
    }

    try {
      const now = new Date();
      const startDate = new Date(event.startDate);
      const endDate = event.endDate ? new Date(event.endDate) : startDate;

      if (endDate < now) {
        return { status: 'completed', color: 'text-gray-400', label: 'Completed', bgColor: 'bg-gray-500/20', icon: <CheckCircle className="w-3 h-3" /> };
      } else if (startDate <= now && endDate >= now) {
        return { status: 'ongoing', color: 'text-green-400', label: 'Live Now', bgColor: 'bg-green-500/20', icon: <Clock className="w-3 h-3" /> };
      } else {
        const daysUntil = Math.ceil((startDate - now) / (1000 * 60 * 60 * 24));
        if (daysUntil <= 7) {
          return { status: 'soon', color: 'text-orange-400', label: `In ${daysUntil} days`, bgColor: 'bg-orange-500/20', icon: <Star className="w-3 h-3" /> };
        } else {
          return { status: 'upcoming', color: 'text-blue-400', label: 'Upcoming', bgColor: 'bg-blue-500/20', icon: <CalendarDays className="w-3 h-3" /> };
        }
      }
    } catch (error) {
      return { status: 'unknown', color: 'text-gray-400', label: 'Unknown', bgColor: 'bg-gray-500/20', icon: <AlertCircle className="w-3 h-3" /> };
    }
  };

  // Loading Skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-64 mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-96 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-800/50 rounded-2xl overflow-hidden shadow-lg border border-gray-700/30">
                  <div className="h-40 bg-gray-700"></div>
                  <div className="p-6">
                    <div className="flex justify-between mb-4">
                      <div className="h-6 bg-gray-700 rounded w-3/4"></div>
                      <div className="h-6 bg-gray-700 rounded w-16"></div>
                    </div>
                    <div className="space-y-3 mb-4">
                      <div className="h-4 bg-gray-700 rounded"></div>
                      <div className="h-4 bg-gray-700 rounded w-5/6"></div>
                      <div className="h-4 bg-gray-700 rounded w-4/6"></div>
                    </div>
                    <div className="h-10 bg-gray-700 rounded mb-2"></div>
                    <div className="flex gap-2">
                      <div className="h-10 bg-gray-700 rounded flex-1"></div>
                      <div className="h-10 bg-gray-700 rounded flex-1"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center py-8">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 backdrop-blur-sm">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Unable to Load Registrations</h3>
            <p className="text-gray-400 mb-6">{error}</p>
            <button
              onClick={loadRegistrations}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl hover:from-red-700 hover:to-orange-700 transition-all shadow-lg"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => window.location.href = '/events'}
            className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white bg-gray-800/50 hover:bg-gray-700/50 rounded-xl transition-all border border-gray-700/30 hover:border-gray-600/50"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Events
          </button>
        </div>

        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 bg-gray-800/50 backdrop-blur-sm rounded-2xl px-6 py-3 border border-gray-700/30 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
              <Ticket className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                My Event Registrations
              </h1>
              <p className="text-gray-400">Manage your event tickets and registration details</p>
            </div>
          </div>
          <br/>
          
          {registrations.length > 0 && (
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 inline-flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{registrations.length}</div>
                <div className="text-gray-400 text-sm">Total Events</div>
              </div>
              <div className="h-8 w-px bg-gray-700/50"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {registrations.filter(r => getEventStatus(r).status === 'upcoming' || getEventStatus(r).status === 'soon').length}
                </div>
                <div className="text-gray-400 text-sm">Upcoming</div>
              </div>
              <div className="h-8 w-px bg-gray-700/50"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {registrations.filter(r => getEventStatus(r).status === 'ongoing').length}
                </div>
                <div className="text-gray-400 text-sm">Live Now</div>
              </div>
            </div>
          )}
        </div>

        {registrations.length === 0 ? (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-12 text-center border border-gray-700/30 max-w-2xl mx-auto">
            <div className="w-24 h-24 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Ticket className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">No Registrations Yet</h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              You haven't registered for any events yet. Explore exciting events and secure your spot!
            </p>
            <button
              onClick={() => window.location.href = '/events'}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl font-medium flex items-center gap-2 mx-auto"
            >
              Browse Events
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {registrations.map((registration) => {
              const eventStatus = getEventStatus(registration);
              
              return (
                <div 
                  key={registration.id} 
                  className="bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-700/30 hover:border-gray-600/50 group"
                >
                  {/* Event Banner with Gradient Overlay */}
                  <div className="relative h-40 overflow-hidden">
                    {registration.bannerUrl ? (
                      <>
                        <img
                          src={registration.bannerUrl}
                          alt={registration.eventTitle}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent"></div>
                      </>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center">
                        <Calendar className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className={`absolute top-4 right-4 flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${eventStatus.bgColor} ${eventStatus.color} backdrop-blur-sm`}>
                      {eventStatus.icon}
                      <span>{eventStatus.label}</span>
                    </div>

                    {/* Event Title Overlay */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-lg font-bold text-white line-clamp-2 drop-shadow-lg">
                        {registration.eventTitle}
                      </h3>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    {/* Event Details */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-3 text-gray-300 p-2 rounded-lg bg-gray-700/20">
                        <Calendar className="w-4 h-4 text-purple-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{formatDate(registration.startDate)}</div>
                          {registration.endDate && registration.endDate !== registration.startDate && (
                            <div className="text-xs text-gray-400">Ends: {formatDate(registration.endDate)}</div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 text-gray-300 p-2 rounded-lg bg-gray-700/20">
                        <MapPin className="w-4 h-4 text-purple-400 flex-shrink-0" />
                        <span className="text-sm truncate">{registration.location || 'Location TBD'}</span>
                      </div>
                      
                      <div className="flex items-center gap-3 text-gray-300 p-2 rounded-lg bg-gray-700/20">
                        <Clock className="w-4 h-4 text-purple-400 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="text-sm">Registered on</div>
                          <div className="text-xs text-gray-400">{formatDate(registration.registrationDate)}</div>
                        </div>
                      </div>
                    </div>

                    {/* Registration Type Badge */}
                    {registration.hasFormSubmission && (
                      <div className="flex items-center gap-2 text-blue-300 text-sm mb-4 p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                        <FileText className="w-4 h-4" />
                        <span>Form-based Registration</span>
                        <Shield className="w-3 h-3 ml-auto" />
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      <button
                        onClick={() => handleDownloadTicket(registration.id)}
                        disabled={downloadingTicket === registration.id}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                      >
                        {downloadingTicket === registration.id ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Downloading...
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4" />
                            Download Ticket
                          </>
                        )}
                      </button>
                      
                      <div className="flex gap-2">
                        {registration.hasFormSubmission && (
                          <button
                            onClick={() => handleEditRegistration(registration)}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors text-sm font-medium"
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </button>
                        )}
                        
                        {(eventStatus.status === 'upcoming' || eventStatus.status === 'soon') && (
                          <button
                            onClick={() => handleUnregister(registration.eventId, registration.id)}
                            disabled={unregistering === registration.id}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors text-sm font-medium disabled:opacity-50"
                          >
                            {unregistering === registration.id ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                            {unregistering === registration.id ? 'Leaving...' : 'Unregister'}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Past Event Notice */}
                    {eventStatus.status === 'completed' && (
                      <div className="mt-3 p-2 bg-gray-700/30 rounded-lg border border-gray-600/30">
                        <div className="flex items-center gap-2 text-gray-400 text-xs">
                          <CheckCircle className="w-3 h-3" />
                          <span>This event has ended</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Form Edit Modal */}
      {showFormEdit && editingRegistration && (
        <DynamicFormSubmission
          eventId={editingRegistration.event.id}
          formId={editingRegistration.formId}
          existingSubmission={true}
          onSubmissionComplete={handleFormUpdateComplete}
          onClose={() => {
            setShowFormEdit(false);
            setEditingRegistration(null);
          }}
        />
      )}
    </div>
  );
};

export default UserRegistrationsPage;