import { apiSlice } from "./apiSlice";

export const documentApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDocuments: builder.query({
      query: () => "/api/document",
      providesTags: ["Document"],
    }),
    getDocument: builder.query({
      query: (id) => `/api/document/${id}`,
      providesTags: (result, error, id) => [{ type: "Document", id }],
    }),
    uploadDocument: builder.mutation({
      query: (formData) => ({
        url: "/api/document/upload",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Document"],
    }),
    deleteDocument: builder.mutation({
      query: (id) => ({
        url: `/api/document/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Document"],
    }),
  }),
});

export const {
  useGetDocumentsQuery,
  useGetDocumentQuery,
  useUploadDocumentMutation,
  useDeleteDocumentMutation,
} = documentApiSlice;
