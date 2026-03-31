import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  FileText,
  AlertCircle,
  Download,
  Trash2,
  X,
  Edit3,
} from 'lucide-react';
import eventApi from '../../../api/eventApi';
import DynamicFormSubmission from './DynamicFormSubmission';
const EventRegistrationModal = ({
  eventId,
  show,
  onClose,
  onRegistrationComplete,
}) => {
  const dispatch = useDispatch();
  const [event, setEvent] = useState(null);
  const [activeForm, setActiveForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState(null);
  const [registrationStatus, setRegistrationStatus] = useState(null);
  const [showFormSubmission, setShowFormSubmission] = useState(false);
  const [selectedFormId, setSelectedFormId] = useState(null);
  const [availableSpots, setAvailableSpots] = useState(null);
  const [showUnregisterModal, setShowUnregisterModal] = useState(false);
  const [unregistering, setUnregistering] = useState(false);

  useEffect(() => {
    if (show && eventId) {
      loadEventData();
    }
  }, [show, eventId]);

  const loadEventData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load event details
      const eventResponse = await eventApi.getEventById(eventId);
      setEvent(eventResponse.data);

        try {
          const spotsResponse = await eventApi.getAvailableSpots(eventId);
          setAvailableSpots(spotsResponse.data);
        } catch (spotsError) {
          setAvailableSpots(null);
        }

      try {
        const statusResponse = await eventApi.getRegistrationStatus(eventId);
        setRegistrationStatus(statusResponse.data);
      } catch (e) {
        setRegistrationStatus(null);
      }

      // Check for active form
      try {
        const formResponse = await eventApi.getActiveForm(eventId);
        setActiveForm(formResponse);
      } catch (formError) {
        setActiveForm(null);
      }
    } catch (error) {
      console.error('Error loading event data:', error);
      setError('Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const handleSimpleRegistration = async () => {
    try {
      setRegistering(true);
      setError(null);


      const response = await eventApi.registerForEvent(eventId);

      // Try to download ticket
      // try {
      //   const pdfResponse = await eventApi.downloadPdf(response.data.id);
        
      //   // Since backend returns byte[] and API uses responseType: 'blob', 
      //   // response.data will be a Blob object
      //   const blob = pdfResponse.data;
        
      //   const url = window.URL.createObjectURL(blob);
        
      //   // Create a temporary download link
      //   const link = document.createElement('a');
      //   link.href = url;
      //   link.download = `ticket-${response.data.id}.pdf`;
      //   document.body.appendChild(link);
      //   link.click();
        
      //   // Clean up
      //   document.body.removeChild(link);
      //   window.URL.revokeObjectURL(url);
        
      // } catch (pdfError) {
      //   console.error('Error downloading ticket:', pdfError);
      // }

      onRegistrationComplete(response.data);
      onClose();
    } catch (error) {
      console.error('Error registering for event:', error);
      setError(error.response?.data?.message || 'Failed to register for event');
    } finally {
      setRegistering(false);
    }
  };

  const handleFormRegistration = (formId) => {
    setSelectedFormId(formId);
    setShowFormSubmission(true);
  };

  const handleFormSubmissionComplete = submissionData => {
    setShowFormSubmission(false);
    onRegistrationComplete(submissionData);
    onClose();
  };

  const handleDownloadTicket = async () => {
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
      setError('Failed to download ticket');
    }
  };

  const handleUnregister = async (formId) => {
    if (!window.confirm('Are you sure you want to unregister from this event?')) {
      return;
    }
    
    if(formId == -1){
      try{
        await eventApi.unregisterFromEvent(eventId);
        
        return;
      }catch(error){
        console.error('Error unregistering from event:', error);
        setError(error.response?.data?.message || 'Failed to unregister from event');
        return;
      }
    }

    try {
      setUnregistering(true);
      setError(null);

      await eventApi.deleteFormFromSubmission(eventId, formId);
      
      // Reload event data to show registration form again
      await loadEventData();
      
      // Notify parent component about unregistration
      onRegistrationComplete(null);
    } catch (error) {
      console.error('Error unregistering from event:', error);
      setError(error.response?.data?.message || 'Failed to unregister from event');
    } finally {
      setUnregistering(false);
    }
  };

  const formatDate = dateString => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const hasCapacityLimit = () => {
    return (
      event &&
      typeof event.maxParticipants === 'number' &&
      event.maxParticipants > 0
    );
  };

  if (!show) return null;
  
  if (showFormSubmission && selectedFormId) {
    return (
      <DynamicFormSubmission
        eventId={eventId}
        formId={selectedFormId}
        existingSubmission={registrationStatus}
        onSubmissionComplete={handleFormSubmissionComplete}
        onClose={() => {
          setShowFormSubmission(false);
          setSelectedFormId(null);
        }}
      />
    );
  }  

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center">
        <div className="bg-gray-800 rounded-xl p-8 border border-gray-600 shadow-2xl">
          <div className="text-white text-lg">Loading event details...</div>
        </div>
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center">
        <div className="bg-gray-800 rounded-xl p-8 max-w-md border border-gray-600">
          <div className="text-red-400 mb-6 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-3" />
            <div className="text-lg font-medium">{error}</div>
          </div>
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const isEventFull = hasCapacityLimit() ? availableSpots <= 0 : false;
  const isEventPast = new Date(event?.endDate) < new Date();
  const isAlreadyRegistered = registrationStatus;
  const canRegister = !isEventFull && !isEventPast && !isAlreadyRegistered;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
      <div className="bg-gray-800 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-gray-600 shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-8 border-b border-gray-600">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-white mb-2">
              {event?.title}
            </h2>
            <div className="text-gray-400 text-lg">Event Registration</div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-3 hover:bg-gray-700 rounded-xl transition-colors duration-200 flex-shrink-0"
          >
            <X className="w-7 h-7" />
          </button>
        </div>

        <div className="p-8">
          {/* Event Details */}
          <div className="bg-gray-750 rounded-xl p-8 mb-8 border border-gray-600">
            <h3 className="text-xl font-semibold text-white mb-6 pb-4 border-b border-gray-600">
              Event Details
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="flex items-start gap-4 text-gray-300 bg-gray-700 p-4 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-sm text-gray-400 font-medium mb-1">Start Date</div>
                  <div className="text-white text-lg font-medium">{formatDate(event?.startDate)}</div>
                </div>
              </div>

              <div className="flex items-start gap-4 text-gray-300 bg-gray-700 p-4 rounded-lg">
                <Clock className="w-6 h-6 text-purple-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-sm text-gray-400 font-medium mb-1">End Date</div>
                  <div className="text-white text-lg font-medium">{formatDate(event?.endDate)}</div>
                </div>
              </div>

              <div className="flex items-start gap-4 text-gray-300 bg-gray-700 p-4 rounded-lg">
                <MapPin className="w-6 h-6 text-purple-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-sm text-gray-400 font-medium mb-1">Location</div>
                  <div className="text-white text-lg font-medium">{event?.location}</div>
                </div>
              </div>

              <div className="flex items-start gap-4 text-gray-300 bg-gray-700 p-4 rounded-lg">
                <Users className="w-6 h-6 text-purple-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-sm text-gray-400 font-medium mb-1">Available Spots</div>
                  {hasCapacityLimit() ? (
                    <div
                      className={
                        availableSpots <= 5 && availableSpots > 0
                          ? 'text-yellow-400 font-bold text-lg'
                          : isEventFull
                            ? 'text-red-400 font-bold text-lg'
                            : 'text-green-400 font-bold text-lg'
                      }
                    >
                      {Math.max(0, availableSpots)} / {event?.maxParticipants}
                    </div>
                  ) : (
                    <div className="text-green-400 font-bold text-lg">Unlimited spots</div>
                  )}
                </div>
              </div>
            </div>

            <div className="text-gray-300 mt-6 pt-6 border-t border-gray-600">
              <div className="text-sm text-gray-400 font-medium mb-3">Description</div>
              <p className="text-white leading-relaxed text-lg">{event?.description}</p>
            </div>
          </div>

          {/* Registration Status */}
          {isAlreadyRegistered != -1 && isAlreadyRegistered && (
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/40 rounded-xl p-6 mb-8">
              <div className="flex items-center gap-4 text-green-300 mb-4">
                <div className="bg-green-500/20 p-3 rounded-lg">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <span className="font-bold text-lg">You are already registered!</span>
                  <div className="text-green-200 text-sm mt-1">Your spot is confirmed for this event</div>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleDownloadTicket}
                  className="flex-1 py-3 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition-all duration-200 flex items-center justify-center gap-3 font-medium shadow-lg hover:shadow-xl"
                >
                  <Download className="w-4 h-4" />
                  Download Ticket
                </button>
                <button
                  onClick={() => handleUnregister(registrationStatus)}
                  disabled={unregistering}
                  className="py-3 px-6 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all duration-200 flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {unregistering ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Unregistering...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Unregister
                    </>
                  )}
                </button>
                <button
                  onClick={onClose}
                  className="py-3 px-6 bg-gray-600 hover:bg-gray-700 text-white rounded-xl transition-all duration-200 flex items-center justify-center gap-2 font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {isEventFull && !isAlreadyRegistered && (
            <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/40 rounded-xl p-6 mb-8">
              <div className="flex items-center gap-4 text-red-300">
                <div className="bg-red-500/20 p-3 rounded-lg">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <span className="font-bold text-lg">This event is full</span>
                  <div className="text-red-200 text-sm mt-1">No available spots remaining</div>
                </div>
              </div>
            </div>
          )}

          {isEventPast && (
            <div className="bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/40 rounded-xl p-6 mb-8">
              <div className="flex items-center gap-4 text-yellow-300">
                <div className="bg-yellow-500/20 p-3 rounded-lg">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <span className="font-bold text-lg">This event has already ended</span>
                  <div className="text-yellow-200 text-sm mt-1">Registration is no longer available</div>
                </div>
              </div>
            </div>
          )}

          {/* Form Information */}
          {activeForm && activeForm.data && canRegister && (
            <div className="space-y-6">
              {activeForm.data.map((form, index) => (
                <div key={index} className="bg-gradient-to-r from-purple-500/15 to-indigo-500/15 border border-purple-500/40 rounded-xl p-6 mb-6">
                  <div className="flex items-center gap-4 text-purple-300 mb-4">
                    <div className="bg-purple-500/20 p-3 rounded-lg">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="font-bold text-lg">Registration Form Required</span>
                      <div className="text-purple-200 text-sm mt-1">Complete the form to secure your spot</div>
                    </div>
                  </div>
                  
                  <div className="text-gray-200 text-base mb-6 bg-gray-700/50 p-4 rounded-lg">
                    <div className="mb-3">
                      This event requires you to fill out a registration form:
                    </div>
                    <div className="bg-gray-600/50 p-4 rounded-lg border-l-4 border-purple-500">
                      <div className="text-white font-bold text-lg mb-2">"{form.title}"</div>
                      {form.deadline && (
                        <div className="flex items-center gap-2 text-purple-200 text-sm">
                          <Clock className="w-4 h-4" />
                          Form deadline: {new Date(form.deadline).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    {form.formLimitEnabled ?(
                      <div className="text-red-400 font-medium">
                        This form has reached its submission limit and is no longer accepting new registrations.
                      </div>
                    ) : (
                      <button
                        onClick={() => handleFormRegistration(form.id)}
                        className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl transition-all duration-200 flex items-center justify-center gap-3 font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        <FileText className="w-5 h-5" />
                        Start Registration Form
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/40 rounded-xl p-6 mb-8">
              <div className="flex items-center gap-4 text-red-300">
                <div className="bg-red-500/20 p-3 rounded-lg">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div className="font-medium">{error}</div>
              </div>
            </div>
          )}

          {/* Registration Buttons */}
          <div className="flex justify-end gap-4 pt-8 border-t border-gray-600">
            {isAlreadyRegistered ? (
              <>
                <button
                  onClick={onClose}
                  className="px-8 py-4 text-gray-400 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-xl transition-all duration-200 font-bold text-lg"
                >
                  Cancel / Back
                </button>
                <button
                  onClick={() => setShowUnregisterModal(isAlreadyRegistered)}
                  disabled={unregistering}
                  className="px-8 py-4 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Trash2 className="w-5 h-5" />
                  {unregistering ? 'Unregistering...' : 'Unregister'}
                </button>
                {activeForm && (
                  <button
                    onClick={() => handleFormRegistration(isAlreadyRegistered)}
                    className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl flex items-center gap-3 font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <Edit3 className="w-5 h-5" />
                    Update Registration
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  onClick={onClose}
                  className="px-8 py-4 text-gray-400 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-xl transition-all duration-200 font-bold text-lg"
                >
                  Close
                </button>
                {canRegister && !activeForm && (
                  <button
                    onClick={handleSimpleRegistration}
                    disabled={registering}
                    className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    {registering ? 'Registering...' : 'Register Now'}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Unregister Confirmation Modal */}
      {showUnregisterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-60 flex justify-center items-center p-4">
          <div className="bg-gray-800 rounded-xl p-8 max-w-md w-full border border-gray-600 shadow-2xl">
            <div className="flex items-center gap-4 text-red-400 mb-6">
              <div className="bg-red-500/20 p-3 rounded-lg">
                <AlertCircle className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold">Confirm Unregistration</h3>
            </div>
            
            <p className="text-gray-300 mb-8 leading-relaxed text-lg">
              Are you sure you want to unregister from this event? This action cannot be undone and you will lose your spot.
            </p>
            
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowUnregisterModal(null)}
                className="px-8 py-4 text-gray-400 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-xl transition-all duration-200 font-bold text-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUnregister(showUnregisterModal)}
                disabled={unregistering}
                className="px-8 py-4 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 font-bold text-lg transition-all duration-200"
              >
                <Trash2 className="w-5 h-5" />
                {unregistering ? 'Unregistering...' : 'Confirm Unregister'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventRegistrationModal;