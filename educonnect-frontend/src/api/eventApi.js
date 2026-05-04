import apiClient from './apiClient';
import axios from 'axios';
const BASE_URL = '/events';

const eventApi = {
  getAllEvents: async () => {
  return apiClient.get(`${BASE_URL}/`);
},


  getEventById: async (id) => {
    return apiClient.get(`${BASE_URL}/${id}`);
  },

  searchEvents: async (keyword, page = 0, size = 20) => {
    return apiClient.get(`${BASE_URL}/search`, { params: { keyWord: keyword, page, size } });
  },

  getUpcomingEvents: async (page = 0, size = 20, sortBy = 'date', sortDirection = 'desc') => {
    return apiClient.get(`${BASE_URL}/upcoming`, {
      params: { page, size, sortBy, sortDirection }
    });
  },

  getPastEvents: async () => {
    return apiClient.get(`${BASE_URL}/past`);
  },

  getEventsByDateRange: async (startDate, endDate) => {
    return apiClient.get(`${BASE_URL}/dateRange`, { params: { startDate, endDate} });
  },

  getPopularEvents: async () => {
    return apiClient.get(`${BASE_URL}/popular`);
  },

  getMyCreatedEvents: async () => {
    return apiClient.get(`${BASE_URL}/my-created`);
  },

  createEvent: async (eventData, bannerFile) => {
    const formData = new FormData();
    
    // Create event object without the banner file
    const eventForBackend = { ...eventData };
    delete eventForBackend.bannerFile; // Remove if it exists
    
    // Add event data as JSON string (for @RequestPart("Event"))
    formData.append('Event', new Blob([JSON.stringify(eventForBackend)], {
      type: 'application/json'
    }));
    
    // Add banner file (for @RequestPart("file"))
    if (bannerFile) {
      formData.append('file', bannerFile);
    }
    
    return apiClient.post(`${BASE_URL}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  updateEvent: async (id, eventData, bannerFile) => {
    const formData = new FormData();
    
    // Create event object without the banner file
    const eventForBackend = { ...eventData };
    delete eventForBackend.bannerFile; // Remove if it exists
    
    // Add event data as JSON string (for @RequestPart("Event"))
    formData.append('Event', new Blob([JSON.stringify(eventForBackend)], {
      type: 'application/json'
    }));
    
    // Add banner file (for @RequestPart("file"))
    if (bannerFile) {
      formData.append('file', bannerFile);
    }
    
    return apiClient.put(`${BASE_URL}/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  deleteEvent: async (id) => {
    return apiClient.delete(`${BASE_URL}/${id}`);
  },

  getEventRegistrationCount: async (eventId) => {
    return apiClient.get(`${BASE_URL}/registration-count/${eventId}`);
  },

  getAvailableSpots: async (eventId) => {
    return apiClient.get(`${BASE_URL}/available-spots/${eventId}`);
  },

  isEventFull: async (eventId) => {
    return apiClient.get(`${BASE_URL}/is-full/${eventId}`);
  },

  isEventActive: async (eventId) => {
    return apiClient.get(`${BASE_URL}/is-active/${eventId}`);
  },

  getRegistrationId: async (eventId) => {
    return apiClient.get(`${BASE_URL}/${eventId}/registration-id`);
  },

  getRegistrationStatus: async (eventId) => {
    return apiClient.get(`${BASE_URL}/${eventId}/registration-status`);
  },

  // Registration endpoints
  registerForEvent: async (eventId) => {
    return apiClient.post(`/register/${eventId}`);
  },

  unregisterFromEvent: async (eventId) => {
    return apiClient.delete(`${BASE_URL}/${eventId}/unregister`);
  },

  getMyRegistrations: async () => {
    return apiClient.get(`${BASE_URL}/my-registrations`);
  },

  getEventRegistrations: async (eventId) => {
    return apiClient.get(`${BASE_URL}/view/${eventId}/registrations`);
  },

  // Additional endpoints
  getTotalActiveEventsCount: async () => {
    return apiClient.get(`${BASE_URL}/total-active-count`);
  },

  getEventsByCreatorCount: async (creatorId) => {
    return apiClient.get(`${BASE_URL}/creator-count/${creatorId}`);
  },

  isUserEventCreator: async (eventId) => {
    return apiClient.get(`${BASE_URL}/is-creator/${eventId}` );
  },

  getEventCreator: async (eventId) => {
    return apiClient.get(`${BASE_URL}/creator/${eventId}`);
  },


  downloadPdf: (registrationId) => {
    return axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/pdf/download_ticket?registrationId=${registrationId}`, {
        responseType: 'blob',
        headers: {
            'Accept': 'application/pdf'
        },
        withCredentials: true
    });
  },

  // Form Management endpoints
  createForm: async (eventId, formData) => {
    return apiClient.post(`${BASE_URL}/${eventId}/forms/`, formData);
  },

  updateForm: async (eventId, formId, formData) => {
    return apiClient.put(`${BASE_URL}/${eventId}/forms/${formId}`, formData);
  },

  getActiveForm: async (eventId) => {
    return apiClient.get(`${BASE_URL}/${eventId}/forms/active`);
  },

  getAllForms: async (eventId) => {
    return apiClient.get(`${BASE_URL}/${eventId}/forms/active`);
  },

  getFormById: async (eventId, formId) => {
    return apiClient.get(`${BASE_URL}/${eventId}/forms/${formId}`);
  },

  deleteForm: async (eventId, formId) => {
    return apiClient.delete(`${BASE_URL}/${eventId}/forms/${formId}`);
  },

  // Form Submission endpoints
  submitForm: async (eventId, formId, responses) => {
    return apiClient.post(`${BASE_URL}/${eventId}/forms/${formId}/submit`, { responses });
  },

  updateFormSubmission: async (eventId, formId, responses) => {
    return apiClient.put(`${BASE_URL}/${eventId}/forms/${formId}/update`, { responses });
  },

  deleteFormFromSubmission: async (eventId, formId) => {
    return apiClient.delete(`${BASE_URL}/${eventId}/forms/${formId}/cancel`);
  },

  getFormSubmission: async (eventId, formId) => {
    return apiClient.get(`${BASE_URL}/${eventId}/forms/${formId}/registration`);
  },

  getFormResponses: async (eventId, formId) => {
    return apiClient.get(`${BASE_URL}/${eventId}/forms/${formId}/get-answers`);
  },

  // Enhanced Registration endpoints for form-based registration
  registerForEventWithForm: async (eventId, formId, responses) => {
    return apiClient.post(`${BASE_URL}/${eventId}/forms/${formId}/submit`, { responses });
  },

  // Additional utility endpoints
  // checkRegistrationEligibility: async (eventId) => {
  //   return apiClient.get(`${BASE_URL}/${eventId}/eligibility`);
  // },

  // getRegistrationStatus: async (eventId) => {
  //   return apiClient.get(`${BASE_URL}/${eventId}/registration-status`);
  // },

  // // Event analytics for creators
  // getEventAnalytics: async (eventId) => {
  //   return apiClient.get(`${BASE_URL}/${eventId}/analytics`);
  // },

  // getEventRegistrationsList: async (eventId, page = 0, size = 20) => {
  //   return apiClient.get(`${BASE_URL}/${eventId}/registrations-list`, {
  //     params: { page, size }
  //   });
  // },

  // // Search and filter enhanced
  // searchEventsAdvanced: async (params) => {
  //   return apiClient.get(`${BASE_URL}/search/advanced`, { params });
  // },

  // getEventsByStatus: async (status, page = 0, size = 20) => {
  //   return apiClient.get(`${BASE_URL}/status/${status}`, {
  //     params: { page, size }
  //   });
  // }

  // getEventsCreatedByUser: async (userId) => {
  //   return apiClient.get(`${BASE_URL}/createdBy/${userId}`);
  // }
};

export default eventApi;
