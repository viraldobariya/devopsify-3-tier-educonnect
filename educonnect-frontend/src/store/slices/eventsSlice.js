import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import eventApi from '../../api/eventApi';

// Async thunks for API calls
export const fetchEvents = createAsyncThunk(
  'events/fetchEvents',
  async ({ page = 0, size = 20, sortBy = 'startDate', sortDirection = 'desc', searchQuery = '', filterType = 'Upcoming', dateRange = null }, { rejectWithValue }) => {
    try {
      let response;
      
      if (dateRange && dateRange.startDate && dateRange.endDate) {
        response = await eventApi.getEventsByDateRange(dateRange.startDate, dateRange.endDate);
      } else if (searchQuery) {
        response = await eventApi.searchEvents(searchQuery, page, size);
      } else {
        switch (filterType) {
          case 'all':
            response = await eventApi.getAllEvents();
            break;
          case 'past':
            response = await eventApi.getPastEvents();
            break;
          case 'popular':
            response = await eventApi.getPopularEvents();
            break;
          case 'my-created':
            response = await eventApi.getMyCreatedEvents();
            break;
          default:
            response = await eventApi.getUpcomingEvents(page, size, sortBy, sortDirection);
        }
      }
      
      return {
        events: response.data.content || response.data,
        totalPages: response.data.totalPages || 1,
        totalElements: response.data.totalElements || response.data.length,
        currentPage: page,
        filterType,
        searchQuery,
        dateRange
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch events');
    }
  }
);

export const fetchEventById = createAsyncThunk(
  'events/fetchEventById',
  async (eventId, { rejectWithValue }) => {
    try {
      const response = await eventApi.getEventById(eventId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch event');
    }
  }
);

export const createEvent = createAsyncThunk(
  'events/createEvent',
  async ({ eventData, bannerFile }, { rejectWithValue }) => {
    try {
      const response = await eventApi.createEvent(eventData, bannerFile);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create event');
    }
  }
);

export const updateEvent = createAsyncThunk(
  'events/updateEvent',
  async ({ id, eventData, bannerFile }, { rejectWithValue }) => {
    try {
      const response = await eventApi.updateEvent(id, eventData, bannerFile);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update event');
    }
  }
);

export const deleteEvent = createAsyncThunk(
  'events/deleteEvent',
  async (eventId, { rejectWithValue }) => {
    try {
      await eventApi.deleteEvent(eventId);
      return eventId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete event');
    }
  }
);

export const fetchMyRegistrations = createAsyncThunk(
  'events/fetchMyRegistrations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await eventApi.getMyRegistrations();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch registrations');
    }
  }
);

export const registerForEvent = createAsyncThunk(
  'events/registerForEvent',
  async (eventId, { rejectWithValue }) => {
    try {
      const response = await eventApi.registerForEvent(eventId);
      return { eventId, registration: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to register for event');
    }
  }
);

export const unregisterFromEvent = createAsyncThunk(
  'events/unregisterFromEvent',
  async ({ eventId, formId }, { rejectWithValue }) => {
    try {
      await eventApi.deleteFormFromSubmission(eventId, formId);
      return eventId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to unregister from event');
    }
  }
);

export const fetchAvailableSpots = createAsyncThunk(
  'events/fetchAvailableSpots',
  async (eventIds, { rejectWithValue }) => {
    try {
      const spotsPromises = eventIds.map(async (eventId) => {
        try {
          const response = await eventApi.getAvailableSpots(eventId);
          return { eventId, availableSpots: response.data };
        } catch (error) {
          return { eventId, availableSpots: null };
        }
      });
      
      const results = await Promise.all(spotsPromises);
      const spotsMap = {};
      results.forEach(({ eventId, availableSpots }) => {
        spotsMap[eventId] = availableSpots;
      });
      
      return spotsMap;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch available spots');
    }
  }
);

const initialState = {
  events: [],
  totalPages: 0,
  totalElements: 0,
  currentPage: 0,
  currentEvent: null,
  
  // User registrations
  myRegistrations: [],
  
  // Available spots for events
  availableSpots: {},
  
  // Registration status for events
  registrationStatus: {},
  
  // Search and filters
  searchQuery: '',
  filterType: 'upcoming', 
  sortBy: 'startDate',
  sortDirection: 'desc',
  
  // Loading states
  loading: false,
  eventsLoading: false,
  registrationsLoading: false,
  
  // Error states
  error: null,
  registrationError: null,
  
  // Success messages
  successMessage: null
};

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setFilterType: (state, action) => {
      state.filterType = action.payload;
    },
    setSortOptions: (state, action) => {
      state.sortBy = action.payload.sortBy;
      state.sortDirection = action.payload.sortDirection;
    },
    clearError: (state) => {
      state.error = null;
      state.registrationError = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    setCurrentEvent: (state, action) => {
      state.currentEvent = action.payload;
    },
    clearCurrentEvent: (state) => {
      state.currentEvent = null;
    },
    updateAvailableSpots: (state, action) => {
      const { eventId, change } = action.payload;
      if (state.availableSpots[eventId] !== null && state.availableSpots[eventId] !== undefined) {
        state.availableSpots[eventId] = Math.max(0, state.availableSpots[eventId] + change);
      }
    },
    setAvailableSpots: (state, action) => {
      state.availableSpots = { ...state.availableSpots, ...action.payload };
    },
    resetEventsState: () => initialState
  },
  extraReducers: (builder) => {
    builder
      // Fetch Events
      .addCase(fetchEvents.pending, (state) => {
        state.eventsLoading = true;
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.eventsLoading = false;
        state.events = action.payload.events;
        state.totalPages = action.payload.totalPages;
        state.totalElements = action.payload.totalElements;
        state.currentPage = action.payload.currentPage;
        state.filterType = action.payload.filterType;
        state.searchQuery = action.payload.searchQuery;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.eventsLoading = false;
        state.error = action.payload;
      })
      
      // Fetch Event by ID
      .addCase(fetchEventById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEventById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentEvent = action.payload;
      })
      .addCase(fetchEventById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create Event
      .addCase(createEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.events.unshift(action.payload);
        state.successMessage = 'Event created successfully';
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Event
      .addCase(updateEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.events.findIndex(event => event.id === action.payload.id);
        if (index !== -1) {
          state.events[index] = action.payload;
        }
        if (state.currentEvent?.id === action.payload.id) {
          state.currentEvent = action.payload;
        }
        state.successMessage = 'Event updated successfully';
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete Event
      .addCase(deleteEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.events = state.events.filter(event => event.id !== action.payload);
        if (state.currentEvent?.id === action.payload) {
          state.currentEvent = null;
        }
        state.successMessage = 'Event deleted successfully';
      })
      .addCase(deleteEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch My Registrations
      .addCase(fetchMyRegistrations.pending, (state) => {
        state.registrationsLoading = true;
        state.registrationError = null;
      })
      .addCase(fetchMyRegistrations.fulfilled, (state, action) => {
        state.registrationsLoading = false;
        state.myRegistrations = action.payload;
      })
      .addCase(fetchMyRegistrations.rejected, (state, action) => {
        state.registrationsLoading = false;
        state.registrationError = action.payload;
      })
      
      // Register for Event
      .addCase(registerForEvent.pending, (state) => {
        state.loading = true;
        state.registrationError = null;
      })
      .addCase(registerForEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = 'Successfully registered for event';
        // Update the event's registration count if it's in the current list
        const eventIndex = state.events.findIndex(event => event.id === action.payload.eventId);
        if (eventIndex !== -1) {
          state.events[eventIndex].isRegistered = true;
          if (typeof state.events[eventIndex].currentRegistrations === 'number') {
            state.events[eventIndex].currentRegistrations += 1;
          }
        }
        if (state.currentEvent && state.currentEvent.id === action.payload.eventId) {
          state.currentEvent.isRegistered = true;
          if (typeof state.currentEvent.currentRegistrations === 'number') {
            state.currentEvent.currentRegistrations += 1;
          }
        }
        // Update available spots (decrease by 1)
        if (state.availableSpots[action.payload.eventId] !== null && state.availableSpots[action.payload.eventId] !== undefined) {
          state.availableSpots[action.payload.eventId] = Math.max(0, state.availableSpots[action.payload.eventId] - 1);
        }
      })
      .addCase(registerForEvent.rejected, (state, action) => {
        state.loading = false;
        state.registrationError = action.payload;
      })
      
      // Unregister from Event
      .addCase(unregisterFromEvent.pending, (state) => {
        state.loading = true;
        state.registrationError = null;
      })
      .addCase(unregisterFromEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = 'Successfully unregistered from event';
        // Update the event's registration status
        const eventIndex = state.events.findIndex(event => event.id === action.payload);
        if (eventIndex !== -1) {
          state.events[eventIndex].isRegistered = false;
          if (typeof state.events[eventIndex].currentRegistrations === 'number' && state.events[eventIndex].currentRegistrations > 0) {
            state.events[eventIndex].currentRegistrations -= 1;
          }
        }
        if (state.currentEvent && state.currentEvent.id === action.payload) {
          state.currentEvent.isRegistered = false;
          if (typeof state.currentEvent.currentRegistrations === 'number' && state.currentEvent.currentRegistrations > 0) {
            state.currentEvent.currentRegistrations -= 1;
          }
        }
        // Remove from registrations list
        state.myRegistrations = state.myRegistrations.filter(
          reg => reg.event.id !== action.payload
        );
        // Update available spots (increase by 1)
        if (state.availableSpots[action.payload] !== null && state.availableSpots[action.payload] !== undefined) {
          state.availableSpots[action.payload] = state.availableSpots[action.payload] + 1;
        }
      })
      .addCase(unregisterFromEvent.rejected, (state, action) => {
        state.loading = false;
        state.registrationError = action.payload;
      })
      
      // Fetch Available Spots
      .addCase(fetchAvailableSpots.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAvailableSpots.fulfilled, (state, action) => {
        state.loading = false;
        state.availableSpots = { ...state.availableSpots, ...action.payload };
      })
      .addCase(fetchAvailableSpots.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const {
  setSearchQuery,
  setFilterType,
  setSortOptions,
  clearError,
  clearSuccessMessage,
  setCurrentEvent,
  clearCurrentEvent,
  updateAvailableSpots,
  setAvailableSpots,
  resetEventsState
} = eventsSlice.actions;

export default eventsSlice.reducer;