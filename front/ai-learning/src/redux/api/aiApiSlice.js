import { apiSlice } from "./apiSlice";

export const aiApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getChatHistory: builder.query({
      query: (docId) => `/api/ai/history/${docId}`,
      providesTags: (result, error, docId) => [{ type: "Chat", id: docId }],
    }),
    askQuestion: builder.mutation({
      query: ({ docId, message }) => ({
        url: `/api/ai/chat/${docId}`,
        method: "POST",
        body: { message },
      }),
      // Invalidates the specific chat history
      invalidatesTags: (result, error, { docId }) => [
        { type: "Chat", id: docId },
      ],
    }),
    clearChatHistory: builder.mutation({
      query: (docId) => ({
        url: `/api/ai/history/${docId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, docId) => [{ type: "Chat", id: docId }],
    }),
  }),
});

export const {
  useGetChatHistoryQuery,
  useAskQuestionMutation,
  useClearChatHistoryMutation,
} = aiApiSlice;
