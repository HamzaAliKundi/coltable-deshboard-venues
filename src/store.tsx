import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "./apis/auth";
import { profileApi } from "./apis/profile";
import { venuesApi } from "./apis/venues";
import { eventsApi } from "./apis/events";
import { reviewsApi } from "./apis/reviews";
import { performerApi } from "./apis/performer";
import { messagesApi } from "./apis/messages";
import { mediaApi } from "./apis/media";

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [profileApi.reducerPath]: profileApi.reducer,
    [venuesApi.reducerPath]: venuesApi.reducer,
    [eventsApi.reducerPath]: eventsApi.reducer,
    [reviewsApi.reducerPath]: reviewsApi.reducer,
    [performerApi.reducerPath]: performerApi.reducer,
    [messagesApi.reducerPath]: messagesApi.reducer,
    [mediaApi.reducerPath]: mediaApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      profileApi.middleware,
      venuesApi.middleware,
      eventsApi.middleware,
      reviewsApi.middleware,
      performerApi.middleware,
      messagesApi.middleware,
      mediaApi.middleware
    ),
});
