import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../../src/api/apiClient';
import notificationsApi from '../../../src/api/notificationsApi';

// fetch latest notifications (paged)
export const fetchNotifications = createAsyncThunk(
  'notifications/fetch',
  async ({ page = 0, size = 50 } = {}, { rejectWithValue }) => {
    try {
      const res = await apiClient.get('/notifications', { params: { page, size } });
      console.log("notifications : ");
      console.log(res.data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  }
);

// fetch unread count
export const fetchUnreadCount = createAsyncThunk(
  'notifications/unreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const res = await notificationsApi.unreadCount();
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  }
);

export const markAllSeen = createAsyncThunk(
  'notifications/markAllSeen',
  async (_, { rejectWithValue }) => {
    try {
      const res = await notificationsApi.markAllSeen();
      console.log("notification all seen ");
      console.log(res);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  }
);

export const markSeen = createAsyncThunk(
  'notifications/markSeen',
  async (nid, {rejectWithValue}) => {
    try{
      const res = await notificationsApi.markSeen(nid);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || {message : err.message});
    }
  }
)

const initialState = {
  byId: {},
  order: [], // newest first
  unreadCount: 0,
  status: 'idle',
  lastSeenAtISO: null,
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addOrMerge(state, action) {
      const items = Array.isArray(action.payload) ? action.payload : [action.payload];
      items.forEach((n) => {
        state.byId[n.id] = { ...(state.byId[n.id] || {}), ...n };
        state.order = [n.id, ...state.order.filter((id) => id !== n.id)];
      });
      state.unreadCount = Object.values(state.byId).filter((x) => !x.seen).length;
    },
    addNotification(state, action) {
      const n = action.payload;
      state.byId[n.id] = { ...(state.byId[n.id] || {}), ...n };
      state.order = [n.id, ...state.order.filter((id) => id !== n.id)];
      state.unreadCount = Object.values(state.byId).filter((x) => !x.seen).length;
    },
    markRead(state, action) {
      const id = action.payload;
      if (state.byId[id] && !state.byId[id].seen) {
        state.byId[id].seen = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllRead(state) {
      Object.values(state.byId).forEach((n) => (n.seen = true));
      state.unreadCount = 0;
    },
    removeNotification(state, action) {
      const id = action.payload;
      delete state.byId[id];
      state.order = state.order.filter((x) => x !== id);
    },
    setLastSeen(state, action) {
      state.lastSeenAtISO = action.payload;
    },
    clear(state) {
      state.byId = {};
      state.order = [];
      state.unreadCount = 0;
      state.status = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (s) => { s.status = 'loading'; })
      .addCase(fetchNotifications.fulfilled, (s, { payload }) => {
        s.status = 'idle';
        
        // Handle the Page object structure from Spring Data
        // The content is in payload.content, not payload.items
        const notifications = payload.content || [];
        
        notifications.forEach((n) => {
          s.byId[n.id] = n;
          if (!s.order.includes(n.id)) s.order.push(n.id);
        });
        
        // Keep newest-first order
        s.order = Array.from(new Set(s.order));
        console.log('fetch notifications')
        console.log(Object.values(s.byId))
        s.unreadCount = Object.values(s.byId).filter((x) => !x.seen).length;
      })
      .addCase(fetchNotifications.rejected, (s) => { s.status = 'error'; })

      // unread count handlers
      .addCase(fetchUnreadCount.fulfilled, (s, { payload }) => {
        // backend returns number directly or in a response object
        s.unreadCount = typeof payload === 'number' ? payload : payload?.count ?? s.unreadCount;
      })
      .addCase(fetchUnreadCount.rejected, (s) => { /* ignore */ })
      .addCase(markAllSeen.fulfilled, (s) => {
        s.unreadCount = 0;
      })
      .addCase(markAllSeen.rejected, (s) => { /* ignore */ })
      .addCase(markSeen.fulfilled, (s, {payload}) => {
        let nid = payload.id;
        if (s.byId[nid] && !s.byId[nid].seen){
          s.byId[nid].seen = true;
          s.unreadCount -= 1;
        }
      });
  },
});

export const {
  addOrMerge, addNotification, markRead, markAllRead, removeNotification, setLastSeen, clear,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;