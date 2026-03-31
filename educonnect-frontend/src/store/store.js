import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import notificationsReducer from './slices/notificationsSlice';
import connectionReducer from './slices/connectionSlice';
import eventsReducer from './slices/eventsSlice';
import formBuilderReducer from './slices/formBuilderSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    connection: connectionReducer,
    notifications: notificationsReducer,
    events: eventsReducer,
    formBuilder: formBuilderReducer,
  },
});

export default store;