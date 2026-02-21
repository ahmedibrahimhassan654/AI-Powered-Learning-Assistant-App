import { apiSlice } from "./apiSlice";

export const dashboardApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query({
      query: () => "/api/dashboard/stats",
      providesTags: ["Document", "Flashcard", "Quiz"],
    }),
  }),
});

export const { useGetDashboardStatsQuery } = dashboardApiSlice;
