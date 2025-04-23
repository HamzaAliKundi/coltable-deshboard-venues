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
      query: (id) => `/api/user/venue/get-single-venue/${id}`,
    }),
    updateVenueProfile: builder.mutation({
      query: ({ data }: { data: any }) => ({
        url: `/api/user/venue`,
        method: "PATCH",
        body: data,
      }),
    }),
  }),
});

export const { useGetSingleVenueByIdQuery, useUpdateVenueProfileMutation } =
  venuesApi;
