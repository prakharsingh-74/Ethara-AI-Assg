import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Force proxy for local development to bypass any browser cache or env issues
const API_URL = "/api";

const baseQuery = fetchBaseQuery({ baseUrl: API_URL });

export const apiSlice = createApi({
  baseQuery,
  tagTypes: [],
  endpoints: (builder) => ({}),
});
