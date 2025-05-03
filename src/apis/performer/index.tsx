import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const performerApi = createApi({
  reducerPath: "performerApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getAllPerformers: builder.query({
      query: () => `/api/venue/performer/get-all-performers`,
    }),
  }),
});

export const { useGetAllPerformersQuery } = performerApi;
