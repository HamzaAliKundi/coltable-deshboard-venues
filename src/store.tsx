import { configureStore } from '@reduxjs/toolkit';
import { authApi } from './apis/auth';
import { profileApi } from './apis/profile';

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [profileApi.reducerPath]: profileApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware, profileApi.middleware),
});