import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "./apis/auth";
import { profileApi } from "./apis/profile";
import { venuesApi } from "./apis/venues";
import { eventsApi } from "./apis/events";

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [profileApi.reducerPath]: profileApi.reducer,
    [venuesApi.reducerPath]: venuesApi.reducer,
    [eventsApi.reducerPath]: eventsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      profileApi.middleware,
      venuesApi.middleware,
      eventsApi.middleware
    ),
});
