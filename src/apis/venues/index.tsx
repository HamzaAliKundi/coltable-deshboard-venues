import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const venuesApi = createApi({
  reducerPath: "venuesApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getSingleVenueById: builder.query({
      query: (id) => `/auth/user/get-profile/${id}`,
    }),
    getVenueProfile: builder.query({
      query: (id) => `/auth/user/get-profile`,
    }),
    updateVenueProfile: builder.mutation({
      query: ({ data }: { data: any }) => ({
        url: `auth/user/update-profile`,
        method: "PATCH",
        body: data,
      }),
    }),
  }),
});

export const { useGetSingleVenueByIdQuery, useUpdateVenueProfileMutation, useGetVenueProfileQuery } =
  venuesApi;
