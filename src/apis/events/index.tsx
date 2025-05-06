import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const eventsApi = createApi({
  reducerPath: "eventsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  endpoints: (builder) => ({
    addEventByVenue: builder.mutation({
      query: (eventData: any) => ({
        url: "/api/venue/event/add-event",
        method: "POST",
        body: eventData,
      }),
    }),

    updateEventByVenue: builder.mutation({
      query: ({ eventData, id }) => ({
        url: `/api/venue/event/update-event/${id}`,
        method: "PATCH",
        body: eventData,
      }),
    }),

    getAllEventsByVenues: builder.query({
      query: ({ page, limit, status }) =>
        `/api/venue/event/get-all-events?limit=${limit}&page=${page}&status=${status}&sort=-1`,
    }),

    getEventsByVenuesById: builder.query({
      query: (id) => `/api/venue/event/get-single-event/${id}`,
    }),

    deleteEventByVenue: builder.mutation({
      query: (id) => ({
        url: `/api/venue/event/delete-event/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useAddEventByVenueMutation,
  useGetAllEventsByVenuesQuery,
  useGetEventsByVenuesByIdQuery,
  useDeleteEventByVenueMutation,
  useUpdateEventByVenueMutation,
} = eventsApi;
