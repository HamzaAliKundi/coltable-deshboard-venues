import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "./apis/auth";
import { profileApi } from "./apis/profile";
import { venuesApi } from "./apis/venues";
import { eventsApi } from "./apis/events";
import { reviewsApi } from "./apis/reviews";

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [profileApi.reducerPath]: profileApi.reducer,
    [venuesApi.reducerPath]: venuesApi.reducer,
    [eventsApi.reducerPath]: eventsApi.reducer,
    [reviewsApi.reducerPath]: reviewsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      profileApi.middleware,
      venuesApi.middleware,
      eventsApi.middleware,
      reviewsApi.middleware
    ),
});
